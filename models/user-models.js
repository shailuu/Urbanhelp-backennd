const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    dob: { type: Date }, // Optional
    gender: { type: String, enum: ["Male", "Female", "Other"] }, // Optional
    city: { type: String }, // Optional
    phoneNumber: { type: String }, // Optional
    address: { type: String }, // Optional
});
// Hash password before saving
userSchema.pre("save", async function (next) {
    const user = this;

    if (!user.isModified("password")) {
        return next();
    }

    try {
        const saltRound = await bcrypt.genSalt(10);
        const hash_password = await bcrypt.hash(user.password, saltRound);
        user.password = hash_password;
        next();
    } catch (error) {
        next(error);
    }
});

// Generate JWT token
userSchema.methods.generateToken = async function () {
    try {
        return jwt.sign(
            {
                userID: this._id.toString(),
                email: this.email,
                isAdmin: this.isAdmin,
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "70d" }
        );
    } catch (error) {
        console.log(error);
    }
};

// Define the model
const User = mongoose.model("User", userSchema);

module.exports = User;