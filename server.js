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
const bookingRoute = require("./router/booking-router");
const adminRoute = require("./router/admin-router");

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoute);
app.use("/api/form", contactRoute);
app.use("/api/form/workwithus", workwithusRoute);
app.use("/api/services", servicesRoute);
app.use("/api/admin", adminRoute);
app.use("/api/bookings", bookingRoute);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 5001;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running at port: ${PORT}`);
    });
});