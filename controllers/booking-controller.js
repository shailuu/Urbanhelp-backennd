const mongoose = require("mongoose");
const Booking = require("../models/booking-model");
const ApprovedBooking = require("../models/approvedBooking-model");
const ApprovedWorker = require("../models/approvedWorker-model");
const Service = require("../models/service");
const { sendEmail } = require("../utils/sendEmail");
const Notification = require("../models/notification-model");
const { generateBookingApprovalEmail } = require("../utils/emailTemplates");

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Public
 */
const createBooking = async (req, res) => {
  try {
    const { service, duration, charge, date, time, clientInfo } = req.body;

    if (!service || !duration || !date || !time || !clientInfo) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newBooking = await Booking.create({
      service,
      duration,
      charge,
      date,
      time,
      clientInfo,
      isApproved: false,
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    console.error("[Create Booking Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get all bookings
 * @route   GET /api/bookings
 * @access  Private/Admin
 */
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("service", "title description price")
      .populate("approvedWorker", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("[Get Bookings Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve bookings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Approve a booking and assign worker
 * @route   POST /api/bookings/:id/approve
 * @access  Private/Admin
 */
const approveBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  let committed = false;

  try {
    const { id } = req.params;
    const { approvedWorkerId } = req.body;

    if (!approvedWorkerId || !mongoose.Types.ObjectId.isValid(approvedWorkerId)) {
      return res.status(400).json({
        success: false,
        message: "Valid approvedWorkerId is required in request body.",
      });
    }

    const booking = await Booking.findById(id)
      .populate("service")
      .populate('approvedWorker', 'name')
      .session(session);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.isApproved) {
      return res.status(400).json({
        success: false,
        message: "Booking is already approved.",
        bookingId: id,
        approvedWorkerId: booking.approvedWorker,
      });
    }

    const worker = await ApprovedWorker.findById(approvedWorkerId).session(session);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Approved worker not found.",
        workerId: approvedWorkerId,
      });
    }

    const approvedBooking = new ApprovedBooking({
      originalBookingId: booking._id,
      approvedWorker: worker._id,
      service: booking.service,
      duration: booking.duration,
      charge: booking.charge,
      date: booking.date,
      time: booking.time,
      clientInfo: booking.clientInfo,
    });

    booking.isApproved = true;
    booking.approvedWorker = worker._id;

    await approvedBooking.save({ session });
    await booking.save({ session });

    await session.commitTransaction();
    committed = true;

    // Extract service title safely
    const serviceTitle = booking.service && typeof booking.service.title === 'string'
      ? booking.service.title
      : 'service';

    // Fire-and-forget email
    sendEmail({
      to: booking.clientInfo.email,
      subject: "Your Booking Has Been Approved",
      html: generateBookingApprovalEmail(booking, worker),
    }).catch((emailError) => {
      console.error("[Email Error]:", emailError);
    });

    // Create notification with more detailed metadata
    try {
      await Notification.create({
        userEmail: booking.clientInfo.email,
        message: `Your booking for ${serviceTitle} has been approved.`,
        relatedEntity: "booking",
        relatedEntityId: booking._id,
        metadata: {
          workerId: worker._id,
          workerName: worker.name,
          serviceTitle: serviceTitle,
          bookingDate: booking.date,
          bookingTime: booking.time,
        },
      });
      console.log("Notification created successfully");
    } catch (notifError) {
      console.error("[Notification Creation Error]:", notifError);
    }

    const updatedBooking = await Booking.findById(id)
      .populate("service", "title description")
      .populate("approvedWorker", "name email phone");

    return res.status(200).json({
      success: true,
      message: "Booking approved successfully.",
      booking: updatedBooking,
      approvedBookingId: approvedBooking._id,
    });

  } catch (error) {
    console.error("[Booking Approval Error]:", error);
    if (!committed) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {
        console.error("[Abort Transaction Error]:", abortErr);
      }
    }
    return res.status(500).json({
      success: false,
      message: "Failed to approve booking.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Get booking history for logged-in user (past bookings only)
 * @route   GET /api/bookings/history/user
 * @access  Private/User (user must be authenticated)
 */
const getUserBookingHistory = async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Fetch approved bookings
    const approvedBookings = await ApprovedBooking.find({ "clientInfo.email": userEmail })
      .populate("approvedWorker", "name email phone")
      .populate("service", "title description price");

    // Fetch pending booking requests (not approved)
    const pendingBookings = await Booking.find({ 
      "clientInfo.email": userEmail,
      isApproved: false 
    })
      .populate("service", "title description price");

    // Add a status field to distinguish them on frontend
    const formattedApproved = approvedBookings.map((b) => ({
      ...b.toObject(),
      status: "Approved",
    }));

    const formattedPending = pendingBookings.map((b) => ({
      ...b.toObject(),
      status: "Pending Approval",
      approvedWorker: null, // no worker assigned yet
    }));

    // Combine and sort by date descending (you can change sorting logic)
    const combinedBookings = [...formattedApproved, ...formattedPending].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    return res.status(200).json(combinedBookings);
  } catch (error) {
    console.error("Error fetching booking history:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Cancel a booking by the user
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private/User
 */
const cancelBookingByUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userEmail = req.user.email; // Assuming req.user is populated by authMiddleware

        let booking = null;
        let approvedBookingRecord = null;

        // Try to find in Booking model first
        booking = await Booking.findById(id);

        // If not found in Booking, check ApprovedBooking (if it refers back to original booking)
        if (!booking) {
            approvedBookingRecord = await ApprovedBooking.findById(id);
            if (approvedBookingRecord && approvedBookingRecord.originalBookingId) {
                booking = await Booking.findById(approvedBookingRecord.originalBookingId);
            }
        }

        if (!booking || booking.clientInfo.email !== userEmail) {
            return res.status(403).json({ success: false, message: "Booking not found or you are not authorized to cancel this booking." });
        }

        if (booking.status === "Cancelled") {
            return res.status(400).json({ success: false, message: "Booking is already cancelled." });
        }

        // Update status in original Booking model
        booking.status = "Cancelled";
        await booking.save();

        // If an approved booking exists, also update its status
        if (!approvedBookingRecord) {
            // If we found the original booking, check if it has an approved counterpart
            approvedBookingRecord = await ApprovedBooking.findOne({ originalBookingId: booking._id });
        }
        if (approvedBookingRecord) {
            approvedBookingRecord.status = "Cancelled";
            await approvedBookingRecord.save();
        }

        // Notify admin about the cancellation (optional but good practice)
        try {
            await Notification.create({
                userEmail: "admin", // Or a specific admin email
                message: `Booking ID ${booking._id} has been cancelled by the user ${userEmail}.`,
                relatedEntity: "booking",
                relatedEntityId: booking._id,
                metadata: {
                    userEmail: userEmail,
                    serviceTitle: booking.service?.title || "unknown service", // Safely access title
                    bookingDate: booking.date.toISOString(),
                    bookingTime: booking.time,
                    status: "Cancelled"
                },
            });
        } catch (notifError) {
            console.error("Error creating admin cancellation notification:", notifError);
        }

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully.",
            booking
        });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        return res.status(500).json({ success: false, message: "Failed to cancel booking." });
    }
};


module.exports = {
  createBooking,
  getAllBookings,
  approveBooking,
  getUserBookingHistory,
  cancelBookingByUser // Added back to exports
};