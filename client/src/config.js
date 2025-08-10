// client/src/config.js
const PROD_API =
  typeof window !== "undefined" ? `${window.location.origin}/api` : "/api";

export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? PROD_API : "http://localhost:4000/api");

// разово перевіримо в консолі
if (typeof window !== "undefined") {
  console.log("[API_URL]", API_URL);
}
