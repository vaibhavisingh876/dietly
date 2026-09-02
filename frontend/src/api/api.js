import axios from "axios";
import { getToken, logout } from "../utils/auth";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT + the browser's IANA timezone to every request. The backend
// uses X-Timezone to resolve "today" per user (see backend/utils/dateUtils.js)
// instead of the server's UTC clock, so calorie/meal/progress dates line up
// with what the user actually sees on their device.
api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) {
      config.headers["X-Timezone"] = timezone;
    }
  } catch {
    // Intl not available / unsupported timezone — backend falls back to a default.
  }

  return config;
});

// Handle authentication errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "API error:",
      error.response?.data || error.message
    );

    if (error.response?.status === 401) {
      logout(); // clears both storages and redirects to /login
    }

    return Promise.reject(error);
  }
);

export default api;