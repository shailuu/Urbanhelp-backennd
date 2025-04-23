const express = require("express");
const router = express.Router();
const parser = require('../middlewares/upload');
const { authMiddleware, isAdmin } = require("../middlewares/auth-middleware");

const { 
    getUsers, updateUser, deleteUser, 
    getContacts, updateContact, deleteContact, 
    getWorkWithUs, updateWorkWithUs, deleteWorkWithUs,
    getServices, addService, updateService, deleteService,
    approveWorker, getApprovedWorkers, createApprovedWorker,
    updateApprovedWorker, deleteApprovedWorker,
    getAllBookingsAdmin, 
    getApprovedBookingsAdmin,
    approveBooking,
    deleteBooking
} = require("../controllers/admin-controller");

// User Management
router.get("/users", authMiddleware, isAdmin, getUsers);
router.put("/users/:id", authMiddleware, isAdmin, updateUser);
router.delete("/users/:id", authMiddleware, isAdmin, deleteUser);

// Contact Management
router.get("/contacts", authMiddleware, isAdmin, getContacts);
router.put("/contacts/:id", authMiddleware, isAdmin, updateContact);
router.delete("/contacts/:id", authMiddleware, isAdmin, deleteContact);

// WorkWithUs Applications
router.get("/workwithus", authMiddleware, isAdmin, getWorkWithUs);
router.put("/workwithus/:id", authMiddleware, isAdmin, updateWorkWithUs);
router.delete("/workwithus/:id", authMiddleware, isAdmin, deleteWorkWithUs);
router.post("/workwithus/:id/approve", authMiddleware, isAdmin, approveWorker);
router.get('/approved-workers', authMiddleware, isAdmin, getApprovedWorkers);
router.post("/approved-workers", authMiddleware, isAdmin, createApprovedWorker);
router.put("/approved-workers/:id", authMiddleware, isAdmin, updateApprovedWorker);
router.delete("/approved-workers/:id", authMiddleware, isAdmin, deleteApprovedWorker);

// Service Management
router.get("/services", authMiddleware, isAdmin, getServices);
// In your routes file
router.post(
    "/services", 
    authMiddleware, 
    isAdmin, 
    parser.single('image'), // Ensure 'image' matches the field name in your form
    addService
  ); // Consolidated route
router.put("/services/:id", authMiddleware, isAdmin, parser.single('image'), updateService); // Added parser middleware
router.delete("/services/:id", authMiddleware, isAdmin, deleteService);

// Booking Management
router.get("/bookings", authMiddleware, isAdmin, getAllBookingsAdmin);
router.get("/approved-bookings", authMiddleware, isAdmin, getApprovedBookingsAdmin);
router.post("/bookings/:id/approve", authMiddleware, isAdmin, approveBooking);
router.delete("/bookings/:id", authMiddleware, isAdmin, deleteBooking);

// Error-handling middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});

module.exports = router;