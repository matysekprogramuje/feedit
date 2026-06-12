var consentOn = false;

function toggleConsent() {
    consentOn = !consentOn;
    document.getElementById('consent-check').classList.toggle('checked', consentOn);
}

function showError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const field = input.closest(".field") || input.parentElement;
    clearError(fieldId);
    const err = document.createElement("span");
    err.className = "field-error";
    err.textContent = message;
    field.appendChild(err);
    input.classList.add("input-error");
}

function clearError(fieldId) {
    const input = document.getElementById(fieldId);
    input.classList.remove("input-error");
    const field = input.closest(".field") || input.parentElement;
    const existing = field.querySelector(".field-error");
    if (existing) existing.remove();
}

function showGeneralError(containerId, message) {
    let el = document.getElementById(containerId);
    if (!el) return;
    el.textContent = message;
    el.style.display = message ? "block" : "none";
}

function validateName(value) {
    if (!value) return "Vyplňte prosím jméno.";
    if (value.length < 2) return "Jméno musí mít alespoň 2 znaky.";
    if (/[^\p{L}\s'\-]/u.test(value)) return "Jméno smí obsahovat pouze písmena.";
    return null;
}

function validateContact(value) {
    if (!value) return "Vyplňte prosím e-mail nebo telefon.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phoneDigits = value.replace(/[\s\-().+]/g, "");
    const onlyDigits = /^\d{7,15}$/.test(phoneDigits);

    if (value.includes("@")) {
        if (!emailRegex.test(value)) return "Zadejte platnou e-mailovou adresu.";
    } else {
        if (!onlyDigits) return "Zadejte platné telefonní číslo (7–15 číslic).";
    }
    return null;
}

function attachFieldValidation(fieldId, validateFn) {
    const input = document.getElementById(fieldId);
    if (!input) return;

    input.addEventListener("blur", function () {
        const err = validateFn(this.value.trim());
        if (err) showError(fieldId, err);
        else clearError(fieldId);
    });

    input.addEventListener("input", function () {
        if (this.classList.contains("input-error")) {
            const err = validateFn(this.value.trim());
            if (!err) clearError(fieldId);
        }
    });
}

attachFieldValidation("name", validateName);
attachFieldValidation("contact", validateContact);

function setCategoryError(message) {
    const field = document.querySelector(".category-list").closest(".field");
    let el = field.querySelector(".field-error");
    if (message) {
        if (!el) {
            el = document.createElement("span");
            el.className = "field-error";
            field.appendChild(el);
        }
        el.textContent = message;
    } else {
        if (el) el.remove();
    }
}

function setStarsError(message) {
    const field = document.getElementById("stars").closest(".field");
    let el = field.querySelector(".field-error");
    if (message) {
        if (!el) {
            el = document.createElement("span");
            el.className = "field-error";
            field.appendChild(el);
        }
        el.textContent = message;
    } else {
        if (el) el.remove();
    }
}

document.querySelectorAll(".category-option").forEach(opt => {
    opt.addEventListener("click", function () {
        setCategoryError(null);
    });
});

document.querySelectorAll(".star").forEach(star => {
    star.addEventListener("click", function () {
        setStarsError(null);
    });
});

function submitFeedback() {
    const nameVal    = document.getElementById("name").value.trim();
    const contactVal = document.getElementById("contact").value.trim();

    const nameErr    = validateName(nameVal);
    const contactErr = validateContact(contactVal);
    const noCategory = document.querySelectorAll(".category-option.selected").length === 0;
    const noStars    = document.querySelectorAll(".star.active").length === 0;

    if (nameErr)    showError("name", nameErr);
    if (contactErr) showError("contact", contactErr);
    if (noCategory) setCategoryError("Vyberte prosím kategorii hodnocení.");
    if (noStars)    setStarsError("Vyberte prosím hodnocení hvězdičkami.");

    if (nameErr || contactErr || noCategory || noStars) return;

    document.querySelector(".form-body").style.display = "none";
    document.getElementById("success-card").style.display = "flex";
}