// src/controllers/auth.controller.js
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { TOKEN_SECRET } from "../config.js";
import { createAccessToken } from "../libs/jwt.js";

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 днів
};

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

// ⛔️ ПУБЛІЧНОГО register більше не робимо тут
// створення користувача переносимо в users.controller + users.routes

export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: ["The email does not exist"] });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(400).json({ message: ["The password is incorrect"] });

    const token = await createAccessToken({
      id: user._id,
      username: user.username,
      role: user.role,
    });

    res.cookie("token", token, cookieOptions);

    return res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.send(false);

    jwt.verify(token, TOKEN_SECRET, async (error, payload) => {
      if (error) return res.sendStatus(401);

      const user = await User.findById(payload.id);
      if (!user) return res.sendStatus(401);

      return res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      });
    });
  } catch (error) {
    console.error("verifyToken error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("token", "", { ...cookieOptions, expires: new Date(0) });
    return res.sendStatus(200);
  } catch (error) {
    console.error("logout error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
