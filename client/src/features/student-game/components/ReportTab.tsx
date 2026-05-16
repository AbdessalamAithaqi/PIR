import type { MatchResult, StandingRow } from "../types";
import { formatMoney } from "../utils";
import { Card } from "./ui";

export function ReportTab({ standings, results }: { standings: StandingRow[]; results: MatchResult[] }) {
  const latestResults = results.slice(-4).reverse();

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="font-semibold">Report</h2>
        <p className="text-sm text-slate-500">Historical performance snapshot.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Place</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Fans</th>
              <th className="px-4 py-3">Money</th>
              <th className="px-4 py-3">Result</th>
              <th className="px-4 py-3">Growth</th>
              <th className="px-4 py-3">Events</th>
              <th className="px-4 py-3">Round</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {standings.map((standing, index) => {
              const teamResult = latestResults.find(
                (result) => result.teamAId === standing.team.id || result.teamBId === standing.team.id,
              );
              const outcome =
                teamResult?.teamAId === standing.team.id
                  ? teamResult.resultA
                  : teamResult?.teamBId === standing.team.id
                    ? teamResult.resultB
                    : "Pending";
              const fanDelta =
                teamResult?.teamAId === standing.team.id
                  ? teamResult.fanDeltaA
                  : teamResult?.teamBId === standing.team.id
                    ? teamResult.fanDeltaB
                    : 0;

              return (
                <tr key={standing.team.id}>
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-medium">{standing.team.name}</td>
                  <td className="px-4 py-3">{standing.team.fans.toLocaleString()}</td>
                  <td className="px-4 py-3">{formatMoney(standing.team.budget)}</td>
                  <td className="px-4 py-3 capitalize">{outcome}</td>
                  <td className="px-4 py-3">
                    {fanDelta > 0 ? "+" : ""}
                    {fanDelta.toLocaleString()} fans
                  </td>
                  <td className="px-4 py-3">0</td>
                  <td className="px-4 py-3">{teamResult?.roundNumber ?? standing.played}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
