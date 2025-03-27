const express = require("express");
const router = express.Router();
const { workWithUsForm, getAllWorkers } = require("../controllers/workwithus-controller.js");

router.route("/").post(workWithUsForm); // `/api/form/workwithus/`
router.route("/all").get(getAllWorkers); // `/api/form/workwithus/all`

module.exports = router;
