import { useEffect, useState } from "react";
import { reportService } from "../../services/reportService";

const today = new Date().toISOString().split("T")[0];

const AdminDashboard = () => {
  const [date, setDate] = useState(today);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReport = async () => {
      try {
        setError("");
        const data = await reportService.getAdminReport(date);
        setReport(data);
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      }
    };

    loadReport();
  }, [date]);

  return (
    <main className="app-page compact-page">
      <div className="page-header">
        <p className="eyebrow">Admin panel</p>
        <h1>Dashboard</h1>
      </div>

      {error && <p className="alert-error">{error}</p>}

      <div className="filter-bar">
        <label>Report Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <section className="stat-grid">
        <div className="stat-card">
          <span>Users</span>
          <strong>{report?.totals?.users || 0}</strong>
        </div>
        <div className="stat-card">
          <span>Games</span>
          <strong>{report?.totals?.games || 0}</strong>
        </div>
        <div className="stat-card">
          <span>Total Bookings</span>
          <strong>{report?.totals?.bookings || 0}</strong>
        </div>
        <div className="stat-card">
          <span>Daily Bookings</span>
          <strong>{report?.totals?.dailyBookings || 0}</strong>
        </div>
      </section>

      <section className="content-grid two-cols">
        <div className="table-card">
          <h2>Most Played Games</h2>
          <div className="report-list">
            {(report?.mostPlayedGames || []).slice(0, 6).map((item) => (
              <p key={item.name}>
                <span>{item.name}</span>
                <strong>{item.count}</strong>
              </p>
            ))}
            {report?.mostPlayedGames?.length === 0 && <p className="empty-text">No game data yet</p>}
          </div>
        </div>

        <div className="table-card">
          <h2>Most Played Timings</h2>
          <div className="report-list">
            {(report?.mostPlayedSlots || []).slice(0, 6).map((item) => (
              <p key={item.slot}>
                <span>{item.slot}</span>
                <strong>{item.count}</strong>
              </p>
            ))}
            {report?.mostPlayedSlots?.length === 0 && <p className="empty-text">No timing data yet</p>}
          </div>
        </div>
      </section>

      <section className="table-card">
        <h2>Daily Booking Report</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Game</th>
              <th>Slot</th>
              <th>Team</th>
            </tr>
          </thead>
          <tbody>
            {(report?.dailyBookings || []).map((item) => (
              <tr key={item.id}>
                <td data-label="Employee">{item.user.name}</td>
                <td data-label="Game">{item.booking.game.name}</td>
                <td data-label="Slot">{item.startTime} - {item.endTime}</td>
                <td data-label="Team">{item.team === "TEAM_A" ? "Team A" : "Team B"}</td>
              </tr>
            ))}
            {report?.dailyBookings?.length === 0 && (
              <tr>
                <td className="empty-cell" colSpan="4">No bookings for this date</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default AdminDashboard;
