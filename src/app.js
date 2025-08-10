import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import taksRoutes from "./routes/tasks.routes.js";
import assetRoutes from "./routes/assets.routes.js";
import barcodeRoutes from "./routes/barcodes.routes.js";

import { FRONTEND_URL } from "./config.js";

const app = express();
app.set("trust proxy", 1);
app.use(
  cors({
    credentials: true,
    origin: FRONTEND_URL,
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api/assets", assetRoutes);
app.use("/api/barcodes", barcodeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", taksRoutes);
app.get("/api/health", (req, res) => res.json({ ok: true }));

if (process.env.NODE_ENV === "production") {
  const path = await import("path");
  app.use(express.static("client/dist"));

  app.get("*", (req, res) => {
    console.log(path.resolve("client", "dist", "index.html"));
    res.sendFile(path.resolve("client", "dist", "index.html"));
  });
}

export default app;
