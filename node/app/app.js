import http from "http";
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
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

app.use(helmet());
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 同一个IP最多5次登录尝试
  message: "登录失败次数过多，请15分钟后再试",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/login", loginLimiter);

export function checkPasswordStrength(password) {
  if (!password) return false;
  const rules = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password)
  };
  return rules.minLength && rules.hasUpperCase && rules.hasLowerCase && rules.hasNumber;
}

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
    server.listen(process.env.PORT);
    console.log(`\nListening on ${process.env.PORT}...`);

    // const temp = await User.buildNew("user500", "password123", "email500@email.com");
    // console.log(temp);
    //
    // const uri = await generateTotpUri(temp.email, temp.totpSecret);
    // console.log(uri)
    //
    // await temp.writeToDatabase();
})();
