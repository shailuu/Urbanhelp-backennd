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
        console.log(req.body);
        const { username, email, password } = req.body;

        // Check if user already exists
        const userExist = await User.findOne({ email });
        if (userExist) {
            const error = new Error("Email already exists");
            error.status = 400;
            return next(error); // Pass error to middleware
        }

        // Create new user (DO NOT hash password here, as `pre("save")` already does it)
        const userCreated = await User.create({
            username,
            email,
            password, // Password will be hashed automatically by userSchema.pre("save")
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: userCreated._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "70d" }
        );

        res.status(201).json({ 
            msg: "Registration Successful!", 
            token, 
            userID: userCreated._id.toString(),
        });

    } catch (error) {
        next(error); // Pass error to middleware
    }
};

// User Login Logic
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        console.log("Login Attempt:", email);

        // Find user by email
        const userExist = await User.findOne({ email });

        if (!userExist) {    
            const error = new Error("Invalid email or password");
            error.status = 400;
            return next(error); // Pass error to middleware
        }

        console.log("User Found:", userExist);

        // Compare passwords
        const isPasswordCorrect = await bcrypt.compare(password, userExist.password);
        console.log("Password Match:", isPasswordCorrect);

        if (!isPasswordCorrect) {
            const error = new Error("Invalid email or password");
            error.status = 401;
            return next(error); // Pass error to middleware
        }

        // Generate JWT token
        const token = await userExist.generateToken();

        res.status(200).json({
            msg: "Login Successful",
            token,
            userID: userExist._id.toString(),
        });

    } catch (error) {
        next(error); // Pass error to middleware
    }
};

module.exports = { home, register, login };
