import type { GameSummary, MatchResult, StandingRow } from "../types";
import { Badge, Card } from "./ui";

export function LeaderboardTab({
  game,
  standings,
  results,
}: {
  game: GameSummary;
  standings: StandingRow[];
  results: MatchResult[];
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-1 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Leaderboard</h2>
          <p className="text-sm text-slate-500">Round {game.currentRound ?? 0}</p>
        </div>
        <Badge>Season table</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Place</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">M</th>
              <th className="px-4 py-3">W</th>
              <th className="px-4 py-3">D</th>
              <th className="px-4 py-3">L</th>
              <th className="px-4 py-3">PD</th>
              <th className="px-4 py-3">PTS</th>
              <th className="px-4 py-3">Form</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {standings.map((standing, index) => {
              const teamResults = results
                .filter((result) => result.teamAId === standing.team.id || result.teamBId === standing.team.id)
                .sort((a, b) => b.roundNumber - a.roundNumber)
                .slice(0, 5);

              return (
                <tr key={standing.team.id}>
                  <td className="px-4 py-3 font-medium">{index + 1}</td>
                  <td className="px-4 py-3">{standing.team.name}</td>
                  <td className="px-4 py-3">{standing.played}</td>
                  <td className="px-4 py-3">{standing.wins}</td>
                  <td className="px-4 py-3">{standing.draws}</td>
                  <td className="px-4 py-3">{standing.losses}</td>
                  <td className="px-4 py-3">{standing.pointDiff}</td>
                  <td className="px-4 py-3 font-semibold">{standing.points}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {teamResults.reverse().map((result) => {
                        const outcome = result.teamAId === standing.team.id ? result.resultA : result.resultB;
                        let colorClass = "bg-slate-300";
                        if (outcome === "win") colorClass = "bg-green-500";
                        if (outcome === "loss") colorClass = "bg-red-500";
                        if (outcome === "draw") colorClass = "bg-amber-500";

                        return (
                          <span
                            key={result.id}
                            className={`h-2.5 w-2.5 rounded-full ${colorClass}`}
                            title={outcome.charAt(0).toUpperCase() + outcome.slice(1)}
                          />
                        );
                      })}
                      {Array.from({ length: Math.max(0, 5 - teamResults.length) }).map((_, item) => (
                        <span key={`empty-${item}`} className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
