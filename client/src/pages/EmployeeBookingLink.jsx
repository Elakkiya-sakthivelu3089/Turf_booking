import { useCallback, useEffect, useState } from "react";
import { bookingService } from "../services/bookingService";
import GameIcon from "../components/bookings/GameIcon";

const getTodayDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const emptyEmployeeForm = {
  name: "",
  position: "FA",
  email: "",
  phone: "",
};

const positionOptions = ["FA", "CRE", "LA"];

const EmployeeBookingLink = () => {
  const today = getTodayDate();
  const [employeeForm, setEmployeeForm] = useState(emptyEmployeeForm);
  const [employee, setEmployee] = useState(() => {
    const saved = sessionStorage.getItem("bookingEmployee");
    return saved ? JSON.parse(saved) : null;
  });
  const [games, setGames] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingEmployee, setSavingEmployee] = useState(false);
  const [notice, setNotice] = useState(null);
  const [linkClosed, setLinkClosed] = useState(false);
  const [closesAt, setClosesAt] = useState(null);
  const [showAllEmployeeBookings, setShowAllEmployeeBookings] = useState(false);

  const showNotice = (type, text) => {
    setNotice({ type, text });
  };

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bookingService.getPublicBookingPage(today);
      setLinkClosed(Boolean(data.linkClosed));
      setClosesAt(data.closesAt || null);
      setGames(data.games || []);
      sessionStorage.removeItem("bookingEmployeeTimes");

      setSelectedGame((currentGame) => {
        if (!currentGame) return null;
        return data.games?.find((game) => game.id === currentGame.id) || null;
      });

      setSelectedSlot((currentSlot) => {
        if (!currentSlot) return null;
        const latestGame = data.games?.find(
          (game) => game.id === selectedGame?.id,
        );
        return (
          latestGame?.slots.find(
            (slot) => slot.startTime === currentSlot.startTime,
          ) || null
        );
      });
    } catch (err) {
      showNotice("error", err.message || "Failed to load slots");
    } finally {
      setLoading(false);
    }
  }, [selectedGame?.id, today]);

  useEffect(() => {
    loadBookings();
    const refreshTimer = window.setInterval(loadBookings, 30000);
    return () => window.clearInterval(refreshTimer);
  }, [loadBookings]);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const categories = Array.from(
    new Set(games.map((game) => game.category).filter(Boolean)),
  ).map((name) => ({
    name,
    label: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
  }));

  const filteredGames = games.filter(
    (game) => game.category === selectedCategory,
  );
  const gameFilterOptions = selectedCategory ? filteredGames : games;
  const employeeBookedSlots = games.flatMap((game) =>
    game.slots.flatMap((slot) => {
      const teamA = slot.teamA
        .filter((player) => player.user.id === employee?.id)
        .map((player) => ({ player, teamLabel: "Team A" }));
      const teamB = slot.teamB
        .filter((player) => player.user.id === employee?.id)
        .map((player) => ({ player, teamLabel: "Team B" }));

      return [...teamA, ...teamB].map(({ teamLabel }) => ({
        key: `${game.id}-${slot.startTime}-${slot.endTime}-${teamLabel}`,
        gameName: game.name,
        category: game.category,
        slotLabel: slot.label,
        teamLabel,
      }));
    }),
  );
  const visibleEmployeeBookings = showAllEmployeeBookings
    ? employeeBookedSlots
    : employeeBookedSlots.slice(0, 3);

  const selectGame = (game) => {
    setSelectedCategory(game.category);
    setSelectedGame(game);
    setSelectedSlot(null);
  };

  const handleEmployeeChange = (event) => {
    setEmployeeForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const registerEmployee = async (event) => {
    event.preventDefault();

    try {
      setSavingEmployee(true);

      const data = await bookingService.registerPublicEmployee(employeeForm);
      setEmployee(data.employee);
      sessionStorage.setItem("bookingEmployee", JSON.stringify(data.employee));
      showNotice("success", "Details saved. You can book today's slot now.");
    } catch (err) {
      showNotice("error", err.message || "Employee details failed");
    } finally {
      setSavingEmployee(false);
    }
  };

  const handleJoinTeam = async (team) => {
    if (!employee) {
      showNotice("error", "Please fill employee details before booking.");
      return;
    }

    if (linkClosed) {
      showNotice("error", "Today's booking link is closed.");
      return;
    }

    try {
      await bookingService.joinPublicBooking({
        userId: employee.id,
        gameId: selectedGame.id,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        team,
      });

      showNotice("success", "Slot booked successfully.");

      const data = await bookingService.getPublicBookingPage(today);
      setLinkClosed(Boolean(data.linkClosed));
      setClosesAt(data.closesAt || null);
      setGames(data.games || []);

      const updatedGame = data.games.find(
        (game) => game.id === selectedGame.id,
      );
      const updatedSlot = updatedGame?.slots.find(
        (slot) => slot.startTime === selectedSlot.startTime,
      );

      setSelectedGame(updatedGame || null);
      setSelectedSlot(updatedSlot || null);
    } catch (err) {
      showNotice("error", err.message || "Booking failed");
      await loadBookings();
    }
  };
    const handleDelete = () => {
      const confirmed = window.confirm(
        "Are you sure you want to delete the saved session data?",
      );

      if (!confirmed) return;

      sessionStorage.removeItem("bookingEmployee");

      alert("Session data deleted successfully");
      window.location.reload();
    };


  return (
    <main className="app-page booking-page employee-booking-link">
      <div className="page-header">
        <p className="eyebrow">Employee booking link</p>
        <h1>Book Today's Game Slot</h1>
      </div>
      <button
        className="employee-session-clear secondary-btn"
        type="button"
        onClick={handleDelete}
      >
        Delete Session Data
      </button>
      {notice && (
        <div className={`booking-toast ${notice.type}`} role="status">
          <strong>
            {notice.type === "error" ? "Booking issue" : "Success"}
          </strong>
          <span>{notice.text}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Close message"
          >
            x
          </button>
        </div>
      )}

      {linkClosed && (
        <section className="status-card employee-link-closed">
          <p className="eyebrow">Closed</p>
          <h1>Today's booking link is closed</h1>
          <p className="muted-text">
            Employee booking is available only until the 7:00 PM slot closes at
            8:00 PM.
          </p>
        </section>
      )}

      {!employee && !linkClosed && (
        <section className="admin-form-card employee-register-card">
          <h2>Employee Details</h2>
          <form className="inline-form user-form" onSubmit={registerEmployee}>
            <input
              name="name"
              value={employeeForm.name}
              placeholder="Name"
              onChange={handleEmployeeChange}
              required
            />
            <select
              name="position"
              value={employeeForm.position}
              onChange={handleEmployeeChange}
              required
            >
              {positionOptions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
            <input
              name="email"
              type="email"
              value={employeeForm.email}
              placeholder="Email"
              onChange={handleEmployeeChange}
              required
            />
            <input
              name="phone"
              value={employeeForm.phone}
              placeholder="Phone number"
              onChange={handleEmployeeChange}
              required
            />
            <button
              className="primary-btn"
              type="submit"
              disabled={savingEmployee}
            >
              {savingEmployee ? "Saving..." : "Continue to Slots"}
            </button>
          </form>
        </section>
      )}

      {employee && !linkClosed && (
        <div className="filter-bar today-slot-bar employee-session-bar">
          <div>
            <label>Booking Date</label>
            <strong>
              {new Date(`${today}T00:00:00`).toLocaleDateString()}
            </strong>
          </div>
          <div>
            <label>Employee</label>
            <strong>
              {employee.name} / {employee.position}
            </strong>
          </div>
          {closesAt && (
            <div>
              <label>Link Closes</label>
              <strong>
                {new Date(closesAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
            </div>
          )}
        </div>
      )}

      {loading && <p className="loading-text">Loading...</p>}

      {employee && !linkClosed && !loading && (
        <>
          <div className="filter-bar">
            <label>Game</label>
            <select
              value={selectedGame?.id || ""}
              onChange={(e) => {
                const game = games.find(
                  (item) => item.id === Number(e.target.value),
                );
                if (game) selectGame(game);
                if (!e.target.value) {
                  setSelectedGame(null);
                  setSelectedSlot(null);
                }
              }}
            >
              <option value="">Select game</option>
              {gameFilterOptions.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>

          {employeeBookedSlots.length > 0 && (
            <section className="booking-section employee-booked-slots">
              <h2>Your Booked Slots</h2>
              <ul className="booked-slot-list">
                {visibleEmployeeBookings.map((item) => (
                  <li key={item.key}>
                    <strong>{item.gameName}</strong>
                    <span>{item.category}</span>
                    <span>{item.slotLabel}</span>
                    <span>{item.teamLabel}</span>
                  </li>
                ))}
              </ul>
              {employeeBookedSlots.length > 3 && (
                <button
                  className="secondary-btn"
                  type="button"
                  onClick={() => setShowAllEmployeeBookings((current) => !current)}
                >
                  {showAllEmployeeBookings ? "Show less" : "Show more"}
                </button>
              )}
            </section>
          )}

          <section className="booking-section">
            <h2>Choose Category</h2>

            <div className="selection-grid">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  className={`selection-card ${
                    selectedCategory === cat.name
                      ? "is-active category-active"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setSelectedGame(null);
                    setSelectedSlot(null);
                  }}
                >
                  <h3>{cat.label}</h3>
                </button>
              ))}
            </div>
          </section>

          {selectedCategory && (
            <section className="booking-section">
              <h2>{selectedCategory} Games</h2>

              {filteredGames.length === 0 && (
                <p className="empty-text">
                  No games found under {selectedCategory}
                </p>
              )}

              <div className="selection-grid">
                {filteredGames.map((game) => (
                  <button
                    key={game.id}
                    type="button"
                    className={`selection-card ${
                      selectedGame?.id === game.id
                        ? "is-active game-active"
                        : ""
                    }`}
                    onClick={() => {
                      selectGame(game);
                    }}
                  >
                    <GameIcon name={game.name} />
                    <h4>{game.name}</h4>
                  </button>
                ))}
              </div>
            </section>
          )}

          {selectedGame && (
            <section className="booking-section">
              <h2>{selectedGame.name} Slots</h2>

              <div className="slot-grid">
                {selectedGame.slots.map((slot) => {
                  const isBookedTime = [slot.teamA, slot.teamB].some(
                    (teamPlayers) =>
                      teamPlayers.some(
                        (player) => player.user.id === employee.id,
                      ),
                  );

                  return (
                    <button
                      key={slot.startTime}
                      type="button"
                      className={`slot-btn ${
                        selectedSlot?.startTime === slot.startTime
                          ? "is-active"
                          : ""
                      } ${slot.isBreak || isBookedTime ? "is-break" : ""}`}
                      disabled={slot.isBreak || isBookedTime}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <span>{slot.label}</span>
                      {slot.isBreak && <small>{slot.reason}</small>}
                      {isBookedTime && !slot.isBreak && (
                        <small>Already booked</small>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedGame.slots.length === 0 && (
                <p className="empty-text">No more slots available for today.</p>
              )}
            </section>
          )}

          {selectedSlot && (
            <section className="booking-section">
              <h2>
                {selectedGame.name} - {selectedSlot.label}
              </h2>

              <div className="team-grid">
                <TeamBox
                  title="Team A"
                  players={selectedSlot.teamA}
                  limit={selectedGame.teamALimit}
                  onJoin={() => handleJoinTeam("TEAM_A")}
                />

                <TeamBox
                  title="Team B"
                  players={selectedSlot.teamB}
                  limit={selectedGame.teamBLimit}
                  onJoin={() => handleJoinTeam("TEAM_B")}
                />
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
};

const TeamBox = ({ title, players, limit, onJoin }) => {
  const available = Math.max((limit || 0) - players.length, 0);
  const isFull = available === 0;

  return (
    <div className="team-card">
      <div className="team-card-header">
        <h3>{title}</h3>
        <span>
          {available}/{limit || 0} available
        </span>
      </div>

      {players.length === 0 ? (
        <p className="empty-text">No members joined</p>
      ) : (
        <ul className="player-list">
          {players.map((player) => (
            <li key={player.id}>{player.user.name}</li>
          ))}
        </ul>
      )}

      <button className="primary-btn" onClick={onJoin} disabled={isFull}>
        {isFull ? `${title} Full` : `Book / Join ${title}`}
      </button>
    </div>
  );
};

export default EmployeeBookingLink;
