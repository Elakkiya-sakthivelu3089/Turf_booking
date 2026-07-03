import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Landing.css";

export default function Landing() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="landing-container authenticated">
        <div className="welcome-card">
          <h1>Welcome, {user?.name}!</h1>
          <p>Role: <span className="role-badge">{user?.role}</span></p>

          <div className="action-buttons">
            {user?.role === "ADMIN" && (
              <button
                className="btn btn-primary"
                onClick={() => navigate("/admin/dashboard")}
              >
                Admin Dashboard
              </button>
            )}
            {user?.role === "HEAD" && (
              <button
                className="btn btn-primary"
                onClick={() => navigate("/head/dashboard")}
              >
                Head Dashboard
              </button>
            )}
            {user?.role === "EMPLOYEE" && (
              <button
                className="btn btn-primary"
                onClick={() => navigate("/employee/dashboard")}
              >
                Employee Dashboard
              </button>
            )}

            <button className="btn btn-secondary" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1>🏟️ Turf Booking System</h1>
        <p className="subtitle">Book your favorite game slots</p>

        <div className="auth-options">
          <div className="auth-card">
            <h2>👨‍💼 Admin</h2>
            <p>Full access to system management</p>
            <button
              className="btn btn-admin"
              onClick={() => navigate("/admin/auth")}
            >
              Admin Login
            </button>
          </div>

          <div className="auth-card">
            <h2>👥 Head</h2>
            <p>Manage bookings and view reports</p>
            <button
              className="btn btn-head"
              onClick={() => navigate("/head/auth")}
            >
              Head Login / Register
            </button>
          </div>

          <div className="auth-card">
            <h2>👤 Employee</h2>
            <p>Book game slots and view your bookings</p>
            <button
              className="btn btn-employee"
              onClick={() => navigate("/employee/auth")}
            >
              Employee Login / Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
