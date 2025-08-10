import mongoose from "mongoose";

const roles = ["depo", "receiving", "filling", "manager", "repair", "admin"];

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: roles, default: "manager" },
    mustChangePassword: { type: Boolean, default: false }, // для першого входу
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
export const ROLES = roles;
