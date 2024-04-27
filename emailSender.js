require('dotenv').config(); // Load environment variables from .env file
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.email",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: process.env.EMAIL_USER, // Using environment variable
        pass: process.env.EMAIL_PASS // Using environment variable,
    },
});

// Function to send email
const sendEmail = async (transporter, mailOptions) => {
    // Send mail with defined transport object
    transporter.sendMail(mailOptions)
        .then(info => {
            console.log(`Email sent: ${info.messageId}`);
            return info;
        })
        .catch(err => {
            console.log(`Error sending email: ${err}`);
            throw err;
        });
}

module.exports = sendEmail;
