import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/games", label: "Games" },
  { to: "/admin/users", label: "Users" },
];

const employeeLinks = [
  { to: "/employee/dashboard", label: "Dashboard" },
  { to: "/employee/bookings", label: "Bookings" },
  { to: "/employee/user-details", label: "User Details" },
];

const SidebarLayout = ({ role }) => {
  const navigate = useNavigate();
  const user = authService.getUser();
  const links = role === "ADMIN" ? adminLinks : employeeLinks;

  const handleLogout = () => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="shell-layout">
      <aside className="sidebar">
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
      </aside>

      <div className="shell-content">
        <Outlet />
      </div>
    </div>
  );
};

export default SidebarLayout;
