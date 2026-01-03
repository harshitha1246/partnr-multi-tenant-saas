import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerTenant } from "../api/auth.api";
import "./Register.css";

export default function RegisterTenant() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    tenantName: "",
    subdomain: "",
    adminEmail: "",
    adminFullName: "",
    adminPassword: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔥 NEW: password visibility states (APPENDED)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Client-side validation
  const validateForm = () => {
    if (!form.tenantName.trim()) return "Organization name is required";
    if (!form.subdomain.trim()) return "Subdomain is required";
    if (!form.adminEmail.trim()) return "Admin email is required";
    if (!form.adminFullName.trim()) return "Admin full name is required";
    if (form.adminPassword.length < 6)
      return "Password must be at least 6 characters";
    if (form.adminPassword !== form.confirmPassword)
      return "Passwords do not match";
    if (!form.acceptTerms)
      return "You must accept Terms & Conditions";
    return null;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // 🔒 prevent double submit

    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      tenantName: form.tenantName,
      subdomain: form.subdomain,
      adminEmail: form.adminEmail,
      adminFullName: form.adminFullName,
      adminPassword: form.adminPassword,
    };

    try {
      setLoading(true);
      await registerTenant(payload);
      setSuccess("Tenant registered successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <h2>Create Tenant Account</h2>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              name="tenantName"
              placeholder="Organization Name"
              value={form.tenantName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <input
              name="subdomain"
              placeholder="Subdomain"
              value={form.subdomain}
              onChange={handleChange}
            />
            <div className="subdomain-preview">
              {(form.subdomain || "your-subdomain")}.yourapp.com
            </div>
          </div>

          <div className="form-group">
            <input
              type="email"
              name="adminEmail"
              placeholder="Admin Email"
              value={form.adminEmail}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <input
              name="adminFullName"
              placeholder="Admin Full Name"
              value={form.adminFullName}
              onChange={handleChange}
            />
          </div>

          {/* 🔥 Password with show/hide */}
          <div className="form-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              name="adminPassword"
              placeholder="Password"
              value={form.adminPassword}
              onChange={handleChange}
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {/* 🔥 Confirm password with show/hide */}
          <div className="form-group password-group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            <span
              className="toggle-password"
              onClick={() =>
                setShowConfirmPassword((prev) => !prev)
              }
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </span>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={form.acceptTerms}
              onChange={handleChange}
            />
            <label>I accept Terms & Conditions</label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <div className="login-link">
          Already have an account?{" "}
          <span
            style={{ cursor: "pointer", color: "#007bff" }}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </div>
      </div>
    </div>
  );
}
