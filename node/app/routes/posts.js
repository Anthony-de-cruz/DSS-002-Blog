import path from "path";
import express from "express";

import { verifyPostAuthSession } from "../middleware/authentication.js";

export const router = express.Router();

router.get("/", verifyPostAuthSession, function (req, res, next) {
    res.sendFile(path.join(import.meta.dirname, "../public/html/posts.html"));
});

router.get("/my", verifyPostAuthSession, function (req, res, next) {
    res.sendFile(path.join(import.meta.dirname, "../public/html/my_posts.html"));
});
