import http from "http";
<<<<<<< HEAD
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
=======
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
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
<<<<<<< HEAD

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
=======
import { router as postsRouter } from "./routes/posts.js";

const app = express();

>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
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
<<<<<<< HEAD
=======
app.use("/posts", postsRouter);
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
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

<<<<<<< HEAD
// // Make a post POST request
// app.post("/makepost", function (req, res) {
//     // Read in current posts
//     const json = fs.readFileSync(__dirname + "/public/json/posts.json");
//     var posts = JSON.parse(json);
//
//     // Get the current date
//     let curDate = new Date();
//     curDate = curDate.toLocaleString("en-GB");
//
//     // Find post with the highest ID
//     let maxId = 0;
//     for (let i = 0; i < posts.length; i++) {
//         if (posts[i].postId > maxId) {
//             maxId = posts[i].postId;
//         }
//     }
//
//     // Initialise ID for a new post
//     let newId = 0;
//
//     // If postId is empty, user is making a new post
//     if (req.body.postId == "") {
//         newId = maxId + 1;
//     } else {
//         // If postID != empty, user is editing a post
//         newId = req.body.postId;
//
//         // Find post with the matching ID, delete it from posts so user can submit their new version
//         let index = posts.findIndex((item) => item.postId == newId);
//         posts.splice(index, 1);
//     }
//
//     // Add post to posts.json
//     posts.push({
//         username: currentUser,
//         timestamp: curDate,
//         postId: newId,
//         title: req.body.title_field,
//         content: req.body.content_field,
//     });
//
//     fs.writeFileSync(
//         __dirname + "/public/json/posts.json",
//         JSON.stringify(posts),
//     );
//
//     // Redirect back to my_posts.html
//     res.sendFile(__dirname + "/public/html/my_posts.html");
// });
//
// // Delete a post POST request
// app.post("/deletepost", (req, res) => {
//     // Read in current posts
//     const json = fs.readFileSync(__dirname + "/public/json/posts.json");
//     var posts = JSON.parse(json);
//
//     // Find post with matching ID and delete it
//     let index = posts.findIndex((item) => item.postId == req.body.postId);
//     posts.splice(index, 1);
//
//     // Update posts.json
//     fs.writeFileSync(
//         __dirname + "/public/json/posts.json",
//         JSON.stringify(posts),
//     );
//
//     res.sendFile(__dirname + "/public/html/my_posts.html");
// });

=======
>>>>>>> 87bbf515f64619f10e6a7ddf8297f0c9574cf4f9
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
