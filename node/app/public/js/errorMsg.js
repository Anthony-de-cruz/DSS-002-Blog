/**
 * Render error messages based on search parameters.
 */
async function renderErrorMsg() {
    const params = new URLSearchParams(window.location.search);
    const errors = {
        invalidCredentials: "Invalid credentials",
        missingFields: "Please fill out the required fields",
    };
    const msg = errors[params.get("error")];
    if (msg) {
        const el = document.getElementById("error-msg");
        el.textContent = msg;
        el.classList.remove("hidden");
    }
}

renderErrorMsg();
