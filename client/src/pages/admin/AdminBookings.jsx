import { useEffect, useState } from "react";
import BookingPage from "../BookingPage";
import { bookingService } from "../../services/bookingService";

const today = new Date().toISOString().split("T")[0];

const AdminBookings = () => {
  const [date, setDate] = useState(today);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  const loadBookings = async () => {
    try {
      setError("");
      const data = await bookingService.getAllBookings(date);
      setBookings(data);
    } catch (err) {
      setError(err.message || "Failed to load bookings");
    }
  };

  useEffect(() => {
    loadBookings();
  }, [date]);

  return (
    <main className="admin-booking-page">
      <BookingPage title="Admin Booking" audience="Admin booking" />

      <section className="app-page compact-page report-section">
        <div className="page-header">
          <p className="eyebrow">Daily report</p>
          <h1>Employee Bookings</h1>
        </div>

        {error && <p className="alert-error">{error}</p>}

        <div className="filter-bar">
          <label>Report Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button className="secondary-btn" onClick={loadBookings}>Refresh</button>
        </div>

        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Game</th>
                <th>Category</th>
                <th>Slot</th>
                <th>Team</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((item) => (
                <tr key={item.id}>
                  <td data-label="Employee">{item.user.name}</td>
                  <td data-label="Game">{item.booking.game.name}</td>
                  <td data-label="Category">{item.booking.game.category?.name}</td>
                  <td data-label="Slot">{item.startTime} - {item.endTime}</td>
                  <td data-label="Team">{item.team === "TEAM_A" ? "Team A" : "Team B"}</td>
                  <td data-label="Email">{item.user.email}</td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td className="empty-cell" colSpan="6">No bookings found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default AdminBookings;
