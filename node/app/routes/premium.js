import path from "path";
import express from "express";

import { collectSessionData, verifyPostAuthSession } from "../middleware/authentication.js";
import { requireFields } from "../middleware/validation.js";
import { Payment } from "../models/payment.js";

export const router = express.Router();

//Parse a whole-number donation amount from the submitted form.
function parseDonationAmount(value) {
    if (typeof value !== "string") {
        return null;
    }

    const trimmedValue = value.trim();

    if (!/^[0-9]+$/.test(trimmedValue)) {
        return null;
    }

    return Number.parseInt(trimmedValue, 10);
}

 //Normalise and validate a card number without storing the full value.
function parseCardNumber(value) {
    if (typeof value !== "string") {
        return null;
    }

    const cardNumber = value.replaceAll(" ", "").replaceAll("-", "");
    if (!/^[0-9]{13,19}$/.test(cardNumber)) {
        return null;
    }

    return passesLuhnCheck(cardNumber) ? cardNumber : null;
}

//Use the Luhn algorithm to check that the card number has a valid structure.
function passesLuhnCheck(cardNumber) {
    let sum = 0;
    let doubleDigit = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = Number.parseInt(cardNumber[i], 10);

        if (doubleDigit) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        doubleDigit = !doubleDigit;
    }

    return sum % 10 === 0;
}

//Validate the card expiry date and reject expired cards.
function parseExpiry(monthValue, yearValue) {
    if (
        typeof monthValue !== "string" ||
        typeof yearValue !== "string" ||
        !/^[0-9]{2}$/.test(monthValue.trim()) ||
        !/^[0-9]{4}$/.test(yearValue.trim())
    ) {
        return null;
    }

    const month = Number.parseInt(monthValue, 10);
    const year = Number.parseInt(yearValue, 10);

    if (!Number.isInteger(month) || !Number.isInteger(year)) {
        return null;
    }

    if (month < 1 || month > 12 || year < 2026 || year > 2050) {
        return null;
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return null;
    }

    return { month, year };
}

//Check the security code format without storing the security code.
function isValidSecurityCode(value) {
    return typeof value === "string" && /^[0-9]{3,4}$/.test(value.trim());
}

// Show the premium page only to users who have already upgraded.
router.get("/", verifyPostAuthSession, collectSessionData, function (req, res, next) {
    if (!res.locals.user.premium) {
        return res.redirect("/premium/upgrade");
    }

    return res.sendFile(path.join(import.meta.dirname, "../public/html/premium.html"));
});

// Show the upgrade form to logged in users who are not premium yet.
router.get("/upgrade", verifyPostAuthSession, collectSessionData, function (req, res, next) {
    if (res.locals.user.premium) {
        return res.redirect("/premium");
    }

    return res.sendFile(path.join(import.meta.dirname, "../public/html/premium_upgrade.html"));
});

// Validate the demo payment, record only encrypted safe details, then upgrade the account.
router.post(
    "/upgrade",
    verifyPostAuthSession,
    collectSessionData,
    requireFields(
        ["amount", "cardNumber", "expiryMonth", "expiryYear", "securityCode"],
        function (req, res) {
            return res.redirect("/premium/upgrade?error=missingFields");
        },
    ),
    async function (req, res, next) {
        const amount = parseDonationAmount(req.body.amount);
        const cardNumber = parseCardNumber(req.body.cardNumber);
        const expiry = parseExpiry(req.body.expiryMonth, req.body.expiryYear);

        if (amount === null) {
            return res.redirect("/premium/upgrade?error=invalidDonation");
        }

        if (amount < 1) {
            return res.redirect("/premium/upgrade?error=minimumDonation");
        }

        if (amount > 100) {
            return res.redirect("/premium/upgrade?error=maxDonation");
        }

        if (cardNumber === null || expiry === null || !isValidSecurityCode(req.body.securityCode)) {
            return res.redirect("/premium/upgrade?error=invalidPayment");
        }

        try {
            await Payment.recordDonation(
                res.locals.user.username,
                cardNumber.slice(-4),
                expiry.year,
                expiry.month,
                amount,
            );
            await res.locals.user.upgradeToPremium();
            return res.redirect("/premium");
        } catch (err) {
            return next(err);
        }
    },
);
