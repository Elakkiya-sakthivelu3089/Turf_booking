import { useEffect, useState } from "react";
import { reportService } from "../../services/reportService";
import TableControls from "../../components/common/TableControls";
import { useTableControls } from "../../hooks/useTableControls";

const today = new Date().toISOString().split("T")[0];

const escapeCsvValue = (value) => {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
};

const AdminDashboard = () => {
  const [date, setDate] = useState(today);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [gameFilter, setGameFilter] = useState("ALL");
  const dailyBookingRows = (report?.dailyBookings || []).map((item) => ({
    ...item,
    employeeName: item.user.name,
    email: item.user.email,
    gameName: item.booking.game.name,
    categoryName: item.booking.game.category?.name || "-",
    slotLabel: `${item.startTime} - ${item.endTime}`,
    teamLabel: item.team === "TEAM_A" ? "Team A" : "Team B",
  }));
  const categoryOptions = Array.from(
    new Set(dailyBookingRows.map((item) => item.categoryName).filter(Boolean)),
  ).sort();
  const gameOptions = Array.from(
    new Set(
      dailyBookingRows
        .filter(
          (item) =>
            categoryFilter === "ALL" || item.categoryName === categoryFilter,
        )
        .map((item) => item.gameName)
        .filter(Boolean),
    ),
  ).sort();
  const filteredDailyBookingRows = dailyBookingRows.filter((item) => {
    const matchesCategory =
      categoryFilter === "ALL" || item.categoryName === categoryFilter;
    const matchesGame = gameFilter === "ALL" || item.gameName === gameFilter;

    return matchesCategory && matchesGame;
  });
  const dailyBookingsTable = useTableControls({
    rows: filteredDailyBookingRows,
    searchFields: [
      (item) => item.employeeName,
      (item) => item.email,
      (item) => item.gameName,
      (item) => item.categoryName,
      (item) => item.slotLabel,
      (item) => item.teamLabel,
    ],
    filterField: "teamLabel",
  });

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

  const exportDailyBookings = () => {
    const headers = ["Employee", "Game", "Category", "Slot", "Team", "Email"];
    const rows = dailyBookingsTable.filteredRows.map((item) => [
      item.employeeName,
      item.gameName,
      item.categoryName,
      item.slotLabel,
      item.teamLabel,
      item.email,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `daily-booking-report-${date}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
        <div className="table-report-controls">
          <TableControls
            table={dailyBookingsTable}
            searchPlaceholder="Search daily bookings"
            filterLabel="Team"
            filterOptions={dailyBookingsTable.filterOptions}
            extraFilters={
              <>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setGameFilter("ALL");
                  }}
                  aria-label="Category"
                >
                  <option value="ALL">All categories</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select
                  value={gameFilter}
                  onChange={(e) => setGameFilter(e.target.value)}
                  aria-label="Game"
                >
                  <option value="ALL">All games</option>
                  {gameOptions.map((game) => (
                    <option key={game} value={game}>
                      {game}
                    </option>
                  ))}
                </select>
              </>
            }
            actions={
              <button className="secondary-btn" type="button" onClick={exportDailyBookings}>
                Export Excel
              </button>
            }
          />
        </div>
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
            {dailyBookingsTable.pageRows.map((item) => (
              <tr key={item.id}>
                <td data-label="Employee">{item.employeeName}</td>
                <td data-label="Game">{item.gameName}</td>
                <td data-label="Category">{item.categoryName}</td>
                <td data-label="Slot">{item.slotLabel}</td>
                <td data-label="Team">{item.teamLabel}</td>
                <td data-label="Email">{item.email}</td>
              </tr>
            ))}
            {dailyBookingsTable.pageRows.length === 0 && (
              <tr>
                <td className="empty-cell" colSpan="6">No bookings for this date</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default AdminDashboard;
