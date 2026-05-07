async function renderUsername() {
    try {
        const response = await fetch("/api/user");

        if (!response.ok) {
            return;
        }

        const userData = await response.json();

        const loginText = document.querySelector("#loginText");
        if (loginText) {
            loginText.textContent = userData.username;
        }
    } catch (err) {
        console.error("Failed to load user data:", err);
    }
}

document.addEventListener("DOMContentLoaded", renderUsername);