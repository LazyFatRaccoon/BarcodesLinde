// controllers/password.controller.js
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import PasswordReset from "../models/passwordReset.model.js";
import { sendInviteEmail } from "../utils/mailer.js"; // або окремий шаблон sendResetEmail

const normalizeEmail = (s) =>
  String(s || "")
    .trim()
    .toLowerCase();

export const requestReset = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email });
    // не розкриваємо існування акаунту
    if (!user) return res.sendStatus(200);

    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 хв

    await PasswordReset.create({ userId: user._id, token, expiresAt });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendInviteEmail(user.email, {
      username: user.username,
      tempPassword: "(натисніть лінк для зміни пароля)",
      loginUrl: resetUrl,
    });

    return res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};

export const confirmReset = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword || newPassword.length < 6)
      return res.status(400).json({ message: "Invalid token or password" });

    const rec = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });
    if (!rec)
      return res.status(400).json({ message: "Token invalid or expired" });

    const user = await User.findById(rec.userId);
    if (!user) return res.status(400).json({ message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await user.save();

    rec.used = true;
    await rec.save();

    return res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};
