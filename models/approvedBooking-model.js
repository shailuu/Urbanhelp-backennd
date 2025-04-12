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
  finalizedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ApprovedBooking", approvedBookingSchema);
