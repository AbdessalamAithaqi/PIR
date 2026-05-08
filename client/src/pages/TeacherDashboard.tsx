import { useState, useEffect } from "react";

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

export function TeacherDashboard() {
  const [games, setGames] = useState<GameInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGameName, setNewGameName] = useState("");
  const [error, setError] = useState("");

  const ownerId = "teacher-123"; // Mock ID for development

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

  async function createGame(e: React.FormEvent) {
    e.preventDefault();
    if (!newGameName.trim()) return;

    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGameName, ownerId })
      });
      if (!res.ok) throw new Error("Failed to create game");
      
      setNewGameName("");
      fetchGames(); // Refresh the list
    } catch (err) {
      setError("Failed to create game");
      console.error(err);
    }
  }

  if (loading) return <div className="p-8">Loading games...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Teacher Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Create New Game</h2>
        <form onSubmit={createGame} className="flex gap-4">
          <input
            type="text"
            value={newGameName}
            onChange={(e) => setNewGameName(e.target.value)}
            placeholder="e.g. Class 101 Spring 2026"
            className="flex-1 border rounded px-4 py-2"
            maxLength={50}
          />
          <button 
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-medium transition-colors"
          >
            Create Game
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Games</h2>
        {games.length === 0 ? (
          <p className="text-gray-500">No games created yet.</p>
        ) : (
          <div className="grid gap-4">
            {games.map(game => (
              <div key={game.id} className="bg-white shadow rounded-lg p-6 border border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">{game.name}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    Status: <span className="font-medium text-gray-700">{game.status}</span> • 
                    Round: <span className="font-medium text-gray-700">{game.currentRound} / 6</span> • 
                    Teams: <span className="font-medium text-gray-700">{game._count.teams} / 4</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Join Code</div>
                  <div className="text-2xl font-mono font-bold tracking-widest text-blue-600">{game.joinCode}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
