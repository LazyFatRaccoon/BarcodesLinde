import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import passwordRoutes from "./routes/password.routes.js";
import taksRoutes from "./routes/tasks.routes.js";
import assetRoutes from "./routes/assets.routes.js";
import barcodeRoutes from "./routes/barcodes.routes.js";

//import { FRONTEND_URL } from "./config.js";

const app = express();
app.set("trust proxy", 1);
const allowedOrigins = [
  process.env.FRONTEND_URL, // наприклад http://localhost:5173
  "http://localhost:5173",
  "https://barcodeslinde.onrender.com",
].filter(Boolean);

app.use(
  cors({
    credentials: true,
    origin: (origin, cb) => {
      // дозволяємо і запити без Origin (наприклад, з Postman)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// на всяк випадок preflight
app.options(
  "*",
  cors({
    credentials: true,
    origin: (origin, cb) =>
      !origin || allowedOrigins.includes(origin)
        ? cb(null, true)
        : cb(new Error("Not allowed by CORS")),
  })
);

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api/assets", assetRoutes);
app.use("/api/barcodes", barcodeRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", taksRoutes);
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Internal server error" });
});

if (process.env.NODE_ENV === "production") {
  const path = await import("path");
  app.use(express.static("client/dist"));

  app.get("*", (req, res) => {
    console.log(path.resolve("client", "dist", "index.html"));
    res.sendFile(path.resolve("client", "dist", "index.html"));
  });
}

export default app;
