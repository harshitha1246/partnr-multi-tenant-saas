// src/api/projects.api.js
import api from "./auth.api"; // reusing axios instance

/* =========================
   GET ALL PROJECTS
   GET /api/projects
========================= */
export const getProjects = async (params = {}) => {
  const response = await api.get("/projects", { params });
  // adapt to your backend response structure
  // if backend sends { success, data }:
  return response.data.data || [];
};

/* =========================
   GET PROJECT BY ID
   GET /api/projects/:id
========================= */
export const getProjectById = async (id) => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

/* =========================
   CREATE PROJECT
   POST /api/projects
========================= */
export const createProject = async (payload) => {
  // payload example:
  // {
  //   name: "Website Redesign",
  //   description: "Redesign company website",
  //   status: "active"
  // }
  const response = await api.post("/projects", payload);
  return response.data;
};

/* =========================
   UPDATE PROJECT
   PUT /api/projects/:id
========================= */
export const updateProject = async (id, payload) => {
  const response = await api.put(`/projects/${id}`, payload);
  return response.data;
};

/* =========================
   DELETE PROJECT
   DELETE /api/projects/:id
========================= */
export const deleteProject = async (id) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};

