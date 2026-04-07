import express from "express";

import { generateSessionToken, verifySessionToken } from "./cryptography.js";
import { User } from "./models/user.js";

/**
 * Begin a new user session.
 *
 * @param {express.Response} res
 * @param {string} username - The username to be signed with.
 * @throws {CryptographyError} Signing operation failed.
 */
export async function initSession(res, username) {
    const token = generateSessionToken(username);
    res.cookie("sessionToken", token, {
        path: "/", // Cookie is accessible from all paths.
        expires: new Date(Date.now() + 3600000), // Cookie expires in 1 hour.
        secure: false, // HTTPS only when true.
        httpOnly: false, // Prevents XSS when true.
        sameSite: "strict", // Prevents CSRF.
    });
    console.log(`Assigning session ${token} to user: "${username}"`);
}

/**
 * Revoke current session token.
 *
 * @param {express.Response} res
 * @returns {express.Response}
 */
export function revokeSession(res) {
    return res.clearCookie("sessionToken");
}

/**
 * Put this middleware in front of any GET requests for protected web pages
 * that you must be logged in to see.
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
export async function verifySession(req, res, next) {
    if (!req.cookies.sessionToken) {
        res.locals.loggedIn = false;
        console.log("No token found, redirecting to login");
        return res.redirect("/login");
    }

    try {
        const decoded = verifySessionToken(req.cookies.sessionToken);
        console.log(`Checking session token: ${decoded}`);
    } catch (err) {
        revokeSession(res);
        console.log("Invalid or expired session token, redirecting to login");
        return res.redirect("/login");
    }
    res.locals.loggedIn = true;
    return next();
}

/**
 * Put this middleware in front of any GET requests
 * for pages that require user data.
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise<void>}
 */
export async function collectSessionData(req, res, next) {
    if (!req.cookies.sessionToken) {
        console.log("No session found");
        res.locals.loggedIn = false;
        res.locals.user = null;
        return next();
    }

    try {
        const decoded = await verifySessionToken(req.cookies.sessionToken);
        console.log(`Fetching user data for session: ${decoded}`);
        res.locals.user = await User.readFromDatabase(decoded.username);
    } catch (err) {
        console.error(`Failed to collect session token data: ${err}`);
        return next(err);
    }

    res.locals.loggedIn = true;
    return next();
}

