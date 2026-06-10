let currentRole = "user";

function setRole(role) {
    currentRole = role;

    document.getElementById("role-user-btn").classList.remove("active");
    document.getElementById("role-admin-btn").classList.remove("active");

    if (role === "user") {
        document.getElementById("role-user-btn").classList.add("active");
    } else {
        document.getElementById("role-admin-btn").classList.add("active");
    }

    hideError();
}

function doLogin() {
    const username = document.getElementById("l-user").value.trim().toLowerCase();
    const password = document.getElementById("l-pass").value.trim();

    let valid = false;

    if (currentRole === "user"  && username === "customer" && password === "user123")  valid = true;
    if (currentRole === "admin" && username === "admin"    && password === "admin123") valid = true;

    if (valid) {
        hideError();

        // Store role so destination pages know who is logged in
        sessionStorage.setItem("feedit-role", currentRole);
        sessionStorage.setItem("feedit-user", username);

        if (currentRole === "admin") {
            window.location.href = "Admin.html";
        } else {
            window.location.href = "FeedbackForm.html";
        }

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