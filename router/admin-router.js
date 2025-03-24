const express = require("express");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middlewares/auth-middleware");

// Protected route for testing authentication
router.get("/test-auth", authMiddleware, (req, res) => {
    res.status(200).json({ success: true, message: "Authenticated successfully.", user: req.user });
});

// Protected route for testing admin authorization
router.get("/test-admin", authMiddleware, adminMiddleware, (req, res) => {
    res.status(200).json({ success: true, message: "Admin access granted.", user: req.user });
});

module.exports = router;