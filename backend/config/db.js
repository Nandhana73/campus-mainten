import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/campusmaintenance");

    console.log("MongoDB Connected");
  } catch (error) {
    console.log("Database connection error:", error);
  }
};

export default connectDB;