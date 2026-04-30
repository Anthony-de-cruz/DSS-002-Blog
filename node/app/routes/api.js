import express from "express";

import { collectSessionData, verifyPostAuthSession } from "../middleware/authentication.js";
import { User } from "../models/user.js";
import { Post } from "../models/post.js";

export const router = express.Router();

// get user data.
router.get("/user", verifyPostAuthSession, collectSessionData, function (req, res, next) {
    if (res.locals.user instanceof User) {
        res.json({
            username: res.locals.user.username,
            email: res.locals.user.email,
        });
    }
});

// get all posts.
router.get("/posts", verifyPostAuthSession, async function (req, res, next) {
    try {
        const posts = await Post.readAllFromDatabase();
        return res.json(posts);
    } catch (err) {
        return next(err);
    }
});

// POST create post.
router.post("/posts", verifyPostAuthSession, collectSessionData, async function (req, res, next) {
    try {
        const title = req.body.title_field;
        const content = req.body.content_field;

        if (!title || !content) {
            return res.status(400).send("Title and content are required.");
        }

        await Post.buildNew(res.locals.user.username, title, content);

        return res.redirect("/html/my_posts.html");
    } catch (err) {
        return next(err);
    }
});