import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/games", label: "Games" },
  { to: "/admin/users", label: "Users" },
];

const employeeLinks = [
  { to: "/employee/bookings", label: "Bookings" },
  { to: "/employee/user-details", label: "User Details" },
];

const SidebarLayout = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getUser();
  const links = role === "ADMIN" ? adminLinks : employeeLinks;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeLink = links.find((link) => link.to === location.pathname);

  const handleLogout = () => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const closeMenu = window.setTimeout(() => setIsMenuOpen(false), 0);
    return () => window.clearTimeout(closeMenu);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  return (
    <div className={`shell-layout ${isMenuOpen ? "menu-open" : ""}`}>
      <aside className="sidebar">
        <div className="mobile-menu-bar" aria-label="Current section">
          <div className="breadcrumb-trail">
            <span>{role === "ADMIN" ? "Admin" : "Employee"}</span>
            <span aria-hidden="true">/</span>
            <strong>{activeLink?.label || "Dashboard"}</strong>
          </div>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="sidebar-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? "Close" : "Menu"}
          </button>
        </div>

        <div className="sidebar-panel" id="sidebar-navigation">
          <div className="sidebar-brand">
            <span>Game Slot</span>
            <strong>{role === "ADMIN" ? "Admin" : "Employee"}</strong>
          </div>

          <nav className="sidebar-nav">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div>
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {isMenuOpen && (
        <button
          className="menu-backdrop"
          type="button"
          aria-label="Close menu"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <div className="shell-content">
        <Outlet />
      </div>
    </div>
  );
};

export default SidebarLayout;
