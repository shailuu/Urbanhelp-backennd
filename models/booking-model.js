const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true }, // Changed from serviceId
  duration: { type: String, required: true },
  charge: { type: Number, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  clientInfo: {
    clientName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    location: { type: String, required: true },
    address: { type: String, required: true },
  },
   status: {
    type: String,
    enum: ["Pending Approval", "Approved", "Cancelled", "Completed", "Payment Pending", "Payment Failed"],
    default: "Pending Approval",
  },
  isApproved: { type: Boolean, default: false },
  approvedWorker: { type: mongoose.Schema.Types.ObjectId, ref: "ApprovedWorker" }
});
module.exports = mongoose.model("Booking", bookingSchema);