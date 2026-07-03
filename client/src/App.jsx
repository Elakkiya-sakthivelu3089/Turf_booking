import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

const Home = () => {
  return <h1>User Home Page</h1>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
       <Route path="/admin/dashboard" element={<AdminDashboard />} />
<Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;