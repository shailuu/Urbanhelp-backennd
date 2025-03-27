require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const connectDB = require("./utils/db");
const errorMiddleware = require("./middlewares/error-middleware");

// Import routers
const authRoute = require("./router/auth-router");
const contactRoute = require("./router/contact-router");
const workwithusRoute = require("./router/workwithus-router");
const servicesRoute = require("./router/services-router");
const adminRoute = require("./router/admin-router");
const bookingRoute = require("./router/booking-router"); // Add the new booking router

// Middleware
app.use(cors({
    origin: "http://localhost:3000", // Replace with your frontend URL if needed
    methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoute);
app.use("/api/form", contactRoute);
app.use("/api/form/workwithus", workwithusRoute);
app.use("/api/services", servicesRoute);
app.use("/api/admin", adminRoute);
app.use("/api/bookings", bookingRoute); // Register the booking router

// Error handling middleware
app.use(errorMiddleware);

// Start server
const PORT = 5001;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running at port: ${PORT}`);
    });
});