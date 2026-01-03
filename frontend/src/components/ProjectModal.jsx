// src/components/ProjectModal.jsx

import { useState, useEffect } from "react";
import { createProject, updateProject } from "../api/projects.api";
import "./Modal.css";

export default function ProjectModal({ editProject = null, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load project data if editing
  useEffect(() => {
    if (editProject) {
      setForm({
        name: editProject.name || "",
        description: editProject.description || "",
        status: editProject.status || "active",
      });
    } else {
      setForm({ name: "", description: "", status: "active" });
    }
  }, [editProject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Client-side validation
  const validateForm = () => {
    if (!form.name.trim()) return "Project name is required";
    if (!form.status) return "Status is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      if (editProject) {
        await updateProject(editProject.id, form);
      } else {
        await createProject(form);
      }
      onSave(); // refresh projects list
      onClose(); // close modal
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="modal-content"
        style={{
          backgroundColor: "#fff",
          padding: "24px",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2>{editProject ? "Edit Project" : "Create Project"}</h2>

        {error && <p className="error" style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: "12px" }}>
            <input
              type="text"
              name="name"
              placeholder="Project Name"
              value={form.name}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "12px" }}>
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "12px" }}>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? (editProject ? "Saving..." : "Creating...") : (editProject ? "Save" : "Create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
