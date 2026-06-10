function doLogin() {
    const username = document.getElementById("l-user").value.trim().toLowerCase();
    const password = document.getElementById("l-pass").value.trim();

    if (username === "admin" && password === "admin123") {
        hideError();
        window.location.href = "Admin.html";

    } else if (username === "customer" && password === "user123") {
        hideError();
        window.location.href = "FeedbackForm.html";

    } else {
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