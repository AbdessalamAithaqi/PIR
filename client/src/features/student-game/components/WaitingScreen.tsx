import { useI18n } from "../../../i18n";
import type { GameSummary } from "../types";
import { Button, Card } from "./ui";

export function WaitingScreen({ game, onLeaveGame }: { game: GameSummary; onLeaveGame: () => void }) {
  const { t } = useI18n();

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-950">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950" />
        <h1 className="text-2xl font-semibold">{t("student.waiting.title")}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {t("student.waiting.description", { gameName: game.name })}
        </p>
        <Button type="button" variant="secondary" onClick={onLeaveGame} className="mt-6 w-full">
          {t("student.leaveGame")}
        </Button>
      </Card>
    </main>
  );
}
