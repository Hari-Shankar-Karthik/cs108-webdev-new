const express = require("express");
const app = express();
const session = require("express-session"); // for session management
const path = require("path");
const fs = require("fs").promises; // importing the async version of fs
const mongoose = require("mongoose"); // for storing data in MongoDB

const script = require("./script"); // contains the matching algorithm

// Import the models
const Student = require("./models/student");
const Login = require("./models/login");
const Chat = require("./models/chat");

// Import the custom error handlers
const AuthenticationError = require("./errors/AuthenticationError");
const IncompleteDataError = require("./errors/IncompleteDataError");
const wrapAsyncHandler = require("./errors/wrapAsyncHandler");
// const isValidStudent = require("./errors/isValidStudent");

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lfad')
    .then(async () => {
        console.log('MongoDB connected');
    })
    .catch(err => {
        console.log('MongoDB connection error:', err)
    });

// set up the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// set up the public directory (serving static css and js files)
app.use(express.static(path.join(__dirname, "/public")));

// set up the photos directory (serving profile photos)
app.use('/photos', express.static(path.join(__dirname, 'photos')));

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

const present = (res, page_name, args) => {
    for(const missing_arg of ["pageTitle", "stylesheetLink", "scriptLink", "error", "message"]) {
        if(!args[missing_arg]) {
            args[missing_arg] = "";
        }
    }
    res.render(page_name, args);
};

// debug
// app.get("/debug", async (req, res) => {
//     script.list_scores("1");
//     res.send("Debugging");
// })

// show the signup page
app.get("/signup", (req, res) => {
    const {error, message} = req.session;
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        }
    });
    present(res, "Signup", {
        pageTitle: "Sign Up",
        error,
        message,
    })
});

// handle the request to signup
app.post("/signup", async (req, res) => {
    try {
        const new_login = new Login(req.body);
        await new_login.validate();
        await new_login.save();
        req.session.iitb_roll_number = new_login["IITB Roll Number"];
        res.redirect("/complete-profile")
    } catch(error) {
        console.log(error);
        if(error.code === 11000 && error.keyPattern && error.keyValue) {
            console.log("ERROR: ", error.keyValue, " already exists");
            req.session.error = `User with this ${Object.keys(error.keyValue)[0]} already exists.`;
        } else {
            req.session.error = "Signup failed. Please try again.";
        }
        res.redirect("/signup");
    }
})

// show the complete profile page (while getting started only)
app.get("/complete-profile", wrapAsyncHandler(async (req, res, next) => {
    const {iitb_roll_number} = req.session;
    if(!iitb_roll_number) {
        throw new AuthenticationError("Not logged in");
    }
    const {error} = req.session;
    req.session.error = "";
    present(res, "dating", {
        pageTitle: "Complete Profile",
        iitb_roll_number,
        error,
        isStudentCreated: false,
    });
}));

// handle the request to complete the profile
app.post("/complete-profile", async (req, res) => {
    try {
        const {iitb_roll_number} = req.session;
        const new_student = new Student({"IITB Roll Number": iitb_roll_number, ...req.body});
        await new_student.validate();
        await new_student.save();
        res.redirect("/dashboard");
    } catch(err) {
        console.log(err);
        req.session.error = "Profile update failed. Please try again.";
        res.redirect("/complete-profile");
    } 
});

// show the login page
app.get("/login", (req, res) => {
    const {username, error, message} = req.session;
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        }
    });
    present(res, "login", {
        pageTitle: "Login",
        username,
        error,
        message,
    })
});

// handling request to login
// verify credentials and redirect to dashboard, or show error message
app.post("/login", async (req, res) => {
    const {username, password} = req.body;
    Login.findOne({username, password})
        .then(login => {
            if(!login) {
                throw new Error("Invalid credentials");
            } else {
                // check if IITB Roll Number is present in this login record
                if(!login["IITB Roll Number"]) {
                    present(res, "link_roll_no", {
                        pageTitle: "Link Roll Number",
                        login,
                    });
                    // res.redirect("/link-roll-no");
                } else {
                    req.session.iitb_roll_number = login["IITB Roll Number"];
                    res.redirect("/dashboard");
                }
            }
        })
        .catch(err => {
            console.log(err);
            req.session.error = "Invalid credentials";
            res.redirect("/login");
        });
});

// handle the request to link the roll number
app.post("/link-roll-no", async (req, res) => {
    const {username, iitb_roll_number} = req.body;
    // update the login record with the IITB Roll Number
    await Login.findOneAndUpdate({username}, { "IITB Roll Number": iitb_roll_number }, {new: true, runValidators: true});
    req.session.iitb_roll_number = iitb_roll_number;
    res.redirect("/dashboard");
});

