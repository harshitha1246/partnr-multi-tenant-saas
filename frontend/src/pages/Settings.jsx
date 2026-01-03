// src/pages/Settings.jsx
import { useEffect, useState } from "react";

export default function Settings() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "1rem" }}>
      <h2>Settings</h2>
      <p>Here you can configure your application preferences.</p>

      <div style={{ marginTop: "1rem" }}>
        <p><strong>Full Name:</strong> {user.fullName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        {/* You can add editable fields and save button later */}
      </div>
    </div>
  );
}
