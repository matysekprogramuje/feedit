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
        console.log(result);

        if (result.trim() === "LOGIN OK ADMIN") {
            sessionStorage.setItem("username", username);
            window.location.href = "../frondEndStyl/Admin.html";
        }

        if (result.trim() === "LOGIN OK USER") {
            sessionStorage.setItem("username", username);
            window.location.href = "../Introduction/IntroductionPage.html";
        }

        else {
            showLoginError();
        }

    } catch (e) {
        console.error(e);
        showLoginError();
    }
}
function showLoginError() {
    document.getElementById("login-error").style.display = "block";
}

function hideLoginError() {
    document.getElementById("login-error").style.display = "none";
}