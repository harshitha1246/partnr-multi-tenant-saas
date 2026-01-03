// src/pages/Projects.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects, deleteProject } from "../api/projects.api";
import ProjectModal from "../components/ProjectModal";

// Helper component for colored status badge
const StatusBadge = ({ status }) => {
  let color;
  switch (status) {
    case "active":
      color = "green";
      break;
    case "completed":
      color = "blue";
      break;
    case "archived":
      color = "gray";
      break;
    default:
      color = "black";
  }

  return (
    <span
      style={{
        backgroundColor: color,
        color: "white",
        padding: "2px 8px",
        borderRadius: "8px",
        textTransform: "capitalize",
        fontSize: "0.8rem",
      }}
    >
      {status}
    </span>
  );
};

export default function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);

  // Search and filter
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = filterStatus ? { status: filterStatus } : {};
      const data = await getProjects(params);
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  // Delete project
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(id);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete project");
    }
  };

  // Filter & search
  const filteredProjects = Array.isArray(projects)
    ? projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div className="projects-page" style={{ padding: "16px" }}>
      <h2>Projects</h2>

      {/* Controls */}
      <div
        className="projects-controls"
        style={{
          marginBottom: "16px",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => {
            setEditProject(null);
            setModalOpen(true);
          }}
        >
          Create New Project
        </button>

        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "6px", flexGrow: 1, minWidth: "180px" }}
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: "6px" }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Loading / Error / Empty */}
      {loading && <p>Loading projects...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && filteredProjects.length === 0 && <p>No projects found</p>}

      {/* Projects List */}
      <div className="projects-list" style={{ display: "grid", gap: "12px" }}>
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="project-card"
            style={{
              border: "1px solid #ddd",
              padding: "12px",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* Project Name clickable */}
            <h3
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              {project.name}
            </h3>
            <p>{project.description ? project.description.slice(0, 100) + "..." : ""}</p>
            <p>
              Status: <StatusBadge status={project.status} />
            </p>
            <p>Tasks: {project.taskCount || 0}</p>
            <p>Created by: {project.creatorName}</p>

            {/* Actions */}
            <div className="actions" style={{ marginTop: "8px" }}>
              <button
                onClick={() => {
                  setEditProject(project);
                  setModalOpen(true);
                }}
                style={{ marginRight: "6px" }}
              >
                Edit
              </button>
              <button onClick={() => handleDelete(project.id)}>Delete</button>
              <button
                onClick={() => navigate(`/projects/${project.id}`)}
                style={{ marginLeft: "6px" }}
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Project Modal */}
      {modalOpen && (
        <ProjectModal
          editProject={editProject}
          onClose={() => {
            setModalOpen(false);
            setEditProject(null);
          }}
          onSave={fetchProjects} // refresh list after create/edit
        />
      )}
    </div>
  );
}
