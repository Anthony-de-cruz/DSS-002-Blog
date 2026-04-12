import express from "express";

import {
    collectSessionData,
    verifyPostAuthSession,
} from "../authentication.js";
import { User } from "../models/user.js";

export const router = express.Router();

// GET user data.
router.get(
    "/user",
    verifyPostAuthSession,
    collectSessionData,
    function (req, res, next) {
        if (res.locals.user instanceof User)
            res.json({
                username: res.locals.user.username,
                email: res.locals.user.email,
            }); // Either type User or null.
    },
);

// GET posts.
router.get("/posts", verifyPostAuthSession, function (req, res, next) {
    res.json({}); // RETURN THE COMPLETE SET OF POSTS.
});
