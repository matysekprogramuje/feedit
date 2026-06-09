-- =====================================================================
--  FEEDBACK SYSTEM — kompletní databázové schéma (PostgreSQL 17 / Supabase)
--  Projekt: feedback-system  (ref: szxakuntflwocnaqqfag)
--
--  Rozsah striktně podle Trella (sloupec Databáze) — nic navíc.
--
--  Hodnocení: feedbacks.rating = hvězdičky od AUTORA (jeho spokojenost).
--             feedback_ratings = hvězdičky (1–5), kterými OSTATNÍ hodnotí
--             cizí recenzi; u feedbacku se drží průměr (stars_avg) a počet.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Rozšíření, pomocné funkce, enumy
-- ---------------------------------------------------------------------
create extension if not exists unaccent with schema extensions;

create or replace function public.f_unaccent(text)
returns text language plpgsql immutable parallel safe strict
set search_path = ''
as $$ begin return extensions.unaccent('extensions.unaccent', $1); end; $$;

create or replace function public.feedback_search_vector(p_title text, p_body text, p_keywords text[])
returns tsvector language plpgsql immutable parallel safe
set search_path = ''
as $$
begin
  return to_tsvector('simple', public.f_unaccent(
    coalesce(p_title,'') || ' ' || coalesce(p_body,'') || ' ' ||
    coalesce(array_to_string(p_keywords,' '), '')));
end; $$;

do $$ begin
  if not exists (select 1 from pg_type where typname='app_role') then
    create type public.app_role as enum ('user','admin');
  end if;
  if not exists (select 1 from pg_type where typname='feedback_status') then
    create type public.feedback_status as enum ('new','in_progress','resolved','wont_fix');
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 2) Tabulky
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        public.app_role not null default 'user',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.feedbacks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title       text,
  body        text not null check (char_length(body) between 1 and 5000),
  rating      smallint not null check (rating between 1 and 5),     -- hvězdičky AUTORA
  keywords    text[] not null default '{}',
  status      public.feedback_status not null default 'new',
  stars_avg   numeric(3,2) not null default 0,    -- průměr hvězd od ostatních (0.00–5.00)
  stars_count integer      not null default 0,    -- kolik lidí ohodnotilo
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  search_vector tsvector generated always as
    (public.feedback_search_vector(title, body, keywords)) stored
);

