import { useEffect, useState } from "react";
import { bookingService } from "../services/bookingService";
import { reportService } from "../services/reportService";

const EmployeeDashboard = () => {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const loadReport = async () => {
    try {
      setError("");
      const data = await reportService.getEmployeeReport();
      setReport(data);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const cancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;

    try {
      await bookingService.cancelBooking(id);
      loadReport();
    } catch (err) {
      setError(err.message || "Cancel failed");
    }
  };

  return (
    <main className="app-page compact-page">
      <div className="page-header">
        <p className="eyebrow">Employee panel</p>
        <h1>Dashboard</h1>
      </div>

      {error && <p className="alert-error">{error}</p>}

      <section className="stat-grid">
        <div className="stat-card">
          <span>Your Active Bookings</span>
          <strong>{report?.totals?.bookings || 0}</strong>
        </div>
      </section>

      <section className="table-card">
        <h2>Your Bookings and Teams</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Game</th>
              <th>Date</th>
              <th>Slot</th>
              <th>Your Team</th>
              <th>Team Members</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {(report?.bookings || []).map((item) => {
              const teamMembers = item.booking.players
                .filter((player) => player.team === item.team)
                .map((player) => player.user.name)
                .join(", ");

              return (
                <tr key={item.id}>
                  <td>{item.booking.game.name}</td>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>{item.startTime} - {item.endTime}</td>
                  <td>{item.team === "TEAM_A" ? "Team A" : "Team B"}</td>
                  <td>{teamMembers || "No members"}</td>
                  <td>
                    <button className="danger-btn" onClick={() => cancelBooking(item.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {report?.bookings?.length === 0 && (
              <tr>
                <td className="empty-cell" colSpan="6">No active bookings</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default EmployeeDashboard;
