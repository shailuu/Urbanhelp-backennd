const express = require("express");
const router = express.Router();
const { getReviews, createReview } = require("../controllers/review-controller");
const { authMiddleware } = require("../middlewares/auth-middleware");

router.get("/services/:id/reviews", getReviews);
router.post("/services/:id/reviews", authMiddleware, createReview);

module.exports = router;