import axios from "axios";

/**
 * Central API client for the Express backend.
 * Set VITE_API_URL in frontend/.env (example: http://localhost:5000)
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

// Attach JWT token automatically for admin endpoints
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gele_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});