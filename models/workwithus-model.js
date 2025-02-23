const { Schema, model } = require("mongoose");

const workWithUsSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    service: { type: String, required: true }, // The selected service
    skills: { type: String, required: true },
    experience: { type: String, required: true },
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

const WorkWithUs = model("WorkWithUs", workWithUsSchema);
module.exports = WorkWithUs;
