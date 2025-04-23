const Service = require("../models/service");

// Get a specific service by ID
exports.getServiceById = async (req, res) => {
    const { id } = req.params;

    try {
        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json(service);
    } catch (error) {
        res.status(500).json({ message: "Error fetching service", error });
    }
};

// Get all services
exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: "Error fetching services", error });
    }
};

// Add a new service
exports.addService = async (req, res) => {
    const { title, description } = req.body;

    try {
        // Extract the image URL from the uploaded file
        const image = req.file ? req.file.path : null;
        if (!image) {
            return res.status(400).json({ message: "Image is required" });
        }

        const newService = new Service({ title, description, image });
        await newService.save();

        res.status(201).json({ message: "Service added successfully", service: newService });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error adding service", error: error.message });
    }
};

// Update a service by ID
exports.updateService = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    try {
        // Check if a new file is uploaded
        const image = req.file ? req.file.path : undefined;

        // Prepare the update object
        const updateData = {
            title,
            description,
            ...(image && { image }), // Only update the image if a new file is uploaded
        };

        const updatedService = await Service.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedService) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json({ message: "Service updated successfully", service: updatedService });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating service", error });
    }
};

// Delete a service by ID
exports.deleteService = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedService = await Service.findByIdAndDelete(id);

        if (!deletedService) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json({ message: "Service deleted successfully", service: deletedService });
    } catch (error) {
        res.status(500).json({ message: "Error deleting service", error });
    }
};