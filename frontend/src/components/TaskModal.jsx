// src/components/TaskModal.jsx

import { useState, useEffect } from "react";
import {
  createTask,
  updateTask,
} from "../api/tasks.api"; // make sure this API file exists
import "./Modal.css"; // optional: reuse ProjectModal.css styles if available
import "./Modal.css";

export default function TaskModal({ editTask, projectId, onClose, onSave }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignedUser: "",
    dueDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Populate form if editing
  useEffect(() => {
    if (editTask) {
      setForm({
        title: editTask.title || "",
        description: editTask.description || "",
        status: editTask.status || "todo",
        priority: editTask.priority || "medium",
        assignedUser: editTask.assignedUser?.id || "",
        dueDate: editTask.dueDate ? editTask.dueDate.split("T")[0] : "",
      });
    }
  }, [editTask]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Task title is required");
      return;
    }

    setLoading(true);
    setError("");

    const payload = { ...form };

    try {
      if (editTask) {
        await updateTask(editTask.id, payload);
      } else {
        await createTask(projectId, payload);
      }
      onSave(); // refresh tasks in ProjectDetails
      onClose();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>{editTask ? "Edit Task" : "Add Task"}</h3>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select name="priority" value={form.priority} onChange={handleChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            name="assignedUser"
            placeholder="Assigned User ID"
            value={form.assignedUser}
            onChange={handleChange}
          />
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
          />

          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
