import express from "express";

import { generateSessionToken, decodeSessionToken } from "./cryptography.js";
import { User } from "./models/user.js";

/**
 * Begin a new partially logged in user session.
 *
 * @param {express.Response} res
 * @param {string} username - The username to be signed with.
 * @throws {CryptographyError} Signing operation failed.
 * @returns {Promise<void>}
 */
export async function initPreAuthSession(res, username) {
    const token = await generateSessionToken(
        { username: username, stage: "preAuth" },
        300, // Token expires in 5 minutes.
    );
    res.cookie("sessionToken", token, {
        path: "/", // Cookie is accessible from all paths.
        expires: new Date(Date.now() + 5 * 60 * 1000), // Cookie expires in 5 minutes.
        secure: true, // HTTPS only when true.
        httpOnly: true, // Prevents XSS when true.
        sameSite: "strict", // Prevents CSRF.
    });
    console.log(`Assigning pre-auth session ${token} to user: "${username}"`);
}

/**
 * Begin a new fully logged in user session.
 *
 * @param {express.Response} res
 * @param {string} username - The username to be signed with.
 * @throws {CryptographyError} Signing operation failed.
 * @returns {Promise<void>}
 */
export async function initPostAuthSession(res, username) {
    const token = await generateSessionToken(
        { username: username, stage: "postAuth" },
        3600, // Token expires in 1 hour.
    );
    res.cookie("sessionToken", token, {
        path: "/", // Cookie is accessible from all paths.
        expires: new Date(Date.now() + 60 * 60 * 1000), // Cookie expires in 1 hour.
        secure: true, // HTTPS only when true.
        httpOnly: true, // Prevents XSS when true.
        sameSite: "strict", // Prevents CSRF.
    });
    console.log(`Assigning post-auth session ${token} to user: "${username}"`);
}

/**
 * Begin a new elevated permissions user session.
 * Intended for the changing of account settings.
 *
 * @param {express.Response} res
 * @param {string} username - The username to be signed with.
 * @throws {CryptographyError} Signing operation failed.
 * @returns {Promise<void>}
 */
export async function initElevatedAuthSession(res, username) {
    const token = await generateSessionToken(
        { username: username, stage: "elevatedAuth" },
        3600, // Token expires in 1 hour.
    );
    res.cookie("sessionToken", token, {
        path: "/", // Cookie is accessible from all paths.
        expires: new Date(Date.now() + 60 * 60 * 1000), // Cookie expires in 1 hour.
        secure: true, // HTTPS only when true.
        httpOnly: true, // Prevents XSS when true.
        sameSite: "strict", // Prevents CSRF.
    });
    console.log(`Assigning elevated-auth session to user: "${username}"`);
}

/**
 * Put this middleware in front of any GET requests for protected web pages
 * that a user must have gotten past the first layer of authentication to use.
 *
 * Should only be for TOTP page.
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise<void>}
 */
export async function verifyPreAuthSession(req, res, next) {
    console.log("Verifying pre-auth session...");

    if (!req.cookies.sessionToken) {
        console.log("No token found, redirecting to login");
        return res.redirect("/login");
    }

    let decoded;
    try {
        decoded = await decodeSessionToken(req.cookies.sessionToken);
        console.log(`Checking session token: ${decoded}`);
    } catch (err) {
        console.log("Invalid or expired session token, redirecting to login");
        res.clearCookie("sessionToken");
        return res.redirect("/login");
    }

    if (decoded.stage !== "preAuth") {
        console.log("Session token at invalid stage, redirecting to login");
        res.clearCookie("sessionToken");
        return res.redirect("/login");
    }
    return next();
}

/**
 * Put this middleware in front of any GET requests for protected web pages
 * that a user must be fully logged in to use.
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise<void>}
 */
export async function verifyPostAuthSession(req, res, next) {
    console.log("Verifying post-auth session...");

    if (!req.cookies.sessionToken) {
        console.log("No token found, redirecting to login");
        return res.redirect("/login");
    }

    let decoded;
    try {
        decoded = await decodeSessionToken(req.cookies.sessionToken);
        console.log(`Checking session token: ${decoded}`);
    } catch (err) {
        console.log("Invalid or expired session token, redirecting to login");
        res.clearCookie("sessionToken");
        return res.redirect("/login");
    }

    if (decoded.stage !== "postAuth" && decoded.stage !== "elevatedAuth") {
        console.log("Session token at invalid stage, redirecting to login");
        res.clearCookie("sessionToken");
        return res.redirect("/login");
    }
    return next();
}

/**
 * Put this middleware in front of any GET requests for protected web pages
 * that a user must reauthenticate in to use.
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise<void>}
 */
export async function verifyElevatedAuthSession(req, res, next) {
    console.log("Verifying elevated-auth session...");

    if (!req.cookies.sessionToken) {
        console.log("No token found, redirecting to login");
        return res.redirect("/login");
    }

    let decoded;
    try {
        decoded = await decodeSessionToken(req.cookies.sessionToken);
    } catch (err) {
        console.log("Invalid or expired session token, redirecting to login");
        res.clearCookie("sessionToken");
        return res.redirect("/account/elevate");
    }

    if (decoded.stage !== "elevatedAuth") {
        console.log("Session token at invalid stage, redirecting to elevate");
        return res.redirect("/account/elevate");
    }
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
    console.log("Collecting session data...");

    if (!req.cookies.sessionToken) {
        console.log("No session found");
        res.locals.authenticated = false;
        res.locals.user = null;
        return next();
    }

    let decoded;
    try {
        decoded = await decodeSessionToken(req.cookies.sessionToken);
    } catch (err) {
        console.log("Invalid or expired session token");
        res.clearCookie("sessionToken");
        res.locals.authenticated = false;
        res.locals.user = null;
        return next();
    }

    res.locals.authenticated = decoded.stage === "postAuth";

    try {
        res.locals.user = await User.readFromDatabase(decoded.username);
    } catch (err) {
        console.log("Failed to collect user data");
        res.locals.authenticated = false;
        res.locals.user = null;
        return next();
    }
    return next();
}
