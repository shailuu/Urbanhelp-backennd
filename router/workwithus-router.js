const express = require("express");
const router = express.Router();
const { workWithUsForm, getAllWorkers, approveWorker } = require("../controllers/workwithus-controller.js");

// Submit a new work application
router.route("/").post(workWithUsForm); // `/api/form/workwithus/`

// Get all work applications
router.route("/all").get(getAllWorkers); // `/api/form/workwithus/all`

// Approve a worker by moving their details to a new collection
router.route("/approve/:id").put(approveWorker); // `/api/form/workwithus/approve/:id`

module.exports = router;
