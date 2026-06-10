let selectedCategory = -1;
let selectedRating = 0;
let consentGiven = false;

function selectCategory(el) {
    document.querySelectorAll(".category-option").forEach(opt => opt.classList.remove("selected"));
    el.classList.add("selected");
    const options = document.querySelectorAll(".category-option");
    options.forEach((opt, index) => {
        if (opt === el) selectedCategory = index;
    });
}

function setStars(count) {
    selectedRating = count;
    document.querySelectorAll(".star").forEach((star, i) => {
        star.classList.toggle("active", i < count);
    });
}

function toggleConsent() {
    consentGiven = !consentGiven;
    document.getElementById("consent-check").classList.toggle("checked", consentGiven);
}

function resetForm() {
    document.getElementById("name").value = "";
    document.getElementById("contact").value = "";
    document.getElementById("comment").value = "";
    selectedCategory = -1;
    selectedRating = 0;
    consentGiven = false;

    document.querySelectorAll(".category-option").forEach(opt => opt.classList.remove("selected"));
    document.querySelectorAll(".star").forEach(star => star.classList.remove("active"));
    document.getElementById("consent-check").classList.remove("checked");

    document.getElementById("success-card").style.display = "none";
    document.querySelector(".form-body").style.display = "";
}

function submitFeedback() {
    const nameVal = document.getElementById("name").value.trim();
    const contactVal = document.getElementById("contact").value.trim();
    const commentVal = document.getElementById("comment").value.trim();

    if (!nameVal || !contactVal || selectedCategory === -1 || selectedRating === 0) {
        alert("Vyplňte prosím všechna povinná pole.");
        return;
    }

    // Determine if contact is email or phone number
    const isEmail = contactVal.includes("@");
    const email = isEmail ? contactVal : "";
    const number = isEmail ? "" : contactVal;

    const today = new Date();
    const date = today.toISOString().split("T")[0]; // "YYYY-MM-DD"

    const feedback = {
        name: nameVal,
        email: email,
        number: number,
        comment: commentVal,
        rating: selectedRating,
        category: selectedCategory,
        date: date,
        wantsContact: consentGiven,
        resolved: false
    };

    fetch("http://localhost:8080/api/user/sendFeedback", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(feedback)
    })
        .then(response => {
            if (!response.ok) throw new Error("Chyba serveru: " + response.status);
            return response.json();
        })
        .then(() => {
            document.querySelector(".form-body").style.display = "none";
            document.getElementById("success-card").style.display = "";
        })
        .catch(err => {
            console.error("Chyba při odesílání:", err);
            alert("Nepodařilo se odeslat hodnocení. Zkuste to prosím znovu.");
        });
}