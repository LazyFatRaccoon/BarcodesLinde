import axios from "./axios";

export const forgotPasswordRequest = (email) =>
  axios.post("/password/forgot", { email });

export const resetPasswordRequest = (token, newPassword) =>
  axios.post("/password/reset", { token, newPassword });
