import path from "path";
import express from "express";

import { verifyPostAuthSession } from "../middleware/authentication.js";

export const router = express.Router();

// Show the page that lists all blog posts.
router.get("/", verifyPostAuthSession, function (req, res, next) {
    res.sendFile(path.join(import.meta.dirname, "../public/html/posts.html"));
});

// Show the page for the current user's own posts.
router.get("/my", verifyPostAuthSession, function (req, res, next) {
    res.sendFile(path.join(import.meta.dirname, "../public/html/my_posts.html"));
});
