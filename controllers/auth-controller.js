const User = require("../models/user-models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { sendPasswordResetEmail } = require("../utils/sendEmail");

// Utility function to generate OTP
function generateOTP(length = 6) {
    return Math.random().toString().substr(2, length);
}

// Function to send OTP via email
async function sendOTPEmail(email, otp) {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP for Registration",
        text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
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
        `,
    };

    await transporter.sendMail(mailOptions);
}

// Home Logic
const home = async (req, res, next) => {
    try {
        res.status(200).send("Welcome to UrbanHelp using controller");
    } catch (error) {
        next(error);
    }
};

// Fetch All Users (Admin Only)
const getAllUsers = async (req, res, next) => {
    try {
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const users = await User.find({}, "-password");
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

// Registration Logic
const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const userExist = await User.findOne({ email });

        if (userExist) {
            if (!userExist.isVerified) {
                const otp = generateOTP();
                userExist.otp = otp;
                userExist.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
                await userExist.save();
                await sendOTPEmail(email, otp);

                return res.status(200).json({
                    msg: "Account exists but not verified. New OTP sent to your email.",
                    requiresVerification: true
                });
            } else {
                return next(new Error("Email already exists"));
            }
        }

        const otp = generateOTP();
        const userCreated = await User.create({
            username,
            email,
            password,
            otp,
            otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
            isVerified: false,
        });

        await sendOTPEmail(email, otp);

        res.status(201).json({
            msg: "Registration initiated! Please check your email for the OTP to complete registration.",
            requiresVerification: true
        });
    } catch (error) {
        next(error);
    }
};

// Verify OTP
const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.otp !== otp || user.otpExpiresAt < new Date()) {
            return next(new Error("Invalid or expired OTP"));
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        const token = await user.generateToken();

        res.status(200).json({
            msg: "Email verified successfully! You can now log in.",
            verified: true,
            token,
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
            }
        });
    } catch (error) {
        next(error);
    }
};

// Resend OTP
const resendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return next(new Error("User not found"));
        if (user.isVerified) return res.status(400).json({ msg: "User is already verified. Please log in." });

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        await sendOTPEmail(email, otp);

        res.status(200).json({ msg: "New OTP sent to your email." });
    } catch (error) {
        next(error);
    }
};

// User Login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return next(new Error("Invalid email or password"));
        }

        if (!user.isVerified) {
            const otp = generateOTP();
            user.otp = otp;
            user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
            await user.save();
            await sendOTPEmail(email, otp);

            return res.status(403).json({
                msg: "Email not verified. A new verification code has been sent to your email.",
                requiresVerification: true
            });
        }

        const token = await user.generateToken();

        res.status(200).json({
            msg: "Login Successful",
            token,
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Fetch User Profile
const getProfile = async (req, res, next) => {
    try {
        const user = req.user;
        res.status(200).json({
            username: user.username,
            email: user.email,
            dob: user.dob || "",
            gender: user.gender || "",
            city: user.city || "",
            phoneNumber: user.phoneNumber || "",
            address: user.address || "",
        });
    } catch (error) {
        next(error);
    }
};

// Update User Profile
const updateProfile = async (req, res, next) => {
    try {
        const user = req.user;
        const updates = req.body;
        const allowedUpdates = ["username", "dob", "gender", "city", "phoneNumber", "address"];

        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                user[field] = updates[field];
            }
        });

        await user.save();
        res.status(200).json({ message: "Profile updated successfully.", user });
    } catch (error) {
        next(error);
    }
};
// controllers/auth-controller.js (add this)

// Update this in controllers/auth-controller.js
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        
        const user = await User.findOne({ email });

        if (!user || !user.isVerified) {
            // For security reasons, don't reveal if user exists or not
            return res.status(200).json({ message: "If the email exists in our system, an OTP has been sent for password reset." });
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        // Use the dedicated password reset email function
        await sendPasswordResetEmail(email, otp);

        res.status(200).json({ message: "OTP sent to your email for password reset." });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Failed to process your request. Please try again later." });
        next(error);
    }
};
// controllers/auth-controller.js (add this)

// Update this in controllers/auth-controller.js
const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: "Email, OTP, and new password are required." });
        }
        
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid request." });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP." });
        }

        if (user.otpExpiresAt < new Date()) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        // Validate password strength (optional)
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }

        user.password = newPassword; // will be hashed in pre-save hook
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successful. You can now log in." });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Failed to reset password. Please try again later." });
        next(error);
    }
};

// controllers/auth-controller.js

const deleteAccount = async (req, res, next) => {
    try {
        const userId = req.user._id; // Extract user ID from the token (added by authMiddleware)
        
        // Find and delete the user
        const deletedUser = await User.findByIdAndDelete(userId);
        
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        // Optionally, you can perform additional cleanup here (e.g., delete related data)

        res.status(200).json({ message: "Account deleted successfully." });
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({ message: "Failed to delete account. Please try again later." });
        next(error);
    }
};




module.exports = { 
    home,
    register,
    login,
    getProfile,
    updateProfile,
    verifyOTP,
    resendOTP,
    getAllUsers,
    forgotPassword,
    resetPassword,
    sendPasswordResetEmail ,
    deleteAccount// Add this if you defined it in the controller file
};
