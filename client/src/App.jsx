import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import "./responsive.css";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminGames from "./pages/admin/AdminGames";
import EmployeeBookingLink from "./pages/EmployeeBookingLink";
import AdminBookings from "./pages/admin/AdminBookings";
import UsersPage from "./pages/UsersPage";

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
      <div className="brand-backdrop" aria-hidden="true">
        <span>CookScape</span>
      </div>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/employee-booking" element={<EmployeeBookingLink />} />

        {/* Admin only routes */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route element={<SidebarLayout role="ADMIN" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/games" element={<AdminGames />} />
            <Route path="/admin/users" element={<UsersPage mode="admin" />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="copyright-footer">
        Copyright &copy; {new Date().getFullYear()} CookScape. All rights reserved.
      </footer>
    </BrowserRouter>
  );
}

export default App;
