import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || "mongodb://localhost:27017/campusmaintenance";
    await mongoose.connect(connStr);

    console.log("MongoDB Connected");
  } catch (error) {
    console.log("Database connection error:", error);
  }
};

export default connectDB;