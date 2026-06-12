async function doLogin() {
    const username = document.getElementById("l-user").value.trim();
    const password = document.getElementById("l-pass").value.trim();

    if (!username || !password) { showError(); return; }

    const btn = document.getElementById("loginButton");
    btn.disabled = true;
    btn.textContent = lang === "cs" ? "Přihlašování..." : "Signing in...";

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            hideError();
            sessionStorage.setItem("feedit-user", data.username);
            sessionStorage.setItem("feedit-role", data.role);

            // Přesměrování podle role
            if (data.role === "ADMIN") {
                window.location.href = "../frondEndStyl/Admin.html";
            } else {
                window.location.href = "../Form/FormPage.html";
            }
        } else {
            showError();
            btn.disabled = false;
            btn.textContent = translations[lang].loginButton;
        }

    } catch (e) {
        console.error(e);
        showError();
        btn.disabled = false;
        btn.textContent = translations[lang].loginButton;
    }
}

function showError() {
    document.getElementById("loginError").style.display = "block";
}
function hideError() {
    document.getElementById("loginError").style.display = "none";
}
function handleEnter(e) {
    if (e.key === "Enter") doLogin();
}

function applyLanguage() {
    const t = translations[lang];
    setText("portalTitle",    t.portalTitle);
    setText("portalTitleDes", t.portalTitleDes);
    setText("platform",       t.platform);
    setText("login",          t.login);
    setText("loginSubtitle",  t.loginSubtitle);
    setText("lbl-username",   t.username);
    setText("lbl-password",   t.password);
    setText("loginButton",    t.loginButton);
    setText("loginError",     t.loginError);
    setText("noAccountText",  lang === "cs" ? "Nemáte účet?" : "Don't have an account?");
    setText("registerLink",   lang === "cs" ? "Zaregistrujte se" : "Register");
    setPlaceholder("l-user",  t.usernamePlaceholder);
    setPlaceholder("l-pass",  t.passwordPlaceholder);
}

document.addEventListener("DOMContentLoaded", () => {
    hideError();
    mountLangSwitcher();
    applyLanguage();
    document.getElementById("l-user").addEventListener("keydown", handleEnter);
    document.getElementById("l-pass").addEventListener("keydown", handleEnter);
});