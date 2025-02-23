const Contact = require("../models/contact-model");

const contactForm = async (req, res) => {
    try {
        await Contact.create(req.body);  // Directly use req.body if it's structured correctly

        return res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error("Error in contactForm:", error); // Log the error for debugging

        return res.status(500).json({ message: "Message not delivered" });
    }
};

module.exports = contactForm;
