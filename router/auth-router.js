const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/auth-controller");
const { signupSchema, loginSchema } = require("../validator/auth-validators");
const { profileUpdateSchema } = require("../validator/profile-validators");
const validate = require("../middlewares/validate-middleware");
const { authMiddleware } = require("../middlewares/auth-middleware");

// Home route
router.route("/").get(authControllers.home);

// Register route
router.route("/register").post(validate(signupSchema), authControllers.register);

// Verify OTP route (no middleware required since it's part of registration)
router.route("/verify-otp").post(authControllers.verifyOTP);

// Resend OTP route
router.route("/resend-otp").post(authControllers.resendOTP);

// Login route
router.route("/login").post(validate(loginSchema), authControllers.login);

// Profile routes (protected)
router.route("/profile").get(authMiddleware, authControllers.getProfile); // Fetch user profile
router.route("/profile").put(authMiddleware, validate(profileUpdateSchema), authControllers.updateProfile); // Update user profile
router.route("/users").get(authMiddleware, authControllers.getAllUsers);
// routes/auth-router.js

router.route("/forgot-password").post(authControllers.forgotPassword);
router.route("/reset-password").post(authControllers.resetPassword);

// Delete account route (protected)
router.route("/delete-account").delete(authMiddleware, authControllers.deleteAccount);

module.exports = router;