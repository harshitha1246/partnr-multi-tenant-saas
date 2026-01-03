import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // Hide navbar on login/register
  const hideNavbarRoutes = ["/login", "/register"];
  if (hideNavbarRoutes.includes(location.pathname)) return null;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    else setUser(null);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  const isTenantAdmin = user.role === "tenant_admin";
  const isSuperAdmin = user.role === "super_admin";

  return (
    <nav style={{ width: "100%", background: "#1e293b", color: "white", borderBottom: "1px solid #334155" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* LEFT */}
        <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
          <Link to="/dashboard" style={linkStyle}>Partnr</Link>
          <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
          <Link to="/projects" style={linkStyle}>Projects</Link>
          {(isTenantAdmin || isSuperAdmin) && <Link to="/tasks" style={linkStyle}>Tasks</Link>}
          {isTenantAdmin && <Link to="/users" style={linkStyle}>Users</Link>}
          {isSuperAdmin && <Link to="/tenants" style={linkStyle}>Tenants</Link>}
        </div>

        {/* RIGHT */}
        <div ref={dropdownRef} style={{ position: "relative", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontWeight: "bold", cursor: "pointer" }} onClick={() => setDropdownOpen(!dropdownOpen)}>
            {user.fullName} ▾
          </span>

          {dropdownOpen && (
            <ul style={dropdownStyle}>
              <li onClick={() => { navigate("/profile"); setDropdownOpen(false); }}>Profile</li>
              <li onClick={() => { navigate("/settings"); setDropdownOpen(false); }}>Settings</li>
              <li onClick={() => { handleLogout(); setDropdownOpen(false); }}>Logout</li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontWeight: "500"
};

const dropdownStyle = {
  position: "absolute",
  right: 0,
  top: "100%",
  background: "#1e293b",
  color: "white",
  listStyle: "none",
  padding: "4px 0",
  borderRadius: "6px",
  minWidth: "140px",
  zIndex: 100,
  fontWeight: 500
};
