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