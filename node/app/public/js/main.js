/**
 * Render the username in the header.
 */
async function renderUsername() {
    const userData = await (await fetch("/api/user")).json();
    const loginLink = document.querySelector("#login_link");
    if (loginLink) {
        loginLink.textContent = userData.username;
    }

    if (userData.admin) {
        renderAdminBanner();
    }
}

function renderAdminBanner() {
    if (document.querySelector("#admin_banner")) {
        return;
    }

    const banner = document.createElement("span");
    banner.id = "admin_banner";
    banner.textContent = "ADMINISTRATOR";
    document.querySelector("header > h1").insertAdjacentElement("afterend", banner);
}

renderUsername();
