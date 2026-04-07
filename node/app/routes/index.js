import path from "path";
import express from "express";

import { collectSessionData, verifySession } from "../authentication.js";

export const router = express.Router();

/* GET index. */
router.get("/", verifySession, collectSessionData, function (req, res, next) {
    console.log("sending index.html")
    res.sendFile(path.join(import.meta.dirname, "../public/html/index.html"));
});

// router.post("/", async (req, res, next) => {
//     const username = req.body.username;
//     const password = req.body.password;
//
//     console.log("Attempted login in as: " + username + "," + password);
//
//     let user;
//     try {
//         user = await User.buildFromDB(username);
//     } catch (exception) {
//         console.error(exception);
//         return res.render("login", { loginResult: "ERR: Username not found" });
//     }
//
//     if (user.password === password) {
//         LoginRegisterController.generateAuthToken(res, user.username);
//         return res.redirect("/");
//     }
//
//     console.log("ERR: login not correct");
//     return res.render("login", { loginResult: "ERR: Incorrect password" });
// });
