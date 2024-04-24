const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    "IITB Roll Number": {
        type: String,
        required: true,
        unique: true
    },
    "Name": {
        type: String,
    },
    "Year of Study": {
        type: String,
    },
    "Age": {
        type: Number,
    },
    "Gender": {
        type: String,
        enum: ["Male", "Female", "Other"]
    },
    "Email": {
        type: String,
    },
    "Interests": {
        type: [String],
        enum: ["Traveling", "Sports", "Movies", "Music", "Literature", "Technology", "Fashion", "Art"],
    },
    "Hobbies": {
        type: [String],
        enum: ["Reading", "Cooking", "Coding", "Gardening", "Painting", "Watching Youtube/Instagram", "Playing musical instruments", "Photography"],
    },
    "Photo": {
        type: String,
    },
    "Views": {
        type: Number,
        default: 0
    },
    "Likes": {
        type: [String],
        default: [],
    },
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;