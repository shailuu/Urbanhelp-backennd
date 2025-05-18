const express = require("express");
const router = express.Router();

// Import the controller functions
const {
  createBooking,
  getAllBookings,
  approveBooking, // Make sure this is correctly imported
  getUserBookingHistory
} = require("../controllers/booking-controller"); // Path to your controller
const { authMiddleware } = require("../middlewares/auth-middleware");

// Define the routes
router.post("/", createBooking); // POST to create a booking
router.get("/", getAllBookings); // GET to fetch all bookings
router.post("/:id/approve", approveBooking); // POST to approve a booking
router.get('/history/user', authMiddleware, getUserBookingHistory);
module.exports = router;