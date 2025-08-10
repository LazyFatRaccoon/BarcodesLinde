const PROD_API =
  typeof window !== "undefined" ? `${window.location.origin}/api` : "/api";

export const API_URL =
  import.meta.env.VITE_API_URL || // якщо явно задано
  (import.meta.env.PROD ? PROD_API : "http://localhost:4000/api");
