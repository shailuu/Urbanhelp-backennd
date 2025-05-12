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

module.exports = {
  createBooking,
  getAllBookings,
  approveBooking,
};