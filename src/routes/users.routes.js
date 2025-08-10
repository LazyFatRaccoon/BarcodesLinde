// src/routes/users.routes.js
import { Router } from "express";
import { authRequired, requireRole } from "../middlewares/auth.middleware.js";
import {
  createUserByAdmin,
  changePassword,
} from "../controllers/users.controller.js";

const router = Router();

// лише admin може створювати користувачів
router.post("/", authRequired, requireRole("admin"), createUserByAdmin);

// зміна пароля поточним користувачем
router.post("/change-password", authRequired, changePassword);

export default router;
