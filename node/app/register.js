import path from "path";
import { readFile } from "node:fs/promises";
import express from "express";
<<<<<<< HEAD
import xss from 'xss'; // Sanitize user input to prevent XSS attacks
=======
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
import QRCode from "qrcode";

import {
    collectRegisterData,
    collectSessionData,
    initPostAuthSession,
    initRegisterSession,
    verifyRegisterSession,
} from "../middleware/authentication.js";
import { generateTotpUri, verifyTotpCode } from "../cryptography.js";
import {
    requireFields,
    requireMaxLength,
    requirePattern,
    requireTotp,
} from "../middleware/validation.js";
import { User } from "../models/user.js";

export const router = express.Router();

<<<<<<< HEAD
=======
function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
// GET register.
router.get("/", collectSessionData, function (req, res, next) {
    if (res.locals.loggedIn) return res.redirect("/");
    return res.sendFile(path.join(import.meta.dirname, "../public/html/register.html"));
});

// POST register.
router.post(
    "/",
    collectSessionData,
    requireFields(["username", "password", "email"], function (req, res) {
        return res.redirect("/register?error=missingFields");
    }),
    requireMaxLength("username", 20, function (req, res) {
        return res.redirect("/register?error=invalidRegistration");
    }),
    requireMaxLength("password", 64, function (req, res) {
        return res.redirect("/register?error=invalidRegistration");
    }),
    requireMaxLength("email", 30, function (req, res) {
        return res.redirect("/register?error=invalidRegistration");
    }),
    requirePattern("username", /^[A-Za-z0-9_]+$/, function (req, res) {
        return res.redirect("/register?error=invalidRegistration");
    }),
    requirePattern("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/, function (req, res) {
        return res.redirect("/register?error=invalidRegistration");
    }),
    async function (req, res, next) {
        if (res.locals.loggedIn) return res.redirect("/");
<<<<<<< HEAD
   const cleanUsername = xss(req.body.username); // Clean input
const cleanPassword = xss(req.body.password); // Clean input
const cleanEmail = xss(req.body.email);       // Clean input

        try {
           const user = await User.buildNew(cleanUsername, cleanPassword, cleanEmail);
=======

        try {
            const user = await User.buildNew(req.body.username, req.body.password, req.body.email);
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
            await initRegisterSession(res, user);
            return res.redirect("/register/mfa");
        } catch (err) {
            console.error(err);
            return res.redirect("/register?error=invalidRegistration");
        }
    },
);

/* GET register mfa. */
router.get("/mfa", verifyRegisterSession, collectRegisterData, async function (req, res, next) {
    if (!res.locals.pendingUser) return res.redirect("/register?error=setupExpired");

    try {
        const template = await readFile(
            path.join(import.meta.dirname, "../public/html/register_mfa.html"),
            "utf8",
        );
        const totpUri = await generateTotpUri(
            res.locals.pendingUser.email,
            res.locals.pendingUser.totpSecret,
        );
<<<<<<< HEAD
        const page = template.replaceAll("__QR_CODE_DATA_URL__", await QRCode.toDataURL(totpUri));
=======
        const page = template
            .replaceAll("__QR_CODE_DATA_URL__", await QRCode.toDataURL(totpUri))
            .replaceAll("__TOTP_URI__", escapeHtml(totpUri));
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9

        return res.type("html").send(page);
    } catch (err) {
        return next(err);
    }
});

/* POST register mfa. */
router.post(
    "/mfa",
    verifyRegisterSession,
    collectRegisterData,
    requireTotp("totp", function (req, res) {
        return res.redirect("/register/mfa?error=invalidCredentials");
    }),
    async function (req, res, next) {
        if (!res.locals.pendingUser) return res.redirect("/register?error=setupExpired");

        try {
            if (!(await verifyTotpCode(req.body.totp, res.locals.pendingUser.totpSecret)))
                return res.redirect("/register/mfa?error=invalidCredentials");

            const user = new User(
                res.locals.pendingUser.username,
                res.locals.pendingUser.passwordHash,
                res.locals.pendingUser.totpSecret,
                res.locals.pendingUser.email,
                false,
<<<<<<< HEAD
=======
                false,
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
            );
            try {
                await user.writeToDatabase();
            } catch (err) {
                console.error(err);
                res.clearCookie("sessionToken");
                return res.redirect("/register?error=accountExists");
            }

            await initPostAuthSession(res, user.username);
            return res.redirect("/");
        } catch (err) {
            return next(err);
        }
    },
);
