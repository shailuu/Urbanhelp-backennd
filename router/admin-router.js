const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/auth-middleware");

const { 
    getUsers, updateUser, deleteUser, 
    getContacts, updateContact, deleteContact, 
    getWorkWithUs, updateWorkWithUs, deleteWorkWithUs,
    getServices, createService, updateService, deleteService,
    approveWorker, getApprovedWorkers, createApprovedWorker,
    updateApprovedWorker, deleteApprovedWorker,
    // Add these new imports
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
router.post("/services", authMiddleware, isAdmin, createService);
router.put("/services/:id", authMiddleware, isAdmin, updateService);
router.delete("/services/:id", authMiddleware, isAdmin, deleteService);

// Add these new booking management routes
router.get("/bookings", authMiddleware, isAdmin, getAllBookingsAdmin);
router.get("/approved-bookings", authMiddleware, isAdmin, getApprovedBookingsAdmin);
router.post("/bookings/:id/approve", authMiddleware, isAdmin, approveBooking);
router.delete("/bookings/:id", authMiddleware, isAdmin, deleteBooking);
module.exports = router;