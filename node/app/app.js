import http from "http";
import path from "path";
import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { testConnection } from "./database.js";
import { router as indexRouter } from "./routes/index.js";
import { router as loginRouter } from "./routes/login.js";
import { router as logoutRouter } from "./routes/logout.js";
import { router as registerRouter } from "./routes/register.js";
import { router as accountRouter } from "./routes/account.js";
import { router as apiRouter } from "./routes/api.js";
import { router as postsRouter } from "./routes/posts.js";

const app = express();

// Trust the upstream proxy (Replit's preview/deploy sits behind one) so that
// req.ip reflects the real client address. Required for accurate per-IP rate
// limiting in routes/login.js.
app.set("trust proxy", true);

// Request parsing middleware.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware.
app.use(morgan("[:date[clf]] :method :url :status :response-time ms"));

// Routing middleware.
app.use(express.static(path.join(import.meta.dirname, "public")));
app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.use("/logout", logoutRouter);
app.use("/account", accountRouter);
app.use("/posts", postsRouter);
app.use("/api", apiRouter);

// Error handling middleware.
app.use((req, res) => {
    console.log("Sending 404: " + req.path.toString());
    res.status(404).sendFile(path.join(import.meta.dirname, "public", "html", "404.html"));
});
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).sendFile(path.join(import.meta.dirname, "public", "html", "500.html"));
});

/// Runtime setup.
(async () => {
    if (!(await testConnection())) process.exit(1);
    const server = http.createServer(app);
    const port = process.env.PORT || 5000;
    const host = process.env.HOST || "0.0.0.0";
    server.listen(port, host);
    console.log(`\nListening on ${host}:${port}...`);
})();