const translations = {
    cs: {
        go_vodafone: "Přejít na Vodafone",

        register_title: "Vytvořte si účet",
        register_subtitle: "Registrace trvá méně než minutu.",
        required_fields_text: "Políčka označená * jsou povinná.",

        full_name_label: "Jméno a příjmení *",
        full_name_placeholder: "Jan Novák",

        phone_label: "Telefon",
        phone_placeholder: "+420 123 456 789",

        email_label: "E-mail *",
        email_placeholder: "jan@email.cz",

        password_label: "Heslo *",
        password_placeholder: "••••••••",

        confirm_password_label: "Potvrzení hesla *",
        confirm_password_placeholder: "••••••••",

        show_password: "Zobrazit heslo",

        consent_text: "Souhlasím se zpracováním osobních údajů a obchodními podmínkami Vodafone.",

        register_button: "Registrovat se",

        already_have_account: "Máte již účet?",
        login_link: "Přihlásit se",

        success_title: "Vítejte!",
        success_message: "Váš účet byl úspěšně vytvořen. Můžete se nyní přihlásit.",
        back_to_registration: "Zpět na registraci",

        footer_copyright: "Copyright © 2026 Feed It technologie Vodafone"
    },

    en: {
        go_vodafone: "Go to Vodafone",

        register_title: "Create an Account",
        register_subtitle: "Registration takes less than a minute.",
        required_fields_text: "Fields marked with * are required.",

        full_name_label: "Full Name *",
        full_name_placeholder: "John Smith",

        phone_label: "Phone",
        phone_placeholder: "+420 123 456 789",

        email_label: "Email *",
        email_placeholder: "john@email.com",

        password_label: "Password *",
        password_placeholder: "••••••••",

        confirm_password_label: "Confirm Password *",
        confirm_password_placeholder: "••••••••",

        show_password: "Show password",

        consent_text: "I agree to the processing of personal data and Vodafone terms and conditions.",

        register_button: "Register",

        already_have_account: "Already have an account?",
        login_link: "Sign in",

        success_title: "Welcome!",
        success_message: "Your account has been successfully created. You can now sign in.",
        back_to_registration: "Back to registration",

        footer_copyright: "Copyright © 2026 Feed It Vodafone Technology"
    }
};

let currentLang = "cs";

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    translatePage();
}

document.addEventListener("DOMContentLoaded", () => {
    currentLang = localStorage.getItem("lang") || "cs";
    translatePage();
});


function translatePage() {
    const dict = translations[currentLang];

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        el.innerText = dict[key] || "";
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        el.placeholder = dict[key] || "";
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach(el => {
        const key = el.getAttribute("data-i18n-aria-label");
        el.setAttribute("aria-label", dict[key] || "");
    });
}




var consentOn = false;

function toggleConsent() {
    consentOn = !consentOn;
    document.getElementById('chk').classList.toggle('on', consentOn);
}

function togglePw(id, btn) {
    var inp = document.getElementById(id);
    var showing = inp.type === 'text';
    inp.type = showing ? 'password' : 'text';
    btn.innerHTML = showing
        ? '<i class="ti ti-eye"></i>'
        : '<i class="ti ti-eye-off"></i>';
}

function updateStrength(val) {
    var score = 0;
    if (val.length >= 8)          score++;
    if (/[A-Z]/.test(val))        score++;
    if (/[0-9]/.test(val))        score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    var colors = ['#eee', '#e24b4a', '#f4a623', '#63c36a', '#1d9e75'];
    var active = val.length > 0 ? colors[score] : '#eee';

    for (var i = 1; i <= 4; i++) {
        document.getElementById('b' + i).style.background = i <= score ? active : '#eee';
    }
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

function validateRegName(value) {
    if (!value) return "Vyplňte prosím jméno.";
    if (value.length < 2) return "Jméno musí mít alespoň 2 znaky.";
    if (/[^\p{L}\s'\-]/u.test(value)) return "Jméno smí obsahovat pouze písmena.";
    return null;
}

function validateEmail(value) {
    if (!value) return "Vyplňte prosím e-mail.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return "Zadejte platnou e-mailovou adresu.";
    return null;
}

function validatePhone(value) {
    if (!value) return null;
    const digits = value.replace(/[\s\-().+]/g, "");
    if (!/^\d{7,15}$/.test(digits)) return "Zadejte platné telefonní číslo (7–15 číslic).";
    return null;
}

function validatePassword(value) {
    if (!value) return "Vyplňte prosím heslo.";
    if (value.length < 8) return "Heslo musí mít alespoň 8 znaků.";
    return null;
}

function validateConfirm(value) {
    const pw = document.getElementById("f-pw").value;
    if (!value) return "Potvrďte prosím heslo.";
    if (value !== pw) return "Hesla se neshodují.";
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

attachFieldValidation("f-name", validateRegName);
attachFieldValidation("f-email", validateEmail);
attachFieldValidation("f-phone", validatePhone);
attachFieldValidation("f-pw", validatePassword);
attachFieldValidation("f-pw2", validateConfirm);

async function submitForm() {
    var name   = document.getElementById('f-name').value.trim();
    var email  = document.getElementById('f-email').value.trim();
    var number = document.getElementById('f-phone').value.trim();
    var pw     = document.getElementById('f-pw').value;
    var pw2    = document.getElementById('f-pw2').value;

    const nameErr    = validateRegName(name);
    const emailErr   = validateEmail(email);
    const phoneErr   = validatePhone(number);
    const pwErr      = validatePassword(pw);
    const confirmErr = validateConfirm(pw2);

    if (nameErr)    showError('f-name', nameErr);
    if (emailErr)   showError('f-email', emailErr);
    if (phoneErr)   showError('f-phone', phoneErr);
    if (pwErr)      showError('f-pw', pwErr);
    if (confirmErr) showError('f-pw2', confirmErr);

    if (nameErr || emailErr || phoneErr || pwErr || confirmErr) return;

    if (!consentOn) {
        alert('Pro registraci je nutný souhlas s podmínkami.');
        return;
    }

    var btn = document.querySelector('.submit-button');
    btn.disabled = true;
    btn.innerHTML = '<i class="ti ti-loader"></i> Registruji...';

    try {
        var response = await fetch('http://localhost:8080/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: name, email: email, number: number, password: pw })
        });

        var result = await response.text();

        if (result === 'REGISTER OK') {
            document.getElementById('form-section').style.display = 'none';
            document.getElementById('success-section').style.display = 'flex';
        } else if (result === 'USER EXISTS') {
            showError('f-name', 'Uživatel s tímto jménem již existuje.');
        } else {
            alert('Chyba při registraci: ' + result);
        }

    } catch (e) {
        alert('Nepodařilo se spojit se serverem. Zkuste to znovu.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ti ti-user-plus"></i> Registrovat se';
    }
}

function resetForm() {
    document.getElementById('f-name').value  = '';
    document.getElementById('f-email').value = '';
    document.getElementById('f-phone').value = '';
    document.getElementById('f-pw').value    = '';
    document.getElementById('f-pw2').value   = '';
    consentOn = false;
    document.getElementById('chk').classList.remove('on');
    updateStrength('');
    clearError('f-name');
    clearError('f-email');
    clearError('f-phone');
    clearError('f-pw');
    clearError('f-pw2');
    document.getElementById('success-section').style.display = 'none';
    document.getElementById('form-section').style.display    = 'block';
}