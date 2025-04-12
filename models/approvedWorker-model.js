const { Schema, model } = require("mongoose");

const approvedWorkerSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    service: { type: String, required: true },
    skills: { type: String, required: true },
    experience: { type: String, required: true },
    approvedAt: { type: Date, default: Date.now }
}, { collection: "approvedworkers" });

const ApprovedWorker = model("ApprovedWorker", approvedWorkerSchema);
module.exports = ApprovedWorker;
