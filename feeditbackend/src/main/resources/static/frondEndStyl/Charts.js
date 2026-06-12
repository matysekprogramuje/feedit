/* ==================================
   Charts.js — přehledové grafy do admin dashboardu
   Data z backendu (/api/admin/getFeedback), vykreslení přes Chart.js.
   Nezávislé na Admin.js — jen čte stejné API.
================================== */

(function () {
    const API_BASE = "http://localhost:8080/api";

    const CATEGORY_NAMES = [
        "Zákaznická podpora", "Mobilní služby", "Internetové připojení",
        "TV a zábava", "Prodejna Vodafone", "Fakturace a platby",
        "Aplikace Můj Vodafone", "Jiné",
    ];
    const DNY = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];

    const RED = "#e60000";
    const PALETA = ["#e60000", "#ff6b6b", "#ffa94d", "#ffd43b", "#69db7c",
                    "#38d9a9", "#4dabf7", "#9775fa", "#f783ac", "#a9e34b"];

    let charts = {};

    function destroyAll() {
        Object.values(charts).forEach(c => c && c.destroy());
        charts = {};
    }

    // datum může přijít jako "2026-06-04" nebo pole [2026,6,4]
    function normDatum(d) {
        if (Array.isArray(d)) {
            return `${d[0]}-${String(d[1]).padStart(2, "0")}-${String(d[2]).padStart(2, "0")}`;
        }
        return String(d ?? "").slice(0, 10);
    }

    function normalizuj(raw) {
        return raw.map(o => {
            const datum = normDatum(o.date);
            const d = new Date(+datum.slice(0, 4), +datum.slice(5, 7) - 1, +datum.slice(8, 10));
            const dow = (d.getDay() + 6) % 7 + 1; // 1=Po … 7=Ne
            return {
                rating: parseInt(o.rating, 10) || 0,
                category: parseInt(o.category, 10) || 0,
                datum, dow,
                wantsContact: o.wantsContact === true || o.wantsContact === "true",
                resolved: o.resolved === true || o.resolved === "true",
            };
        });
    }

    /* ---------- načtení dat ---------- */
    async function loadCharts() {
        let raw = [];
        try {
            // resolved=true → vrátí VŠECHNY feedbacky (i vyřešené)
            const res = await fetch(`${API_BASE}/admin/getFeedback?resolved=true`, { cache: "no-store" });
            if (!res.ok) throw new Error("HTTP " + res.status);
            raw = await res.json();
        } catch (err) {
            console.error("Grafy: chyba při načítání dat:", err);
            raw = [];
        }
        render(normalizuj(raw));
    }

    /* ---------- vykreslení ---------- */
    function render(rows) {
        destroyAll();

        // 1) Feedback po dnech (čárový, dorovnané prázdné dny)
        const byDay = {};
        rows.forEach(r => { byDay[r.datum] = (byDay[r.datum] || 0) + 1; });
        const dni = Object.keys(byDay).sort();
        const labelsDni = [], valsDni = [];
        if (dni.length) {
            let cur = new Date(dni[0]);
            const end = new Date(dni[dni.length - 1]);
            while (cur <= end) {
                const iso = cur.toISOString().slice(0, 10);
                labelsDni.push(iso.slice(5));
                valsDni.push(byDay[iso] || 0);
                cur.setDate(cur.getDate() + 1);
            }
        }
        cara("ch-po-dnech", labelsDni, valsDni);

        // 2) Rozložení hodnocení 1–5
        const hodn = [0, 0, 0, 0, 0];
        rows.forEach(r => { if (r.rating >= 1 && r.rating <= 5) hodn[r.rating - 1]++; });
        sloupce("ch-hodnoceni", ["1★", "2★", "3★", "4★", "5★"], hodn,
                [1, 2, 3, 4, 5].map(s => PALETA[s + 2]));

        // 3) + 4) Kategorie — počet a průměr
        const cat = {}; // index -> {count, sum}
        rows.forEach(r => {
            (cat[r.category] = cat[r.category] || { count: 0, sum: 0 });
            cat[r.category].count++; cat[r.category].sum += r.rating;
        });
        const catArr = Object.entries(cat).map(([i, v]) => ({
            name: CATEGORY_NAMES[i] ?? ("Kategorie " + i),
            count: v.count,
            avg: v.count ? +(v.sum / v.count).toFixed(2) : 0,
        }));

        const poCountu = [...catArr].sort((a, b) => b.count - a.count);
        sloupce("ch-kategorie", poCountu.map(c => c.name), poCountu.map(c => c.count),
                PALETA, true);

        const poPrumeru = [...catArr].sort((a, b) => b.avg - a.avg);
        sloupce("ch-prumer-kat", poPrumeru.map(c => c.name), poPrumeru.map(c => c.avg),
                PALETA, true);

        // 5) Stav řešení (vyřešeno / nevyřešeno)
        const vyreseno = rows.filter(r => r.resolved).length;
        kolac("ch-stav", ["Nevyřešeno", "Vyřešeno"],
              [rows.length - vyreseno, vyreseno], ["#ffa94d", "#69db7c"]);

        // 6) Aktivita podle dne v týdnu
        const dny = [0, 0, 0, 0, 0, 0, 0];
        rows.forEach(r => { if (r.dow >= 1 && r.dow <= 7) dny[r.dow - 1]++; });
        sloupce("ch-dny", DNY, dny, DNY.map((_, i) => PALETA[i]));
    }

    /* ---------- Chart.js obaly ---------- */
    function baseOpts() {
        return {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        };
    }
    function cara(id, labels, data) {
        const el = document.getElementById(id); if (!el) return;
        charts[id] = new Chart(el, {
            type: "line",
            data: { labels, datasets: [{ label: "Počet", data, borderColor: RED,
                backgroundColor: "rgba(230,0,0,.1)", fill: true, tension: .3, pointRadius: 2 }] },
            options: baseOpts(),
        });
    }
    function sloupce(id, labels, data, colors, horizontal = false) {
        const el = document.getElementById(id); if (!el) return;
        charts[id] = new Chart(el, {
            type: "bar",
            data: { labels, datasets: [{ label: "Hodnota", data,
                backgroundColor: colors || RED, borderRadius: 4 }] },
            options: { ...baseOpts(), indexAxis: horizontal ? "y" : "x" },
        });
    }
    function kolac(id, labels, data, colors) {
        const el = document.getElementById(id); if (!el) return;
        charts[id] = new Chart(el, {
            type: "doughnut",
            data: { labels, datasets: [{ data, backgroundColor: colors }] },
            options: { responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" } } },
        });
    }

    /* ---------- init ---------- */
    document.addEventListener("DOMContentLoaded", () => {
        loadCharts();
        const refreshBtn = document.querySelector(".action-btn.primary");
        if (refreshBtn) refreshBtn.addEventListener("click", loadCharts);
    });

    // pro případné ruční překreslení / testování
    window.feeditCharts = { reload: loadCharts, render };
})();
