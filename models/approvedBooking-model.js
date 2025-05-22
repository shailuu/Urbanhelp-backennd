const mongoose = require("mongoose");

const approvedBookingSchema = new mongoose.Schema({
  originalBookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  approvedWorker: { type: mongoose.Schema.Types.ObjectId, ref: "ApprovedWorker", required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
  duration: String,
  charge: Number,
  date: Date,
  time: String,
  clientInfo: {
    clientName: String,
    email: String,
    phoneNumber: String,
    location: String,
    address: String,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    // Add 'Completed', 'Payment Pending', 'Payment Failed' as required
    enum: ["Approved", "Completed", "Cancelled", "Payment Pending", "Payment Failed"], // Explicitly list states for ApprovedBooking
    default: "Approved", // Default to 'Approved' for new approved bookings
  },
  finalizedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true }); 

module.exports = mongoose.model("ApprovedBooking", approvedBookingSchema);