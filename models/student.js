const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    "IITB Roll Number": {
        type: String,
        required: true,
        unique: true
    },
    "Name": {
        type: String,
        required: true
    },
    "Year of Study": {
        type: String,
        required: true,
    },
    "Age": {
        type: Number,
        required: true
    },
    "Gender": {
        type: String,
        required: true,
        enum: ["Male", "Female", "Other"]
    },
    "Email": {
        type: String,
        required: true
    },
    "Interests": {
        type: [String],
        required: true,
        enum: ["Traveling", "Sports", "Movies", "Music", "Literature", "Technology", "Fashion", "Art"],
    },
    "Hobbies": {
        type: [String],
        required: true,
        enum: ["Reading", "Cooking", "Coding", "Gardening", "Painting", "Watching Youtube/Instagram", "Playing musical instruments", "Photography"],
    },
    "Photo": {
        type: String,
        required: true
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