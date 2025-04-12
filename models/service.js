const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
            required: true,
        },
        additionalDetails: {
            type: String,  // Optional field for extra service details
            trim: true,
        },
        durations: [
            {
                duration: {
                    type: String,
                    required: true,
                },
                charge: {
                    type: Number,
                    required: true,
                },
            },
        ],
    },
    { timestamps: true }
);

// Define the model
const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
