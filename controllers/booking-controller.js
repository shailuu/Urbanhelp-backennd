const Booking = require("../models/booking-model");

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      serviceId,
      duration,
      charge,
      date,
      time,
      clientInfo: { clientName, email, phoneNumber, location, address },
    } = req.body;

    // Validate required fields
    if (!serviceId || !duration || !charge || !date || !time || !clientName || !email || !phoneNumber || !location || !address) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create a new booking
    const newBooking = new Booking({
      service: serviceId, // Assuming this refers to a Service model
      serviceId,
      duration,
      charge,
      date,
      time,
      clientInfo: { clientName, email, phoneNumber, location, address },
    });

    // Save the booking to the database
    await newBooking.save();

    res.status(201).json({ message: "Booking created successfully.", booking: newBooking });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("service"); // Populate service details if needed
    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};