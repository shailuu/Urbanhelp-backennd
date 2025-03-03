// routes/admin-router.js
const express = require("express");
const router = express.Router();
const { getAllUsers } = require("../controllers/admin-controller");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth-middleware");

// Route to get all users (protected for admins only)
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);

module.exports = router;