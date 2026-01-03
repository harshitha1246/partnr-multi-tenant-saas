// src/api/auth.api.js
import axios from "axios";

/**
 * Axios instance
 * Make sure the baseURL points to your backend
 */
const api = axios.create({
  baseURL: "http://localhost:5000/api", // backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================
// JWT Interceptor
// =========================
// Automatically attach token to all requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Token stored after login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =========================
// REGISTER TENANT
// =========================
export const registerTenant = async (payload) => {
  // Payload keys must match backend exactly
  // tenantName, subdomain, adminEmail, adminFullName, adminPassword
  const response = await api.post("/auth/register-tenant", payload);
  return response.data;
};

// =========================
// LOGIN
// =========================
export const login = async (payload) => {
  // Payload keys: email, password, tenantSubdomain (optional)
  const response = await api.post("/auth/login", payload);
  return response.data;
};

// =========================
// GET CURRENT USER
// =========================
export const getCurrentUser = async () => {
  // No need to pass token manually, interceptor handles it
  const response = await api.get("/auth/me");
  return response.data;
};

// =========================
// LOGOUT
// =========================
export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export default api;
