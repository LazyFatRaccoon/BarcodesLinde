// src/routes/auth.routes.js
import { Router } from "express";
import { login, logout, verifyToken } from "../controllers/auth.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { loginSchema } from "../schemas/auth.schema.js";

const router = Router();

router.post("/login", validateSchema(loginSchema), login);
router.get("/verify", verifyToken);
router.post("/logout", verifyToken, logout); // або можна без verify, як забажаєш

export default router;
