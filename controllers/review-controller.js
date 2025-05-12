const Review = require("../models/reviews");
const User = require("../models/user-models");

// Fetch all reviews for a specific service
const getReviews = async (req, res) => {
    const { id } = req.params;

    try {
        const reviews = await Review.find({ serviceId: id })
            .populate("userId", "username")
            .sort({ createdAt: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch reviews." });
    }
};

// Submit a new review for a specific service
const createReview = async (req, res) => {
    const { id } = req.params; // serviceId
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || !comment) {
        return res.status(400).json({ message: "Rating and comment are required." });
    }

    try {
        // 🔍 Check if user has already reviewed this service
        const existingReview = await Review.findOne({ serviceId: id, userId });

        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this service." });
        }

        // 📝 Create new review
        const newReview = new Review({
            serviceId: id,
            userId,
            rating,
            comment,
        });

        const savedReview = await newReview.save();

        res.status(201).json(savedReview);

    } catch (error) {
        // 💥 Handle MongoDB duplicate key error (in case of race condition)
        if (error.code === 11000) {
            return res.status(400).json({ message: "You have already reviewed this service." });
        }

        console.error(error);
        res.status(500).json({ message: "Failed to submit review." });
    }
};

// ✅ Add this function:
const checkUserReview = async (req, res) => {
    const { id } = req.params; // serviceId
    const userId = req.user.id;

    try {
        const existingReview = await Review.findOne({ serviceId: id, userId });
        res.json({ hasReviewed: !!existingReview });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { getReviews, createReview, checkUserReview };
