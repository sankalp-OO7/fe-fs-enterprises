// src/api/axiosClient.js

import axios from "axios";

const axiosClient = axios.create();

// Set the base URL, which relies on your proxy configuration (e.g., in vite.config.js)
// If you don't use a proxy, change this to 'http://localhost:5000/api'
axiosClient.defaults.baseURL = "/api";
axiosClient.defaults.headers.post["Content-Type"] = "application/json";

// Request Interceptor to attach the token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // The backend auth middleware expects the token in the 'Authorization' header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to handle token expiry (e.g., 401 Unauthorized)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // This handles token expiry or invalid token automatically
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Force a page refresh or redirect to login (handled better in components)
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
