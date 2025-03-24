const nodemailer = require("nodemailer");
require('dotenv').config(); // Make sure to have this package installed

async function testSendEmail() {
    // Create test account on Ethereal for testing without real emails
    // Or configure your actual email service for real testing
    const testAccount = await nodemailer.createTestAccount();
    
    // For real Gmail testing
    const useRealEmail = false; // Set to true to use real Gmail
    
    const transporter = useRealEmail ? 
        nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        }) :
        // For testing without sending real emails
        nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

    const testOTP = Math.random().toString().substr(2, 6);
    
    const mailOptions = {
        from: useRealEmail ? process.env.EMAIL_USER : '"Test User" <test@example.com>',
        to: "recipient-email@example.com", // Replace with a test recipient email
        subject: "Your OTP for Registration",
        text: `Your OTP is: ${testOTP}. It will expire in 10 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #333;">Welcome to UrbanHelp!</h2>
                <p>Thank you for registering. To complete your registration, please use the following OTP:</p>
                <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
                    ${testOTP}
                </div>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this OTP, please ignore this email.</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Test email sent successfully!");
        
        if (!useRealEmail) {
            // This URL lets you preview the email without actually sending it
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
    } catch (error) {
        console.error("Error sending test email:", error.message);
    }
}

// Call the function
testSendEmail();