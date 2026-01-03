// src/api/tasks.api.js
import api from "./auth.api";

/* =========================
   GET ALL TASKS
   Optional params: { assignedTo: userId, projectId, status }
========================= */
export const getTasks = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = query ? `/tasks?${query}` : "/tasks";
  const response = await api.get(url);
  return response.data;
};

/* =========================
   GET TASK BY ID
========================= */
export const getTaskById = async (id) => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

/* =========================
   GET TASKS BY PROJECT
   GET /api/projects/:projectId/tasks
========================= */
export const getTasksByProject = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/tasks`);
  return response.data;
};

/* =========================
   CREATE TASK
   POST /api/projects/:projectId/tasks
========================= */
export const createTask = async (projectId, payload) => {
  const response = await api.post(`/projects/${projectId}/tasks`, payload);
  return response.data;
};

/* =========================
   UPDATE TASK
   PUT /api/tasks/:id
========================= */
export const updateTask = async (taskId, payload) => {
  const response = await api.put(`/tasks/${taskId}`, payload);
  return response.data;
};

/* =========================
   UPDATE TASK STATUS ONLY
   PATCH /api/tasks/:id/status
========================= */
export const updateTaskStatus = async (taskId, status) => {
  const response = await api.patch(`/tasks/${taskId}/status`, { status });
  return response.data;
};

/* =========================
   DELETE TASK
   DELETE /api/tasks/:id
========================= */
export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};
