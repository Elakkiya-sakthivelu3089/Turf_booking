import { useEffect, useState } from "react";
import { bookingService } from "../services/bookingService";

const BookingPage = ({ title = "Turf Bookings", audience = "Employee booking" }) => {
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [games, setGames] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadBookings = async () => {
    try {
      setLoading(true);

      const data = await bookingService.getBookingPage(selectedDate);
      setGames(data.games || []);
    } catch (error) {
      alert(error.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [selectedDate]);

  const categories = [
    {
      name: "INDOOR",
      label: "Indoor",
    },
    {
      name: "OUTDOOR",
      label: "Outdoor",
    },
  ];

  const filteredGames = games.filter(
    (game) => game.category === selectedCategory
  );

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

      const data = await bookingService.getBookingPage(selectedDate);
      setGames(data.games || []);

      const updatedGame = data.games.find((g) => g.id === selectedGame.id);

      const updatedSlot = updatedGame.slots.find(
        (s) => s.startTime === selectedSlot.startTime
      );

      setSelectedGame(updatedGame);
      setSelectedSlot(updatedSlot);
    } catch (error) {
      alert(error.message || "Booking failed");
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
                      setSelectedGame(game);
                      setSelectedSlot(null);
                    }}
                  >
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
                    }`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot.label}
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
