const express = require("express");
const router = express.Router();
const { createBooking, getAllBookings } = require("../controllers/booking-controller");

// Create a new booking
router.post("/bookings", createBooking);

// Get all bookings
router.get("/bookings", getAllBookings);

module.exports = router;