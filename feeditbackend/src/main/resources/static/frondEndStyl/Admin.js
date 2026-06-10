/* ==================================
   CONFIG
================================== */

const API_BASE = "http://localhost:8080/api";

const CATEGORY_NAMES = [
    "Zákaznická podpora",    // 0
    "Mobilní služby",        // 1
    "Internetové připojení", // 2
    "TV a zábava",           // 3
    "Prodejna Vodafone",     // 4
    "Fakturace a platby",    // 5
    "Aplikace Můj Vodafone", // 6
    "Jiné",                  // 7
];

function getCategoryName(index) {
    return CATEGORY_NAMES[index] ?? `Kategorie ${index}`;
}

/* ==================================
   STATE
================================== */

let feedbackData   = [];
let activeCategory = "Vše";
let activeSort     = "date";

/* ==================================
   HELPERS
================================== */

function getInitials(name) {
    return name
        .split(" ")
        .map(w => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
}

function starsHTML(rating) {
    let html = "";
    for (let i = 1; i <= 5; i++) html += i <= rating ? "★" : "☆";
    return html;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("cs-CZ");
}

/* ==================================
   FETCH FROM BACKEND
================================== */

async function loadFeedback() {
    try {
        // resolved=false → vrátí nevyřešené; bez filtru rating/category
        const response = await fetch(`${API_BASE}/admin/getFeedback?resolved=false`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const raw = await response.json();

        feedbackData = raw.map(item => ({
            name:             item.name,
            email:            item.email,
            number:           item.number,
            comment:          item.comment,
            rating:           item.rating,
            category:         getCategoryName(item.category),
            date:             item.date,
            contactRequested: item.wantsContact,
            resolved:         item.resolved,
        }));

    } catch (err) {
        console.error("Chyba při načítání feedbacku:", err);
        feedbackData = [];
    }

    await loadStats();
    renderStats();
    render();
}

async function loadStats() {
    try {
        const [amountRes, ratingRes] = await Promise.all([
            fetch(`${API_BASE}/admin/getAmount`),
            fetch(`${API_BASE}/admin/getTotalRating`),
        ]);

        const total  = await amountRes.text();
        const avgRaw = await ratingRes.text();

        document.getElementById("s-total").textContent = total;
        document.getElementById("s-avg").textContent   = parseFloat(avgRaw).toFixed(1);

    } catch (err) {
        console.error("Chyba při načítání statistik:", err);
    }
}

/* ==================================
   STATS
================================== */

function renderStats() {
    const critical        = feedbackData.filter(f => f.rating <= 2).length;
    const contactRequests = feedbackData.filter(f => f.contactRequested).length;

    document.getElementById("s-neg").textContent     = critical;
    document.getElementById("s-contact").textContent = contactRequests;
}

/* ==================================
   CATEGORY FILTERS
================================== */

function renderCategories() {
    const container = document.getElementById("cat-tabs");

    const categories = ["Vše", ...new Set(feedbackData.map(f => f.category))];

    container.innerHTML = categories
        .map(cat => `
            <button class="cat-btn ${activeCategory === cat ? "active" : ""}"
                    onclick="setCategory('${cat}')">
                ${cat}
            </button>
        `)
        .join("");
}

function setCategory(category) {
    activeCategory = category;
    render();
}

/* ==================================
   SORTING
================================== */

function setSort(sortType) {
    activeSort = sortType;

    document.querySelectorAll(".sort-btn").forEach(btn => btn.classList.remove("active"));

    const map = { date: "btn-date", "stars-desc": "btn-stars-desc", "stars-asc": "btn-stars-asc" };
    document.getElementById(map[sortType])?.classList.add("active");

    render();
}

/* ==================================
   CARDS
================================== */

function renderCards(data) {
    const container  = document.getElementById("cards");
    const emptyState = document.getElementById("empty-state");

    if (data.length === 0) {
        container.innerHTML      = "";
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    container.innerHTML = data.map(item => `
        <div class="feedback-card">

            <div class="card-top">
                <div class="user">
                    <div class="avatar">${getInitials(item.name)}</div>
                    <div>
                        <h4>${item.name}</h4>
                        <div class="category">${item.category}</div>
                    </div>
                </div>
                <div class="rating">
                    <div class="rating-value">${item.rating}.0</div>
                    <div class="stars">${starsHTML(item.rating)}</div>
                </div>
            </div>

            <div class="comment">${item.comment || "<em>Bez komentáře</em>"}</div>

            <div class="badges">
                ${item.rating <= 2 ? `<span class="badge badge-warning">Priority</span>` : ""}
                ${item.contactRequested ? `<span class="badge badge-contact">Contact Requested</span>` : ""}
            </div>

            <div class="card-footer">
                <span>${formatDate(item.date)}</span>
                <span>${item.email || item.number || ""}</span>
            </div>

        </div>
    `).join("");
}

/* ==================================
   MAIN RENDER
================================== */

function render() {
    let filtered = [...feedbackData];

    const search = document.getElementById("search-input").value.toLowerCase();

    if (search) {
        filtered = filtered.filter(f =>
            f.name.toLowerCase().includes(search)     ||
            f.comment.toLowerCase().includes(search)  ||
            f.category.toLowerCase().includes(search)
        );
    }

    if (activeCategory !== "Vše") {
        filtered = filtered.filter(f => f.category === activeCategory);
    }

    if (activeSort === "stars-desc") filtered.sort((a, b) => b.rating - a.rating);
    if (activeSort === "stars-asc")  filtered.sort((a, b) => a.rating - b.rating);
    if (activeSort === "date")       filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    document.getElementById("results-info").textContent = `${filtered.length} reviews`;

    renderCategories();
    renderCards(filtered);
}

/* ==================================
   INIT
================================== */

document.addEventListener("DOMContentLoaded", () => {
    const refreshBtn = document.querySelector(".action-btn.primary");
    if (refreshBtn) refreshBtn.addEventListener("click", loadFeedback);

    loadFeedback();
});