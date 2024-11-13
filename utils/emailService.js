// utils/emailService.js
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail", // or any other email service provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === "development" ? false : true, // This allows self-signed certificates
  },
});

// Send OTP email
exports.sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Transaction",
    text: `Your One-Time Password (OTP) for the transaction is: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};
