const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    secret_question: {
        type: String,
        required: true
    },
    secret_answer: {
        type: String,
        required: true
    },
    "IITB Roll Number": {
        type: String,
        required: true,
        unique: true
    },
});

const Login = mongoose.model('Login', loginSchema);

module.exports = Login;