// src/components/UserModal.jsx
import { useState, useEffect } from "react";
import { createUser, updateUser } from "../api/users.api";

export default function UserModal({ editUser, tenantId, onClose, onSave }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "user",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editUser) {
      setForm({
        fullName: editUser.fullName || editUser.name || "",
        email: editUser.email || "",
        password: "",
        role: editUser.role || "user",
        isActive: editUser.isActive ?? true,
      });
    }
  }, [editUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.fullName || !form.email || (!editUser && !form.password)) {
      setError("Name, email, and password are required");
      return;
    }

    try {
      setLoading(true);
      if (editUser) {
        await updateUser(editUser.id, form);
      } else {
        await createUser(tenantId, form);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.5)", display: "flex",
      justifyContent: "center", alignItems: "center", zIndex: 9999
    }}>
      <div style={{ background: "#fff", padding: "20px", minWidth: "320px", borderRadius: "8px" }}>
        <h3>{editUser ? "Edit User" : "Add User"}</h3>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
          {!editUser && <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />}
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="tenant_admin">Admin</option>
          </select>
          <label>
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
            Active
          </label>
          <div style={{ marginTop: "10px" }}>
            <button type="submit">{loading ? "Saving..." : "Save"}</button>
            <button type="button" onClick={onClose} style={{ marginLeft: "10px" }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
