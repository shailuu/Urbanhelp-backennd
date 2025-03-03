// controllers/admin-controller.js
const User = require("../models/user-models");

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, "-password"); // Exclude passwords from the response
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error); // Pass error to global error handler
  }
};