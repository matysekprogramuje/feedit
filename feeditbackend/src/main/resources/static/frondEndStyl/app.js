/* =====================================================================
   app.js — načte feedback.csv, udělá z něj SQL tabulku `feedback`
   a vykreslí grafy. Veškerá data se tahají SQL příkazy z dotazy_sql.js.
   ===================================================================== */

const KATEGORIE = [
  "Zákaznická podpora", "Mobilní služby", "Internetové připojení",
  "TV a zábava", "Prodejna Vodafone", "Fakturace a platby",
  "Aplikace Můj Vodafone", "Jiné",
];
const DNY = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];

// barvy (Vodafone red + paleta)
const RED = "#e60000";
const PALETA = ["#e60000", "#ff6b6b", "#ffa94d", "#ffd43b", "#69db7c",
                "#38d9a9", "#4dabf7", "#9775fa", "#f783ac", "#a9e34b"];

function err(msg) {
  const e = document.getElementById("error");
  e.style.display = "block";
  e.textContent = "Chyba: " + msg;
  console.error(msg);
}

// ------- načtení a parsování CSV -> typovaná tabulka --------------------
async function nactiData() {
  const text = await (await fetch("feedback.csv?_=" + Date.now())).text();
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
  lines.shift(); // hlavička pryč

  const rows = lines.map(line => {
    const c = line.split("|");
    const d = new Date(+c[6].slice(0, 4), +c[6].slice(5, 7) - 1, +c[6].slice(8, 10));
    const isoDow = (d.getDay() + 6) % 7 + 1; // 1=Po … 7=Ne
    return {
      name: c[0], email: c[1], number: c[2], comment: c[3],
      rating: parseInt(c[4], 10),
      category: parseInt(c[5], 10),
      categoryName: KATEGORIE[parseInt(c[5], 10)] ?? ("Kategorie " + c[5]),
      datum: c[6],
      dow: isoDow,
      den_v_tydnu: DNY[isoDow - 1],
      wantsContact: c[7] === "true" ? 1 : 0,
      resolved: c[8] === "true" ? 1 : 0,
    };
  });

  // registrace jako SQL tabulka `feedback`
  alasql("DROP TABLE IF EXISTS feedback");
  alasql("CREATE TABLE feedback");
  alasql.tables.feedback.data = rows;
  return rows.length;
}

// spustí SQL příkaz nad tabulkou feedback
const q = (sql, params = []) => alasql(sql, params);

// ------- vykreslení -----------------------------------------------------
function kpi(id, value) { document.getElementById(id).textContent = value; }

function vykresli() {
  const dnes = new Date();
  const cutoff = (n) => {
    const d = new Date(dnes); d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };

  // KPI karty
  kpi("kpi-celkem",      q(SQL.celkem)[0].hodnota);
  kpi("kpi-prumer",      q(SQL.prumer)[0].hodnota ?? 0);
  kpi("kpi-spokojenost", (q(SQL.spokojenost)[0].hodnota ?? 0) + " %");
  kpi("kpi-kontakt",     q(SQL.chteji_kontakt)[0].hodnota);
  kpi("kpi-7dni",        q(SQL.za_7_dni,  [cutoff(7)])[0].hodnota);
  kpi("kpi-30dni",       q(SQL.za_30_dni, [cutoff(30)])[0].hodnota);

  // Graf 1 — po dnech (čárový), s dorovnáním prázdných dnů
  const poDnech = q(SQL.po_dnech);
  const mapa = Object.fromEntries(poDnech.map(r => [r.den, r.pocet]));
  const dny = [], poc = [];
  if (poDnech.length) {
    let cur = new Date(poDnech[0].den);
    const end = new Date(poDnech[poDnech.length - 1].den);
    while (cur <= end) {
      const iso = cur.toISOString().slice(0, 10);
      dny.push(iso.slice(5)); poc.push(mapa[iso] || 0);
      cur.setDate(cur.getDate() + 1);
    }
  }
  cara("graf-po-dnech", dny, poc, "Počet feedbacků");

  // Graf 2 — rozložení hodnocení 1–5 (sloupcový)
  const rh = q(SQL.rozlozeni_hodnoceni);
  const rhMap = Object.fromEntries(rh.map(r => [r.hvezdicky, r.pocet]));
  sloupce("graf-hodnoceni",
    ["1★", "2★", "3★", "4★", "5★"],
    [1, 2, 3, 4, 5].map(s => rhMap[s] || 0),
    "Počet", [1, 2, 3, 4, 5].map(s => PALETA[s + 2]));

  // Graf 3 — počet podle kategorie (vodorovný sloupcový)
  const pk = q(SQL.podle_kategorie);
  sloupce("graf-kategorie", pk.map(r => r.kategorie), pk.map(r => r.pocet),
    "Počet", PALETA, true);

  // Graf 4 — průměrné hodnocení podle kategorie
  const prk = q(SQL.prumer_kategorie);
  sloupce("graf-prumer-kat", prk.map(r => r.kategorie), prk.map(r => r.prumer),
    "Průměr ★", PALETA, true);

  // Graf 5 — vyřešeno vs nevyřešeno (koláč)
  const st = q(SQL.stav);
  const stMap = Object.fromEntries(st.map(r => [r.vyreseno, r.pocet]));
  kolac("graf-stav", ["Nevyřešeno", "Vyřešeno"],
    [stMap[0] || 0, stMap[1] || 0], ["#ffa94d", "#69db7c"]);

  // Graf 6 — aktivita podle dne v týdnu
  const dt = q(SQL.dny_v_tydnu);
  const dtMap = Object.fromEntries(dt.map(r => [r.dow, r.pocet]));
  sloupce("graf-dny", DNY, [1, 2, 3, 4, 5, 6, 7].map(d => dtMap[d] || 0),
    "Počet", DNY.map((_, i) => PALETA[i]));

  // vypsání SQL příkazů dole na stránku
  const box = document.getElementById("sql-list");
  box.innerHTML = Object.entries(SQL)
    .map(([k, v]) => `<div class="sql-item"><b>${k}</b><pre>${v.trim()}</pre></div>`)
    .join("");
}

// ------- pomocné Chart.js obaly ----------------------------------------
function cara(id, labels, data, label) {
  new Chart(document.getElementById(id), {
    type: "line",
    data: { labels, datasets: [{ label, data, borderColor: RED,
      backgroundColor: "rgba(230,0,0,.1)", fill: true, tension: .3,
      pointRadius: 2 }] },
    options: baseOpts(),
  });
}
function sloupce(id, labels, data, label, colors, horizontal = false) {
  new Chart(document.getElementById(id), {
    type: "bar",
    data: { labels, datasets: [{ label, data, backgroundColor: colors || RED,
      borderRadius: 4 }] },
    options: { ...baseOpts(), indexAxis: horizontal ? "y" : "x" },
  });
}
function kolac(id, labels, data, colors) {
  new Chart(document.getElementById(id), {
    type: "doughnut",
    data: { labels, datasets: [{ data, backgroundColor: colors }] },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } } },
  });
}
function baseOpts() {
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };
}

// ------- start ----------------------------------------------------------
(async function () {
  try {
    const n = await nactiData();
    document.getElementById("pocet-zaznamu").textContent =
      n + " záznamů načteno z feedback.csv";
    vykresli();
  } catch (e) {
    err(e.message || String(e));
  }
})();
