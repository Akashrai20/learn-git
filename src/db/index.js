import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅mongoDB connect");
        console.log("MongoDB connection pakka ho gya");
        console.log("MongoDB connection hona hi chahiye");
    } catch (error) {
        console.error("❌MongoDB connection error", error);
        process.exit(1);
    }
};

export default connectDB;
