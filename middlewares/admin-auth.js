const jwt = require("jsonwebtoken");
const User = require("../models/user-models");

const adminAuth = async (req, res, next) => {
  try {
    // 1. Check for token in Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Access denied. No token provided." 
      });
    }

    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // 3. Find the user in database
    const user = await User.findById(decoded.userID).select("-password");
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token. User not found." 
      });
    }

    // 4. Check if user is admin
    if (!user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Admin privileges required." 
      });
    }

    // 5. Attach user to request and proceed
    req.user = user;
    next();
  } catch (error) {
    // Handle different error cases
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: "Session expired. Please login again." 
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token." 
      });
    }
    console.error("Admin auth error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error during authentication." 
    });
  }
};

module.exports = adminAuth;