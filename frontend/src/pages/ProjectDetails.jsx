// src/pages/ProjectDetails.jsx

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProjectById } from "../api/projects.api";
import { getTasks } from "../api/tasks.api";
import TaskModal from "../components/TaskModal";

// Helper for colored status badge
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

export default function ProjectDetails() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  // Fetch project & tasks
  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const projectData = await getProjectById(projectId);

      // If backend wraps project in { project: {...} }, use: projectData.project
      setProject(projectData);

      const tasksData = await getTasks({ projectId });
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  if (loading) return <p>Loading project...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!project) return <p>No project found</p>;

  return (
    <div style={{ padding: "16px" }}>
      <h2>{project.name}</h2>
      <p>{project.description}</p>
      <p>
        Status: <StatusBadge status={project.status} />
      </p>
      <p>Created by: {project.creatorName}</p>

      {/* Tasks Section */}
      <h3>Tasks</h3>
      <button
        onClick={() => {
          setEditTask(null);
          setTaskModalOpen(true);
        }}
        style={{ marginBottom: "12px" }}
      >
        Add Task
      </button>

      {tasks.length === 0 ? (
        <p>No tasks yet</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id} style={{ marginBottom: "6px" }}>
              {task.title} - {task.status} - {task.priority}
              <button
                onClick={() => {
                  setEditTask(task);
                  setTaskModalOpen(true);
                }}
                style={{ marginLeft: "8px" }}
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Task Modal */}
      {taskModalOpen && (
        <TaskModal
          editTask={editTask}
          projectId={projectId}
          onClose={() => {
            setTaskModalOpen(false);
            setEditTask(null);
          }}
          onSave={fetchProjectDetails} // refresh after add/edit
        />
      )}
    </div>
  );
}
