import axios from "axios";
import { getToken, logout } from "../utils/auth";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

/* -------------------- Request Interceptor -------------------- */

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Tell the backend which calendar day the user is currently in.
    // This keeps calorie tracking and meal history timezone-aware.
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      if (timezone) {
        config.headers["X-Timezone"] = timezone;
      }
    } catch (error) {
      console.warn("Unable to resolve browser timezone:", error);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* -------------------- Response Interceptor -------------------- */

api.interceptors.response.use(
  (response) => response,

  (error) => {
    console.error(
      "API error:",
      error.response?.data || error.message
    );

    if (error.response?.status === 401) {
      logout();
    }

    return Promise.reject(error);
  }
);

export default api;