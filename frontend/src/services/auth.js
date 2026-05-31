import api from "./api";

const authService = {
  // Sign up new user
  signup: async (userData) => {
    return api.post("/auth/sign-up", userData);
  },

  // Login user
  login: async (credentials) => {
    return api.post("/auth/log-in", credentials);
  },

  // Logout user
  logout: async () => {
    try {
      await api.post("/auth/sign-out");
    } catch (error) {
      console.error("Logout error:", error);
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
  isAuthenticated: async () => {
    try {
      const response = await api.get("/users/me");
      return !!response.success;
    } catch (error) {
      return false;
    }
  },

  // Get user from cookie-backed session
  getUser: async () => {
    const response = await api.get("/users/me");
    return response.data?.user || null;
  },
};

export default authService;
