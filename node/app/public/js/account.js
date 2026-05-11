/**
 * Render account details in the accounts page.
 */
async function renderAccountData() {
    const userData = await (await fetch("/api/user")).json();
<<<<<<< HEAD
    document.querySelector("#currentUsername").textContent = userData.username;
    document.querySelector("#currentEmail").textContent = userData.email;
=======
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

function renderAdminBanner() {
    if (document.querySelector("#admin_banner")) {
        return;
    }

    const banner = document.createElement("span");
    banner.id = "admin_banner";
    banner.textContent = "ADMINISTRATOR";
    document.querySelector("header > h1").insertAdjacentElement("afterend", banner);
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
}

renderAccountData();
