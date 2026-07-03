import { useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const AdminGames = () => {
  const [categories, setCategories] = useState([]);
  const [games, setGames] = useState([]);

  const [categoryName, setCategoryName] = useState("");
  const [gameName, setGameName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [teamALimit, setTeamALimit] = useState(1);
  const [teamBLimit, setTeamBLimit] = useState(1);

  const [editGameId, setEditGameId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const categoryOptions = Array.from(
    new Map(categories.map((category) => [category.type || category.name.toUpperCase(), category])).values()
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const catRes = await fetch(`${API_BASE_URL}/categories`);
      const gameRes = await fetch(`${API_BASE_URL}/games`);

      const catData = await catRes.json();
      const gameData = await gameRes.json();

      if (!catRes.ok) {
        throw new Error(catData.message || catData.error || "Failed to fetch categories");
      }

      if (!gameRes.ok) {
        throw new Error(gameData.message || gameData.error || "Failed to fetch games");
      }

      setCategories(Array.isArray(catData) ? catData : []);
      setGames(Array.isArray(gameData) ? gameData : []);
    } catch (err) {
      console.error("Fetch data error:", err);
      setError(err.message);
      setCategories([]);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addCategory = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const res = await fetch(`${API_BASE_URL}/categories`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: categoryName.trim(),
    type: categoryName.trim().toUpperCase(),
  }),
});
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to add category");
      }

      setCategoryName("");
      fetchData();
    } catch (err) {
      console.error("Add category error:", err);
      setError(err.message);
    }
  };

  const saveGame = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const url = editGameId
        ? `${API_BASE_URL}/games/${editGameId}`
        : `${API_BASE_URL}/games`;

      const method = editGameId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: gameName.trim(),
          categoryId: Number(categoryId),
          teamALimit: Number(teamALimit),
          teamBLimit: Number(teamBLimit),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to save game");
      }

      setGameName("");
      setCategoryId("");
      setTeamALimit(1);
      setTeamBLimit(1);
      setEditGameId(null);
      fetchData();
    } catch (err) {
      console.error("Save game error:", err);
      setError(err.message);
    }
  };

  const editGame = (game) => {
    setEditGameId(game.id);
    setGameName(game.name);
    setCategoryId(String(game.categoryId));
    setTeamALimit(game.teamALimit || 1);
    setTeamBLimit(game.teamBLimit || 1);
  };

  const deleteGame = async (id) => {
    try {
      setError("");

      const res = await fetch(`${API_BASE_URL}/games/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || "Failed to delete game");
      }

      fetchData();
    } catch (err) {
      console.error("Delete game error:", err);
      setError(err.message);
    }
  };

  const cancelEdit = () => {
    setEditGameId(null);
    setGameName("");
    setCategoryId("");
    setTeamALimit(1);
    setTeamBLimit(1);
  };

  return (
    <main className="app-page admin-games-page">
      <div className="page-header">
        <p className="eyebrow">Admin panel</p>
        <h1>Admin Game Management</h1>
      </div>

      {loading && <p className="loading-text">Loading...</p>}

      {error && (
        <p className="alert-error">
          Error: {error}
        </p>
      )}

      <section className="admin-form-card">
        <h2>Add Category</h2>

        <form className="inline-form" onSubmit={addCategory}>
          <input
            type="text"
            placeholder="Category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />

          <button className="primary-btn" type="submit">Add Category</button>
        </form>
      </section>

      <section className="admin-form-card">
        <h2>{editGameId ? "Edit Game" : "Add Game"}</h2>

        <form className="inline-form" onSubmit={saveGame}>
          <input
            type="text"
            placeholder="Game name"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            required
          />

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Select Category</option>

            {Array.isArray(categoryOptions) &&
              categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.type || category.name}
                </option>
              ))}
          </select>

          <input
            type="number"
            min="1"
            placeholder="Team A members"
            value={teamALimit}
            onChange={(e) => setTeamALimit(e.target.value)}
            required
          />

          <input
            type="number"
            min="1"
            placeholder="Team B members"
            value={teamBLimit}
            onChange={(e) => setTeamBLimit(e.target.value)}
            required
          />

          <button className="primary-btn" type="submit">
            {editGameId ? "Update Game" : "Add Game"}
          </button>

          {editGameId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="secondary-btn"
            >
              Cancel
            </button>
          )}
        </form>
      </section>

      <section className="table-card">
        <h2>Game List</h2>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Game</th>
            <th>Category</th>
            <th>Team A Limit</th>
            <th>Team B Limit</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {Array.isArray(games) && games.length > 0 ? (
            games.map((game) => (
              <tr key={game.id}>
                <td data-label="ID">{game.id}</td>
                <td data-label="Game">{game.name}</td>
                <td data-label="Category">{game.category?.name || "No category"}</td>
                <td data-label="Team A Limit">{game.teamALimit}</td>
                <td data-label="Team B Limit">{game.teamBLimit}</td>
                <td data-label="Action" className="table-actions">
                  <button className="secondary-btn" onClick={() => editGame(game)}>Edit</button>

                  <button
                    className="danger-btn"
                    onClick={() => deleteGame(game.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="empty-cell">
                No games found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </section>
    </main>
  );
};

export default AdminGames;
