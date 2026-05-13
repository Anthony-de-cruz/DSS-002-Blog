/**
 * Render error messages based on search parameters.
 */
async function renderErrorMsg() {
    const params = new URLSearchParams(window.location.search);
    const errors = {
        accountExists: "Username or email is already in use",
        invalidCredentials: "Invalid credentials",
        invalidDonation: "Please enter a valid donation amount",
        invalidPayment: "Please enter valid card details",
        invalidRegistration: "Please provide a valid username, password, and email",
        maxDonation: "Premium donations cannot be more than GBP 100",
        minimumDonation: "Premium requires a donation of at least GBP 1",
        missingFields: "Please fill out the required fields",
        setupExpired: "Your registration setup expired, please start again",
    };
    const msg = errors[params.get("error")];
    if (msg) {
        const el = document.getElementById("error-msg");
        el.textContent = msg;
        el.classList.remove("hidden");
    }
}

renderErrorMsg();
