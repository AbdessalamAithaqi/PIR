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

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Button({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}

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
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-950">
        <div className="mx-auto max-w-5xl text-sm text-slate-500">Loading games...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge>Teacher console</Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Game management</h1>
            <p className="mt-1 text-sm text-slate-500">
              Create leagues and share join codes with students.
            </p>
          </div>
          <Button type="button" onClick={createGame} disabled={creating}>
            {creating ? "Creating..." : "Create game"}
          </Button>
        </div>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="font-medium">Existing games</h2>
          </div>
          {games.length === 0 ? (
            <p className="px-4 py-8 text-sm text-slate-500">No games created yet.</p>
          ) : (
            <div className="divide-y divide-slate-200">
              {games.map((game) => (
                <Link
                  key={game.id}
                  to={`/teacher/games/${game.id}`}
                  className="grid gap-3 px-4 py-4 text-slate-950 no-underline transition hover:bg-slate-50 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div>
                    <p className="font-medium">{game.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Round {game.currentRound} · {game.status} · {game._count.teams} teams
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-semibold">{game.joinCode}</span>
                    <Badge>Open</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
