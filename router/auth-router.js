// router/auth-router.js

const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/auth-controller");
const { signupSchema, loginSchema } = require("../validator/auth-validators");
const validate = require("../middlewares/validate-middleware");

// Home route
router.route("/").get(authControllers.home);

// Register route
router.route("/register").post(validate(signupSchema), authControllers.register);

// Login route
router.route("/login").post(validate(loginSchema), authControllers.login);

module.exports = router;