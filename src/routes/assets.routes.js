import { Router } from "express";
import Asset from "../models/asset.model.js";
import Event from "../models/event.model.js";
import { authRequired } from "../middlewares/auth.middleware.js"; // твой guard

const router = Router();

router.get("/by-barcode/:code", authRequired, async (req, res) => {
  const asset = await Asset.findOne({ barcode: req.params.code });
  if (!asset) return res.status(404).json({ message: "Not found" });
  res.json(asset);
});

router.post("/", authRequired, async (req, res) => {
  const asset = await Asset.create(req.body);
  await Event.create({
    asset_id: asset._id,
    type: "CREATE",
    payload: req.body,
    user_id: req.user.id,
    location: asset.location,
  });
  res.json(asset);
});

router.put("/:id", authRequired, async (req, res) => {
  const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!asset) return res.status(404).json({ message: "Not found" });
  await Event.create({
    asset_id: asset._id,
    type: "UPDATE",
    payload: req.body,
    user_id: req.user.id,
    location: asset.location,
  });
  res.json(asset);
});

router.get("/:id/history", authRequired, async (req, res) => {
  const events = await Event.find({ asset_id: req.params.id }).sort({
    createdAt: -1,
  });
  res.json(events);
});

export default router;
