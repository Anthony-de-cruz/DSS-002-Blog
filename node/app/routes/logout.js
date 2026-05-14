import express from "express";
export const router = express.Router();

// Clear the session cookie and send the user back to the site.
router.get("/", async function (req, res, next) {
    res.clearCookie("sessionToken");
    return res.redirect("/");
});
