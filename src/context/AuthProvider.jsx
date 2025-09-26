// src/context/AuthProvider.jsx (REVISED)

import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null); // <--- ADDED TOKEN STATE
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data on initial mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    // Note: Token is handled in the custom Axios client (see step A)
    setLoading(false);
  }, []);

  // Update token and user state and localStorage after successful login
  const login = (userData, jwtToken) => {
    // <--- MODIFIED TO ACCEPT TOKEN
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // <--- CLEAR TOKEN
  };

  const value = {
    user,
    token, // <--- EXPOSE TOKEN (for manual checks if needed)
    loading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    isAdmin: () => user?.role === "admin",
  };

  if (loading) return <div>Loading...</div>;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
