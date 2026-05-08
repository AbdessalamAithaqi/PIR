import { useEffect, useState } from "react";

type GameSummary = {
  id: string;
  name: string;
  joinCode: string;
  status: string;
};

type TeamAssignment = {
  id: string;
  name: string;
  budget: number;
  fans: number;
};

type StudentScreen = "join" | "waiting" | "dashboard";

const STUDENT_STORAGE_KEY = "pir-demo-student-id";

function getDemoStudentId() {
  const storedId = window.localStorage.getItem(STUDENT_STORAGE_KEY);
  if (storedId) return storedId;

  const newId = `student-${crypto.randomUUID()}`;
  window.localStorage.setItem(STUDENT_STORAGE_KEY, newId);
  return newId;
}

export function StudentJoinPage() {
  const [screen, setScreen] = useState<StudentScreen>("join");
  const [joinCode, setJoinCode] = useState("");
  const [game, setGame] = useState<GameSummary | null>(null);
  const [team, setTeam] = useState<TeamAssignment | null>(null);
  const [studentId] = useState(getDemoStudentId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function joinGame(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedJoinCode = joinCode.trim().toUpperCase();

    if (!trimmedJoinCode) {
      setError("Enter a class code to join.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/games/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          joinCode: trimmedJoinCode,
          studentId,
          studentName: "Demo Student",
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Invalid class code or game is not accepting participants.");
      }

      if (!data?.game) {
        throw new Error("Unable to join this game.");
      }

      setGame(data.game);
      setScreen("waiting");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to join this game.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (screen !== "waiting" || !game) return;

    let active = true;
    const gameId = game.id;

    async function checkAssignment() {
      try {
        const response = await fetch(
          `/api/games/${gameId}/assignment?studentId=${encodeURIComponent(studentId)}`,
        );
        if (!response.ok) return;

        const data = await response.json();
        if (active && data.assigned && data.team) {
          setTeam(data.team);
          setScreen("dashboard");
        }
      } catch (err) {
        console.error("Failed to check assignment:", err);
      }
    }

    checkAssignment();
    const intervalId = window.setInterval(checkAssignment, 3000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [game, screen, studentId]);

  if (screen === "waiting" && game) {
    return (
      <main className="min-h-screen bg-white text-black">
        <section className="flex min-h-screen items-center justify-center px-6">
          <h1 className="text-center text-5xl font-normal tracking-normal sm:text-6xl">
            Waiting to join...
          </h1>
        </section>
      </main>
    );
  }

  if (screen === "dashboard" && game && team) {
    return (
      <main className="min-h-screen bg-gray-50 text-gray-950">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-5">
          <div>
            <p className="text-sm text-gray-500">{game.name}</p>
            <h1 className="text-3xl font-bold">{team.name}</h1>
          </div>
          <div className="flex gap-8 text-right">
            <div>
              <p className="text-sm text-gray-500">Fans</p>
              <p className="text-xl font-semibold">{team.fans.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Budget</p>
              <p className="text-xl font-semibold">
                {team.budget.toLocaleString(undefined, {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>
        </header>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="flex min-h-screen items-center justify-center px-6">
        <form
          onSubmit={joinGame}
          className="flex w-full max-w-3xl flex-col items-stretch gap-4 sm:flex-row sm:items-start"
        >
          <div className="flex-1">
            <label htmlFor="class-code" className="sr-only">
              Enter class code
            </label>
            <input
              id="class-code"
              type="text"
              value={joinCode}
              onChange={(event) => {
                setJoinCode(event.target.value.toUpperCase());
                setError("");
              }}
              placeholder="Code"
              autoComplete="off"
              autoCapitalize="characters"
              maxLength={12}
              className="h-24 w-full rounded-2xl border border-black bg-white px-8 text-center text-6xl font-normal outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              aria-describedby={error ? "join-error" : undefined}
              aria-invalid={Boolean(error)}
            />
            {error && (
              <p id="join-error" className="mt-3 text-center text-base text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="h-24 rounded-2xl border border-black bg-white px-7 text-5xl font-normal text-black transition hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-56"
          >
            {submitting ? "Joining" : "Enter"}
          </button>
        </form>
      </section>
    </main>
  );
}
