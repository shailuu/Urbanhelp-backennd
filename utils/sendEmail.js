// utils/sendEmail.js
const nodemailer = require("nodemailer");
require('dotenv').config();

async function sendEmail({ to, subject, html }) {
    try {
        // Validate inputs
        if (!to || !subject || !html) {
            throw new Error("Missing required email parameters");
        }

        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
            // For better error handling
            pool: true,
            maxConnections: 1,
            rateDelta: 20000,
            rateLimit: 5
        });

        const mailOptions = {
            from: `UrbanHelp <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            // Add headers for better email deliverability
            headers: {
                "X-Priority": "1",
                "X-MSMail-Priority": "High",
                "Importance": "high"
            }
        };

        // Verify connection configuration
        await transporter.verify();

        // Send the email with timeout
        const sendPromise = transporter.sendMail(mailOptions);
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error("Email sending timeout"));
            }, 15000); // 15 seconds timeout
        });

        await Promise.race([sendPromise, timeoutPromise]);
        
        console.log(`Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error(`Email sending failed to ${to}:`, error);
        throw error; // Re-throw to allow calling function to handle
    }
}

// Specialized function for password reset emails
async function sendPasswordResetEmail(email, otp) {
    try {
        return await sendEmail({
            to: email,
            subject: "Password Reset Request",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                    <h2 style="color: #333;">UrbanHelp Password Reset</h2>
                    <p>We received a request to reset your password. Please use the following OTP to continue:</p>
                    <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p>If you didn't request this password reset, please ignore this email or contact support.</p>
                </div>
            `
        });
    } catch (error) {
        console.error(`Password reset email failed to ${email}:`, error);
        throw error;
    }
}

// Specialized function for OTP verification emails (for registration)
async function sendOTPVerificationEmail(email, otp) {
    try {
        return await sendEmail({
            to: email,
            subject: "Your OTP for Registration",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                    <h2 style="color: #333;">Welcome to UrbanHelp!</h2>
                    <p>Thank you for registering. To complete your registration, please use the following OTP:</p>
                    <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p>If you didn't request this OTP, please ignore this email.</p>
                </div>
            `
        });
    } catch (error) {
        console.error(`OTP verification email failed to ${email}:`, error);
        throw error;
    }
}

module.exports = {
    sendEmail,
    sendPasswordResetEmail,
    sendOTPVerificationEmail
};