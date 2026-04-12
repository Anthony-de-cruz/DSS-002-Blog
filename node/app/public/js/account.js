async function renderAccountData() {
    const userData = await (await fetch("/api/user")).json();
    document.querySelector("#currentUsername").textContent = `<b>Current Email:</b> ${userData.username}`;
    document.querySelector("#currentEmail").textContent = `<b>Current Email:</b> ${userData.email}`;
}

renderAccountData();