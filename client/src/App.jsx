import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import "./responsive.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminGames from "./pages/admin/AdminGames";
import BookingPage from "./pages/BookingPage";
import AdminBookings from "./pages/admin/AdminBookings";
import UsersPage from "./pages/UsersPage";
import UserDetails from "./pages/UserDetails";

import ProtectedRoute from "./components/common/ProtectedRoute";
import PublicRoute from "./components/common/PublicRoute";
import SidebarLayout from "./components/common/SidebarLayout";

const Home = () => {
  return <Navigate to="/login" replace />;
};

const Unauthorized = () => {
  return (
    <main className="app-page app-page-centered">
      <section className="status-card">
        <h1>Unauthorized Access</h1>
        <p>You do not have permission to view this page.</p>
      </section>
    </main>
  );
};

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin only routes */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route element={<SidebarLayout role="ADMIN" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/games" element={<AdminGames />} />
            <Route path="/admin/users" element={<UsersPage mode="admin" />} />
          </Route>
        </Route>

        {/* Employee only routes */}
        <Route element={<ProtectedRoute allowedRoles={["EMPLOYEE"]} />}>
          <Route element={<SidebarLayout role="EMPLOYEE" />}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/bookings" element={<BookingPage />} />
            <Route path="/employee/user-details" element={<UserDetails />} />
          </Route>
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
