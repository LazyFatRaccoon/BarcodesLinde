// src/controllers/auth.controller.js
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { TOKEN_SECRET, FRONTEND_URL } from "../config.js";
import { createAccessToken } from "../libs/jwt.js";

const isProd = process.env.NODE_ENV === "production";

/**
 * Опції для cookie з токеном:
 * - у dev: sameSite:'lax', secure:false — щоб працювало на http://localhost
 * - у prod: sameSite:'none', secure:true — щоб працювало на HTTPS (Render/Vercel)
 */
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  // за бажанням можна додати термін дії access-куки:
  // maxAge: 1000 * 60 * 60 * 24 * 7, // 7 днів
};

/** Нормалізація email (щоб уникнути дублів з різним регістром) */
const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

export const register = async (req, res) => {
  try {
    const username = (req.body.username || "").trim();
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!username || !email || !password) {
      return res.status(400).json({ message: ["Missing required fields"] });
    }

    const userFound = await User.findOne({ email });
    if (userFound) {
      return res.status(400).json({ message: ["The email is already in use"] });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userSaved = await new User({
      username,
      email,
      password: passwordHash,
    }).save();

    const token = await createAccessToken({ id: userSaved._id, username });

    res.cookie("token", token, cookieOptions);

    return res.json({
      id: userSaved._id,
      username: userSaved.username,
      email: userSaved.email,
    });
  } catch (error) {
    console.error("register error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    const userFound = await User.findOne({ email });
    if (!userFound) {
      return res.status(400).json({ message: ["The email does not exist"] });
    }

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      return res.status(400).json({ message: ["The password is incorrect"] });
    }

    const token = await createAccessToken({
      id: userFound._id,
      username: userFound.username,
    });

    res.cookie("token", token, cookieOptions);

    return res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
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

      const userFound = await User.findById(payload.id);
      if (!userFound) return res.sendStatus(401);

      return res.json({
        id: userFound._id,
        username: userFound.username,
        email: userFound.email,
      });
    });
  } catch (error) {
    console.error("verifyToken error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      ...cookieOptions,
      expires: new Date(0),
    });
    return res.sendStatus(200);
  } catch (error) {
    console.error("logout error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
