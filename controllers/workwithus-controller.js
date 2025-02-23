const WorkWithUs = require("../models/workwithus-model");

const workWithUsForm = async (req, res) => {
    try {
        await WorkWithUs.create(req.body);  // Directly use req.body if it's structured correctly

        return res.status(200).json({ message: "Application submitted successfully" });
    } catch (error) {
        console.error("Error in workWithUsForm:", error); // Log the error for debugging

        return res.status(500).json({ message: "Application submission failed" });
    }
};

module.exports = workWithUsForm;
