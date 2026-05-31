// API backbone
import axios from "axios";

// 1. Set your backend URL
const API_URL = "http://localhost:5050/api/v-1";

// 2. Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 3. INTERCEPTOR: Handle responses and errors
api.interceptors.response.use(
  (response) => {
    // If request successful, return only the data part
    return response.data;
  },
  (error) => {
    const isSessionCheck = error.config?.url === "/users/me";
    const isAlreadyOnAuthPage = ["/login", "/signup"].includes(
      window.location.pathname,
    );

    if (
      error.response?.status === 401 &&
      !isSessionCheck &&
      !isAlreadyOnAuthPage
    ) {
      window.location.href = "/login";
    }

    // Return error message for display
    return Promise.reject(error.response?.data || error.message);
  },
);

// 5. Export the configured api instance
export default api;
