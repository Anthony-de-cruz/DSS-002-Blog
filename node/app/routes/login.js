import path from "path";
import express from "express";

import { collectSessionData, initSession } from "../authentication.js";
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
router.post("/", async function (req, res, next) {
    if (
        req.body.username === undefined ||
        req.body.password === undefined ||
        req.body.totp === undefined
    ) {
        console.log("err");
        return next();
    }
    console.log(`${req.body.username}, ${req.body.password}`);

    // Hash password before user lookup. This guarantees that passwords are
    // always hashed and usernames are always looked up, mitigating against
    // timing based attacks.

    // let hash;
    // try {
    //     hash = await hashPassword(req.body.password);
    // } catch (err) {
    //     console.log(err);
    //     return next();
    // }

    let user;
    try {
        user = await User.readFromDatabase(req.body.username);
    } catch (err) {
        console.log(err);
        return next();
    }

    const temp = await User.buildNew("user1", "password123", "thing");
    console.log(temp);

    if (!await verifyPassword(req.body.password, user.passwordHash)) {
        // console.log(hash);
        // console.log("!==");
        // console.log(user.passwordHash);
        console.log("invalid password");
        return next();
    }

    if (!(await verifyTotpCode(req.body.totp, user.totpSecret))) {
        console.log("invalid code");
        return next();
    }

    await initSession(res, user.username);

    console.log("success!");

    res.redirect("/");
});
