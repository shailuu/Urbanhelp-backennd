require("dotenv").config();
const express = require("express");
const cors = require("cors"); // Import CORS
const app = express();
const authRoute = require("./router/auth-router");
const contactRoute = require("./router/contact-router");
const workwithusRoute = require("./router/workwithus-router");
const servicesRoute = require("./router/services-router"); // Import the new services router
const connectDB = require("./utils/db");
const errorMiddleware = require("./middlewares/error-middleware");

// Enable CORS for all origins (or specify one domain)
app.use(cors({
    origin: "http://localhost:3000", // Replace with your frontend URL if needed
    methods: ["GET", "POST", "PUT", "DELETE"], // Optional: define methods you want to allow
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoute);
app.use("/api/form", contactRoute);
app.use("/api/form", workwithusRoute);
app.use("/api/services", servicesRoute); // Add the services route

app.use(errorMiddleware);

const PORT = 5001;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running at port: ${PORT}`);
    });
});