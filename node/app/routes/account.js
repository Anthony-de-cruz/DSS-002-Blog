import path from "path";
import express from "express";

import {
    collectSessionData,
    verifyPostAuthSession,
    verifyElevatedAuthSession,
} from "../authentication.js";

export const router = express.Router();

router.get(
    "/",
    verifyPostAuthSession,
    function (req, res, next) {
        res.sendFile(
            path.join(import.meta.dirname, "../public/html/account.html"),
        );
    },
);

// GET elevate account.
router.get(
    "/elevate",
    verifyPostAuthSession,
    collectSessionData,
    function (req, res, next) {
        res.sendFile(
            path.join(import.meta.dirname, "../public/html/account_elevate.html"),
        );
    },
);

// GET edit account.
router.get(
    "/edit",
    verifyElevatedAuthSession,
    collectSessionData,
    function (req, res, next) {
        res.sendFile(
            path.join(import.meta.dirname, "../public/html/account_edit.html"),
        );
    },
);