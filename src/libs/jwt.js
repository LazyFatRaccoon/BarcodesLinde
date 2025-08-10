// src/libs/jwt.js
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

export function createAccessToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload, // {id, username, role}
      TOKEN_SECRET,
      { expiresIn: "7d" },
      (err, token) => (err ? reject(err) : resolve(token))
    );
  });
}
