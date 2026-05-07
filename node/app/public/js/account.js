async function renderAccountData() {
    const response = await fetch("/api/user");
    const userData = await response.json();

    document.querySelector("#currentUsername").textContent = userData.username;
    document.querySelector("#currentEmail").textContent = userData.email;
    document.querySelector("#premiumStatus").textContent = userData.premium
        ? "Premium Account"
        : "Free Account";

    const upgradeBtn = document.querySelector("#upgradeBtn");

    if (userData.premium) {
        upgradeBtn.disabled = true;
        upgradeBtn.textContent = "Already Premium";
    }
}

async function savePaymentMethod(event) {
    event.preventDefault();

    const cardNumber = document.querySelector("#cardNumber").value.trim();
    const expiryMonth = document.querySelector("#expiryMonth").value.trim();
    const expiryYear = document.querySelector("#expiryYear").value.trim();
    const paymentMessage = document.querySelector("#paymentMessage");

    const response = await fetch("/api/payment-method", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            cardNumber,
            expiryMonth,
            expiryYear,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        paymentMessage.textContent = data.error || "Failed to save payment method.";
        return;
    }

    paymentMessage.textContent = "Payment method saved successfully.";
    document.querySelector("#paymentForm").reset();
}

async function upgradeToPremium() {
    const response = await fetch("/api/premium/upgrade", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    const data = await response.json();
    const message = document.querySelector("#upgradeMessage");

    if (!response.ok) {
        message.textContent = data.error || "Upgrade failed.";
        return;
    }

    message.textContent = "Your account is now Premium.";
    await renderAccountData();
}

document.addEventListener("DOMContentLoaded", async () => {
    await renderAccountData();

    const paymentForm = document.querySelector("#paymentForm");
    const upgradeBtn = document.querySelector("#upgradeBtn");

    if (paymentForm) {
        paymentForm.addEventListener("submit", savePaymentMethod);
    }

    if (upgradeBtn) {
        upgradeBtn.addEventListener("click", upgradeToPremium);
    }
});