const User = require("../models/user-models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Utility function to generate OTP
function generateOTP(length = 6) {
    return Math.random().toString().substr(2, length);
}

// Function to send OTP via email
async function sendOTPEmail(email, otp) {
    const transporter = nodemailer.createTransport({
        service: "Gmail", // Use your email service (e.g., Gmail, SendGrid)
        auth: {
            user: process.env.EMAIL_USER, // Your email address
            pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
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
        next(error); // Pass error to middleware
    }
};

// Registration Logic
const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const userExist = await User.findOne({ email });
        if (userExist) {
            // If user exists but is not verified, we can resend OTP
            if (!userExist.isVerified) {
                // Generate new OTP
                const otp = generateOTP();
                const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
                
                // Update existing user with new OTP
                userExist.otp = otp;
                userExist.otpExpiresAt = otpExpiresAt;
                await userExist.save();
                
                // Send OTP to email
                await sendOTPEmail(email, otp);
                
                return res.status(200).json({
                    msg: "Account exists but not verified. New OTP sent to your email.",
                    requiresVerification: true
                });
            } else {
                const error = new Error("Email already exists");
                error.status = 400;
                return next(error);
            }
        }

        // Generate OTP for new user
        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

        // Create new user with OTP details
        const userCreated = await User.create({
            username,
            email,
            password, // Password will be hashed automatically by userSchema.pre("save")
            otp,
            otpExpiresAt,
            isVerified: false, // Mark as not verified initially
        });

        // Send OTP to the user's email
        await sendOTPEmail(email, otp);

        res.status(201).json({
            msg: "Registration initiated! Please check your email for the OTP to complete registration.",
            requiresVerification: true
        });
    } catch (error) {
        next(error);
    }
};

// Verify OTP Logic
const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error("User not found");
            error.status = 404;
            return next(error);
        }

        // Check if OTP matches and has not expired
        if (user.otp !== otp || user.otpExpiresAt < new Date()) {
            const error = new Error("Invalid or expired OTP");
            error.status = 400;
            return next(error);
        }

        // Mark the user as verified
        user.isVerified = true;
        user.otp = undefined; // Clear OTP after verification
        user.otpExpiresAt = undefined; // Clear OTP expiration time
        await user.save();

        // Generate token for automatic login after verification
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

// Resend OTP Logic
const resendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error("User not found");
            error.status = 404;
            return next(error);
        }

        // Check if the user is already verified
        if (user.isVerified) {
            return res.status(400).json({
                msg: "User is already verified. Please log in."
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

        // Update user with new OTP
        user.otp = otp;
        user.otpExpiresAt = otpExpiresAt;
        await user.save();

        // Send new OTP to the user's email
        await sendOTPEmail(email, otp);

        res.status(200).json({
            msg: "New OTP sent to your email.",
        });
    } catch (error) {
        next(error);
    }
};

// User Login Logic
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error("Invalid email or password");
            error.status = 400;
            return next(error);
        }

        // Check if the user's email is verified
        if (!user.isVerified) {
            // Generate new OTP for convenience
            const otp = generateOTP();
            const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
            
            user.otp = otp;
            user.otpExpiresAt = otpExpiresAt;
            await user.save();
            
            // Send new OTP
            await sendOTPEmail(email, otp);
            
            return res.status(403).json({
                msg: "Email not verified. A new verification code has been sent to your email.",
                requiresVerification: true
            });
        }

        // Compare passwords
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            const error = new Error("Invalid email or password");
            error.status = 401;
            return next(error);
        }

        // Generate JWT token
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
        const user = req.user; // User attached by authMiddleware
        
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
        const user = req.user; // User attached by authMiddleware
        const updates = req.body;
        
        // List of fields that can be updated
        const allowedUpdates = ["username", "dob", "gender", "city", "phoneNumber", "address"];
        
        // Update fields if provided in request
        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                user[field] = updates[field];
            }
        });

        await user.save(); // Save updated user data

        res.status(200).json({ 
            message: "Profile updated successfully.",
            user: {
                username: user.username,
                email: user.email,
                dob: user.dob || "",
                gender: user.gender || "",
                city: user.city || "",
                phoneNumber: user.phoneNumber || "",
                address: user.address || "",
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { 
    home, register, login, getProfile, updateProfile, verifyOTP, resendOTP 
};