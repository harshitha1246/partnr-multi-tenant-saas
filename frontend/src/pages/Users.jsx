// src/pages/Users.jsx
import { useState, useEffect } from "react";
import { getUsers, deleteUser } from "../api/users.api";
import UserModal from "../components/UserModal";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const role = localStorage.getItem("role");
  const tenantId = localStorage.getItem("tenantId");
  const isAdmin = role === "tenant_admin";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      if (!isAdmin) return;

      const usersList = await getUsers(tenantId);
      setUsers(usersList);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users. Make sure you are logged in as tenant admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (!isAdmin) return alert("Only tenant admins can delete users");
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId);
        fetchUsers();
      } catch (err) {
        console.error(err);
        alert("Failed to delete user");
      }
    }
  };

  return (
    <div style={{ padding: "16px" }}>
      <h2>Users</h2>

      {isAdmin && (
        <button onClick={() => { setEditUser(null); setModalOpen(true); }}>
          Add User
        </button>
      )}

      {loading && <p>Loading users...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !isAdmin && <p>You do not have permission to view users.</p>}
      {!loading && isAdmin && users.length === 0 && <p>No users found</p>}

      {isAdmin && users.length > 0 && (
        <table style={{ width: "100%", marginTop: "16px", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td>{u.fullName || u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.isActive ? "Active" : "Inactive"}</td>
                <td>{new Date(u.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => { setEditUser(u); setModalOpen(true); }}>Edit</button>
                  <button onClick={() => handleDelete(u.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <UserModal
          editUser={editUser}
          tenantId={tenantId}
          onClose={() => { setModalOpen(false); setEditUser(null); }}
          onSave={fetchUsers}
        />
      )}
    </div>
  );
}
