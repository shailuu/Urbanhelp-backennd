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
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || !comment) {
        return res.status(400).json({ message: "Rating and comment are required." });
    }

    try {
        const newReview = new Review({
            serviceId: id,
            userId: userId,
            rating: rating,
            comment: comment,
        });

        const savedReview = await newReview.save();

        res.status(201).json(savedReview);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to submit review." });
    }
};

// Export only the controller functions
module.exports = { getReviews, createReview };