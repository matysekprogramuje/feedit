var consentOn = false;

function toggleConsent() {
    consentOn = !consentOn;
    document.getElementById("chk").classList.toggle("on", consentOn);
}

function togglePw(id, btn) {
    const inp     = document.getElementById(id);
    const showing = inp.type === "text";
    inp.type      = showing ? "password" : "text";
    btn.innerHTML = showing
        ? '<i class="ti ti-eye"></i>'
        : '<i class="ti ti-eye-off"></i>';
}

function updateStrength(val) {
    let score = 0;
    if (val.length >= 8)          score++;
    if (/[A-Z]/.test(val))        score++;
    if (/[0-9]/.test(val))        score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const colors = ["#eee","#e24b4a","#f4a623","#63c36a","#1d9e75"];
    const active  = val.length > 0 ? colors[score] : "#eee";

    for (let i = 1; i <= 4; i++) {
        document.getElementById("b" + i).style.background = i <= score ? active : "#eee";
    }
}

async function submitForm() {
    const username = document.getElementById("f-username").value.trim();
    const pw       = document.getElementById("f-pw").value;
    const pw2      = document.getElementById("f-pw2").value;
    const msgs     = registerMessages[lang];

    if (!username || !pw) { alert(msgs.requiredFields);    return; }
    if (pw !== pw2)        { alert(msgs.passwordsMismatch); return; }
    if (!consentOn)        { alert(msgs.consentRequired);   return; }

    const btn = document.getElementById("registerBtn");
    btn.disabled = true;
    document.getElementById("lbl-register").textContent = msgs.registering;

    try {
        const response = await fetch("/api/auth/register", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ username, password: pw })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById("form-section").style.display    = "none";
            document.getElementById("success-section").style.display = "flex";
        } else {
            alert(data.message || msgs.connectionError);
        }

    } catch (e) {
        alert(msgs.connectionError);
    } finally {
        btn.disabled = false;
        document.getElementById("lbl-register").textContent =
            translations[lang].register;
    }
}

function goToLogin() {
    window.location.href = "../Log-in/Log-in.html";
}

function resetForm() {
    document.getElementById("f-username").value = "";
    document.getElementById("f-pw").value       = "";
    document.getElementById("f-pw2").value      = "";
    consentOn = false;
    document.getElementById("chk").classList.remove("on");
    updateStrength("");
    document.getElementById("success-section").style.display = "none";
    document.getElementById("form-section").style.display    = "block";
}

function applyLanguage() {
    const t = translations[lang];
    setText("createAccount",          t.createAccount);
    setText("registerSubtitle",       t.registerSubtitle);
    setText("lbl-fullName",           t.fullName + " *");
    setText("lbl-phone",              t.phone);
    setText("lbl-username",           t.username + " *");
    setText("lbl-password",           t.password + " *");
    setText("lbl-passwordConfirm",    t.passwordConfirm + " *");
    setHTML ("lbl-personalDataConsent", t.personalDataConsent);
    setText("lbl-register",           t.register);
    setText("lbl-alreadyAccount",     t.alreadyAccount);
    setText("lbl-backToLogin",        t.backToLogin);
    setText("lbl-welcome",            t.welcome);
    setText("lbl-accountCreated",     t.accountCreated);
    setText("lbl-goLogin",            t.backToLogin);
    setText("lbl-copyright",          t.copyright);
    setText("goToVod",                t.goToVod);
}

document.addEventListener("DOMContentLoaded", () => {
    mountLangSwitcher();
    applyLanguage();
});