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

module.exports = sendEmail;