create table if not exists public.feedback_ratings (
  id          uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.feedbacks(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  stars       smallint not null check (stars between 1 and 5),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (feedback_id, user_id)        -- 1 hodnocení na uživatele (lze ho změnit)
);

create table if not exists public.admin_notes (
  id          uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.feedbacks(id) on delete cascade,
  author_id   uuid references auth.users(id) on delete set null,
  body        text not null check (char_length(body) between 1 and 5000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Indexy (Trello: indexy pro rychlé vyhledávání)
create index if not exists idx_feedbacks_search        on public.feedbacks using gin (search_vector);
create index if not exists idx_feedbacks_keywords      on public.feedbacks using gin (keywords);
create index if not exists idx_feedbacks_category      on public.feedbacks (category_id);
create index if not exists idx_feedbacks_status        on public.feedbacks (status);
create index if not exists idx_feedbacks_user          on public.feedbacks (user_id);
create index if not exists idx_feedbacks_created       on public.feedbacks (created_at desc);
create index if not exists idx_feedback_ratings_feedback on public.feedback_ratings (feedback_id);
create index if not exists idx_feedback_ratings_user     on public.feedback_ratings (user_id);
create index if not exists idx_admin_notes_feedback    on public.admin_notes (feedback_id);
create index if not exists idx_admin_notes_author      on public.admin_notes (author_id);
create index if not exists idx_profiles_role           on public.profiles (role);

-- ---------------------------------------------------------------------
-- 3) Funkce a triggery
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=''
as $$ select exists (select 1 from public.profiles p
                     where p.id = auth.uid() and p.role = 'admin'); $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path=''
as $$ begin new.updated_at = now(); return new; end; $$;

create trigger trg_profiles_updated_at         before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_feedbacks_updated_at        before update on public.feedbacks
  for each row execute function public.set_updated_at();
create trigger trg_admin_notes_updated_at      before update on public.admin_notes
  for each row execute function public.set_updated_at();
create trigger trg_feedback_ratings_updated_at before update on public.feedback_ratings
  for each row execute function public.set_updated_at();

-- Přepočet průměru + počtu hvězd po každé změně hodnocení
create or replace function public.sync_feedback_stars()
returns trigger language plpgsql security definer set search_path=''
as $$
declare fid uuid;
begin
  fid := coalesce(new.feedback_id, old.feedback_id);
  update public.feedbacks f set
    stars_count = (select count(*)                          from public.feedback_ratings r where r.feedback_id = fid),
    stars_avg   = (select coalesce(round(avg(r.stars),2),0) from public.feedback_ratings r where r.feedback_id = fid)
  where f.id = fid;
  return coalesce(new, old);
end; $$;

drop trigger if exists trg_feedback_ratings_sync on public.feedback_ratings;
create trigger trg_feedback_ratings_sync
  after insert or update or delete on public.feedback_ratings
  for each row execute function public.sync_feedback_stars();

-- Admin: změna stavu řešení (SECURITY DEFINER, uvnitř hlídá is_admin())
create or replace function public.admin_set_feedback_status(p_feedback_id uuid, p_status public.feedback_status)
returns public.feedbacks language plpgsql security definer set search_path=''
as $$
declare result public.feedbacks;
begin
  if not public.is_admin() then raise exception 'Forbidden: admin only' using errcode='42501'; end if;
  update public.feedbacks set status = p_status where id = p_feedback_id returning * into result;
  if not found then raise exception 'Feedback % not found', p_feedback_id using errcode='P0002'; end if;
  return result;
end; $$;

-- Statistiky pro firmu (přesně dle Trella)
create or replace function public.get_feedback_stats()
returns json language sql stable security invoker set search_path=''
as $$
  select json_build_object(
    'total',            (select count(*) from public.feedbacks),
    'average_rating',   (select round(coalesce(avg(rating),0)::numeric,2)      from public.feedbacks),
    'rating_percentage',(select round(coalesce(avg(rating),0)::numeric/5*100,1) from public.feedbacks),
    'last_7_days',      (select count(*) from public.feedbacks where created_at >= now()-interval '7 days'),
    'last_30_days',     (select count(*) from public.feedbacks where created_at >= now()-interval '30 days'));
$$;

-- Seskupení dat podle kategorií pro grafy
create or replace function public.get_category_stats()
returns table(category_id uuid, slug text, name text, feedback_count bigint, average_rating numeric)
language sql stable security invoker set search_path=''
as $$
  select c.id, c.slug, c.name, count(f.id),
         round(coalesce(avg(f.rating),0)::numeric,2)
  from public.categories c
  left join public.feedbacks f on f.category_id = c.id
  group by c.id, c.slug, c.name, c.sort_order
  order by c.sort_order, c.name;
$$;

-- ---------------------------------------------------------------------
-- 4) Pohled pro výpis + vyhledávací funkce
-- ---------------------------------------------------------------------
create or replace view public.feedback_details with (security_invoker = on) as
select f.id, f.title, f.body, f.rating, f.keywords, f.status,
       f.stars_avg, f.stars_count,
       f.created_at, f.updated_at, f.category_id,
       c.slug as category_slug, c.name as category_name,
       f.user_id, p.full_name as author_name,
       (select r.stars from public.feedback_ratings r
         where r.feedback_id = f.id and r.user_id = auth.uid()) as my_stars
from public.feedbacks f
left join public.categories c on c.id = f.category_id
left join public.profiles   p on p.id = f.user_id;

create or replace function public.search_feedbacks(
  p_query text default null, p_category uuid default null,
  p_status public.feedback_status default null, p_min_rating smallint default null,
  p_limit int default 50, p_offset int default 0)
returns setof public.feedback_details language sql stable set search_path=''
as $$
  select d.* from public.feedback_details d
  join public.feedbacks f on f.id = d.id
  where (p_query is null or p_query='' or
         f.search_vector @@ websearch_to_tsquery('simple', public.f_unaccent(p_query)))
    and (p_category   is null or d.category_id = p_category)
    and (p_status     is null or d.status = p_status)
    and (p_min_rating is null or d.rating >= p_min_rating)
  order by d.created_at desc
  limit greatest(coalesce(p_limit,50),0) offset greatest(coalesce(p_offset,0),0);
$$;

-- ---------------------------------------------------------------------
-- 5) RLS + oprávnění (Trello: ochrana databáze)
-- ---------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.categories       enable row level security;
alter table public.feedbacks        enable row level security;
alter table public.feedback_ratings enable row level security;
alter table public.admin_notes      enable row level security;

