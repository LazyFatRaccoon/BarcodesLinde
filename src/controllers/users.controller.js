// src/controllers/users.controller.js
import bcrypt from "bcryptjs";
import User, { ROLES } from "../models/user.model.js";

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

export const createUserByAdmin = async (req, res, next) => {
  try {
    const { username, email, role } = req.body;
    if (!username || !email || !role || !ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid data" });
    }
    const normEmail = normalizeEmail(email);
    const exists = await User.findOne({ email: normEmail });
    if (exists) return res.status(409).json({ message: "Email already used" });

    const tempPassword = Math.random().toString(36).slice(-10);
    const hash = await bcrypt.hash(tempPassword, 10);

    const user = await User.create({
      username: username.trim(),
      email: normEmail,
      role,
      password: hash,
      mustChangePassword: true,
    });

    // відправляємо лист
    const loginUrl = `${req.protocol}://${req.get("host")}/login`;
    try {
      await sendInviteEmail(user.email, {
        username: user.username,
        tempPassword,
        loginUrl,
      });
    } catch (mailErr) {
      console.error("invite email error:", mailErr);
      // не валимо створення юзера через збій пошти
    }

    return res.status(201).json({
      id: user._id,
      email: user.email,
      role: user.role,
      tempPassword, // у проді краще НЕ повертати це в JSON, а слати поштою
    });
  } catch (e) {
    next(e);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body || {};
    if (!newPassword)
      return res.status(400).json({ message: "New password required" });

    const user = await User.findById(req.user.id);
    if (!user) return res.sendStatus(401);

    if (user.mustChangePassword) {
      // перший вхід: oldPassword можна не вимагати, якщо йдемо за magic-link
      if (oldPassword) {
        const ok = await bcrypt.compare(oldPassword, user.password);
        if (!ok) return res.status(400).json({ message: "Old password wrong" });
      }
    } else {
      // звичайна зміна пароля — вимагаємо oldPassword
      const ok = await bcrypt.compare(oldPassword || "", user.password);
      if (!ok) return res.status(400).json({ message: "Old password wrong" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await user.save();

    return res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};
