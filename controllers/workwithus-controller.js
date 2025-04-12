const WorkWithUs = require("../models/workwithus-model");
const ApprovedWorker = require("../models/approvedWorker-model");

// Define the function to handle the work application form
const workWithUsForm = async (req, res) => {
    try {
        await WorkWithUs.create(req.body);
        return res.status(200).json({ message: "Application submitted successfully" });
    } catch (error) {
        console.error("Error in workWithUsForm:", error);
        return res.status(500).json({ message: "Application submission failed" });
    }
};

// Define the function to get all workers
const getAllWorkers = async (req, res) => {
    try {
        const workers = await WorkWithUs.find();
        return res.status(200).json(workers);
    } catch (error) {
        console.error("Error fetching workers:", error);
        return res.status(500).json({ message: "Failed to fetch workers" });
    }
};

// Approve worker by moving data to a new collection
const approveWorker = async (req, res) => {
    try {
        const application = await WorkWithUs.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Save to approved workers collection
        const approved = new ApprovedWorker({
            name: application.name,
            email: application.email,
            phone: application.phone,
            service: application.service,
            skills: application.skills,
            experience: application.experience,
        });

        await approved.save();

        // Optionally update the application status
        application.status = "approved";
        await application.save();

        return res.status(201).json({ message: "Worker approved successfully" });
    } catch (error) {
        console.error("Error approving worker:", error);
        return res.status(500).json({ message: "Worker approval failed" });
    }
};

module.exports = {
    workWithUsForm,
    getAllWorkers,
    approveWorker
};
