import { Router } from "express";
import crypto from "crypto";
const router = Router();

router.post("/reserve", (req, res) => {
  // приклад генерації, далі краще зберігати в БД унікальність
  const code = "CYL-" + crypto.randomInt(1e8).toString().padStart(8, "0");
  res.json({ code });
});

export default router;
