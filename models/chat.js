const mongoose = require('mongoose');
const Student = require('./student');

// function to check whether the sender/receiver students exist
const studentValidator = async iitb_roll_number => {
    const student = await Student.findOne({ "IITB Roll Number": iitb_roll_number });
    if (!student) {
        throw new Error(`Invalid roll number: ${iitb_roll_number}`);
    }
};

// schema for QuickChatTM messages
const chatSchema = new mongoose.Schema({
    from: {
        type: String,
        required: true,
        validate: {
            validator: studentValidator,
        }
    },
    to: {
        type: String,
        required: true,
        validate: {
            validator: studentValidator,
        }
    },
    message: {
        type: String,
        required: true,
        minlength: 1,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    viewed: {
        type: Boolean,
        default: false,
    },
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
