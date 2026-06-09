# Feedback systém — databáze

Production-ready Postgres databáze na **Supabase** pro firemní feedback/recenzní systém
(uživatelská část + firemní dashboard). Tohle je dokumentace pro celý tým (frontend, backend, DB).

---

## 0) Jak to celé funguje (tok dat)

```
 UŽIVATEL                                  FIRMA / ADMIN
 ────────                                  ─────────────
 1. registrace (Supabase Auth)             • přihlášení (stejný Auth)
    → trigger vytvoří profil (role=user)   • vidí všechny feedbacky + interní poznámky
 2. odešle feedback (hvězdičky, text,      • mění STAV řešení (new→in_progress→resolved)
    kategorie, keywords) → hned veřejný     • píše interní poznámky (uživatel je nevidí)
 3. hodnotí cizí feedbacky 1–5 ⭐ (1× na   • čte statistiky (průměr, počty, podle kategorií)
    osobu, lze změnit)
 4. vyhledává/filtruje veřejný výpis        • spravuje kategorie
```

Klíčový princip: **databáze sama hlídá pravidla** (kdo co smí) přes RLS + oprávnění.
Frontend se připojuje přímo na Supabase (REST/JS klient), backend ho nemusí „obalovat".

---

## 1) Připojení

| | |
|---|---|
| **Project URL** | `https://szxakuntflwocnaqqfag.supabase.co` |
| **Publishable key** (do frontendu) | `sb_publishable_xMNcEdEKVHtmNai1w0MLnQ_xIJBPbDy` |
| **Project ref** | `szxakuntflwocnaqqfag` |
| **Region** | eu-central-1 (Frankfurt) |

`.env` (Vite/React příklad):
```env
VITE_SUPABASE_URL=https://szxakuntflwocnaqqfag.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xMNcEdEKVHtmNai1w0MLnQ_xIJBPbDy
```
> ⚠️ `service_role` klíč (z Dashboard → Settings → API) **nikdy nedávej do frontendu** — obchází veškerou bezpečnost. Patří jen na backend/server.

```ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
```

---

## 2) Schéma (tabulky a vztahy)

```
auth.users ──1:1── profiles (role: user | admin)
     │
     ├──1:N── feedbacks ──N:1── categories
     │            │
     │            ├──1:N── feedback_ratings (UNIQUE feedback_id+user_id → 1 hodnocení 1–5★/osoba)
     │            └──1:N── admin_notes      (interní, jen admin)
```

| Tabulka | K čemu | Kdo čte | Kdo zapisuje |
|---|---|---|---|
| `profiles` | jméno + **role** (user/admin) | všichni | uživatel jen své jméno; roli nelze měnit z klienta |
| `categories` | číselník kategorií | všichni | jen admin |
| `feedbacks` | odeslané recenze | všichni | přihlášený uživatel (jen své) |
| `feedback_ratings` | hvězdičky (1–5) cizích recenzí | všichni | přihlášený (jen své, lze změnit) |
| `admin_notes` | interní poznámky firmy | **jen admin** | jen admin |

**`feedbacks` — důležité sloupce:**
- `rating` smallint 1–5 (hvězdičky **autora** = jeho spokojenost), `body` 1–5000 znaků (validuje DB)
- `keywords text[]` — štítky, dají se filtrovat i hledat
- `status` (`new`/`in_progress`/`resolved`/`wont_fix`) — **stav řešení**, mění jen firma
- `stars_avg` + `stars_count` — **průměr a počet hvězd od ostatních** uživatelů; udržuje **trigger** automaticky (rychlý výpis bez JOINu)
- `search_vector` — automatický fulltext **bez diakritiky** (title + body + keywords)

**Pohled `feedback_details`** = feedback + jméno autora + název kategorie + `stars_avg`/`stars_count`
+ `my_stars` (kolik hvězd dal přihlášený, nebo `null`). Tohle používej pro výpis na frontendu.

---

## 3) API — jak na to z frontendu

### Registrace / přihlášení (profil vznikne sám)
```ts
await supabase.auth.signUp({ email, password,
  options: { data: { full_name: 'Jan Novák' } } })   // full_name se uloží do profiles
await supabase.auth.signInWithPassword({ email, password })
```

### Načíst kategorie (do selectu ve formuláři)
```ts
const { data } = await supabase.from('categories').select('*').order('sort_order')
```

### Odeslat feedback
```ts
const { data: { user } } = await supabase.auth.getUser()
await supabase.from('feedbacks').insert({
  user_id: user!.id,            // MUSÍ = přihlášený uživatel (hlídá RLS)
  category_id: categoryId,
  title: 'Pomalý internet',
  body: 'Večer to padá…',
  rating: 2,
  keywords: ['rychlost', 'vypadky'],
})
// status, stars_avg/stars_count, search_vector řeší server — neposílej je
```

### Výpis recenzí (nejnovější první)
```ts
const { data } = await supabase
  .from('feedback_details')
  .select('*')
  .order('created_at', { ascending: false })
  .range(0, 19)                 // stránkování
```