-- PROFILES
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant insert (id, full_name) on public.profiles to authenticated;
grant update (full_name)     on public.profiles to authenticated;  -- role NELZE měnit z klienta
create policy "profiles_select_all"          on public.profiles for select using (true);
create policy "profiles_insert_self"         on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy "profiles_update_own_or_admin" on public.profiles for update to authenticated
  using (id = (select auth.uid()) or public.is_admin()) with check (id = (select auth.uid()) or public.is_admin());

-- CATEGORIES (veřejné čtení, zápis jen admin)
revoke all on public.categories from anon, authenticated;
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
create policy "categories_select_all"   on public.categories for select using (true);
create policy "categories_admin_insert" on public.categories for insert to authenticated with check (public.is_admin());
create policy "categories_admin_update" on public.categories for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "categories_admin_delete" on public.categories for delete to authenticated using (public.is_admin());

-- FEEDBACKS (status/stars_avg/stars_count/user_id NEJSOU v grantech → klient je nepřepíše)
revoke all on public.feedbacks from anon, authenticated;
grant select on public.feedbacks to anon, authenticated;
grant insert (user_id, category_id, title, body, rating, keywords) on public.feedbacks to authenticated;
grant update (category_id, title, body, rating, keywords)          on public.feedbacks to authenticated;
grant delete on public.feedbacks to authenticated;
create policy "feedbacks_select_all"          on public.feedbacks for select using (true);
create policy "feedbacks_insert_own"          on public.feedbacks for insert to authenticated with check (user_id = (select auth.uid()));
create policy "feedbacks_update_own_or_admin" on public.feedbacks for update to authenticated
  using (user_id = (select auth.uid()) or public.is_admin()) with check (user_id = (select auth.uid()) or public.is_admin());
create policy "feedbacks_delete_own_or_admin" on public.feedbacks for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

-- FEEDBACK_RATINGS (hvězdičky od ostatních; lze vložit/změnit/smazat jen své)
revoke all on public.feedback_ratings from anon, authenticated;
grant select on public.feedback_ratings to anon, authenticated;
grant insert (feedback_id, user_id, stars) on public.feedback_ratings to authenticated;
grant update (stars)                       on public.feedback_ratings to authenticated;
grant delete on public.feedback_ratings to authenticated;
create policy "ratings_select_all" on public.feedback_ratings for select using (true);
create policy "ratings_insert_own" on public.feedback_ratings for insert to authenticated with check (user_id = (select auth.uid()));
create policy "ratings_update_own" on public.feedback_ratings for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "ratings_delete_own" on public.feedback_ratings for delete to authenticated using (user_id = (select auth.uid()));

-- ADMIN_NOTES (čistě interní, jen admin)
revoke all on public.admin_notes from anon, authenticated;
grant select, insert, update, delete on public.admin_notes to authenticated;
create policy "admin_notes_admin_all" on public.admin_notes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- EXECUTE granty
revoke execute on function public.handle_new_user()       from public, anon, authenticated;
revoke execute on function public.sync_feedback_stars()   from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon;
grant  execute on function public.is_admin() to authenticated;
revoke execute on function public.admin_set_feedback_status(uuid, public.feedback_status) from public, anon;
grant  execute on function public.admin_set_feedback_status(uuid, public.feedback_status) to authenticated;
grant  execute on function public.get_feedback_stats()  to anon, authenticated;
grant  execute on function public.get_category_stats()  to anon, authenticated;
grant  execute on function public.search_feedbacks(text, uuid, public.feedback_status, smallint, int, int) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 6) Výchozí kategorie
-- ---------------------------------------------------------------------
insert into public.categories (slug, name, sort_order) values
  ('zakaznicka-podpora',   'Zákaznická podpora',   10),
  ('mobilni-sit',          'Mobilní síť',          20),
  ('internetove-pripojeni','Internetové připojení',30),
  ('fakturace',            'Fakturace',            40),
  ('aplikace',             'Aplikace',             50),
  ('prodej-a-aktivace',    'Prodej a aktivace',    60),
  ('technicka-zavada',     'Technická závada',     70),
  ('smlouva-a-tarify',     'Smlouva a tarify',     80),
  ('jine',                 'Jiné',                 99)
on conflict (slug) do nothing;
