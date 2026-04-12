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
    if (res.locals.loggedIn) {
        console.log("logged in, redirecting to /");
        res.redirect("/");
    }

    console.log("sending login.html");
    res.sendFile(path.join(import.meta.dirname, "../public/html/login.html"));
});

/* POST login. */
router.post("/", collectSessionData, async function (req, res, next) {
    if (res.locals.loggedIn) {
        console.log("logged in, redirecting to /");
        res.redirect("/");
    }

    if (req.body.username === undefined || req.body.password === undefined) {
        console.log("err");
        return next();
    }
    console.log(`${req.body.username}, ${req.body.password}`);

    let user;
    try {
        user = await User.readFromDatabase(req.body.username);
    } catch (err) {
        console.log(err);
        return next();
    }

    if (!(await verifyPassword(req.body.password, user.passwordHash))) {
        console.log("Invalid Password");
        return next();
    }

    await initPreAuthSession(res, user.username);

    console.log("Login successful");

    res.redirect("/login/mfa");
});

/* GET login mfa. */
router.get(
    "/mfa",
    verifyPreAuthSession,
    collectSessionData,
    function (req, res, next) {
        if (res.locals.loggedIn) {
            console.log("logged in, redirecting to /");
            res.redirect("/");
        }

        console.log("sending login_mfa.html");
        res.sendFile(
            path.join(import.meta.dirname, "../public/html/login_mfa.html"),
        );
    },
);

/* POST login mfa. */
router.post(
    "/mfa",
    verifyPreAuthSession,
    collectSessionData,
    async function (req, res, next) {
        if (req.body.totp === undefined) {
            console.log("err");
            return next();
        }

        console.log(`${req.body.totp}`);

        if ((!res.locals.user) instanceof User) {
            console.log("err");
            return next();
        }

        if (
            !(await verifyTotpCode(req.body.totp, res.locals.user.totpSecret))
        ) {
            console.log("invalid code");
            return next();
        }

        console.log("success!");

        await initPostAuthSession(res, res.locals.user.username);
        res.redirect("/");
    },
);
