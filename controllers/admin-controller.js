const User = require("../models/user-models");
const Contact = require("../models/contact-model");
const WorkWithUs = require("../models/workwithus-model");
const Service = require("../models/service");
const { approveWorker } = require("./workwithus-controller");
const ApprovedWorker = require('../models/approvedWorker-model');
const Booking = require("../models/booking-model");
const ApprovedBooking = require("../models/approvedBooking-model");
const { approveBooking } = require("./booking-controller");
const parser = require("../middlewares/upload"); 
const Review = require("../models/reviews");
// ------------------- USER MANAGEMENT -------------------

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Update a user
const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// ------------------- CONTACT MANAGEMENT -------------------

// Get all contacts
const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
};

// Update contact details
const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contact) return res.status(404).json({ error: "Contact not found" });
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ error: "Failed to update contact" });
  }
};

// Delete a contact
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ error: "Contact not found" });
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete contact" });
  }
};

// ------------------- WORKWITHUS APPLICATIONS -------------------

// Get all WorkWithUs applications
const getWorkWithUs = async (req, res) => {
  try {
    const applications = await WorkWithUs.find();
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
};

// Update WorkWithUs application details
const updateWorkWithUs = async (req, res) => {
  try {
    const application = await WorkWithUs.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!application) return res.status(404).json({ error: "Application not found" });
    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ error: "Failed to update application" });
  }
};

// Delete a WorkWithUs application
const deleteWorkWithUs = async (req, res) => {
  try {
    const application = await WorkWithUs.findByIdAndDelete(req.params.id);
    if (!application) return res.status(404).json({ error: "Application not found" });
    res.status(200).json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete application" });
  }
};

// ------------------- SERVICE MANAGEMENT -------------------

// Get all services
const getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
};

// Create a new service
// Create a new service
const createService = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);
    
    const { title, description, additionalDetails } = req.body;
    
    // Extract durations if they exist
    let durations = [];
    if (req.body.durations) {
      // Handle if durations is sent as JSON string
      try {
        durations = typeof req.body.durations === 'string' 
          ? JSON.parse(req.body.durations) 
          : req.body.durations;
      } catch (err) {
        console.error("Error parsing durations:", err);
        return res.status(400).json({ error: "Invalid durations format" });
      }
    }
    
    // Check for the uploaded file
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }
    
    const image = req.file.path; // This should be the Cloudinary URL
    
    const newService = new Service({
      title,
      description,
      image,
      additionalDetails,
      ...(durations.length > 0 && { durations })
    });
    
    await newService.save();
    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service: newService
    });
  } catch (error) {
    console.error("Service creation error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to create service",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Update a service
const updateService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const updates = req.body;

    // Handle image update if a new image is uploaded
    if (req.file) {
      updates.image = req.file.path;
    }

    // Parse durations if provided (in case they are passed as JSON string)
    if (updates.durations && typeof updates.durations === "string") {
      try {
        updates.durations = JSON.parse(updates.durations);
      } catch (err) {
        return res.status(400).json({ error: "Invalid durations format" });
      }
    }

    const updatedService = await Service.findByIdAndUpdate(serviceId, updates, { new: true });
    if (!updatedService) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("Update Service Error:", error);
    res.status(500).json({ error: "Failed to update service" });
  }
};


// Delete a service
const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete service" });
  }
};

// ------------------- APPROVED WORKERS MANAGEMENT -------------------

// Get all approved workers
const getApprovedWorkers = async (req, res) => {
  try {
    const workers = await ApprovedWorker.find();
    res.status(200).json(workers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch approved workers" });
  }
};

// Create an approved worker directly
const createApprovedWorker = async (req, res) => {
  try {
    const worker = new ApprovedWorker(req.body);
    await worker.save();
    res.status(201).json(worker);
  } catch (error) {
    res.status(500).json({ error: "Failed to create approved worker" });
  }
};

// Update an approved worker
const updateApprovedWorker = async (req, res) => {
  try {
    const worker = await ApprovedWorker.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!worker) return res.status(404).json({ error: "Approved worker not found" });
    res.status(200).json(worker);
  } catch (error) {
    res.status(500).json({ error: "Failed to update approved worker" });
  }
};

// Delete an approved worker
const deleteApprovedWorker = async (req, res) => {
  try {
    const worker = await ApprovedWorker.findByIdAndDelete(req.params.id);
    if (!worker) return res.status(404).json({ error: "Approved worker not found" });
    res.status(200).json({ message: "Approved worker deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete approved worker" });
  }
};

// ------------------- BOOKING MANAGEMENT -------------------

// Get all bookings
const getAllBookingsAdmin = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("service", "title description price")
      .populate("approvedWorker", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("[Get Bookings Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve bookings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all approved bookings
const getApprovedBookingsAdmin = async (req, res) => {
  try {
    const approvedBookings = await ApprovedBooking.find({})
      .populate("service", "title description price")
      .populate("approvedWorker", "name email phone")
      .sort({ finalizedAt: -1 });

    res.status(200).json({
      success: true,
      count: approvedBookings.length,
      approvedBookings,
    });
  } catch (error) {
    console.error("[Get Approved Bookings Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve approved bookings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete a booking
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete booking" });
  }
};
// Delete an approved booking
const deleteApprovedBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBooking = await ApprovedBooking.findByIdAndDelete(id);
    if (!deletedBooking) {
      return res.status(404).json({ error: "Approved booking not found" });
    }
    res.status(200).json({ message: "Approved booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting approved booking:", error);
    res.status(500).json({ error: "Failed to delete approved booking" });
  }
};
// ------------------- REVIEW MANAGEMENT -------------------
// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate("userId", "name email")          // Optional: populate user info
      .populate("serviceId", "title");           // Optional: populate service title
    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
};
// ------------------- EXPORTS -------------------

module.exports = {
  getUsers,
  updateUser,
  deleteUser,
  getContacts,
  updateContact,
  deleteContact,
  getWorkWithUs,
  updateWorkWithUs,
  deleteWorkWithUs,
  getServices,
  createService,
  addService: createService, 
  updateService,
  deleteService,
  approveWorker,
  getApprovedWorkers,
  createApprovedWorker,
  updateApprovedWorker,
  deleteApprovedWorker,
  getAllBookingsAdmin,
  getApprovedBookingsAdmin,
  approveBooking,
  deleteApprovedBooking,
  deleteBooking,
  getAllReviews,
  deleteReview
};