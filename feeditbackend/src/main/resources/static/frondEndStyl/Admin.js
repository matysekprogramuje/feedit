const API_BASE = "/api";

let feedbackData   = [];
let activeCategory = "all";
let activeSort     = "date";

function getInitials(name) {
    return (name || "?").split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
}
function starsHTML(r) {
    let h = "";
    for (let i = 1; i <= 5; i++) h += i <= r ? "★" : "☆";
    return h;
}
function formatDate(d) {
    return new Date(d).toLocaleDateString("cs-CZ");
}

async function loadFeedback() {
    try {
        const res = await fetch(`${API_BASE}/admin/getFeedback`);
        if (!res.ok) throw new Error(res.status);
        const raw = await res.json();

        feedbackData = raw.map(item => ({
            name:             item.name,
            email:            item.email,
            number:           item.number,
            comment:          item.comment,
            rating:           item.rating,
            categoryIndex:    item.category,
            date:             item.date,
            contactRequested: item.wantsContact,
            resolved:         item.resolved,
        }));
    } catch (err) {
        console.error("Chyba při načítání feedbacku:", err);
        feedbackData = [];
    }
    renderStats();
    render();
}

function renderStats() {
    const total = feedbackData.length;
    const avg   = total ? (feedbackData.reduce((s, f) => s + f.rating, 0) / total).toFixed(1) : "0.0";

    document.getElementById("s-total").textContent   = total;
    document.getElementById("s-avg").textContent     = avg;
    document.getElementById("s-neg").textContent     = feedbackData.filter(f => f.rating <= 2).length;
    document.getElementById("s-contact").textContent = feedbackData.filter(f => f.contactRequested).length;
}

function renderCategories() {
    const cats    = categoryTranslations[lang];
    const allText = adminTexts[lang].all;
    const used    = new Set(feedbackData.map(f => f.categoryIndex));

    const container = document.getElementById("cat-tabs");
    container.innerHTML = [
        `<button class="cat-btn ${activeCategory === 'all' ? 'active' : ''}" onclick="setCategory('all')">${allText}</button>`,
        ...[...used].map(i =>
            `<button class="cat-btn ${activeCategory === String(i) ? 'active' : ''}" onclick="setCategory('${i}')">${cats[i] ?? i}</button>`
        )
    ].join("");
}

function setCategory(cat) {
    activeCategory = cat;
    render();
}

function setSort(s) {
    activeSort = s;
    document.querySelectorAll(".sort-btn").forEach(b => b.classList.remove("active"));
    const map = { date: "btn-date", "stars-desc": "btn-stars-desc", "stars-asc": "btn-stars-asc" };
    document.getElementById(map[s])?.classList.add("active");
    render();
}

function renderCards(data) {
    const container  = document.getElementById("cards");
    const emptyState = document.getElementById("empty-state");
    const cats       = categoryTranslations[lang];
    const texts      = adminTexts[lang];

    if (!data.length) {
        container.innerHTML      = "";
        emptyState.style.display = "block";
        return;
    }
    emptyState.style.display = "none";

    container.innerHTML = data.map(item => {
        const catName = cats[item.categoryIndex] ?? `Kategorie ${item.categoryIndex}`;
        return `
        <div class="feedback-card">
            <div class="card-top">
                <div class="user">
                    <div class="avatar">${getInitials(item.name)}</div>
                    <div>
                        <h4>${item.name}</h4>
                        <div class="category">${catName}</div>
                    </div>
                </div>
                <div class="rating">
                    <div class="rating-value">${item.rating}.0</div>
                    <div class="stars">${starsHTML(item.rating)}</div>
                </div>
            </div>
            <div class="comment">${item.comment || `<em>${texts.noComment}</em>`}</div>
            <div class="badges">
                ${item.rating <= 2 ? `<span class="badge badge-warning">${texts.priority}</span>` : ""}
                ${item.contactRequested ? `<span class="badge badge-contact">${texts.contactRequested}</span>` : ""}
            </div>
            <div class="card-footer">
                <span>${formatDate(item.date)}</span>
                <span>${item.email || item.number || ""}</span>
            </div>
        </div>`;
    }).join("");
}

function exportCSV() {
    const cats = categoryTranslations[lang];
    const rows = [
        ["Jméno","E-mail","Telefon","Komentář","Hodnocení","Kategorie","Datum","Kontakt","Vyřešeno"],
        ...feedbackData.map(f => [
            f.name, f.email, f.number, `"${(f.comment||"").replace(/"/g,'""')}"`,
            f.rating, cats[f.categoryIndex] ?? f.categoryIndex,
            f.date, f.contactRequested, f.resolved
        ])
    ];
    const csv  = rows.map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `feedit-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function render() {
    let filtered = [...feedbackData];
    const search = document.getElementById("search-input").value.toLowerCase();
    const cats   = categoryTranslations[lang];

    if (search) {
        filtered = filtered.filter(f =>
            (f.name    || "").toLowerCase().includes(search) ||
            (f.comment || "").toLowerCase().includes(search) ||
            (cats[f.categoryIndex] || "").toLowerCase().includes(search)
        );
    }

    if (activeCategory !== "all") {
        filtered = filtered.filter(f => String(f.categoryIndex) === activeCategory);
    }

    if (activeSort === "stars-desc") filtered.sort((a, b) => b.rating - a.rating);
    if (activeSort === "stars-asc")  filtered.sort((a, b) => a.rating - b.rating);
    if (activeSort === "date")       filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    const reviewsWord = adminTexts[lang].reviews;
    document.getElementById("results-info").textContent = `${filtered.length} ${reviewsWord}`;

    renderCategories();
    renderCards(filtered);
}

function applyLanguage() {
    const t  = translations[lang];
    const at = adminTexts[lang];

    setText("cusFeedbackManage",     t.cusFeedbackManage);
    setText("customerFeedback",      t.customerFeedback);
    setText("adminDescription",      t.adminDescription);
    setText("lbl-export",            t.export);
    setText("lbl-refresh",           t.refresh);
    setText("totalFeedback",         t.totalFeedback);
    setText("submittedReviews",      t.submittedReviews);
    setText("averageRating",         t.averageRating);
    setText("customerSatisfaction",  t.customerSatisfaction);
    setText("criticalReviews",       t.criticalReviews);
    setText("requiresAttention",     t.requiresAttention);
    setText("contactRequests",       t.contactRequests);
    setText("awaitingResponse",      t.awaitingResponse);
    setText("lbl-latest",            t.latest);
    setText("lbl-highestRated",      t.highestRated);
    setText("lbl-lowestRated",       t.lowestRated);
    setText("lbl-feedbackTitle",     t.customerFeedback);
    setText("feedbackReviewAndManage", t.feedbackReviewAndManage);
    setText("noFeedback",            t.noFeedback);
    setText("tryDifferentSearch",    t.tryDifferentSearch);
    setPlaceholder("search-input",   t.searchPlaceholder);

    const user = sessionStorage.getItem("feedit-user");
    if (user) {
        setText("user-name", user);
        setText("user-avatar", user.substring(0, 2).toUpperCase());
    }

    render();
}

document.addEventListener("DOMContentLoaded", () => {
    mountLangSwitcher();
    applyLanguage();
    loadFeedback();
});