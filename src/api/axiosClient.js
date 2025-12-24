// src/api/axiosClient.js

import axios from "axios";

// 1️⃣ Read the base URL from Vite environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// Check if env var is missing
if (!API_BASE_URL) {
  console.warn(
    "%c[AxiosClient] ⚠️ VITE_API_BASE_URL is undefined. Check your .env file and restart the dev server.",
    "color: orange;"
  );
}

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 2️⃣ Request Interceptor: Attach Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");


    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 3️⃣ Response Interceptor: Handle Global Errors (like 401)
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;

    console.error(
      "%c[AxiosClient] ❌ Error:",
      "color: red; font-weight: bold;",
      status,
      error.config?.url
    );

    if (status === 401) {
      console.error(
        "401 Unauthorized: Token expired. Clearing token and redirecting to /login."
      );
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
