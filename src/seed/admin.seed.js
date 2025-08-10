import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

export async function ensureDefaultAdmin() {
  const email = "vladimir.todorov.ukraine@gmail.com";
  const username = "Admin";
  const role = "admin";
  const plaintext = "q1234r";

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return;

  const password = await bcrypt.hash(plaintext, 10);
  await User.create({
    username,
    email,
    role,
    password,
    mustChangePassword: false, // можна true, якщо хочеш примусову зміну
  });

  console.log("[seed] default admin created:", email);
}
