import path from "path";
import express from "express";

import {
    collectSessionData,
    initPreAuthSession,
    initPostAuthSession,
    verifyPreAuthSession,
} from "../middleware/authentication.js";
import { verifyPassword, verifyTotpCode } from "../cryptography.js";
import {
    requireFields,
    requireMaxLength,
    requirePattern,
    requireTotp,
} from "../middleware/validation.js";
import { User } from "../models/user.js";

export const router = express.Router();

// login limit start
// Per-username: max 3 failed login attempts within RATE_WINDOW_MS.
// Per-IP: max 5 failed login attempts within RATE_WINDOW_MS.

const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS_PER_USER = 3;
const MAX_ATTEMPTS_PER_IP = 5;

const userFailures = new Map(); //username number[] of timestamps
const ipFailures = new Map(); //IP number[] of timestamps

function pruneTimestamps(arr) {
    const cutoff = Date.now() - RATE_WINDOW_MS;
    while (arr.length && arr[0] < cutoff) arr.shift();
    return arr;
}

function countFailures(map, key) {
    if (!key) return 0;
    const arr = map.get(key);
    if (!arr) return 0;
    return pruneTimestamps(arr).length;
}

function recordFailure(map, key) {
    if (!key) return;
    const arr = map.get(key) || [];
    pruneTimestamps(arr);
    arr.push(Date.now());
    map.set(key, arr);
}

function clearFailures(map, key) {
    if (key) map.delete(key);
}

function loginRateLimit(req, res, next) {
    const ipKey = req.ip || req.socket?.remoteAddress || "unknown";
    const usernameKey =
        typeof req.body?.username === "string" && req.body.username.trim().length > 0
            ? req.body.username.trim().toLowerCase()
            : null;

    const userCount = countFailures(userFailures, usernameKey);
    const ipCount = countFailures(ipFailures, ipKey);

    if (userCount >= MAX_ATTEMPTS_PER_USER || ipCount >= MAX_ATTEMPTS_PER_IP) {
        console.log(
            `Rate limit hit on /login (user=${usernameKey ?? "<none>"} count=${userCount}, ip=${ipKey} count=${ipCount})`,
        );
        return res.redirect("/login?error=tooManyAttempts");
    }

    // Expose recorders to the route handler = register the outcome.
    res.locals.loginLimiter = {
        recordFailure: () => {
            recordFailure(userFailures, usernameKey);
            recordFailure(ipFailures, ipKey);
        },
        clearUserOnSuccess: () => {
            clearFailures(userFailures, usernameKey);
        },
    };

    return next();
}
// #login limit end

/* GET login. */
router.get("/", collectSessionData, function (req, res, next) {
    if (res.locals.loggedIn) res.redirect("/");
    res.sendFile(path.join(import.meta.dirname, "../public/html/login.html"));
});

/* POST login. */
router.post(
    "/",
    collectSessionData,
    // Apply basic form validation before authentication logic.
    requireFields(["username", "password"], function (req, res) {
        return res.redirect("/login?error=missingFields");
    }),
    requireMaxLength("username", 20, function (req, res) {
        return res.redirect("/login?error=invalidCredentials");
    }),
    requireMaxLength("password", 128, function (req, res) {
        return res.redirect("/login?error=invalidCredentials");
    }),
    requirePattern("username", /^[A-Za-z0-9_]+$/, function (req, res) {
        return res.redirect("/login?error=invalidCredentials");
    }),
    // Per-username (3) and per-IP (5) failed-attempt rate limit; see #login limit block above.
    loginRateLimit,
    async function (req, res, next) {
        if (res.locals.loggedIn) res.redirect("/");

        console.log(`Attempting to log in as: ${req.body.username}...`);

        // #Delay login timing start
        // Pad failed login response to fixed min duration
        const LOGIN_FAILURE_MIN_MS = 1000;
        const loginStart = Date.now();
        const failInvalidCredentials = async () => {
            // Count this attempt against the per-user / per-IP rate limit.
            res.locals.loginLimiter?.recordFailure();
            const elapsed = Date.now() - loginStart;
            const remaining = LOGIN_FAILURE_MIN_MS - elapsed;
            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, remaining));
            }
            return res.redirect("/login?error=invalidCredentials");
        };
        // #Delay timing end

        let user;
        try {
            user = await User.readFromDatabase(req.body.username);
        } catch (err) {
            console.error(err);
            return failInvalidCredentials();
        }

        if (!(await verifyPassword(req.body.password, user.passwordHash)))
            return failInvalidCredentials();

        // Successful password check — clear this user's failure counter so a
        // legitimate user is not locked out by their own earlier typos.
        res.locals.loginLimiter?.clearUserOnSuccess();

        await initPreAuthSession(res, user.username);
        return res.redirect("/login/mfa");
    },
);

/* GET login mfa. */
router.get("/mfa", verifyPreAuthSession, collectSessionData, function (req, res, next) {
    if (res.locals.loggedIn) res.redirect("/");

    res.sendFile(path.join(import.meta.dirname, "../public/html/login_mfa.html"));
});

/* POST login mfa. */
router.post(
    "/mfa",
    verifyPreAuthSession,
    collectSessionData,
    // Keep MFA input checks simple and local to the route.
    requireTotp("totp", function (req, res) {
        return res.redirect("/login/mfa?error=invalidCredentials");
    }),
    async function (req, res, next) {
        console.log(`Attempting MFA with ${req.body.totp}...`);

        try {
            if (!(await verifyTotpCode(req.body.totp, res.locals.user.totpSecret))) {
                return res.redirect("/login/mfa?error=invalidCredentials");
            }
        } catch (err) {
            return next(err);
        }

        await initPostAuthSession(res, res.locals.user.username);
        return res.redirect("/");
    },
);