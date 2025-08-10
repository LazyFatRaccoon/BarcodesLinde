import mongoose from "mongoose";
import "dotenv/config";

export const connectDB = async () => {
  try {
    console.log("mongo", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB is connected");
  } catch (error) {
    console.error(error);
  }
};
