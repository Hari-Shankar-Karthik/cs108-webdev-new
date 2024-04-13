const express = require("express");
const app = express();
const path = require("path");
const utils = require("./utils");
const session = require("express-session");

// set up the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// set up the public directory (serving static assets)
app.use(express.static(path.join(__dirname, "/public")));

// middleware to parse the request body
app.use(express.urlencoded({extended: true}));

// configure expression session middleware
app.use(
    session({
        secret: "a555fd80ea8c9dd6f393c603a8d4a1d2b7487c52a6d2f332cb39699fed66a21e", // Set a secret key for session encryption
        resave: false,
        saveUninitialized: false,
    })
);

// start the server
app.listen(8000, () => {
    console.log("Listening on port 8000");
});

// dummy route - for debugging only
app.get("/", (req, res) => {
    res.send("Hello.");
});

// show the login page
app.get("/login", (req, res) => {
    res.render("login");
});

// handling request to login
// verify credentials and redirect to dashboard, or show error message
app.post("/login", async (req, res) => {
    const {username, password} = req.body;
    console.log(`username: ${username}, password: ${password}`);
    utils.validate_login(username, password)
        .then(iitb_roll_number => {
            // TODO: Pass on iitb_roll_number to the dashboard
            console.log(`${iitb_roll_number} logged in successfully.`)
            req.session.iitb_roll_number = iitb_roll_number;
            res.redirect("/dashboard");
        })
        .catch(err => {
            console.log(err);
            res.redirect("/login");
        })
});

// show the "forgot password: enter your username" page
app.get("/forgot", (req, res) => {
    res.render("forgot_username");
})

// show the "forgot password: answer the secret question" page
app.post("/secret-question", async (req, res) => {
    const {username} = req.body;
    console.log(`username: ${username}`);
    try {
        const login_details = await utils.get_login_data(username);
        res.render("forgot_secret_question", {
            username,
            secret_question: login_details["secret_question"],
        });
    } catch(err) {
        console.log(err);
        res.redirect("/login");
    }
});

// handle the request to answer the secret question
app.post("/forgot", async (req, res) => {
    const {username, secret_answer} = req.body;
    console.log(`username: ${username}, secret_answer: ${secret_answer}`);
    try {
        const login_details = await utils.get_login_data(username);
        if (login_details["secret_answer"] === secret_answer) {
            console.log(`Secret answer is correct, password is ${login_details["password"]}`);
            res.redirect("/login");
        } else {
            console.log("Secret answer is incorrect");
            res.redirect("/login");
        }
    } catch(err) {
        console.log(err);
        res.redirect("/login");
    }
});

// show the dashboard
app.get("/dashboard", async (req, res) => {
    try {
        const student = await utils.get_student_data(req.session.iitb_roll_number);
        console.log(student);
        res.render("dashboard", {
            pageTitle: "My Dashboard", 
            stylesheetLink: "/css/dashboard_styles.css", 
            student,
        });
    } catch (error) {
        console.log(error);
        res.redirect("/login");
    }
});

app.get("/profile", async (req, res) => {
    try {
        const student = await utils.get_student_data(req.session.iitb_roll_number);
        console.log(student);
        res.render("dating", {
            pageTitle: "My Profile",
            stylesheetLink: "/css/style.css",
            student,
        });
    } catch (error) {
        console.log(error);
        res.redirect("/login");
    }
});

app.post("/match", (req, res) => {
    const {iitb_roll_number} = req.session;
    console.log(iitb_roll_number);
    utils.update_student_data(iitb_roll_number, req.body);
    res.send("Matching... Meanwhile, your profile has been updated.");
})

// handle the request to logout
app.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            res.redirect("/dashboard");
        } else {
            console.log("Logged out successfully.");
            res.redirect("/login");
        }
    });
});
