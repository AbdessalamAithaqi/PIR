import type { GameSummary, RoundAction, Team } from "../types";
import { Badge, Button, Card } from "./ui";

export function RoundManagementTab({
  game,
  teams,
  saving,
  onRoundAction,
}: {
  game: GameSummary;
  teams: Team[];
  saving: boolean;
  onRoundAction: (action: RoundAction) => void;
}) {
  const readyStates = teams.slice(0, 4).map((team) => Boolean(team.ready));
  const readyCount = readyStates.filter(Boolean).length;

  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <Card className="grid content-start gap-3 p-4">
        <Button type="button" disabled={saving} onClick={() => onRoundAction("launch")}>
          Launch
        </Button>
        <Button type="button" disabled={saving} onClick={() => onRoundAction("next")} variant="secondary">
          Move to next round
        </Button>
        <Button type="button" disabled={saving} onClick={() => onRoundAction("stop")} variant="secondary">
          Stop
        </Button>
      </Card>

      <Card className="p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Round {game.currentRound} / 6</h2>
            <p className="mt-1 text-sm text-slate-500">Current state: {game.status}</p>
          </div>
          <Badge>{game.status}</Badge>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {readyStates.map((ready, index) => (
            <div
              key={teams[index]?.id ?? index}
              className="flex h-14 w-14 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xl font-semibold"
            >
              {ready ? "✓" : "×"}
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Ready teams {readyCount} / {teams.length}
        </p>
      </Card>
    </div>
  );
}
