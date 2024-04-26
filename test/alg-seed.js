const mongoose = require('mongoose');

const Student = require('../models/student');

// Function to get a random sample of elements from an array
const sampleRandom = arr => {
    const n = Math.floor(Math.random() * arr.length);
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/looking-for-a-date')
    .then(async () => {
        console.log('MongoDB connected');
        try {
            // Clear existing data
            await Student.deleteMany({});
            console.log('Existing students data cleared from database');

            // Insert seed data
            const numStudents = 1000;
            for(let i = 1; i <= numStudents; i++) {
                const newStudent = new Student({
                    "IITB Roll Number": `${i}`,
                    "Name": `Student${i}`,
                    "Year of Study": "1st",
                    "Age": Math.floor(Math.random() * 6) + 18,
                    "Gender": Math.random() < 0.4 ? "Male" : Math.random() < 0.8 ? "Female" : "Other",
                    "Email": `student${i}@gmail.com`,
                    "Interests": sampleRandom(["Traveling", "Sports", "Movies", "Music", "Literature", "Technology", "Fashion", "Art"]),
                    "Hobbies": sampleRandom(["Reading", "Cooking", "Coding", "Gardening", "Painting", "Watching Youtube/Instagram", "Playing musical instruments", "Photography"]),
                    "Photo": "https://images.unsplash.com/photo-1464472186810-92f1e85ac789?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                });
                await newStudent.save();
            }
            console.log('Seed data inserted into database');
            

            // Close MongoDB connection
            mongoose.connection.close();
            console.log('MongoDB connection closed');
        } catch (err) {
            console.error('Error:', err);
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err)
    });