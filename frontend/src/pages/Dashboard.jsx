import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects } from "../api/projects.api";
import { getTasks } from "../api/tasks.api";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const projectsData = await getProjects();
        setProjects(projectsData.data || []);

        const tasksData = await getTasks();
        setTasks(tasksData.data || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="dashboard-wrapper">
      {/* Navigation buttons */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button onClick={() => navigate("/projects")}>Projects</button>
        <button onClick={() => navigate("/users")}>Users</button>
      </div>

      <h1>Dashboard</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="stats-cards">
            <div className="card">Total Projects: {projects.length}</div>
            <div className="card">Total Tasks: {tasks.length}</div>
            <div className="card">
              Completed Tasks: {tasks.filter(t => t.status === "completed").length}
            </div>
            <div className="card">
              Pending Tasks: {tasks.filter(t => t.status !== "completed").length}
            </div>
          </div>

          {/* Recent Projects */}
          <h2>Recent Projects</h2>
          <ul className="recent-projects">
            {projects.slice(0, 5).map(p => (
              <li key={p.id}>
                {p.name} - {p.status} - {p.tasks?.length || 0} tasks
              </li>
            ))}
          </ul>

          {/* My Tasks */}
          <h2>My Tasks</h2>
          <ul className="my-tasks">
            {tasks.map(t => (
              <li key={t.id}>
                {t.title} ({t.projectName}) - {t.priority} - Due: {t.dueDate}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
