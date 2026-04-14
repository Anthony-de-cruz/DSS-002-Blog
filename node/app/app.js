import http from "http";
import path from "path";
import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { testConnection } from "./database.js";
import { router as indexRouter } from "./routes/index.js";
import { router as loginRouter } from "./routes/login.js";
import { router as logoutRouter } from "./routes/logout.js";
import { router as accountRouter } from "./routes/account.js";
import { router as apiRouter } from "./routes/api.js";

const app = express();

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
app.use("/logout", logoutRouter);
app.use("/account", accountRouter);
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

// // Landing page
// app.get("/", (req, res) => {
//     /// send the static file
//     res.sendFile(__dirname + "/public/html/login.html", (err) => {
//         if (err) {
//             console.log(err);
//         }
//     });
// });
//
// // Reset login_attempt.json when server restarts
// let login_attempt = { username: "null", password: "null" };
// let data = JSON.stringify(login_attempt);
// fs.writeFileSync(
//     path.join(import.meta.dirname, "public/json/login_attempt.json"),
//     data,
// );
//
// // Store who is currently logged in
// let currentUser = null;
//
// // Login POST request
// app.post("/", function (req, res) {
//     // Get username and password entered from user
//     var username = req.body.username_input;
//     var password = req.body.password_input;
//
//     // Currently only "username" is a valid username
//     if (username !== "username") {
//         // Update login_attempt with credentials used to log in
//         let login_attempt = { username: username, password: password };
//         let data = JSON.stringify(login_attempt);
//         fs.writeFileSync(__dirname + "/public/json/login_attempt.json", data);
//
//         // Redirect back to login page
//         res.sendFile(__dirname + "/public/html/login.html", (err) => {
//             if (err) {
//                 console.log(err);
//             }
//         });
//     }
//
//     // Currently only "password" is a valid password
//     if (password !== "password") {
//         // Update login_attempt with credentials used to log in
//         let login_attempt = { username: username, password: password };
//         let data = JSON.stringify(login_attempt);
//         fs.writeFileSync(__dirname + "/public/json/login_attempt.json", data);
//
//         // Redirect back to login page
//         res.sendFile(__dirname + "/public/html/login.html", (err) => {
//             if (err) {
//                 console.log(err);
//             }
//         });
//     }
//
//     // Valid username and password both entered together
//     if (username === "username" && password === "password") {
//         // Update login_attempt with credentials
//         let login_attempt = { username: username, password: password };
//         let data = JSON.stringify(login_attempt);
//         fs.writeFileSync(__dirname + "/public/json/login_attempt.json", data);
//
//         // Update current user upon successful login
//         currentUser = req.body.username_input;
//
//         // Redirect to home page
//         res.sendFile(__dirname + "/public/html/index.html", (err) => {
//             if (err) {
//                 console.log(err);
//             }
//         });
//     }
// });
//
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