### Vyhledávání + filtry (jeden RPC)
```ts
const { data } = await supabase.rpc('search_feedbacks', {
  p_query: 'pomaly',            // bez diakritiky, najde i „Pomalý"; null = bez textu
  p_category: categoryId,       // null = všechny
  p_status: null,               // 'new' | 'in_progress' | 'resolved' | 'wont_fix'
  p_min_rating: null,           // např. 4 = jen 4★+
  p_limit: 20, p_offset: 0,
})
```

### Hvězdičkové hodnocení cizí recenze (1–5 ⭐)
```ts
// dát / změnit hodnocení — upsert podle (feedback_id, user_id), takže 2. hlas hodnocení jen přepíše
await supabase.from('feedback_ratings')
  .upsert({ feedback_id, user_id: user.id, stars: 4 },
          { onConflict: 'feedback_id,user_id' })

// zrušit svoje hodnocení
await supabase.from('feedback_ratings').delete().match({ feedback_id, user_id: user.id })
```
> Průměr (`stars_avg`) a počet (`stars_count`) se přepočítají samy přes trigger — ber je z `feedback_details`.

### Statistiky (dashboard)
```ts
const { data: stats } = await supabase.rpc('get_feedback_stats')
// { total, average_rating, rating_percentage, last_7_days, last_30_days }
const { data: byCat } = await supabase.rpc('get_category_stats')   // pro grafy
```

### Firemní akce (jen admin)
```ts
// změna stavu řešení
await supabase.rpc('admin_set_feedback_status', { p_feedback_id: id, p_status: 'resolved' })
// interní poznámka
await supabase.from('admin_notes').insert({ feedback_id: id, author_id: user.id, body: 'Voláno zákazníkovi.' })
```
> Když tyhle zavolá neadmin, databáze vrátí **Forbidden** — nemusíš to hlídat na frontendu.

---

## 4) Jak vytvořit prvního admina

Registrace dělá vždy roli `user`. Prvního admina povýšíš ručně (Supabase Dashboard → SQL Editor):
```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'tvuj@email.cz');
```
Stejně povýšíš i případné další adminy (Trello v appce správu rolí nepožaduje).

---

## 5) Bezpečnost (proč je to „production ready")

- **RLS zapnuté na všech tabulkách** — bez politiky se nedostaneš k ničemu.
- **Sloupcová oprávnění**: uživatel fyzicky nemá právo zapsat `feedbacks.status`,
  `stars_avg`/`stars_count` ani `user_id` → nejde podvrhnout cizí feedback, falešný stav ani nafouknout hodnocení.
- **Role nejde zvednout z klienta** (`profiles.role` není v UPDATE grantu) — jen ručně přes SQL.
- **`admin_notes` jsou pro anon i běžné uživatele neviditelné.**
- Hvězdičkové hodnocení jištěné `UNIQUE (feedback_id, user_id)` na úrovni DB (1 hlas na osobu).
- Vyhledávání přes parametrizované RPC → žádná SQL injection.

**Bezpečnostní audit (Supabase advisor): čistý**, kromě 2 záměrných WARN:
`is_admin` a `admin_set_feedback_status` jsou `SECURITY DEFINER`.
Tak to **musí** být (obcházejí sloupcová oprávnění), a uvnitř mají kontrolu `is_admin()`.
Linter o té vnitřní pojistce neví → varování je očekávané, ne chyba.

---

## 6) Mapování na váš To-do board

| Board task | Stav v DB |
|---|---|
| Endpoint pro příjímání feedbacku | `feedbacks` insert (RLS) ✅ |
| Endpoint pro získávání feedbacku (admin) | `feedback_details` + `admin_notes` ✅ |
| Filtrování (stav / hodnocení / kategorie) | `search_feedbacks(...)` ✅ |
| Full-text vyhledávání | `search_vector` + `search_feedbacks` (bez diakritiky) ✅ |
| Hvězdičkové hodnocení recenzí + kontrola duplicity | `feedback_ratings` + UNIQUE + trigger (průměr/počet) ✅ |
| Interní poznámky firmy | `admin_notes` (admin-only) ✅ |
| Statistiky firmy (průměr, počty, kategorie) | `get_feedback_stats`, `get_category_stats` ✅ |
| Veřejný výpis + průměr hvězd | `feedback_details.stars_avg` / `stars_count` ✅ |
| Indexy pro rychlé vyhledávání | GIN + B-tree indexy ✅ |
| Ochrana databáze | RLS + sloupcové granty ✅ |
| Status 201 po odeslání | řeší PostgREST/klient automaticky |

---

## 7) Soubory v tomto balíčku
- `schema.sql` — kompletní schéma (lze spustit na čisté instanci, slož do gitu)
- `database.types.ts` — TypeScript typy pro `createClient<Database>()`
- `README.md` — tento dokument

Schéma je už **nasazené** v cloudovém projektu (migrace 01–09). `schema.sql` je referenční/záložní.
