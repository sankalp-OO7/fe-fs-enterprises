// src/api/axiosClient.js

import axios from "axios";

// 1. DYNAMICALLY SET BASE URL USING VITE ENVIRONMENT VARIABLES
//    - Reads VITE_API_BASE_URL (e.g., 'http://localhost:5000/api' in dev,
//      or 'https://sfr1ge43pl.execute-api.us-east-1.amazonaws.com/dev' in prod)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosClient = axios.create({
  // Set the base URL dynamically based on the environment
  baseURL: API_BASE_URL,
  // Add common headers for all requests
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // IMPORTANT: If your backend uses cookies/sessions
});

// 2. Request Interceptor: Attach Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor: Handle Global Errors (like 401 Unauthorized)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for 401 Unauthorized status (token expired/invalid)
    if (error.response?.status === 401) {
      console.error(
        "401 Unauthorized: Token expired. Clearing token and forcing redirect."
      );

      // Clear token and user data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Force a redirect to the login page to fully reset app state
      // Assuming your login route is '/login'
      window.location.replace("/login");
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
