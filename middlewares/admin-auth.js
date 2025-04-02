const jwt = require("jsonwebtoken");
const User = require("../models/user-models");

const authAdmin = async (req, res, next) => {
  try {
    // Get token from headers
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    // Check if user is an admin
    if (!user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Not an admin." });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};

module.exports = authAdmin;