import { useCallback, useEffect, useState } from "react";
import { bookingService } from "../services/bookingService";
import GameIcon from "../components/bookings/GameIcon";

const BookingPage = ({ title = "Turf Bookings", audience = "Employee booking" }) => {
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [games, setGames] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);

      const data = await bookingService.getBookingPage(selectedDate);
      setGames(data.games || []);
    } catch (error) {
      alert(error.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const categories = Array.from(
    new Set(games.map((game) => game.category).filter(Boolean))
  ).map((name) => ({
    name,
    label: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
  }));

  const filteredGames = games.filter(
    (game) => game.category === selectedCategory
  );
  const gameFilterOptions = selectedCategory ? filteredGames : games;

  const selectGame = (game) => {
    setSelectedCategory(game.category);
    setSelectedGame(game);
    setSelectedSlot(null);
  };

  const refreshSelectedBooking = async () => {
    const data = await bookingService.getBookingPage(selectedDate);
    setGames(data.games || []);

    if (!selectedGame || !selectedSlot) return;

    const updatedGame = data.games.find((game) => game.id === selectedGame.id);
    const updatedSlot = updatedGame?.slots.find(
      (slot) => slot.startTime === selectedSlot.startTime
    );

    setSelectedGame(updatedGame || null);
    setSelectedSlot(updatedSlot || null);
  };

  const handleJoinTeam = async (team) => {
    try {
      await bookingService.joinBooking({
        gameId: selectedGame.id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        team,
      });

      alert("Slot booked successfully");
      await refreshSelectedBooking();
    } catch (error) {
      alert(error.message || "Booking failed");
      await refreshSelectedBooking();
    }
  };

  return (
    <main className="app-page booking-page">
      <div className="page-header">
        <p className="eyebrow">{audience}</p>
        <h1>{title}</h1>
      </div>

      <div className="filter-bar">
        <label>Select Date: </label>
        <input
          type="date"
          value={selectedDate}
          min={today}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setSelectedCategory(null);
            setSelectedGame(null);
            setSelectedSlot(null);
          }}
        />
        <label>Category</label>
        <select
          value={selectedCategory || ""}
          onChange={(e) => {
            setSelectedCategory(e.target.value || null);
            setSelectedGame(null);
            setSelectedSlot(null);
          }}
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.label}
            </option>
          ))}
        </select>
        <label>Game</label>
        <select
          value={selectedGame?.id || ""}
          onChange={(e) => {
            const game = games.find((item) => item.id === Number(e.target.value));
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

      {loading && <p className="loading-text">Loading...</p>}

      {!loading && (
        <>
          <section className="booking-section">
            <h2>Choose Category</h2>

            <div className="selection-grid">
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  className={`selection-card ${
                    selectedCategory === cat.name ? "is-active category-active" : ""
                  }`}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setSelectedGame(null);
                    setSelectedSlot(null);
                  }}
                >
                  <h3>{cat.label}</h3>
                </div>
              ))}
            </div>
          </section>

          {selectedCategory && (
            <section className="booking-section">
              <h2>{selectedCategory} Games</h2>

              {filteredGames.length === 0 && (
                <p className="empty-text">No games found under {selectedCategory}</p>
              )}

              <div className="selection-grid">
                {filteredGames.map((game) => (
                  <div
                    key={game.id}
                    className={`selection-card ${
                      selectedGame?.id === game.id ? "is-active game-active" : ""
                    }`}
                  onClick={() => {
                    selectGame(game);
                  }}
                >
                    <GameIcon name={game.name} />
                    <h4>{game.name}</h4>
                  </div>
                ))}
              </div>
            </section>
          )}

          {selectedGame && (
            <section className="booking-section">
              <h2>{selectedGame.name} Slots</h2>

              <div className="slot-grid">
                {selectedGame.slots.map((slot) => (
                  <button
                    key={slot.startTime}
                    className={`slot-btn ${
                      selectedSlot?.startTime === slot.startTime ? "is-active" : ""
                    } ${slot.isBreak ? "is-break" : ""}`}
                    disabled={slot.isBreak}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <span>{slot.label}</span>
                    {slot.isBreak && <small>{slot.reason}</small>}
                  </button>
                ))}
              </div>
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
        <span>{available}/{limit || 0} available</span>
      </div>

      {players.length === 0 ? (
        <p className="empty-text">No members joined</p>
      ) : (
        <ul className="player-list">
          {players.map((p) => (
            <li key={p.id}>{p.user.name}</li>
          ))}
        </ul>
      )}

      <button className="primary-btn" onClick={onJoin} disabled={isFull}>
        {isFull ? `${title} Full` : `Book / Join ${title}`}
      </button>
    </div>
  );
};

export default BookingPage;
