import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../../services/authService";

const PublicRoute = () => {
  const user = authService.getUser();

  if (authService.isAuthenticated() && user?.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (authService.isAuthenticated() && user?.role === "EMPLOYEE") {
    return <Navigate to="/employee/bookings" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
