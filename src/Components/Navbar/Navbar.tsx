import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

function getUserLabel(user: Record<string, unknown> | null): string {
  if (!user) return "";
  const entry = Object.entries(user).find(
    ([key, value]) => /name|username/i.test(key) && typeof value === "string",
  );
  return entry ? String(entry[1]) : "";
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/signin", { replace: true });
  }

  return (
    <header className="app-navbar">
      <NavLink className="brand" to="/">Social App</NavLink>
      <nav aria-label="Main navigation" className="nav-links">
        <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} end to="/">
          Home
        </NavLink>
        <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/profile">
          Profile
        </NavLink>
        <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/change-password">
          Password
        </NavLink>
      </nav>
      <div className="nav-actions">
        {getUserLabel(user) && <span className="nav-user">{getUserLabel(user)}</span>}
        <button className="button secondary small" onClick={handleLogout} type="button">
          Log out
        </button>
      </div>
    </header>
  );
}
