function showError(fieldId, message) {
    const field = document.getElementById(fieldId).closest(".field") ||
        document.getElementById(fieldId).parentElement;
    clearError(fieldId);
    const err = document.createElement("span");
    err.className = "field-error";
    err.textContent = message;
    field.appendChild(err);
    document.getElementById(fieldId).classList.add("input-error");
}

function clearError(fieldId) {
    const input = document.getElementById(fieldId);
    input.classList.remove("input-error");
    const field = input.closest(".field") || input.parentElement;
    const existing = field.querySelector(".field-error");
    if (existing) existing.remove();
}


function validateName(value) {
    if (value.length < 2) return "Jméno musí mít alespoň 2 znaky.";

    if (/[^\p{L}\s'\-]/u.test(value)) return "Jméno smí obsahovat pouze písmena.";
    return null;
}

function validateContact(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;


    const phoneDigits = value.replace(/[\s\-().+]/g, "");
    const phoneRegex = /^\+?[\d\s\-().]{7,20}$/;
    const onlyDigits = /^\d{7,15}$/.test(phoneDigits);

    if (value.includes("@")) {
        if (!emailRegex.test(value)) return "Zadejte platnou e-mailovou adresu.";
    } else {
        if (!phoneRegex.test(value) || !onlyDigits) {
            return "Zadejte platné telefonní číslo (7–15 číslic).";
        }
    }
    return null;
}


let formInteracted = false;

function getSubmitError() {
    const nameVal = document.getElementById("name").value.trim();
    const contactVal = document.getElementById("contact").value.trim();

    if (!nameVal) return "Vyplňte prosím jméno.";
    if (validateName(nameVal)) return validateName(nameVal);
    if (!contactVal) return "Vyplňte prosím e-mail nebo telefon.";
    if (validateContact(contactVal)) return validateContact(contactVal);
    if (document.querySelectorAll(".category-option.selected").length === 0)
        return "Vyberte prosím kategorii hodnocení.";
    if (document.querySelectorAll(".star.active").length === 0)
        return "Vyberte prosím hodnocení hvězdičkami.";
    return null;
}

function setSubmitError(message) {
    let el = document.getElementById("submit-error");
    if (!el) {
        el = document.createElement("span");
        el.id = "submit-error";
        el.className = "submit-error";
        document.querySelector(".submit-button").insertAdjacentElement("afterend", el);
    }
    el.textContent = message || "";
    el.style.display = message ? "block" : "none";
}

function updateSubmitState() {
    const error = getSubmitError();
    const btn = document.querySelector(".submit-button");
    if (error) {
        btn.classList.add("submit-disabled");
        btn.disabled = true;
        if (formInteracted) setSubmitError("Prosím vyplňte všechna políčka správně.");
    } else {
        btn.classList.remove("submit-disabled");
        btn.disabled = false;
        setSubmitError(null);
    }
}


document.getElementById("name").addEventListener("blur", function () {
    formInteracted = true;
    const err = validateName(this.value.trim());
    if (err) showError("name", err);
    else clearError("name");
    updateSubmitState();
});

document.getElementById("name").addEventListener("input", function () {
    if (this.classList.contains("input-error")) {
        const err = validateName(this.value.trim());
        if (!err) clearError("name");
    }
    updateSubmitState();
});

document.getElementById("contact").addEventListener("blur", function () {
    formInteracted = true;
    const err = validateContact(this.value.trim());
    if (err) showError("contact", err);
    else clearError("contact");
    updateSubmitState();
});

document.getElementById("contact").addEventListener("input", function () {
    if (this.classList.contains("input-error")) {
        const err = validateContact(this.value.trim());
        if (!err) clearError("contact");
    }
    updateSubmitState();
});


document.querySelectorAll(".category-option").forEach(opt => {
    opt.addEventListener("click", updateSubmitState);
});

document.querySelectorAll(".star").forEach(star => {
    star.addEventListener("click", updateSubmitState);
});

document.querySelector(".submit-button").addEventListener("click", function (e) {
    formInteracted = true;
    const error = getSubmitError();
    if (error) {
        e.stopImmediatePropagation(); // block submitFeedback in FormPage.js
        setSubmitError("Prosím vyplňte všechna políčka správně.");
        return;
    }
    setSubmitError(null);
}, true);