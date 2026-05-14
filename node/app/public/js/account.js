/**
 * Render account details in the accounts page.
 */
async function renderAccountData() {
    const userData = await (await fetch("/api/user")).json();
    const username = document.querySelector("#currentUsername");
    const email = document.querySelector("#currentEmail");
    const loginLink = document.querySelector("#login_link");

    if (username) {
        username.textContent = userData.username;
    }
    if (email) {
        email.textContent = userData.email;
    }
    if (loginLink) {
        loginLink.textContent = userData.username;
    }
    if (userData.admin) {
        renderAdminBanner();
    }
}

/**
 * Add an administrator label to the page header when the user is an admin.
 */
function renderAdminBanner() {
    if (document.querySelector("#admin_banner")) {
        return;
    }

    const banner = document.createElement("span");
    banner.id = "admin_banner";
    banner.textContent = "ADMINISTRATOR";
    document.querySelector("header > h1").insertAdjacentElement("afterend", banner);
}

renderAccountData();
