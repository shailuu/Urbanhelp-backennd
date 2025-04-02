const jwt = require("jsonwebtoken");
const User = require("../models/user-models");

// Middleware to authenticate users
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token

    if (!token) {
      return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Find user in the database
    const user = await User.findById(decoded.userID || decoded._id).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token. User not found." });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
};

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    // Ensure user exists
    if (!req.user) {
      return res.status(403).json({ error: "Access denied. User not authenticated." });
    }

    // We already have the user from authMiddleware
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Access denied. Not an admin." });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Authorization failed" });
  }
};

module.exports = { authMiddleware, isAdmin };