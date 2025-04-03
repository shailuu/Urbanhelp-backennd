const Contact = require("../models/contact-model");

const contactForm = async (req, res) => {
    try {
        console.log("Request Body:", req.body); // Log the incoming data

        // Create a new contact entry
        const newContact = await Contact.create(req.body);

        console.log("New Contact Created:", newContact); // Log the created document

        return res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error("Error in contactForm:", error); // Log the error for debugging

        return res.status(500).json({ message: "Message not delivered" });
    }
};

module.exports = contactForm;