// middlewares/auth-middleware.js

const jwt = require("jsonwebtoken");
const User = require("../models/user-models");

// Middleware to authenticate users
exports.authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from headers

    if (!token) {
        return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Verify token
        req.user = await User.findById(decoded.userID).select("-password"); // Attach user to request object
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid token." });
    }
};

// Middleware to check if the user is an admin
exports.adminMiddleware = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ success: false, message: "Access denied. Not an admin." });
    }
    next();
};