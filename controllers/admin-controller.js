const User = require("../models/user-models");
const Contact = require("../models/contact-model");
const WorkWithUs = require("../models/workwithus-model");
const Service = require("../models/service");
const { approveWorker } = require("./workwithus-controller"); // <-- Import the approveWorker function
const ApprovedWorker = require('../models/approvedWorker-model');
const Booking = require("../models/booking-model");
const ApprovedBooking = require("../models/approvedBooking-model");
const { approveBooking } = require("./booking-controller");


// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

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
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ error: "Failed to update contact" });
  }
};

// Delete a contact
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete contact" });
  }
};

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
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ error: "Failed to update application" });
  }
};

// Delete a WorkWithUs application
const deleteWorkWithUs = async (req, res) => {
  try {
    const application = await WorkWithUs.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.status(200).json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete application" });
  }
};

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
const createService = async (req, res) => {
  try {
    const { title, description, image, additionalDetails, durations } = req.body;

    // Validate durations array
    if (!Array.isArray(durations) || durations.length === 0) {
      return res.status(400).json({ error: "Durations must be a non-empty array" });
    }

    // Validate that each duration object has the required properties
    for (const item of durations) {
      if (!item.duration || !item.charge) {
        return res.status(400).json({ error: "Each duration must have both duration and charge properties" });
      }
    }

    const newService = new Service({
      title,
      description,
      image,
      additionalDetails,
      durations
    });

    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: "Failed to create service" });
  }
};

// Update a service
const updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: "Failed to update service" });
  }
};

// Delete a service
const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete service" });
  }
};

const getApprovedWorkers = async (req, res) => {
  try {
    const workers = await ApprovedWorker.find();
    res.status(200).json(workers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch approved workers" });
  }
};


// Add these new controller functions:

// Create approved worker directly (not from application)
const createApprovedWorker = async (req, res) => {
  try {
    const worker = new ApprovedWorker(req.body);
    await worker.save();
    res.status(201).json(worker);
  } catch (error) {
    res.status(500).json({ error: "Failed to create approved worker" });
  }
};

// Update approved worker
const updateApprovedWorker = async (req, res) => {
  try {
    const worker = await ApprovedWorker.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    if (!worker) {
      return res.status(404).json({ error: "Approved worker not found" });
    }
    res.status(200).json(worker);
  } catch (error) {
    res.status(500).json({ error: "Failed to update approved worker" });
  }
};

// Delete approved worker
const deleteApprovedWorker = async (req, res) => {
  try {
    const worker = await ApprovedWorker.findByIdAndDelete(req.params.id);
    if (!worker) {
      return res.status(404).json({ error: "Approved worker not found" });
    }
    res.status(200).json({ message: "Approved worker deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete approved worker" });
  }
};

const getAllBookingsAdmin = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("service", "title description price")
      .populate("approvedWorker", "name email phone")
      .sort({ createdAt: -1 });
      
    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error("[Get Bookings Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve bookings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Get all approved bookings for admin
const getApprovedBookingsAdmin = async (req, res) => {
  try {
    const approvedBookings = await ApprovedBooking.find({})
      .populate("service", "title description price")
      .populate("approvedWorker", "name email phone")
      .sort({ finalizedAt: -1 });
      
    return res.status(200).json({
      success: true,
      count: approvedBookings.length,
      approvedBookings
    });
  } catch (error) {
    console.error("[Get Approved Bookings Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve approved bookings",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete booking" });
  }
};
// Export all functions including approveWorker
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
  deleteBooking
};
