const mongoose = require('mongoose');

// function to check whether the sender/receiver students exist
const studentValidator = async username => {
    const student = await mongoose.model('Student').findOne({username});
    if (!student) {
        throw new Error(`Invalid student username: ${username}`);
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
    }
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
