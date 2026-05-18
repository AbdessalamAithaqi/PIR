import { useI18n } from "../../../i18n";
import type { MatchResult, Team } from "../types";
import { formatMoney, sortStandings } from "../utils";
import { Card } from "./ui";

export function LeaderboardTab({ teams, results }: { teams: Team[]; results: MatchResult[] }) {
  const { t } = useI18n();
  const standings = sortStandings(teams);

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="font-semibold">{t("common.leaderboard")}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">{t("common.team")}</th>
              <th className="px-4 py-3">W</th>
              <th className="px-4 py-3">D</th>
              <th className="px-4 py-3">L</th>
              <th className="px-4 py-3">PD</th>
              <th className="px-4 py-3">PTS</th>
              <th className="px-4 py-3">{t("common.fans")}</th>
              <th className="px-4 py-3">{t("common.budget")}</th>
              <th className="px-4 py-3">{t("common.form")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {standings.map((team) => {
              const teamResults = results
                .filter((result) => result.teamAId === team.id || result.teamBId === team.id)
                .sort((a, b) => b.roundNumber - a.roundNumber)
                .slice(0, 5);

              return (
                <tr key={team.id}>
                  <td className="px-4 py-3 font-medium">{team.name}</td>
                  <td className="px-4 py-3">{team.wins ?? 0}</td>
                  <td className="px-4 py-3">{team.draws ?? 0}</td>
                  <td className="px-4 py-3">{team.losses ?? 0}</td>
                  <td className="px-4 py-3">{team.pointDiff ?? 0}</td>
                  <td className="px-4 py-3 font-semibold">{team.points ?? 0}</td>
                  <td className="px-4 py-3">{team.fans.toLocaleString()}</td>
                  <td className="px-4 py-3">{formatMoney(team.budget)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {teamResults.reverse().map((result) => {
                        const outcome = result.teamAId === team.id ? result.resultA : result.resultB;
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
                      {Array.from({ length: Math.max(0, 5 - teamResults.length) }).map((_, index) => (
                        <span key={`empty-${index}`} className="h-2.5 w-2.5 rounded-full bg-slate-200" />
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