// show the "forgot password: enter your username" page
app.get("/forgot", (req, res) => {
    present(res, "forgot_username", {
        pageTitle: "Forgot Password",
    });
})

// handle the incoming username and show the secret question
app.post("/secret-question", async (req, res) => {
    const {username} = req.body;
    try {
        const login = await Login.findOne({username});
        if(!login) {
            throw new Error("User not found");
        }
        present(res, "forgot_secret_question", {
            pageTitle: "Forgot Password",
            username,
            secret_question: login["secret_question"],
        })
    } catch(err) {
        req.session.error = "User not found";
        console.log(err);
        res.redirect("/login");
    }
});

// handle the request to answer the secret question
app.post("/forgot", async (req, res) => {
    const {username, secret_answer} = req.body;
    try {
        const login = await Login.findOne({username, secret_answer});
        if(!login) {
            throw new Error("Secret answer is incorrect");
        }
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
app.get("/dashboard", wrapAsyncHandler(async (req, res, next) => {
    const {iitb_roll_number} = req.session;
    if(!iitb_roll_number) {
        throw new AuthenticationError("Not logged in");
    }
    const student = await Student.findOne({ "IITB Roll Number": iitb_roll_number });
    if(!student) {
        throw new IncompleteDataError("Student data is incomplete");
    }
    const {message} = req.session;
    req.session.message = "";

    // get all QuickChats that this student has not yet seen
    const unreadMessages = await Chat.find({ to: iitb_roll_number, viewed: false});

    // get the number of messages from each sender
    const numChats = {};
    const names = {};
    for(const message of unreadMessages) {
        const sender = await Student.findOne({ "IITB Roll Number": message.from });
        if(!numChats[sender["_id"]]) {
            numChats[sender["_id"]] = 0;
            names[sender["_id"]] = sender["Name"];
        }
        numChats[sender["_id"]] += 1;
    }

    present(res, "dashboard", {
        pageTitle: "My Dashboard", 
        stylesheetLink: "/css/dashboard_styles.css", 
        student,
        message,
        numChats,
        names,
    });
}))

// show the chat page
app.get("/chat/:student2ID", wrapAsyncHandler(async (req, res, next) => {
    const {iitb_roll_number} = req.session;
    if(!iitb_roll_number) {
        throw new AuthenticationError("Not logged in");
    }
    const student = await Student.findOne({ "IITB Roll Number": iitb_roll_number });
    if(!student) {
        throw new IncompleteDataError("Student data is incomplete");
    }
    const {student2ID} = req.params;
    const student2 = await Student.findById(student2ID);
    const student2RollNumber = student2["IITB Roll Number"];
    const chats = await Chat.find({
        $or: [
            { $and: [{ from: iitb_roll_number }, { to: student2RollNumber }] },
            { $and: [{ from: student2RollNumber }, { to: iitb_roll_number }] }
        ]
    }).sort({ createdAt: 1 });
    
    // mark all messages as read
    for(const chat of chats) {
        if(chat.to === iitb_roll_number) {
            chat.viewed = true;
            await chat.save();
        }
    }

    present(res, "chat", {
        pageTitle: `Chat with ${student2["Name"].split(" ")[0]}`,
        stylesheetLink: "/css/chat_styles.css",
        scriptLink: "/js/chat_script.js",
        chats,
        student,
        student2,
    });
}))

// handle the request to send a chat message
app.post("/chat/:student2ID", async (req, res) => {
    const {iitb_roll_number} = req.session;
    const {student2ID} = req.params;
    const student2 = await Student.findById(student2ID);
    const student2RollNumber = student2["IITB Roll Number"];
    const {new_message} = req.body;
    const newChat = new Chat({from: iitb_roll_number, to: student2RollNumber, message: new_message});
    await newChat.save();
    res.redirect(`/chat/${student2ID}`);
})

// show the profile page
app.get("/profile", wrapAsyncHandler(async (req, res, next) => {
    const {iitb_roll_number} = req.session;
    if(!iitb_roll_number) {
        throw new AuthenticationError("Not logged in");
    }
    const student = await Student.findOne({ "IITB Roll Number": iitb_roll_number });
    if(!student) {
        throw new IncompleteDataError("Student data is incomplete");
    }
    present(res, "dating", {
        pageTitle: "My Profile",
        student,
        isStudentCreated: true,
    });
}))

// function to handle update to profile from and redirect appropriately
const updateProfile = async (req, callback) => {
    const {iitb_roll_number} = req.session;
    Student.findOneAndUpdate({ "IITB Roll Number": iitb_roll_number }, req.body, {new: true, runValidators: true})
        .then(student => {
            callback(student);
        })
        .catch(err => {
            console.log(err);
        });
}

// handle the request to update the profile and redirect to the dashboard
app.post("/update-profile", (req, res) => {
    updateProfile(req, student => {
        req.session.message = "Profile updated successfully.";
        res.redirect("/dashboard");
    });
})

// handle the request to update the profile and redirect to the match page
app.post("/match", (req, res) => {
    updateProfile(req, student => {
        res.redirect("/match");
    });
});

// show the match page
app.get("/match", wrapAsyncHandler(async (req, res, next) => {
    const {iitb_roll_number} = req.session;
    if(!iitb_roll_number) {
        throw new AuthenticationError("Not logged in");
    }
    const student = await Student.findOne({ "IITB Roll Number": iitb_roll_number });
    if(!student) {
        throw new IncompleteDataError("Student data is incomplete");
    }
    const match_roll_number = await script.find_perfect_match(iitb_roll_number);
    if(!match_roll_number) {
        present(res, "no_match", {
            pageTitle: "No match found",
            student,
        });
        return;
    }
    const match = await Student.findOne({ "IITB Roll Number": match_roll_number });
    const canLike = !match["Likes"].includes(iitb_roll_number);
    present(res, "match", {
        pageTitle: "It's a match!",
        scriptLink: "/js/like.js",
        student,
        match,
        canLike,
    });
}))

// show the scroll/swipe page
app.get("/explore", wrapAsyncHandler(async (req, res, next) => {
    const {iitb_roll_number} = req.session;
    // Use the query parameters as needed
    if(!iitb_roll_number) {
        throw new AuthenticationError("Not logged in");
    }
    const student = await Student.findOne({ "IITB Roll Number": iitb_roll_number });
    if(!student) {
        throw new IncompleteDataError("Student data is incomplete");
    }
    const { quickchat } = req.query; // quickchat is a boolean which is true if the user explicitly wants to quickchat
    const suitable_roll_numbers = await script.suitable(iitb_roll_number);
    const profiles = await Student.find({ "IITB Roll Number": { $in: suitable_roll_numbers } });
    present(res, "scroll_or_swipe", {
        pageTitle: "Explore",
        stylesheetLink: "/css/scroll_or_swipe_styles.css",
        profiles,
        quickchat,
    });
}));

// Define a route for liking a profile
app.post('/hitLike', async (req, res) => {
    try {
        const {iitb_roll_number} = req.session;
        const { likerRollNo, likedID } = req.body;
        if(!likerRollNo || !likedID || likerRollNo !== iitb_roll_number) {
            throw new Error('Invalid request');
        }
        // check if the liker has already liked the liked
        const liker = await Student.findOne({ "IITB Roll Number": likerRollNo });
        if(liker["Likes"].includes(likedID)) {
            throw new Error('Already liked');
        }
        const updatedRecord = await Student.findByIdAndUpdate(likedID, { $push: { "Likes": likerRollNo } }, { new: true, runValidators: true });
        // Update the record using Mongoose
        res.json(updatedRecord);
    } catch (error) {
        console.log('Error updating record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
  
// show the profile of a specific student
app.get("/profile/:student_id", wrapAsyncHandler(async (req, res, next) => {
    const {iitb_roll_number} = req.session;
    if(!iitb_roll_number) {
        throw new AuthenticationError("Not logged in");
    }
    const currStudent = await Student.findOne({ "IITB Roll Number": iitb_roll_number });
    if(!currStudent) {
        throw new IncompleteDataError("Student data is incomplete");
    }
    const {quickchat} = req.query; // quickchat is a boolean which is true if the user explicitly wants to quickchat
    const {student_id} = req.params;
    const student = await Student.findById(student_id);
    const canLike = !student["Likes"].includes(iitb_roll_number);
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
        quickchat,
    });
}));

// handle the request to logout
app.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            res.redirect("/dashboard");
        } else {
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.log(err);
    if(err instanceof AuthenticationError) {
        req.session.error = "Not logged in";
        res.redirect("/login");
    } else if(err instanceof IncompleteDataError) {
        req.session.error = "Please complete your profile info";
        res.redirect("/complete-profile");
    } else {
        res.send(err);
    }
});