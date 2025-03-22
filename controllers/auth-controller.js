const User = require("../models/user-models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
            const error = new Error("Email already exists");
            error.status = 400;
            return next(error);
        }

        // Create new user with minimal required fields
        const userCreated = await User.create({
            username,
            email,
            password, // Password will be hashed automatically by userSchema.pre("save")
        });

        // Generate JWT token
        const token = await userCreated.generateToken();

        res.status(201).json({
            msg: "Registration Successful!",
            token,
            user: {
                id: userCreated._id.toString(),
                username: userCreated.username,
                email: userCreated.email,
                isAdmin: userCreated.isAdmin,
            },
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
        const userExist = await User.findOne({ email });

        if (!userExist) {
            const error = new Error("Invalid email or password");
            error.status = 400;
            return next(error);
        }

        // Compare passwords
        const isPasswordCorrect = await bcrypt.compare(password, userExist.password);

        if (!isPasswordCorrect) {
            const error = new Error("Invalid email or password");
            error.status = 401;
            return next(error);
        }

        // Generate JWT token
        const token = await userExist.generateToken();

        res.status(200).json({
            msg: "Login Successful",
            token,
            user: {
                id: userExist._id.toString(),
                username: userExist.username,
                email: userExist.email,
                isAdmin: userExist.isAdmin,
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

module.exports = { home, register, login, getProfile, updateProfile };