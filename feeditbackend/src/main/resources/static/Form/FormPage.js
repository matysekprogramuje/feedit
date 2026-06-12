
let selectedCategory = -1;
let selectedRating   = 0;
let consentGiven     = false;

function renderCategories() {
    const list = document.getElementById("category-list");
    const cats = categoryTranslations[lang];
    list.innerHTML = cats.map((name, i) => `
        <div class="category-option" onclick="selectCategory(this)">
            <div class="cat-icon"><i></i> ${name}</div><i></i>
        </div>
    `).join("");

    if (selectedCategory >= 0) {
        const opts = list.querySelectorAll(".category-option");
        if (opts[selectedCategory]) opts[selectedCategory].classList.add("selected");
    }
}

function selectCategory(el) {
    document.querySelectorAll(".category-option").forEach(o => o.classList.remove("selected"));
    el.classList.add("selected");
    selectedCategory = [...el.parentElement.children].indexOf(el);
}

function setStars(n) {
    selectedRating = n;
    document.querySelectorAll(".star").forEach((s, i) => s.classList.toggle("active", i < n));
}

function toggleConsent() {
    consentGiven = !consentGiven;
    document.getElementById("consent-check").classList.toggle("checked", consentGiven);
}

function resetForm() {
    document.getElementById("name").value    = "";
    document.getElementById("contact").value = "";
    document.getElementById("comment").value = "";
    selectedCategory = -1;
    selectedRating   = 0;
    consentGiven     = false;

    document.querySelectorAll(".category-option").forEach(o => o.classList.remove("selected"));
    document.querySelectorAll(".star").forEach(s => s.classList.remove("active"));
    document.getElementById("consent-check").classList.remove("checked");
    document.getElementById("success-card").style.display = "none";
    document.querySelector(".form-body").style.display    = "";
}

function submitFeedback() {
    const nameVal    = document.getElementById("name").value.trim();
    const contactVal = document.getElementById("contact").value.trim();
    const commentVal = document.getElementById("comment").value.trim();

    if (!nameVal || !contactVal || selectedCategory === -1 || selectedRating === 0) {
        alert(messages[lang].requiredFields);
        return;
    }

    const isEmail = contactVal.includes("@");
    const feedback = {
        name:         nameVal,
        email:        isEmail ? contactVal : "",
        number:       isEmail ? "" : contactVal,
        comment:      commentVal,
        rating:       selectedRating,
        category:     selectedCategory,
        date:         new Date().toISOString().split("T")[0],
        wantsContact: consentGiven,
        resolved:     false
    };

    fetch("/api/user/sendFeedback", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(feedback)
    })
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(() => {
            document.querySelector(".form-body").style.display = "none";
            document.getElementById("success-card").style.display = "";
        })
        .catch(() => alert(messages[lang].sendError));
}

function applyLanguage() {
    const t = translations[lang];
    setText("goToVod",            t.goToVod);
    setText("formTitle",          t.formTitle);
    setText("formSubtitle",       t.formSubtitle);
    setText("lbl-fullName",       t.fullName     + " *");
    setText("lbl-contactField",   t.contactField + " *");
    setText("lbl-category",       t.category     + " *");
    setText("lbl-rating",         t.rating       + " *");
    setText("lbl-comments",       t.comments);
    setText("lbl-consent",        t.consent);
    setText("lbl-submit",         t.submit);
    setText("lbl-thanks",         t.thanks);
    setText("lbl-successMessage", t.successMessage);
    setText("lbl-sendAnother",    t.sendAnother);
    setText("lbl-copyright",      t.copyright);
    setPlaceholder("name",        t.fullNamePlaceholder);
    setPlaceholder("contact",     t.contactPlaceholder);
    setPlaceholder("comment",     t.commentPlaceholder);

    renderCategories();
}

document.addEventListener("DOMContentLoaded", () => {
    mountLangSwitcher();
    applyLanguage();
});