import path from "path";
import express from "express";

import {
    collectSessionData,
    verifyPostAuthSession,
    verifyElevatedAuthSession,
    initElevatedAuthSession,
} from "../middleware/authentication.js";
import { verifyTotpCode } from "../cryptography.js";
import {
    requireFields,
    requireMaxLength,
    requirePattern,
    requireTotp,
} from "../middleware/validation.js";

export const router = express.Router();

router.get("/", verifyPostAuthSession, function (req, res, next) {
    res.sendFile(path.join(import.meta.dirname, "../public/html/account.html"));
});

// GET elevate account.
router.get("/elevate", verifyPostAuthSession, collectSessionData, function (req, res, next) {
    res.sendFile(path.join(import.meta.dirname, "../public/html/account_elevate.html"));
});

// POST elevate account.
router.post(
    "/elevate",
    verifyPostAuthSession,
    collectSessionData,
    // Reuse the same TOTP validation for account elevation.
    requireTotp("totp", function (req, res) {
        return res.redirect("/account/elevate?error=invalidCredentials");
    }),
    async function (req, res, next) {
        console.log(`Attempting MFA with ${req.body.totp}...`);

        try {
            if (!(await verifyTotpCode(req.body.totp, res.locals.user.totpSecret))) {
                return res.redirect("/account/elevate?error=invalidCredentials");
            }
        } catch (err) {
            return next(err);
        }

        await initElevatedAuthSession(res, res.locals.user.username);
        return res.redirect("/account/edit");
    },
);

// GET edit account.
router.get("/edit", verifyElevatedAuthSession, collectSessionData, function (req, res, next) {
    res.sendFile(path.join(import.meta.dirname, "../public/html/account_edit.html"));
});

// POST edit account username.
router.post(
    "/edit/username",
    verifyElevatedAuthSession,
    collectSessionData,
    // Match username checks to the database's size and allowed character set.
    requireFields(["newUsername"], function (req, res) {
        return res.redirect("/account/edit?error=missingFields");
    }),
    requireMaxLength("newUsername", 20, function (req, res) {
        return res.redirect("/account/edit?error=invalidCredentials");
    }),
    requirePattern("newUsername", /^[A-Za-z0-9_]+$/, function (req, res) {
        return res.redirect("/account/edit?error=invalidCredentials");
    }),
    async function (req, res, next) {
        console.log(`Attempting to update username to ${req.body.newUsername}...`);

        try {
            await res.locals.user.updateUsername(req.body.newUsername);
        } catch (err) {
            return res.redirect("/account/edit?error=invalidCredentials");
        }

        // Reset session due to username change.
        await initElevatedAuthSession(res, res.locals.user.username);
        res.redirect("/account/edit");
    },
);

// POST edit account password.
router.post(
    "/edit/password",
    verifyElevatedAuthSession,
    collectSessionData,
    // Only keep the password checks needed for the demonstrator.
    requireFields(["newPassword"], function (req, res) {
        return res.redirect("/account/edit?error=missingFields");
    }),
    requireMaxLength("newPassword", 64, function (req, res) {
        return res.redirect("/account/edit?error=invalidCredentials");
    }),
    async function (req, res, next) {
        console.log(`Attempting to update password...`);

        try {
            await res.locals.user.updatePassword(req.body.newPassword);
        } catch (err) {
            return res.redirect("/account/edit?error=invalidCredentials");
        }

        res.redirect("/account/edit");
    },
);

// POST edit account email.
router.post(
    "/edit/email",
    verifyElevatedAuthSession,
    collectSessionData,
    // Basic email validation is enough here before handing off to the model.
    requireFields(["newEmail"], function (req, res) {
        return res.redirect("/account/edit?error=missingFields");
    }),
    requireMaxLength("newEmail", 30, function (req, res) {
        return res.redirect("/account/edit?error=invalidCredentials");
    }),
    requirePattern("newEmail", /^[^\s@]+@[^\s@]+\.[^\s@]+$/, function (req, res) {
        return res.redirect("/account/edit?error=invalidCredentials");
    }),
    async function (req, res, next) {
        console.log(`Attempting to update email to ${req.body.newEmail}...`);

        try {
            await res.locals.user.updateEmail(req.body.newEmail);
        } catch (err) {
            return res.redirect("/account/edit?error=invalidCredentials");
        }

        res.redirect("/account/edit");
    },
);
