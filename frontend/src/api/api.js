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

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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