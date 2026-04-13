import path from "path";
import express from "express";

import {
    collectSessionData,
    initPreAuthSession,
    initPostAuthSession,
    verifyPreAuthSession,
} from "../authentication.js";
import { verifyPassword, verifyTotpCode } from "../cryptography.js";
import { User } from "../models/user.js";

export const router = express.Router();

/* GET login. */
router.get("/", collectSessionData, function (req, res, next) {
    if (res.locals.loggedIn) res.redirect("/");
    res.sendFile(path.join(import.meta.dirname, "../public/html/login.html"));
});

/* POST login. */
router.post("/", collectSessionData, async function (req, res, next) {
    if (res.locals.loggedIn) res.redirect("/");

    if (
        req.body.username === undefined ||
        req.body.username.length === 0 ||
        req.body.password === undefined ||
        req.body.password.length === 0
    ) {
        return res.redirect("/login?error=missingFields");
    }
    console.log(`Attemping to log in as: ${req.body.username}...`);

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
    res.redirect("/login/mfa");
});

/* GET login mfa. */
router.get("/mfa", verifyPreAuthSession, collectSessionData, function (req, res, next) {
    if (res.locals.loggedIn) res.redirect("/");

    res.sendFile(path.join(import.meta.dirname, "../public/html/login_mfa.html"));
});

/* POST login mfa. */
router.post("/mfa", verifyPreAuthSession, collectSessionData, async function (req, res, next) {
    if (req.body.totp === undefined || req.body.totp.length === 0)
        return res.redirect("/login/mfa?error=missingFields");

    console.log(`Attemping to mfa with ${req.body.totp}...`);

    if ((!res.locals.user) instanceof User) {
        return next(new Error("Failed to get user data."));
    }

    try {
        if (!(await verifyTotpCode(req.body.totp, res.locals.user.totpSecret))) {
            return res.redirect("/login/mfa?error=invalidCredentials");
        }
    } catch (err) {
        return next(err);
    }

    await initPostAuthSession(res, res.locals.user.username);
    res.redirect("/");
});
