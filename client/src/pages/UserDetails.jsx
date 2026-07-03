import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { userService } from "../services/userService";

const UserDetails = () => {
  const navigate = useNavigate();
  const currentUser = authService.getUser();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        setError("");
        const data = await userService.getMe();
        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          password: "",
        });
        setBookings(data.joinedTeams || []);
      } catch (err) {
        setError(err.message || "Failed to load user details");
      }
    };

    loadUser();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const saveUser = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      const updated = await userService.updateUser(null, payload);
      localStorage.setItem("user", JSON.stringify({ ...currentUser, ...updated }));
      setSuccess("User details updated");
    } catch (err) {
      setError(err.message || "Update failed");
    }
  };

  const deleteMyAccount = async () => {
    const confirmed = window.confirm(
      "Delete your account? This also cancels your active bookings and cannot be undone."
    );

    if (!confirmed) return;

    try {
      await userService.deleteUser(currentUser.id);
      authService.logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  };

  return (
    <main className="app-page compact-page">
      <div className="page-header">
        <p className="eyebrow">Employee panel</p>
        <h1>User Details</h1>
      </div>

      {error && <p className="alert-error">{error}</p>}
      {success && <p className="auth-success">{success}</p>}

      <section className="admin-form-card">
        <h2>View and Edit Details</h2>
        <form className="inline-form user-form" onSubmit={saveUser}>
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
          <input name="password" type="password" placeholder="New password optional" value={form.password} onChange={handleChange} />
          <button className="primary-btn" type="submit">Update Details</button>
          <button className="danger-btn" type="button" onClick={deleteMyAccount}>Delete Account</button>
        </form>
      </section>

      <section className="table-card">
        <h2>Your Booking IDs</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Game</th>
              <th>Date</th>
              <th>Slot</th>
              <th>Team</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.booking.game.name}</td>
                <td>{new Date(item.date).toLocaleDateString()}</td>
                <td>{item.startTime} - {item.endTime}</td>
                <td>{item.team === "TEAM_A" ? "Team A" : "Team B"}</td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td className="empty-cell" colSpan="5">No active bookings</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default UserDetails;
