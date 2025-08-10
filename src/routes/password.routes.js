// routes/password.routes.js
import { Router } from "express";
import {
  requestReset,
  confirmReset,
} from "../controllers/password.controller.js";

const router = Router();
router.post("/forgot", requestReset); // { email }
router.post("/reset", confirmReset); // { token, newPassword }
export default router;
