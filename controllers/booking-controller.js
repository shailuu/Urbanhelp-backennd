const mongoose = require("mongoose");
const Booking = require("../models/booking-model");
const ApprovedBooking = require("../models/approvedBooking-model");
const ApprovedWorker = require("../models/approvedWorker-model");
const Service = require("../models/service");
const { sendEmail } = require("../utils/sendEmail");
const Notification = require("../models/notification-model");
const { generateBookingApprovalEmail, generatePaymentConfirmationEmail } = require("../utils/emailTemplates");

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
      status: "Pending Approval",
      isPaid: false,
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

    if (booking.isApproved || booking.status === "Approved") {
      return res.status(400).json({
        success: false,
        message: "Booking is already approved.",
        bookingId: id,
        approvedWorkerId: booking.approvedWorker,
      });
    }
    if (booking.status === "Cancelled") {
        return res.status(400).json({
            success: false,
            message: "Cannot approve a cancelled booking.",
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
      status: "Approved",
      isPaid: false,
    });

    booking.isApproved = true;
    booking.approvedWorker = worker._id;
    booking.status = "Approved";
    booking.isPaid = false;

    await approvedBooking.save({ session });
    await booking.save({ session });

    await session.commitTransaction();
    committed = true;

    const serviceTitle = booking.service && typeof booking.service.title === 'string'
      ? booking.service.title
      : 'service';

    sendEmail({
      to: booking.clientInfo.email,
      subject: "Your Booking Has Been Approved",
      html: generateBookingApprovalEmail(booking, worker),
    }).catch((emailError) => {
      console.error("[Email Error]:", emailError);
    });

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
          charge: booking.charge,
          bookingId: booking._id,
          isPaid: false,
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

const getUserBookingHistory = async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Fetch all bookings from the 'Booking' model for the user.
    const allOriginalBookings = await Booking.find({ "clientInfo.email": userEmail })
      .populate("service", "title description price")
      .populate("approvedWorker", "name email phone")
      .lean();

    // Fetch all entries from the 'ApprovedBooking' model for the user.
    const allApprovedBookings = await ApprovedBooking.find({ "clientInfo.email": userEmail })
      .populate("service", "title description price")
      .populate("approvedWorker", "name email phone")
      .lean();

    const combinedBookingsMap = new Map();

    // 1. Add all bookings from the 'Booking' model first.
    allOriginalBookings.forEach(booking => {
        // Use the actual status from the database, or derive if not explicitly set
        if (!booking.status) {
            booking.status = booking.isApproved ? "Approved" : "Pending Approval";
        }
        combinedBookingsMap.set(booking._id.toString(), {
            ...booking,
        });
    });

    // 2. Iterate through 'ApprovedBooking' records.
    // Update existing entries in the map with more definitive status and worker info from ApprovedBooking.
    allApprovedBookings.forEach(approvedBooking => {
        const keyId = approvedBooking.originalBookingId ? approvedBooking.originalBookingId.toString() : approvedBooking._id.toString();

        if (combinedBookingsMap.has(keyId)) {
            const existingBooking = combinedBookingsMap.get(keyId);
            combinedBookingsMap.set(keyId, {
                ...existingBooking, // Keep existing fields unless overwritten
                ...approvedBooking, // Overwrite with details from ApprovedBooking (like approvedWorker, final status)
                _id: existingBooking._id, // Ensure we keep the original _id as the primary identifier
                status: approvedBooking.status || "Approved", // IMPORTANT: Use the actual status from ApprovedBooking
                service: approvedBooking.service || existingBooking.service,
                approvedWorker: approvedBooking.approvedWorker || existingBooking.approvedWorker,
            });
        } else {
            // If an ApprovedBooking somehow exists without a corresponding original booking, add it.
            combinedBookingsMap.set(keyId, {
                ...approvedBooking,
                status: approvedBooking.status || "Approved"
            });
        }
    });

    const combinedBookings = Array.from(combinedBookingsMap.values()).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    return res.status(200).json(combinedBookings);
  } catch (error) {
    console.error("Error fetching user booking history:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const cancelBookingByUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userEmail = req.user.email;

        let booking = await Booking.findById(id);

        if (!booking) {
            const approvedBookingById = await ApprovedBooking.findById(id);
            if (approvedBookingById && approvedBookingById.originalBookingId) {
                booking = await Booking.findById(approvedBookingById.originalBookingId);
                if (!booking || booking.clientInfo.email !== userEmail) {
                    return res.status(403).json({ success: false, message: "You are not authorized to cancel this booking." });
                }
            } else {
                return res.status(404).json({ success: false, message: "Booking not found." });
            }
        }

        if (booking.clientInfo.email !== userEmail) {
            return res.status(403).json({ success: false, message: "You are not authorized to cancel this booking." });
        }

        if (booking.status === "Cancelled") {
            return res.status(400).json({ success: false, message: "Booking is already cancelled." });
        }

        booking.status = "Cancelled";
        await booking.save();

        const approvedBookingRecord = await ApprovedBooking.findOne({ originalBookingId: booking._id });
        if (approvedBookingRecord) {
            approvedBookingRecord.status = "Cancelled";
            await approvedBookingRecord.save();
        }

        try {
            await Notification.create({
                userEmail: "admin",
                message: `Booking ID ${booking._id} has been cancelled by the user ${userEmail}.`,
                relatedEntity: "booking",
                relatedEntityId: booking._id,
                metadata: {
                    userEmail: userEmail,
                    serviceTitle: booking.service?.title || "unknown service",
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

const handleKhaltiPaymentSuccess = async (req, res) => {
  const { pidx, transaction_id, purchase_order_id, amount, status } = req.query;

  if (status !== 'Completed') {
    console.error(`Khalti payment not completed for order ${purchase_order_id}. Status: ${status}`);
    return res.redirect(`http://localhost:3000/payment-status?success=false&orderId=${purchase_order_id}&status=${status}`);
  }

  try {
    const bookingId = purchase_order_id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error(`Booking not found for purchase_order_id: ${bookingId}`);
      return res.redirect(`http://localhost:3000/payment-status?success=false&message=Booking not found&orderId=${bookingId}`);
    }

    booking.status = 'Completed';
    booking.isPaid = true;
    await booking.save();

    const approvedBookingRecord = await ApprovedBooking.findOne({ originalBookingId: booking._id });
    if (approvedBookingRecord) {
      approvedBookingRecord.status = 'Completed';
      approvedBookingRecord.isPaid = true;
      await approvedBookingRecord.save();
    }

    await Notification.updateMany(
      { relatedEntity: "booking", relatedEntityId: booking._id },
      { $set: { "metadata.isPaid": true } }
    );

    await booking.populate("service").populate("approvedWorker");
    sendEmail({
      to: booking.clientInfo.email,
      subject: "Payment Confirmed & Thank You for Your Booking!",
      html: generatePaymentConfirmationEmail(booking, transaction_id),
    }).catch((emailError) => {
      console.error("[Payment Confirmation Email Error]:", emailError);
    });

    return res.redirect(`http://localhost:3000/payment-status?success=true&orderId=${bookingId}&transactionId=${transaction_id}`);

  } catch (error) {
    console.error("[Khalti Payment Success Handler Error]:", error);
    return res.redirect(`http://localhost:3000/payment-status?success=false&message=Server error during payment confirmation&orderId=${purchase_order_id}`);
  }
};


module.exports = {
  createBooking,
  getAllBookings,
  approveBooking,
  getUserBookingHistory,
  cancelBookingByUser,
  handleKhaltiPaymentSuccess,
};
