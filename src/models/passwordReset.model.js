import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    token: { type: String, unique: true, index: true },
    expiresAt: { type: Date, index: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("PasswordReset", schema);
