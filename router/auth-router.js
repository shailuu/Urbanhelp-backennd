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

module.exports = router;