// models/notification-model.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  relatedEntity: {
    type: String, // e.g., 'booking', 'worker', etc.
    default: null,
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  metadata: {
    type: Object, // additional optional data (worker name, service name etc.)
    default: {},
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
