import { Router } from "express";
import Asset from "../models/asset.model.js";
import Event from "../models/event.model.js"; // переконайся, що файл існує!
import { authRequired } from "../middlewares/auth.middleware.js";

const router = Router();

// GET /api/assets/by-barcode/:code
router.get("/by-barcode/:code", authRequired, async (req, res, next) => {
  try {
    const asset = await Asset.findOne({ barcode: req.params.code });
    if (!asset) return res.status(404).json({ message: "Not found" });
    res.json(asset);
  } catch (e) {
    next(e);
  }
});

// POST /api/assets
router.post("/", authRequired, async (req, res, next) => {
  try {
    const { barcode, type } = req.body || {};
    if (!barcode || !type) {
      return res.status(400).json({ message: "barcode and type are required" });
    }
    const exists = await Asset.findOne({ barcode });
    if (exists) {
      return res
        .status(409)
        .json({ message: "Asset with this barcode already exists" });
    }

    const asset = await Asset.create(req.body);

    // події не повинні валити запит — якщо щось піде не так, просто злогуй
    try {
      await Event.create({
        asset_id: asset._id,
        type: "CREATE",
        payload: req.body,
        user_id: req.user?.id || null,
        location: asset.location,
      });
    } catch (logErr) {
      console.error("Event.create error:", logErr);
    }

    res.status(201).json(asset);
  } catch (e) {
    // красивий меседж для дублікатів індексу Mongo
    if (e?.code === 11000) {
      return res.status(409).json({ message: "Duplicate barcode" });
    }
    next(e);
  }
});

// PUT /api/assets/:id
router.put("/:id", authRequired, async (req, res, next) => {
  try {
    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!asset) return res.status(404).json({ message: "Not found" });

    try {
      await Event.create({
        asset_id: asset._id,
        type: "UPDATE",
        payload: req.body,
        user_id: req.user?.id || null,
        location: asset.location,
      });
    } catch (logErr) {
      console.error("Event.create error:", logErr);
    }

    res.json(asset);
  } catch (e) {
    next(e);
  }
});

// GET /api/assets/:id/history
router.get("/:id/history", authRequired, async (req, res, next) => {
  try {
    const events = await Event.find({ asset_id: req.params.id }).sort({
      createdAt: -1,
    });
    res.json(events);
  } catch (e) {
    next(e);
  }
});

export default router;
