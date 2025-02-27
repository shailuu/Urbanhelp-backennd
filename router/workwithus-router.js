const express = require("express");
const router = express.Router();
const workWithUsForm = require("../controllers/workwithus-controller.js");

router.route("/workwithus").post(workWithUsForm);

module.exports = router;
