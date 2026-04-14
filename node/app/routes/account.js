import path from "path";
import express from "express";

import {
    collectSessionData,
    verifyPostAuthSession,
    verifyElevatedAuthSession,
    initElevatedAuthSession,
} from "../authentication.js";
import { verifyPassword, verifyTotpCode } from "../cryptography.js";
import { User } from "../models/user.js";

export const router = express.Router();

router.get("/", verifyPostAuthSession, function (req, res, next) {
    res.sendFile(path.join(import.meta.dirname, "../public/html/account.html"));
});

// GET elevate account.
router.get("/elevate", verifyPostAuthSession, collectSessionData, function (req, res, next) {
    res.sendFile(path.join(import.meta.dirname, "../public/html/account_elevate.html"));
});

// POST elevate account.
router.post("/elevate", verifyPostAuthSession, collectSessionData, async function (req, res, next) {
    if (req.body.totp === undefined || req.body.totp.length === 0)
        return res.redirect("/account/elevate?error=missingFields");
    if (req.body.totp.length !== 6)
        return res.redirect("/account/elevate?error=invalidCredentials");

    console.log(`Attemping to mfa with ${req.body.totp}...`);

    if ((!res.locals.user) instanceof User) {
        return next(new Error("Failed to get user data."));
    }

    try {
        if (!(await verifyTotpCode(req.body.totp, res.locals.user.totpSecret))) {
            return res.redirect("/account/elevate?error=invalidCredentials");
        }
    } catch (err) {
        return next(err);
    }

    await initElevatedAuthSession(res, res.locals.user.username);
    res.redirect("/account/edit");
});

// GET edit account.
router.get("/edit", verifyElevatedAuthSession, collectSessionData, function (req, res, next) {
    res.sendFile(path.join(import.meta.dirname, "../public/html/account_edit.html"));
});

// POST edit account username.
router.post(
    "/edit/username",
    verifyElevatedAuthSession,
    collectSessionData,
    async function (req, res, next) {
        if (req.body.newUsername === undefined || req.body.newUsername.length === 0)
            return res.redirect("/account/edit?error=missingFields");

        console.log(`Attemping to update username to ${req.body.newUsername}...`);

        if ((!res.locals.user) instanceof User) {
            return next(new Error("Failed to get user data."));
        }

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
    async function (req, res, next) {
        if (req.body.newPassword === undefined || req.body.newPassword.length === 0)
            return res.redirect("/account/edit?error=missingFields");

        console.log(`Attemping to update password...`);

        if ((!res.locals.user) instanceof User) {
            return next(new Error("Failed to get user data."));
        }

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
    async function (req, res, next) {
        if (req.body.newEmail === undefined || req.body.newEmail.length === 0)
            return res.redirect("/account/edit?error=missingFields");

        console.log(`Attemping to update email to ${req.body.newEmail}...`);

        if ((!res.locals.user) instanceof User) {
            return next(new Error("Failed to get user data."));
        }

        try {
            await res.locals.user.updateEmail(req.body.newEmail);
        } catch (err) {
            return res.redirect("/account/edit?error=invalidCredentials");
        }

        res.redirect("/account/edit");
    },
);
