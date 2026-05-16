import type { GameDetails } from "../types";
import { Card } from "./ui";

export function ReportTab({ details }: { details: GameDetails }) {
  const assignedStudents = details.participants.filter((participant) => participant.teamId).length;
  const latestRound = details.results[details.results.length - 1]?.roundNumber ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <ReportTile label="Students" value={details.participants.length} />
      <ReportTile label="Assigned" value={assignedStudents} />
      <ReportTile label="Rounds played" value={latestRound} />
      <ReportTile label="Matches" value={details.results.length} />
    </div>
  );
}

function ReportTile({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </Card>
  );
}
