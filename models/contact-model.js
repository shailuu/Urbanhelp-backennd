const { Schema, model } = require("mongoose");

const contactSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: false }, // Optional field
    subject: { type: String, required: true },
    message: { type: String, required: true },
}, { timestamps: true });
{ collection: "contacts" }
const Contact = model("Contact", contactSchema);
module.exports = Contact;