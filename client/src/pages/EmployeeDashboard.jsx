import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = authService.getUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.name}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AdminDashboard;