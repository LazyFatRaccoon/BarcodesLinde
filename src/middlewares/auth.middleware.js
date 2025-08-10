import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

export const authRequired = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const payload = jwt.verify(token, TOKEN_SECRET);
    req.user = payload; // {id, username, role}
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const requireRole =
  (...allowed) =>
  (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role))
      return res.status(403).json({ message: "Forbidden" });
    next();
  };
// Додаємо друге ім'я для сумісності зі старими імпортами
export const auth = authRequired;
