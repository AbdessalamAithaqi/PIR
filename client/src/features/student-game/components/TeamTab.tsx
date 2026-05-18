import { useI18n } from "../../../i18n";
import type { Player } from "../types";
import { playerPositions } from "../constants";
import { cn } from "../utils";
import { Badge, Button, Card } from "./ui";

export function TeamTab({
  lineup,
  bench,
  selectedLineupId,
  setSelectedLineupId,
  swapPlayer,
  ready,
  onReady,
  decisionOpen,
}: {
  lineup: Player[];
  bench: Player[];
  selectedLineupId: string | null;
  setSelectedLineupId: (id: string | null) => void;
  swapPlayer: (player: Player) => void;
  ready: boolean;
  onReady: () => void;
  decisionOpen: boolean;
}) {
  const { t } = useI18n();

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{t("student.squad.title")}</h2>
          <p className="text-sm text-slate-500">
            {decisionOpen ? t("student.squad.instructions") : t("student.squad.locked")}
          </p>
        </div>
        <Button type="button" onClick={onReady} disabled={!decisionOpen} variant={ready ? "secondary" : "primary"}>
          {ready ? t("student.squad.readySubmitted") : t("student.squad.markReady")}
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="font-medium">{t("student.squad.starting")}</h3>
          </div>
          <div className="relative min-h-[680px] bg-emerald-950/90 p-4">
            <div className="absolute inset-4 rounded-lg border border-white/20" />
            <div className="absolute inset-x-12 top-1/2 border-t border-white/20" />
            {lineup.map((player, index) => (
              <button
                key={`${player.id}-${index}`}
                type="button"
                disabled={!decisionOpen}
                onClick={() => setSelectedLineupId(player.id)}
                className={cn(
                  "absolute w-28 -translate-x-1/2 rounded-md border bg-white/95 px-2 py-2 text-left text-xs shadow-sm transition hover:bg-white",
                  selectedLineupId === player.id ? "border-amber-400 ring-2 ring-amber-300" : "border-slate-200",
                )}
                style={playerPositions[index]}
              >
                <span className="block truncate font-semibold">{player.name}</span>
                <span className="block truncate text-slate-500">{player.position}</span>
                <span className="mt-1 inline-flex rounded bg-slate-100 px-1.5 py-0.5 font-medium">
                  {player.rating}
                </span>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="font-medium">{t("student.squad.bench", { count: bench.length })}</h3>
          </div>
          <div className="grid gap-2 p-3">
            {bench.map((player) => (
              <button
                key={player.id}
                type="button"
                onClick={() => swapPlayer(player)}
                disabled={!decisionOpen || !selectedLineupId}
                className="rounded-md border border-slate-200 bg-white p-3 text-left transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{player.name}</p>
                    <p className="text-sm text-slate-500">{player.position}</p>
                  </div>
                  <Badge>{player.rating}</Badge>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
