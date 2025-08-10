import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    asset_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      index: true,
    },
    type: { type: String, required: true }, // CREATE, UPDATE, REFILL, MOVE, ...
    payload: Object,
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    location: String,
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
