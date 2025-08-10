import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    barcode: { type: String, unique: true, index: true, required: true },
    type: {
      type: String,
      enum: ["cylinder", "pallet", "bundle", "dewar"],
      required: true,
    },
    location: String,
    owner: String,
    // cylinder fields
    cylinder_no: String,
    cylinder_kind: String,
    is_filled: Boolean,
    product_code: String,
    tare_weight: Number,
    test_pressure: Number,
    work_pressure: Number,
    test_date: Date,
    next_test_date: Date,
  },
  { timestamps: true }
);

// 🔹 Додаємо, щоб на фронт йшло `id` замість `_id`
assetSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

export default mongoose.model("Asset", assetSchema);
