import api from "./api";

const authService = {
  // Sign up new user
  signup: async (userData) => {
    const response = await api.post("/auth/sign-up", userData);

    if (response.token) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post("/auth/log-in", credentials);

    if (response.token) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  },

  // Logout user
  logout: async () => {
    try {
      await api.post("/auth/sign-out");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response;
  },

  // Verify reset token
  verifyResetToken: async (token) => {
    const response = await api.get(`/auth/reset-password/${token}`);
    return response;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post(`/auth/reset-password/${token}`, {
      password: newPassword,
    });
    return response;
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Get user from localStorage
  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem("token");
  },
};

export default authService;
