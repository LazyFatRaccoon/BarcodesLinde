import { Router } from "express";
import Asset from "../models/asset.model.js";
import Event from "../models/event.model.js"; // переконайся, що файл існує!
import { authRequired, requireRole } from "../middlewares/auth.middleware.js";

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

router.get(
  "/",
  authRequired,
  requireRole("admin", "manager"),
  async (req, res) => {
    const { type, page = 1, limit = 20, q } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (q) {
      filter.$or = [
        { barcode: new RegExp(q, "i") },
        { cylinder_no: new RegExp(q, "i") },
        { owner: new RegExp(q, "i") },
        { location: new RegExp(q, "i") },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Asset.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Asset.countDocuments(filter),
    ]);
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  }
);

// GET /api/assets/:id/events
router.get(
  "/:id/events",
  authRequired,
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const list = await Event.find({ asset_id: req.params.id }).sort({
        createdAt: -1,
      });
      res.json(list);
    } catch (e) {
      next(e);
    }
  }
);

export default router;
