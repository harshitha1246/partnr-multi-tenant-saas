import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth.api";
import "./Register.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", tenantSubdomain: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password || !form.tenantSubdomain) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const data = await login(form);
      console.log("Login success:", data);

      // Save token to localStorage
      // Change this in handleSubmit
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      localStorage.setItem("tenantId", data.data.user.tenantId);
      localStorage.setItem("role", data.data.user.role);
      navigate("/dashboard"); // create a dashboard route later
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            name="tenantSubdomain"
            placeholder="Subdomain"
            value={form.tenantSubdomain}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
          <button type="submit">{loading ? "Logging in..." : "Login"}</button>
        </form>
      </div>
    </div>
  );
}
