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