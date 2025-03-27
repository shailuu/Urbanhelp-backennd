const jwt = require("jsonwebtoken");
const User = require("../models/user-models");

// Middleware to authenticate users
exports.authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from headers

    if (!token) {
      return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Find the user in the database
    const user = await User.findById(decoded.userID).select("-password"); // Exclude password for security

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token. User not found." });
    }

    // Attach the user object to the request
    req.user = user;
    next();
  } catch (error) {
    // Handle token verification errors
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
};

// Middleware to check if the user is an admin
exports.adminMiddleware = (req, res, next) => {
  try {
    // Check if the user has the 'admin' role
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Not an admin." });
    }

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};