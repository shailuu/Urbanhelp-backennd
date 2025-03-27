const WorkWithUs = require("../models/workwithus-model");

const workWithUsForm = async (req, res) => {
    try {
        await WorkWithUs.create(req.body);
        return res.status(200).json({ message: "Application submitted successfully" });
    } catch (error) {
        console.error("Error in workWithUsForm:", error);
        return res.status(500).json({ message: "Application submission failed" });
    }
};

// New function to get all workers
const getAllWorkers = async (req, res) => {
    try {
        const workers = await WorkWithUs.find(); // Fetch all documents
        return res.status(200).json(workers);
    } catch (error) {
        console.error("Error fetching workers:", error);
        return res.status(500).json({ message: "Failed to fetch workers" });
    }
};

module.exports = { workWithUsForm, getAllWorkers };
