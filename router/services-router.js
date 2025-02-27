const express = require("express");
const router = express.Router();
const { getAllServices, addService, updateService, deleteService } = require("../controllers/services-controller");

// Get all services
router.get("/", getAllServices);

// Add a new service (Admin only)
router.post("/", addService);

// Update a service by ID (Admin only)
router.put("/:id", updateService);

// Delete a service by ID (Admin only)
router.delete("/:id", deleteService);

module.exports = router;