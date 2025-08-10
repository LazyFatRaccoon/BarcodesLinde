import mongoose from "mongoose";
import "dotenv/config";
import { MONGODB_URI } from "./config.js";

export const connectDB = async () => {
  try {
    console.log("mongo", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB is connected");
  } catch (error) {
    console.error(error);
  }
};
