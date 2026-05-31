import React, { useState, useEffect, useCallback } from "react";
import AuthContext from "./AuthContext.jsx";
import api from "../services/api.js";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await api.get("/users/me");

        if (response.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/log-in", { email, password });

      if (response.success) {
        const userData = response.data?.user;
        setUser(userData);
        return { success: true, data: userData };
      }

      return { success: false, error: response.message || "Login failed" };
    } catch (error) {
      return { success: false, error: error.message || "Login failed" };
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      const response = await api.post("/auth/sign-up", {
        name,
        email,
        password,
      });

      if (response.success) {
        const userData = response.data?.user;
        setUser(userData);
        return { success: true, data: userData };
      }

      return {
        success: false,
        error: response.message || "Registration failed",
      };
    } catch (error) {
      return { success: false, error: error.message || "Registration failed" };
    }
  };

  // Logout function
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/sign-out");
    } catch (error) {
      console.error("Logout error:", error);
    }

    setUser(null);
  }, []);

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      const response = await api.patch("/users/me", userData);

      if (response.success) {
        const updatedUser = response.data?.user;
        setUser(updatedUser);
        return { success: true, data: updatedUser };
      }

      return { success: false, error: response.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Get user function (refresh)
  const getUser = async () => {
    try {
      const response = await api.get("/users/me");

      if (response.success) {
        const userData = response.data?.user;
        setUser(userData);
        return { success: true, data: userData };
      }

      return { success: false };
    } catch (error) {
      // Fix ESLint warning by using the error variable
      console.error("Get user error:", error);
      return { success: false };
    }
  };

  // Context value
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    getUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
