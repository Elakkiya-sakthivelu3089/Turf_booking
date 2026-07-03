import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h2>Game Slot Booking</h2>

      <div className="navbar-links">
        <Link to="/dashboard">
          Dashboard
        </Link>

        <Link to="/employee/bookings">
          Booking
        </Link>

        <Link to="/admin/games">
          Games
        </Link>

        <button className="nav-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
