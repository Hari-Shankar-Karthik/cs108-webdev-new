const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.APP_PASS,
    },
});

async function sendEmail(transporter, mailOptions) {
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
}

module.exports = { transporter, sendEmail };