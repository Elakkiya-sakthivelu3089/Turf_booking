const GameBox = ({ games, selectedGame, onSelect }) => {
  return (
    <section className="booking-section">
      <h2>Select Game</h2>

      <div className="selection-grid">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => onSelect(game)}
            className={`selection-card compact ${
              selectedGame?.id === game.id ? "is-active game-active" : ""
            }`}
          >
            {game.name}
          </button>
        ))}
      </div>
    </section>
  );
};

export default GameBox;
