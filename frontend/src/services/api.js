// API backbone
import axios from "axios";

// 1. Set your backend URL
const API_URL = "http://localhost:5050/api/v-1";

// 2. Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 3. INTERCEPTOR: Automatically add JWT token to every request
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (where we'll store it after login)
    const token = localStorage.getItem("token");

    // If token exists, add it to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 4. INTERCEPTOR: Handle responses and errors
api.interceptors.response.use(
  (response) => {
    // If request successful, return only the data part
    return response.data;
  },
  (error) => {
    // If token expired (401 error), redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("token"); // Remove expired token
      localStorage.removeItem("user"); // Remove user data
      window.location.href = "/login"; // Redirect to login page
    }

    // Return error message for display
    return Promise.reject(error.response?.data || error.message);
  },
);

// 5. Export the configured api instance
export default api;
