/* ==================================
   CONFIG
================================== */

const API_BASE = "http://localhost:8080/api";

// Category names mapped from the int stored in Feedback.java
// Index matches the category int sent by the feedback form
const CATEGORY_NAMES = [
    "Zákaznická podpora",   // 0
    "Mobilní síť",          // 1
    "Internetové připojení",// 2
    "Aplikace",             // 3
    "Fakturace",            // 4
];

function getCategoryName(categoryInt) {
    return CATEGORY_NAMES[categoryInt] ?? `Category ${categoryInt}`;
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
        .map(word => word[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
}

function starsHTML(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? "★" : "☆";
    }
    return stars;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("cs-CZ");
}

/* ==================================
   FETCH FROM BACKEND
================================== */

async function loadFeedback() {
    try {
        const response = await fetch(`${API_BASE}/admin/getFeedback`);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const raw = await response.json();

        // Normalize: map category int → string, map wantsContact → contactRequested
        feedbackData = raw.map(item => ({
            name:             item.name,
            email:            item.email,
            number:           item.number,
            comment:          item.comment,
            rating:           item.rating,
            category:         getCategoryName(item.category),
            date:             item.date,
            contactRequested: item.wantsContact,
        }));

    } catch (error) {
        console.error("Error loading feedback:", error);
        feedbackData = [];
    }

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

    } catch (error) {
        console.error("Error loading stats:", error);
    }
}

/* ==================================
   CATEGORY FILTERS
================================== */

function renderCategories() {
    const container = document.getElementById("cat-tabs");

    const categories = [
        "Vše",
        ...new Set(feedbackData.map(item => item.category))
    ];

    container.innerHTML = categories
        .map(category => `
            <button
                class="cat-btn ${activeCategory === category ? "active" : ""}"
                onclick="setCategory('${category}')">
                ${category}
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

    document
        .querySelectorAll(".sort-btn")
        .forEach(btn => btn.classList.remove("active"));

    if (sortType === "date")        document.getElementById("btn-date").classList.add("active");
    if (sortType === "stars-desc")  document.getElementById("btn-stars-desc").classList.add("active");
    if (sortType === "stars-asc")   document.getElementById("btn-stars-asc").classList.add("active");

    render();
}

/* ==================================
   STATS  (critical + contact counts
   are computed client-side from the
   full list, total + avg come from API)
================================== */

function renderStats() {
    // total and avg are loaded from the API in loadStats()
    // but if feedbackData is available we can also compute locally as fallback
    if (feedbackData.length > 0) {
        document.getElementById("s-total").textContent = feedbackData.length;

        const average = feedbackData.reduce((sum, item) => sum + item.rating, 0) / feedbackData.length;
        document.getElementById("s-avg").textContent   = average.toFixed(1);
    }

    const critical = feedbackData.filter(item => item.rating <= 2).length;
    document.getElementById("s-neg").textContent = critical;

    const contactRequests = feedbackData.filter(item => item.contactRequested).length;
    document.getElementById("s-contact").textContent = contactRequests;
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

    container.innerHTML = data
        .map(item => `
            <div class="feedback-card">

                <div class="card-top">

                    <div class="user">

                        <div class="avatar">
                            ${getInitials(item.name)}
                        </div>

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

                <div class="comment">${item.comment || "<em>No comment</em>"}</div>

                <div class="badges">
                    ${item.rating <= 2 ? `<span class="badge badge-warning">Priority</span>` : ""}
                    ${item.contactRequested ? `<span class="badge badge-contact">Contact Requested</span>` : ""}
                </div>

                <div class="card-footer">
                    <span>${formatDate(item.date)}</span>
                    <span>${item.category}</span>
                </div>

            </div>
        `)
        .join("");
}

/* ==================================
   REFRESH BUTTON
================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Wire up the Refresh button in the page header
    const refreshBtn = document.querySelector(".action-btn.primary");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", loadFeedback);
    }
});

/* ==================================
   MAIN RENDER
================================== */

function render() {
    let filtered = [...feedbackData];

    const search = document.getElementById("search-input").value.toLowerCase();

    if (search) {
        filtered = filtered.filter(item =>
            item.name.toLowerCase().includes(search)    ||
            item.comment.toLowerCase().includes(search) ||
            item.category.toLowerCase().includes(search)
        );
    }

    if (activeCategory !== "Vše") {
        filtered = filtered.filter(item => item.category === activeCategory);
    }

    if (activeSort === "stars-desc") filtered.sort((a, b) => b.rating - a.rating);
    if (activeSort === "stars-asc")  filtered.sort((a, b) => a.rating - b.rating);
    if (activeSort === "date")       filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    document.getElementById("results-info").textContent = `${filtered.length} results`;

    renderCategories();
    renderCards(filtered);
}

loadFeedback();