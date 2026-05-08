import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type GameInstance = {
  id: string;
  name: string;
  joinCode: string;
  status: string;
  currentRound: number;
  _count: {
    teams: number;
  };
};

const ownerId = "teacher-123";

export function TeacherDashboard() {
  const [games, setGames] = useState<GameInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGames();
  }, []);

  async function fetchGames() {
    try {
      const res = await fetch(`/api/games?ownerId=${ownerId}`);
      if (!res.ok) throw new Error("Failed to fetch games");
      const data = await res.json();
      setGames(data.games);
    } catch (err) {
      setError("Failed to load games");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function createGame() {
    const nextGameNumber = games.length + 1;
    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Game ${nextGameNumber}`, ownerId }),
      });
      if (!res.ok) throw new Error("Failed to create game");

      await fetchGames();
    } catch (err) {
      setError("Failed to create game");
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-white p-12 text-4xl text-black">Loading games...</div>;
  }

  return (
    <main className="min-h-screen bg-white px-10 py-12 text-black sm:px-20">
      <button
        type="button"
        onClick={createGame}
        disabled={creating}
        className="mb-16 rounded-2xl border border-black bg-white px-12 py-8 text-6xl font-normal transition hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {creating ? "Creating" : "New game"}
      </button>

      {error && (
        <p className="mb-8 text-2xl text-red-600" role="alert">
          {error}
        </p>
      )}

      <section className="grid gap-10">
        {games.length === 0 ? (
          <p className="text-4xl text-gray-500">No games created yet.</p>
        ) : (
          games.map((game) => (
            <Link
              key={game.id}
              to={`/teacher/games/${game.id}`}
              className="grid min-h-36 grid-cols-1 items-center rounded-2xl border border-black px-14 py-7 text-black no-underline transition hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-100 md:grid-cols-[1fr_auto] md:gap-12"
            >
              <span className="text-6xl font-normal">{game.name}</span>
              <span className="font-mono text-6xl font-normal tracking-wide">{game.joinCode}</span>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}
