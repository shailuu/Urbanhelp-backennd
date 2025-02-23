const mongoose = require('mongoose');


const URI =process.env.MONGODB_URI;

//const URI = "mongodb://127.0.0.1:27017/Urban-Help";
const connectDB = async () => {
    try {
        await mongoose.connect(URI)
        console.log("connection successful to DB");
    } catch (error){
        console.error("DB connection failed", error);
        process.exit(0);
    }
};

module.exports =connectDB;