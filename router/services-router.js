const express = require("express");
const router = express.Router();
const parser = require('../middlewares/upload');
const serviceController = require("../controllers/services-controller");

router.get("/", serviceController.getAllServices);
router.get("/:id", serviceController.getServiceById);
router.post("/", parser.single('image'), serviceController.addService);
router.put("/:id", parser.single('image'), serviceController.updateService);
router.delete("/:id", serviceController.deleteService);


module.exports = router;