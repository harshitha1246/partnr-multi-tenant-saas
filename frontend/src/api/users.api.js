// src/api/users.api.js
import api from "./auth.api"; // axios instance with JWT interceptor

// GET all users of the tenant
export const getUsers = async (tenantId) => {
  if (!tenantId) throw new Error("Tenant ID is missing");
  const response = await api.get(`/tenants/${tenantId}/users`);
  return response.data.data.users || []; // match backend response
};

// CREATE new user for tenant
export const createUser = async (tenantId, payload) => {
  if (!tenantId) throw new Error("Tenant ID is missing");
  const response = await api.post(`/tenants/${tenantId}/users`, payload);
  return response.data;
};

// UPDATE existing user
export const updateUser = async (userId, payload) => {
  const response = await api.put(`/users/${userId}`, payload);
  return response.data;
};

// DELETE user
export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};
