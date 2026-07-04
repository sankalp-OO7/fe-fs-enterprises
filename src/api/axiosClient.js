// src/api/axiosClient.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.warn(
    "%c[AxiosClient] ⚠️ VITE_API_BASE_URL is undefined. Check your .env file and restart the dev server.",
    "color: orange;"
  );
}

// Regular axios client for JSON requests
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Keep this for auth requests
});

// Separate client for file uploads (no withCredentials)
export const uploadClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // Important: set to false for uploads
  timeout: 60000, // 60 second timeout for uploads
});

// Request Interceptor for both clients
const addTokenInterceptor = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

axiosClient.interceptors.request.use(addTokenInterceptor);
uploadClient.interceptors.request.use(addTokenInterceptor);

// Response Interceptor for both clients
const handleResponseError = (error) => {
  const status = error.response?.status;
  
  console.error(
    "%c[AxiosClient] ❌ Error:",
    "color: red; font-weight: bold;",
    status,
    error.config?.url
  );

  if (status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.replace("/login");
  }

  return Promise.reject(error);
};

axiosClient.interceptors.response.use(
  (response) => response,
  handleResponseError
);

uploadClient.interceptors.response.use(
  (response) => response,
  handleResponseError
);

export default axiosClient;