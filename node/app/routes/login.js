import path from "path";
import express from "express";

import {
    collectSessionData,
    initPreAuthSession,
    initPostAuthSession,
    verifyPreAuthSession,
} from "../middleware/authentication.js";
import { verifyPassword, verifyTotpCode } from "../cryptography.js";
import {
    requireFields,
    requireMaxLength,
    requirePattern,
    requireTotp,
} from "../middleware/validation.js";
import { User } from "../models/user.js";

export const router = express.Router();

/* GET login. */
router.get("/", collectSessionData, function (req, res, next) {
    if (res.locals.loggedIn) res.redirect("/");
    res.sendFile(path.join(import.meta.dirname, "../public/html/login.html"));
});

/* POST login. */
router.post(
    "/",
    collectSessionData,
    // Apply basic form validation before authentication logic.
    requireFields(["username", "password"], function (req, res) {
        return res.redirect("/login?error=missingFields");
    }),
    requireMaxLength("username", 20, function (req, res) {
        return res.redirect("/login?error=invalidCredentials");
    }),
    requireMaxLength("password", 128, function (req, res) {
        return res.redirect("/login?error=invalidCredentials");
    }),
    requirePattern("username", /^[A-Za-z0-9_]+$/, function (req, res) {
        return res.redirect("/login?error=invalidCredentials");
    }),
    async function (req, res, next) {
        if (res.locals.loggedIn) res.redirect("/");

        console.log(`Attempting to log in as: ${req.body.username}...`);

        let user;
        try {
            user = await User.readFromDatabase(req.body.username);
        } catch (err) {
            console.error(err);
            return res.redirect("/login?error=invalidCredentials");
        }

        if (!(await verifyPassword(req.body.password, user.passwordHash)))
            return res.redirect("/login?error=invalidCredentials");

        await initPreAuthSession(res, user.username);
        return res.redirect("/login/mfa");
    },
);

/* GET login mfa. */
router.get("/mfa", verifyPreAuthSession, collectSessionData, function (req, res, next) {
    if (res.locals.loggedIn) res.redirect("/");

    res.sendFile(path.join(import.meta.dirname, "../public/html/login_mfa.html"));
});

/* POST login mfa. */
router.post(
    "/mfa",
    verifyPreAuthSession,
    collectSessionData,
    // Keep MFA input checks simple and local to the route.
    requireTotp("totp", function (req, res) {
        return res.redirect("/login/mfa?error=invalidCredentials");
    }),
    async function (req, res, next) {
        console.log(`Attempting MFA with ${req.body.totp}...`);

        try {
            if (!(await verifyTotpCode(req.body.totp, res.locals.user.totpSecret))) {
                return res.redirect("/login/mfa?error=invalidCredentials");
            }
        } catch (err) {
            return next(err);
        }

        await initPostAuthSession(res, res.locals.user.username);
        return res.redirect("/");
    },
);
