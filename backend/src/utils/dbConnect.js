import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoURI = process.env.MONGODB_URI;
export const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};
