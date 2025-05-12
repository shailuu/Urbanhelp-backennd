const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service", // Reference to the Service model
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// 🔒 Add this line: Enforce uniqueness of (serviceId, userId) pair
reviewSchema.index({ serviceId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);