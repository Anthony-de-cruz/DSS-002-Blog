import express from "express";
export const router = express.Router();

/* GET logout. */
router.get("/", async function (req, res, next) {
    res.clearCookie("sessionToken");
    return res.redirect("/");
});
