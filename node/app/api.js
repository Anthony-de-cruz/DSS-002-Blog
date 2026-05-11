import express from "express";

import { collectSessionData, verifyPostAuthSession } from "../middleware/authentication.js";
<<<<<<< HEAD
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
=======
import { requireFields, requireMaxLength } from "../middleware/validation.js";
import { Post } from "../models/post.js";
import { User } from "../models/user.js";

export const router = express.Router();

function parsePostId(value) {
    if (value === undefined || value === null) {
        return null;
    }

    if (typeof value !== "string") {
        return undefined;
    }

    if (value.trim() === "") {
        return null;
    }

    const trimmedValue = value.trim();
    if (!/^[0-9]+$/.test(trimmedValue)) {
        return undefined;
    }

    const postId = Number.parseInt(trimmedValue, 10);
    return postId > 0 ? postId : undefined;
}

function invalidPostInput(req, res) {
    return res.status(400).send("Invalid post input.");
}

// GET user data.
router.get("/user", verifyPostAuthSession, collectSessionData, function (req, res, next) {
    if (!(res.locals.user instanceof User)) {
        return res.sendStatus(404);
    }

    return res.json({
        username: res.locals.user.username,
        email: res.locals.user.email,
        admin: res.locals.user.admin,
    });
});

// GET post data.
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
router.get("/posts", verifyPostAuthSession, async function (req, res, next) {
    try {
        const posts = await Post.readAllFromDatabase();
        return res.json(posts);
    } catch (err) {
        return next(err);
    }
});

<<<<<<< HEAD
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
=======
// POST
router.post(
    "/posts",
    verifyPostAuthSession,
    collectSessionData,
    requireFields(["title_field", "content_field"], function (req, res) {
        return res.status(400).send("Invalid post input.");
    }),
    requireMaxLength("title_field", 256, function (req, res) {
        return res.status(400).send("Invalid post input.");
    }),
    requireMaxLength("content_field", 1024, function (req, res) {
        return res.status(400).send("Invalid post input.");
    }),
    async function (req, res, next) {
        try {
            const postId = parsePostId(req.body.postId);

            if (postId === undefined) {
                return res.status(400).send("Invalid post id.");
            }

            if (postId === null) {
                await Post.buildNew(
                    res.locals.user.username,
                    req.body.title_field,
                    req.body.content_field,
                );
            } else {
                const updatedPost = await Post.updateByAuthorizedUser(
                    postId,
                    res.locals.user.username,
                    res.locals.user.admin,
                    req.body.title_field,
                    req.body.content_field,
                );

                if (updatedPost === null) {
                    return res.status(404).send("Post not found.");
                }
            }

            return res.redirect("/posts/my");
        } catch (err) {
            return next(err);
        }
    },
);

// DELETE post by id.
router.delete(
    "/posts/:id",
    verifyPostAuthSession,
    collectSessionData,
    async function (req, res, next) {
        try {
            const postId = parsePostId(req.params.id);

            if (postId === null || postId === undefined) {
                return res.status(400).send("Invalid post id.");
            }

            const deleted = await Post.deleteByAuthorizedUser(
                postId,
                res.locals.user.username,
                res.locals.user.admin,
            );
            if (!deleted) {
                return res.status(404).send("Post not found.");
            }

            return res.sendStatus(204);
        } catch (err) {
            return next(err);
        }
    },
);
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
