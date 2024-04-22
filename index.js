const express = require("express");
const app = express();
const path = require("path");
const script = require("./script");
const session = require("express-session");
const mongoose = require("mongoose");
const fs = require("fs").promises; // importing the async version of fs
const Student = require("./models/student");
const Login = require("./models/login");
const bodyParser = require("body-parser");

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/looking-for-a-date')
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

// middleware to parse JSON bodies
app.use(express.json());

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

const present = (res, page_name, args) => {
    for(const missing_arg of ["pageTitle", "stylesheetLink", "scriptLink"]) {
        if(!args[missing_arg]) {
            args[missing_arg] = "";
        }
    }
    res.render(page_name, args);
};

// show the login page
app.get("/login", (req, res) => {
    const {username, error, message} = req.session;
    console.log(`pre-filled username: ${username}, error = ${error}, message = ${message}`)
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        }
    });
    res.render("login", {username, error, message});
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
            req.session.error = "Invalid credentials";
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
        req.session.error = "User not found";
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
        req.session.message = `Your password is ${login["password"]}.`;
        res.redirect("/login");
    } catch(err) {
        console.log(err);
        req.session.error = "Secret answer is incorrect";
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
        present(res, "dashboard", {
            pageTitle: "My Dashboard", 
            stylesheetLink: "/css/dashboard_styles.css", 
            student,
        });
    } catch (error) {
        console.log(error);
        req.session.error = "Not logged in";
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
        present(res, "dating", {
            pageTitle: "My Profile",
            student,
        });
    } catch (error) {
        console.log(error);
        req.session.error = "Not logged in";
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
        const match_id = await script.find_perfect_match(student);
        if(!match_id) {
            present(res, "no_match", {
                pageTitle: "No match found",
                student,
            });
            return;
        }
        const match = await Student.findById(match_id);
        const canLike = !match["Likes"].includes(iitb_roll_number);
        console.log(`Match found: ${match}`);
        present(res, "match", {
            pageTitle: "It's a match!",
            scriptLink: "/js/like.js",
            student,
            match,
            canLike,
        });
    } catch (error) {
        console.log(error);
        req.session.error = "Not logged in";
        res.redirect("/login");
    }
});

const suitable_profiles = async looking_roll_no => {
    const compatible_gender = gender1 => {
        if(gender1 === "Male") {
            return "Female";
        }
        if(gender1 === "Female") {
            return "Male";
        }
        return "Other";
    }

    const looking_student = await Student.findOne({ "IITB Roll Number": looking_roll_no });
    const suitable_gender = compatible_gender(looking_student["Gender"]);
    return await Student.find({ "IITB Roll Number": { $ne: looking_roll_no }, "Gender": suitable_gender });
}

// show the scroll/swipe page
app.get("/explore", async (req, res) => {
    try {
        const {iitb_roll_number} = req.session;
        if(!iitb_roll_number) {
            throw new Error("Not logged in");
        }
        console.log(iitb_roll_number);
        const profiles = await suitable_profiles(iitb_roll_number)
        present(res, "scroll_or_swipe", {
            pageTitle: "Explore",
            stylesheetLink: "/css/scroll_or_swipe_styles.css",
            profiles,
        });
        // res.render("scroll_or_swipe_temp");
    } catch (error) {
        console.log(error);
        req.session.error = "Not logged in";
        res.redirect("/login");
    }
});

// Define a route for liking a profile
app.post('/hitLike', async (req, res) => {
    try {
        const {iitb_roll_number} = req.session;
        const { likerRollNo, likedID } = req.body;
        console.log(`Liker Roll No: ${likerRollNo}, Liked ID: ${likedID}, Session Roll No: ${iitb_roll_number}`)
        if(!likerRollNo || !likedID || likerRollNo !== iitb_roll_number) {
            throw new Error('Invalid request');
        }
        // check if the liker has already liked the liked
        const liker = await Student.findOne({ "IITB Roll Number": likerRollNo });
        if(liker["Likes"].includes(likedID)) {
            throw new Error('Already liked');
        }
        const updatedRecord = await Student.findByIdAndUpdate(likedID, { $push: { "Likes": likerRollNo } }, { new: true, runValidators: true });
        console.log(updatedRecord);
        // Update the record using Mongoose
        res.json(updatedRecord);
    } catch (error) {
        console.error('Error updating record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
  
// show the profile of a specific student
app.get("/profile/:student_id", async (req, res) => {
    try {
        const {iitb_roll_number} = req.session;
        if(!iitb_roll_number) {
            throw new Error("Not logged in");
        }
        const {student_id} = req.params;
        const student = await Student.findById(student_id);
        const canLike = !student["Likes"].includes(iitb_roll_number);
        console.log(student);
        // Incrementing the view count
        // To prevent views from increasing my simply doing multiple refreshes, store the viewed students in the session
        if(!req.session.viewed_students) {
            req.session.viewed_students = [];
        }
        if(!req.session.viewed_students.includes(student_id)) {
            req.session.viewed_students.push(student_id);
            student["Views"] += 1;
            await student.save();
        }
        present(res, "profile", {
            pageTitle: `${student["Name"].split(" ")[0]}'s Profile`,
            stylesheetLink: "/css/profile_styles.css",
            scriptLink: "/js/like.js",
            iitb_roll_number,
            student,
            canLike,
        });
    } catch (error) {
        console.log(error);
    req.session.error = "Not logged in";
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

// handle any other request
app.get("*", (req, res) => {
    present(res, "error404", {
        pageTitle: "Error 404",
    });
});
