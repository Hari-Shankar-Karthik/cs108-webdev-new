const express = require("express");
const app = express();
const path = require("path");
const script = require("./script");
const session = require("express-session");
const mongoose = require("mongoose");
const fs = require("fs").promises; // importing the async version of fs
const Student = require("./models/student");
const Login = require("./models/login");

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/kavya-is-god')
    .then(async () => {
        console.log('MongoDB connected');
        try {
            // Clear existing data
            await Student.deleteMany({});
            console.log('Existing students data cleared from database');
            
            await Login.deleteMany({});
            console.log('Existing login data cleared from database');

            // Read data from students.json
            const studentsData = JSON.parse(await fs.readFile('./dbs/students.json', 'utf-8'));
            // Insert students data into database
            await Student.insertMany(studentsData);
            console.log('New students data inserted into database');

            // Read data from login.json
            const loginData = JSON.parse(await fs.readFile('./dbs/login.json', 'utf-8'));
            // Insert login data into database
            await Login.insertMany(loginData);
            console.log('New login data inserted into database');
        } catch (err) {
            console.error('Error:', err);
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err)
    });

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
app.get("/", async (req, res) => {
    try {
        const all_logins = await Login.find({})
        const all_students = await Student.find({})
        console.log(all_logins);
        console.log(all_students);
        res.send("Hello World");
    } catch(err) {
        console.log(err);
        res.send("Error");
    }
});

// show the login page
app.get("/login", (req, res) => {
    const {username} = req.session;
    console.log(`pre-filled username: ${username}`)
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        }
    });
    res.render("login", {username});
});

// handling request to login
// verify credentials and redirect to dashboard, or show error message
app.post("/login", async (req, res) => {
    const {username, password} = req.body;
    console.log(`username: ${username}, password: ${password}`);
    Login.findOne({username, password})
        .then(login => {
            if(!login) {
                throw new Error("Invalid credentials");
            } else {
                console.log(`${login["IITB Roll Number"]} logged in successfully.`);
                req.session.iitb_roll_number = login["IITB Roll Number"];
                res.redirect("/dashboard");
            }
        })
        .catch(err => {
            console.log(err);
            res.redirect("/login");
        });
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
        const login = await Login.findOne({username});
        if(!login) {
            throw new Error("User not found");
        }
        res.render("forgot_secret_question", {
            username,
            secret_question: login["secret_question"],
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
        const login = await Login.findOne({username, secret_answer});
        if(!login) {
            throw new Error("Secret answer is incorrect");
        }
        console.log(`Secret answer is correct, password is ${login["password"]}`);
        req.session.username = username;
        res.redirect("/login");
    } catch(err) {
        console.log(err);
        res.redirect("/login");
    }
});

// show the dashboard
app.get("/dashboard", async (req, res) => {
    try {
        const {iitb_roll_number} = req.session;
        if(!iitb_roll_number) {
            throw new Error("Not logged in");
        }
        const student = await Student.findOne({ "IITB Roll Number": iitb_roll_number });
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

// show the profile page
app.get("/profile", async (req, res) => {
    try {
        const {iitb_roll_number} = req.session;
        if(!iitb_roll_number) {
            throw new Error("Not logged in");
        }
        const student = await Student.findOne({ "IITB Roll Number": iitb_roll_number });
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

// handle the request to update the profile
app.post("/match", (req, res) => {
    const {iitb_roll_number} = req.session;
    console.log(iitb_roll_number);
    Student.findOneAndUpdate({ "IITB Roll Number": iitb_roll_number }, req.body, {new: true, runValidators: true})
        .then(student => {
            console.log(`student updated: ${student}`);
            res.redirect("/match");
        })
        .catch(err => {
            console.log(err);
        });
});

// show the match page
app.get("/match", async (req, res) => {
    try {
        const {iitb_roll_number} = req.session;
        if(!iitb_roll_number) {
            throw new Error("Not logged in");
        }
        const student = await Student.findOne({ "IITB Roll Number": iitb_roll_number });
        const match_student = await script.find_perfect_match(student);
        console.log(`Match found: ${match_student}`);
        res.render("match", {
            pageTitle: "It's a match!",
            stylesheetLink: "",
        });
    } catch (error) {
        console.log(error);
        res.redirect("/login");
    }
});

// show the scroll/swipe page
app.get("/explore", async (req, res) => {
    try {
        const {iitb_roll_number} = req.session;
        if(!iitb_roll_number) {
            throw new Error("Not logged in");
        }
        console.log(iitb_roll_number);
        res.render("scroll_or_swipe", {
            pageTitle: "Explore",
            stylesheetLink: "",
        });
    } catch (error) {
        console.log(error);
        res.redirect("/login");
    }
});

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
