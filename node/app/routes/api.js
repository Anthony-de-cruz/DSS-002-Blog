import express from "express";

import { collectSessionData, verifyPostAuthSession } from "../middleware/authentication.js";
import { User } from "../models/user.js";
import { Post } from "../models/post.js";
import { query } from "../database.js";

export const router = express.Router();

// get user data
router.get("/user", verifyPostAuthSession, collectSessionData, function (req, res, next) {
    if (res.locals.user instanceof User) {
        return res.json({
            username: res.locals.user.username,
            email: res.locals.user.email,
            premium: res.locals.user.premium,
        });
    }

    return res.status(401).json({ error: "Not authenticated." });
});

// save payment method
router.post("/payment-method", verifyPostAuthSession, collectSessionData, async function (req, res, next) {
    try {
        if (!(res.locals.user instanceof User)) {
            return res.status(401).json({ error: "Not authenticated." });
        }

        const { cardNumber, expiryMonth, expiryYear } = req.body;

        const cleanedCardNumber = cardNumber.replace(/\s/g, "");

        if (!/^\d{16}$/.test(cleanedCardNumber)) {
            return res.status(400).json({ error: "Card number must be exactly 16 digits." });
        }

        const last4 = cleanedCardNumber.slice(-4);

        const month = Number(expiryMonth);
        const year = Number(expiryYear);

        if (!Number.isInteger(month) || month < 1 || month > 12) {
            return res.status(400).json({ error: "Expiry month must be between 1 and 12." });
        }

        if (!Number.isInteger(year) || year < 2026 || year > 2050) {
            return res.status(400).json({ error: "Expiry year must be between 2026 and 2050." });
        }

        const existing = await query(
            "SELECT payment_method_id FROM payment_method WHERE username = $1;",
            [res.locals.user.username]
        );

        if (existing.rowCount > 0) {
            await query(
                `UPDATE payment_method
                 SET last_4_digits = $1, expiry_year = $2, expiry_month = $3
                 WHERE username = $4;`,
                [last4, year, month, res.locals.user.username]
            );
        } else {
            await query(
                `INSERT INTO payment_method (username, last_4_digits, expiry_year, expiry_month)
                 VALUES ($1, $2, $3, $4);`,
                [res.locals.user.username, last4, year, month]
            );
        }

        return res.json({ message: "Payment method saved." });
    } catch (err) {
        return next(err);
    }
});

// upgrade to premium
router.post("/premium/upgrade", verifyPostAuthSession, collectSessionData, async function (req, res, next) {
    try {
        if (!(res.locals.user instanceof User)) {
            return res.status(401).json({ error: "Not authenticated." });
        }

        const paymentResult = await query(
            "SELECT payment_method_id FROM payment_method WHERE username = $1;",
            [res.locals.user.username]
        );

        if (paymentResult.rowCount < 1) {
            return res.status(400).json({
                error: "No payment method found for this account.",
            });
        }

        await res.locals.user.upgradeToPremium();

        return res.json({
            message: "Account upgraded successfully.",
            premium: true,
        });
    } catch (err) {
        return next(err);
    }
});

// get all posts
router.get("/posts", verifyPostAuthSession, async function (req, res, next) {
    try {
        const posts = await Post.readAllFromDatabase();
        return res.json(posts);
    } catch (err) {
        return next(err);
    }
});

// create post
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