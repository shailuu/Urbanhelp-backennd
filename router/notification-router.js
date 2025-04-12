const express = require("express");
const router = express.Router();
const Notification = require("../models/notification-model");

// GET /api/notifications?userEmail=someone@example.com
router.get("/", async (req, res) => {
  const { userEmail } = req.query;

  if (!userEmail) {
    return res.status(400).json({ success: false, message: "Missing userEmail" });
  }

  try {
    const notifications = await Notification.find({ userEmail })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to prevent loading too many
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("[Fetch Notifications Error]:", error);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
});

// PUT /api/notifications/:id/read - Mark a single notification as read
router.put("/:id/read", async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error("[Mark Notification Read Error]:", error);
    res.status(500).json({ success: false, message: "Failed to mark notification as read" });
  }
});

// PUT /api/notifications/mark-all-read - Mark all notifications as read for a user
router.put("/mark-all-read", async (req, res) => {
  const { userEmail } = req.query;

  if (!userEmail) {
    return res.status(400).json({ success: false, message: "Missing userEmail" });
  }

  try {
    const result = await Notification.updateMany(
      { userEmail, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ 
      success: true, 
      message: `Marked ${result.modifiedCount} notifications as read` 
    });
  } catch (error) {
    console.error("[Mark All Notifications Read Error]:", error);
    res.status(500).json({ success: false, message: "Failed to mark all notifications as read" });
  }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.error("[Delete Notification Error]:", error);
    res.status(500).json({ success: false, message: "Failed to delete notification" });
  }
});

module.exports = router;