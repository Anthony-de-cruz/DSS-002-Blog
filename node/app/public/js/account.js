/**
 * Render account details in the accounts page.
 */
async function renderAccountData() {
    const userData = await (await fetch("/api/user")).json();
    document.querySelector("#currentUsername").textContent = userData.username;
    document.querySelector("#currentEmail").textContent = userData.email;
}

renderAccountData();