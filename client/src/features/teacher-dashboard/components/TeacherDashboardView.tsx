import type { GameInstance } from "../types";
import { GameList } from "./GameList";
import { Badge, Button } from "./ui";

export function TeacherDashboardView({
  games,
  creating,
  error,
  onCreateGame,
  onDeleteGame,
}: {
  games: GameInstance[];
  creating: boolean;
  error: string;
  onCreateGame: () => void;
  onDeleteGame: (gameId: string) => void;
}) {
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
          <Button type="button" onClick={onCreateGame} disabled={creating}>
            {creating ? "Creating..." : "Create game"}
          </Button>
        </div>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <GameList games={games} onDeleteGame={onDeleteGame} />
      </section>
    </main>
  );
}
