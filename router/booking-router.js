const express = require("express");
const router = express.Router();

// Import the controller functions
const {
  createBooking,
  getAllBookings,
  approveBooking, // Make sure this is correctly imported
} = require("../controllers/booking-controller"); // Path to your controller

// Define the routes
router.post("/", createBooking); // POST to create a booking
router.get("/", getAllBookings); // GET to fetch all bookings
router.post("/:id/approve", approveBooking); // POST to approve a booking

module.exports = router;