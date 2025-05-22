// routes/paymentRoute.js

const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment-controller");
const bookingController = require('../controllers/booking-controller'); // Adjust path as needed

// ... other booking routes

// Route for Khalti payment success callback
router.get('/khalti-payment-success', bookingController.handleKhaltiPaymentSuccess);
router.post("/verify", paymentController.verifyPayment);

module.exports = router;