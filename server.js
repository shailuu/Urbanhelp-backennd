require("dotenv").config();
const express = require("express");
const app = express();
const authRoute = require("./router/auth-router");
const contactRoute = require("./router/contact-router");
const workwithusRoute = require("./router/workwithus-router"); 
const connectDB = require("./utils/db");
const errorMiddleware = require("./middlewares/error-middleware");

app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/form", contactRoute);
app.use("/api/form", workwithusRoute); // 
app.use(errorMiddleware);
// app.get("/", (req, res) => {
//     res.status(200).send("Welcome to UrbanHelp");
// });

// app.get("/register", (req, res) => {
//         res.status(200).send("Welcome to Sign Up");
    
// });
const PORT = 5001;

connectDB().then(() => {
app.listen(PORT, () => {
    console.log("server is running at port: ${PORT}");
});
});