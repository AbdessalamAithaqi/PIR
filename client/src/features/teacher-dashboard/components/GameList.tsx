import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { formatStatus, useI18n } from "../../../i18n";
import type { GameInstance } from "../types";
import { Badge } from "./ui";
import { DeleteIcon } from "./DeleteIcon";

export function GameList({
  games,
  onDeleteGame,
}: {
  games: GameInstance[];
  onDeleteGame: (gameId: string) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="font-medium">{t("teacherDashboard.existingGames")}</h2>
      </div>
      {games.length === 0 ? (
        <p className="px-4 py-8 text-sm text-slate-500">{t("teacherDashboard.empty")}</p>
      ) : (
        <div className="divide-y divide-slate-200">
          {games.map((game) => (
            <GameListItem key={game.id} game={game} onDeleteGame={onDeleteGame} />
          ))}
        </div>
      )}
    </div>
  );
}

function GameListItem({
  game,
  onDeleteGame,
}: {
  game: GameInstance;
  onDeleteGame: (gameId: string) => void;
}) {
  const { t } = useI18n();

  function handleDelete(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (!confirm(t("teacherDashboard.deleteConfirm"))) {
      return;
    }

    onDeleteGame(game.id);
  }

  return (
    <Link
      to={`/teacher/games/${game.id}`}
      className="grid gap-3 px-4 py-4 text-slate-950 no-underline transition hover:bg-slate-50 sm:grid-cols-[1fr_auto] sm:items-center"
    >
      <div>
        <p className="font-medium">{game.name}</p>
        <p className="mt-1 text-sm text-slate-500">
          {t("teacherDashboard.gameMeta", {
            round: game.currentRound,
            status: formatStatus(game.status, t),
            teams: game._count.teams,
          })}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-lg font-semibold">{game.joinCode}</span>
        <Badge>{t("common.open")}</Badge>
        <button
          type="button"
          onClick={handleDelete}
          className="ml-2 flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
          title={t("teacherDashboard.deleteGame")}
        >
          <DeleteIcon />
        </button>
      </div>
    </Link>
  );
}
