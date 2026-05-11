/**
 * Render the username in the header.
 */
async function renderUsername() {
    const userData = await (await fetch("/api/user")).json();
<<<<<<< HEAD
    document.querySelector("#login_link").textContent = userData.username;
=======
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
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
}

renderUsername();
