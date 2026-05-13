import React, { useState, useEffect, useCallback } from "react";
import AuthContext from "./AuthContext.jsx";
import api from "../services/api.js";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setTokenState] = useState(() => {
    return localStorage.getItem("token");
  });

  const setToken = useCallback((newToken) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
    setTokenState(newToken);
  }, []);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await api.get("/auth/profile");

          if (response.success) {
            setUser(response.data);
          } else {
            setToken(null);
          }
        } catch (error) {
          console.error("Failed to load user:", error);
          setToken(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token, setToken]);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      if (response.success) {
        const authToken = response.token || response.data?.token;

        if (authToken) {
          setToken(authToken);
          setUser(response.data);
          return { success: true, data: response.data };
        }

        return { success: false, error: "No token received" };
      }

      return { success: false, error: response.message || "Login failed" };
    } catch (error) {
      return { success: false, error: error.message || "Login failed" };
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      const response = await api.post("/auth/signup", {
        name,
        email,
        password,
      });

      if (response.success) {
        const authToken = response.token || response.data?.token;

        if (authToken) {
          setToken(authToken);
          setUser(response.data);
          return { success: true, data: response.data };
        }

        return { success: false, error: "No token received" };
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
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, [setToken]);

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      const response = await api.put("/auth/profile", userData);

      if (response.success) {
        setUser(response.data);
        return { success: true, data: response.data };
      }

      return { success: false, error: response.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Get user function (refresh)
  const getUser = async () => {
    try {
      const response = await api.get("/auth/profile");

      if (response.success) {
        setUser(response.data);
        return { success: true, data: response.data };
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
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    getUser,
    isAuthenticated: !!token,
    isAdmin: user?.isAdmin || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
