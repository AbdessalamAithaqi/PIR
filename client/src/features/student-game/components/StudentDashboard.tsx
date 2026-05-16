import type { Dispatch, SetStateAction } from "react";
import { tabs } from "../constants";
import type { GameDetails, GameSummary, Player, StandingRow, StudentTab, TeamSummary } from "../types";
import { cn, formatMoney } from "../utils";
import { LeaderboardTab } from "./LeaderboardTab";
import { MarketTab } from "./MarketTab";
import { MarketingTab } from "./MarketingTab";
import { ReportTab } from "./ReportTab";
import { TeamTab } from "./TeamTab";
import { Badge, Button, Card, ErrorToast } from "./ui";

export function StudentDashboard({
  game,
  team,
  activeTab,
  setActiveTab,
  lineup,
  bench,
  selectedLineupId,
  setSelectedLineupId,
  swapPlayer,
  ready,
  bids,
  setBids,
  totalReserved,
  marketingSpend,
  setMarketingSpend,
  totalMarketing,
  standings,
  gameDetails,
  onBid,
  onMarketing,
  onReady,
  onRefresh,
  onLeaveGame,
  refreshing,
  error,
  onDismissError,
  decisionOpen,
}: {
  game: GameSummary;
  team: TeamSummary;
  activeTab: StudentTab;
  setActiveTab: (tab: StudentTab) => void;
  lineup: Player[];
  bench: Player[];
  selectedLineupId: string | null;
  setSelectedLineupId: (id: string | null) => void;
  swapPlayer: (player: Player) => void;
  ready: boolean;
  bids: Record<string, number>;
  setBids: Dispatch<SetStateAction<Record<string, number>>>;
  totalReserved: number;
  marketingSpend: Record<string, number>;
  setMarketingSpend: Dispatch<SetStateAction<Record<string, number>>>;
  totalMarketing: number;
  standings: StandingRow[];
  gameDetails: GameDetails | null;
  onBid: (playerId: string, amount: number) => void;
  onMarketing: (spend: Record<string, number>) => void;
  onReady: () => void;
  onRefresh: () => void;
  onLeaveGame: () => void;
  refreshing: boolean;
  error: string;
  onDismissError: () => void;
  decisionOpen: boolean;
}) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {error && <ErrorToast message={error} onDismiss={onDismissError} />}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm text-slate-500">{game.name}</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">{team.name}</h1>
              <Badge>{decisionOpen ? "Decision open" : "Locked"}</Badge>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="grid grid-cols-2 gap-3 sm:w-auto">
              <Metric label="Fans" value={team.fans.toLocaleString()} />
              <Metric label="Budget" value={formatMoney(team.budget)} />
            </div>
            <Button type="button" variant="secondary" onClick={onLeaveGame}>
              Leave game
            </Button>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950",
                activeTab === tab.id && "bg-slate-950 text-white hover:bg-slate-950 hover:text-white",
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === "team" && (
          <TeamTab
            lineup={lineup}
            bench={bench}
            selectedLineupId={selectedLineupId}
            setSelectedLineupId={setSelectedLineupId}
            swapPlayer={swapPlayer}
            ready={ready}
            onReady={onReady}
            decisionOpen={decisionOpen}
          />
        )}
        {activeTab === "market" && (
          <MarketTab
            team={team}
            market={gameDetails?.market ?? []}
            serverBids={gameDetails?.bids ?? []}
            bids={bids}
            setBids={setBids}
            totalReserved={totalReserved}
            onBid={onBid}
            onRefresh={onRefresh}
            refreshing={refreshing}
            decisionOpen={decisionOpen}
          />
        )}
        {activeTab === "marketing" && (
          <MarketingTab
            team={team}
            marketingSpend={marketingSpend}
            setMarketingSpend={setMarketingSpend}
            totalMarketing={totalMarketing}
            onMarketing={onMarketing}
            decisionOpen={decisionOpen}
          />
        )}
        {activeTab === "leaderboard" && (
          <LeaderboardTab game={game} standings={standings} results={gameDetails?.results ?? []} />
        )}
        {activeTab === "report" && <ReportTab standings={standings} results={gameDetails?.results ?? []} />}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="min-w-36 px-4 py-3">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </Card>
  );
}
