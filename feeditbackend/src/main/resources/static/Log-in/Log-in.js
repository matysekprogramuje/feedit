const translations = {
    cs: {
        login_title: "Přihlášení",
        login_subtitle: "Přihlaste se do systému správy zpětné vazby.",
        login_error: "Nesprávné přihlašovací údaje",
        username_label: "Uživatelské jméno",
        password_label: "Heslo",
        username_placeholder: "Zadejte uživatelské jméno",
        password_placeholder: "Zadejte heslo",
        login_button: "Přihlásit se",
        go_vodafone: "Přejít na Vodafone",
        main_title: "Portál zákaznické zkušenosti",
        main_desc: "Spravujte zpětnou vazbu zákazníků, sledujte spokojenost a zlepšujte kvalitu služeb.",

    },
    en: {
        login_title: "Login",
        login_subtitle: "Sign in to the feedback management system.",
        login_error: "Invalid credentials",
        username_label: "Username",
        password_label: "Password",
        username_placeholder: "Enter username",
        password_placeholder: "Enter password",
        login_button: "Sign in",
        go_vodafone: "Go to Vodafone",
        main_title: "Customer Experience Portal",
        main_desc: "Manage customer feedback, track satisfaction and improve service quality."
    }
};
let currentLang = "cs";

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
}

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    translatePage();
}

document.addEventListener("DOMContentLoaded", () => {
    currentLang = localStorage.getItem("lang") || "cs";
    translatePage();
});
async function doLogin() {



    const username = document.getElementById("l-user").value.trim();
    const password = document.getElementById("l-pass").value.trim();

    try {

        const response = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const result = await response.text();
        console.log(result)

        if (result === "LOGIN OK") {
            hideError();
            window.location.href = "FeedbackForm.html";
        } else {
            showError();
        }

    } catch (e) {
        console.error(e);
        showError();
    }

}

function showError() {
    document.getElementById("login-error").style.display = "block";
}

function hideError() {
    document.getElementById("login-error").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
    hideError();
    document.getElementById("l-user").addEventListener("keydown", handleEnter);
    document.getElementById("l-pass").addEventListener("keydown", handleEnter);
});

function handleEnter(e) {
    if (e.key === "Enter") doLogin();
}