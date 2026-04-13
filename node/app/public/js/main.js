/**
 * Render the username in the header.
 */
async function renderUsername() {
    const userData = await (await fetch("/api/user")).json();
    document.querySelector("#login_link").textContent = userData.username;
}

displayUsername();