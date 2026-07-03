const TeamBox = ({ booking, onJoin }) => {
  const teamA = booking?.teamA || [];
  const teamB = booking?.teamB || [];

  return (
    <section className="booking-section">
      <h2>Teams</h2>

      <div className="team-grid">
        <div className="team-card">
          <h3>Team A</h3>

          {teamA.length === 0 ? (
            <p className="empty-text">No players yet</p>
          ) : (
            teamA.map((player) => (
              <p key={player.id}>{player.name || player.user?.name}</p>
            ))
          )}

          <button className="primary-btn" onClick={() => onJoin("TEAM_A")}>
            Join Team A
          </button>
        </div>

        <div className="team-card">
          <h3>Team B</h3>

          {teamB.length === 0 ? (
            <p className="empty-text">No players yet</p>
          ) : (
            teamB.map((player) => (
              <p key={player.id}>{player.name || player.user?.name}</p>
            ))
          )}

          <button className="primary-btn" onClick={() => onJoin("TEAM_B")}>
            Join Team B
          </button>
        </div>
      </div>
    </section>
  );
};

export default TeamBox;
