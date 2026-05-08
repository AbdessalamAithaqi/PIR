import { useEffect, useMemo, useState } from "react";

type GameSummary = {
  id: string;
  name: string;
  joinCode: string;
  status: string;
  currentRound?: number;
};

type TeamAssignment = {
  id: string;
  name: string;
  budget: number;
  fans: number;
};

type TeamSummary = TeamAssignment & {
  members: { id: string; user: { id: string; name: string } }[];
};

type GameDetails = {
  game: Required<GameSummary>;
  teams: TeamSummary[];
};

type StudentScreen = "join" | "waiting" | "dashboard";
type StudentTab = "team" | "market" | "marketing" | "leaderboard" | "report";

type Player = {
  id: string;
  name: string;
  position: string;
  rating: number;
};

const STUDENT_STORAGE_KEY = "pir-demo-student-id";
const JOINED_GAME_STORAGE_KEY = "pir-demo-joined-game";

const tabs: { id: StudentTab; label: string }[] = [
  { id: "team", label: "Team" },
  { id: "market", label: "Market" },
  { id: "marketing", label: "Marketing" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "report", label: "Report" },
];

const startingPlayers: Player[] = [
  { id: "p1", name: "Tesseyre", position: "Loosehead", rating: 74 },
  { id: "p2", name: "Siciliano", position: "Hooker", rating: 78 },
  { id: "p3", name: "Tafili", position: "Tighthead", rating: 76 },
  { id: "p4", name: "Omby", position: "Lock", rating: 73 },
  { id: "p5", name: "Griffiths", position: "Lock", rating: 79 },
  { id: "p6", name: "Mendy", position: "Flanker", rating: 80 },
  { id: "p7", name: "Keletoana", position: "Number 8", rating: 82 },
  { id: "p8", name: "Geneste", position: "Flanker", rating: 77 },
  { id: "p9", name: "Guyon", position: "Scrum-half", rating: 75 },
  { id: "p10", name: "Bros", position: "Fly-half", rating: 81 },
  { id: "p11", name: "Rayeur", position: "Wing", rating: 72 },
  { id: "p12", name: "Masse", position: "Centre", rating: 76 },
  { id: "p13", name: "Biastoto", position: "Centre", rating: 78 },
  { id: "p14", name: "Noon", position: "Wing", rating: 79 },
  { id: "p15", name: "Lewis", position: "Fullback", rating: 83 },
];

const benchPlayers: Player[] = [
  { id: "b1", name: "Alaguy", position: "Prop", rating: 70 },
  { id: "b2", name: "Guillendas", position: "Lock", rating: 69 },
  { id: "b3", name: "Hull", position: "Centre", rating: 71 },
  { id: "b4", name: "Camara", position: "Wing", rating: 72 },
  { id: "b5", name: "Broncan", position: "Hooker", rating: 68 },
  { id: "b6", name: "Malaterre", position: "Flanker", rating: 70 },
  { id: "b7", name: "Peyramard", position: "Scrum-half", rating: 67 },
  { id: "b8", name: "Molala", position: "Fullback", rating: 73 },
];

const marketPlayers: Player[] = [
  { id: "m1", name: "Ramos", position: "Fullback", rating: 88 },
  { id: "m2", name: "Dupont", position: "Scrum-half", rating: 94 },
  { id: "m3", name: "Ntamack", position: "Fly-half", rating: 89 },
  { id: "m4", name: "Atonio", position: "Prop", rating: 85 },
  { id: "m5", name: "Marchand", position: "Hooker", rating: 87 },
  { id: "m6", name: "Woki", position: "Lock", rating: 84 },
];

const marketingOptions = [
  { id: "campus", name: "Campus campaign", cost: 4000, impact: "+8% fan growth chance" },
  { id: "merch", name: "Merch stand", cost: 6500, impact: "+12% revenue chance" },
  { id: "social", name: "Social media push", cost: 3000, impact: "+5% fans this round" },
  { id: "sponsor", name: "Local sponsor event", cost: 9000, impact: "+15% high reward chance" },
  { id: "family", name: "Family match day", cost: 5500, impact: "+10% retention chance" },
];

const playerPositions = [
  { top: "5%", left: "18%" },
  { top: "5%", left: "45%" },
  { top: "5%", left: "72%" },
  { top: "20%", left: "32%" },
  { top: "20%", left: "59%" },
  { top: "35%", left: "22%" },
  { top: "35%", left: "45%" },
  { top: "35%", left: "68%" },
  { top: "51%", left: "38%" },
  { top: "51%", left: "58%" },
  { top: "63%", left: "16%" },
  { top: "66%", left: "34%" },
  { top: "66%", left: "58%" },
  { top: "63%", left: "78%" },
  { top: "82%", left: "47%" },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getDemoStudentId() {
  const storedId = window.localStorage.getItem(STUDENT_STORAGE_KEY);
  if (storedId) return storedId;

  const newId = `student-${crypto.randomUUID()}`;
  window.localStorage.setItem(STUDENT_STORAGE_KEY, newId);
  return newId;
}

function formatMoney(value: number) {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

function Button({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-slate-950 text-white hover:bg-slate-800",
        variant === "secondary" && "border border-slate-200 bg-white text-slate-950 hover:bg-slate-50",
        variant === "ghost" && "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
        className,
      )}
    >
      {children}
    </button>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-slate-200 bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StudentJoinPage() {
  const [screen, setScreen] = useState<StudentScreen>("join");
  const [activeTab, setActiveTab] = useState<StudentTab>("team");
  const [joinCode, setJoinCode] = useState("");
  const [game, setGame] = useState<GameSummary | null>(null);
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
  const [team, setTeam] = useState<TeamAssignment | null>(null);
  const [lineup, setLineup] = useState(startingPlayers);
  const [bench, setBench] = useState(benchPlayers);
  const [selectedLineupId, setSelectedLineupId] = useState<string | null>(null);
  const [bids, setBids] = useState<Record<string, number>>({});
  const [marketingSpend, setMarketingSpend] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);
  const [studentId] = useState(getDemoStudentId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedGame = window.localStorage.getItem(JOINED_GAME_STORAGE_KEY);
    if (!storedGame) return;

    try {
      const parsedGame = JSON.parse(storedGame) as GameSummary;
      setGame(parsedGame);
      setScreen("waiting");
    } catch {
      window.localStorage.removeItem(JOINED_GAME_STORAGE_KEY);
    }
  }, []);

  async function loadGameDetails(gameId: string) {
    const response = await fetch(`/api/games/${gameId}`);
    if (!response.ok) return;
    const data = await response.json();
    setGameDetails(data);
  }

  async function joinGame(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedJoinCode = joinCode.trim().toUpperCase();

    if (!trimmedJoinCode) {
      setError("Enter a class code to join.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/games/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          joinCode: trimmedJoinCode,
          studentId,
          studentName: "Demo Student",
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Invalid class code or game is not accepting participants.");
      }

      if (!data?.game) {
        throw new Error("Unable to join this game.");
      }

      setGame(data.game);
      window.localStorage.setItem(JOINED_GAME_STORAGE_KEY, JSON.stringify(data.game));
      setScreen("waiting");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to join this game.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (screen !== "waiting" || !game) return;

    let active = true;
    const gameId = game.id;

    async function checkAssignment() {
      try {
        const response = await fetch(
          `/api/games/${gameId}/assignment?studentId=${encodeURIComponent(studentId)}`,
        );
        if (!response.ok) return;

        const data = await response.json();
        if (active && data.assigned && data.team) {
          setTeam(data.team);
          await loadGameDetails(gameId);
          setScreen("dashboard");
        }
      } catch (err) {
        console.error("Failed to check assignment:", err);
      }
    }

    checkAssignment();
    const intervalId = window.setInterval(checkAssignment, 3000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [game, screen, studentId]);

  function swapPlayer(benchPlayer: Player) {
    if (!selectedLineupId) return;

    const selectedPlayer = lineup.find((player) => player.id === selectedLineupId);
    if (!selectedPlayer) return;

    setLineup((players) =>
      players.map((player) => (player.id === selectedLineupId ? benchPlayer : player)),
    );
    setBench((players) =>
      players.map((player) => (player.id === benchPlayer.id ? selectedPlayer : player)),
    );
    setSelectedLineupId(null);
    setReady(false);
  }

  const standings = useMemo(
    () =>
      (gameDetails?.teams ?? []).map((standingTeam, index) => ({
        team: standingTeam,
        played: gameDetails?.game.currentRound ?? 0,
        wins: index === 0 ? 1 : 0,
        draws: 0,
        losses: index === 0 ? 0 : 1,
        pointDiff: 18 - index * 7,
        points: index === 0 ? 4 : 0,
      })),
    [gameDetails?.game.currentRound, gameDetails?.teams],
  );

  const totalReserved = Object.values(bids).reduce((sum, bid) => sum + bid, 0);
  const totalMarketing = Object.values(marketingSpend).reduce((sum, spend) => sum + spend, 0);

  if (screen === "waiting" && game) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-950">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950" />
          <h1 className="text-2xl font-semibold">Waiting for team assignment</h1>
          <p className="mt-2 text-sm text-slate-500">
            You joined {game.name}. Keep this page open while the professor places you in a team.
          </p>
        </Card>
      </main>
    );
  }

  if (screen === "dashboard" && game && team) {
    return (
      <StudentDashboard
        game={game}
        team={team}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lineup={lineup}
        bench={bench}
        selectedLineupId={selectedLineupId}
        setSelectedLineupId={setSelectedLineupId}
        swapPlayer={swapPlayer}
        ready={ready}
        setReady={setReady}
        bids={bids}
        setBids={setBids}
        totalReserved={totalReserved}
        marketingSpend={marketingSpend}
        setMarketingSpend={setMarketingSpend}
        totalMarketing={totalMarketing}
        standings={standings}
      />
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-950">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6">
          <Badge>Student access</Badge>
          <h1 className="mt-4 text-2xl font-semibold">Join a game</h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter the class code shared by your professor.
          </p>
        </div>
        <form onSubmit={joinGame} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="class-code" className="text-sm font-medium text-slate-700">
              Class code
            </label>
            <input
              id="class-code"
              type="text"
              value={joinCode}
              onChange={(event) => {
                setJoinCode(event.target.value.toUpperCase());
                setError("");
              }}
              placeholder="ABC123"
              autoComplete="off"
              autoCapitalize="characters"
              maxLength={12}
              className="h-11 rounded-md border border-slate-200 bg-white px-3 font-mono text-lg uppercase outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              aria-describedby={error ? "join-error" : undefined}
              aria-invalid={Boolean(error)}
            />
          </div>
          {error && (
            <p
              id="join-error"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Joining..." : "Join game"}
          </Button>
        </form>
      </Card>
    </main>
  );
}

function StudentDashboard({
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
  setReady,
  bids,
  setBids,
  totalReserved,
  marketingSpend,
  setMarketingSpend,
  totalMarketing,
  standings,
}: {
  game: GameSummary;
  team: TeamAssignment;
  activeTab: StudentTab;
  setActiveTab: (tab: StudentTab) => void;
  lineup: Player[];
  bench: Player[];
  selectedLineupId: string | null;
  setSelectedLineupId: (id: string | null) => void;
  swapPlayer: (player: Player) => void;
  ready: boolean;
  setReady: (ready: boolean) => void;
  bids: Record<string, number>;
  setBids: (bids: Record<string, number>) => void;
  totalReserved: number;
  marketingSpend: Record<string, number>;
  setMarketingSpend: (spend: Record<string, number>) => void;
  totalMarketing: number;
  standings: {
    team: TeamSummary;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    pointDiff: number;
    points: number;
  }[];
}) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm text-slate-500">{game.name}</p>
            <h1 className="text-3xl font-semibold tracking-tight">{team.name}</h1>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:w-auto">
            <Metric label="Fans" value={team.fans.toLocaleString()} />
            <Metric label="Budget" value={formatMoney(team.budget)} />
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
            setReady={setReady}
          />
        )}
        {activeTab === "market" && (
          <MarketTab team={team} bids={bids} setBids={setBids} totalReserved={totalReserved} />
        )}
        {activeTab === "marketing" && (
          <MarketingTab
            team={team}
            marketingSpend={marketingSpend}
            setMarketingSpend={setMarketingSpend}
            totalMarketing={totalMarketing}
          />
        )}
        {activeTab === "leaderboard" && <LeaderboardTab game={game} standings={standings} />}
        {activeTab === "report" && <ReportTab team={team} standings={standings} />}
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

function TeamTab({
  lineup,
  bench,
  selectedLineupId,
  setSelectedLineupId,
  swapPlayer,
  ready,
  setReady,
}: {
  lineup: Player[];
  bench: Player[];
  selectedLineupId: string | null;
  setSelectedLineupId: (id: string | null) => void;
  swapPlayer: (player: Player) => void;
  ready: boolean;
  setReady: (ready: boolean) => void;
}) {
  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Squad</h2>
          <p className="text-sm text-slate-500">Select a starter, then choose a bench player.</p>
        </div>
        <Button type="button" onClick={() => setReady(!ready)} variant={ready ? "secondary" : "primary"}>
          {ready ? "Ready submitted" : "Mark ready"}
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="font-medium">Starting XV</h3>
          </div>
          <div className="relative min-h-[680px] bg-emerald-950/90 p-4">
            <div className="absolute inset-4 rounded-lg border border-white/20" />
            <div className="absolute inset-x-12 top-1/2 border-t border-white/20" />
            {lineup.map((player, index) => (
              <button
                key={`${player.id}-${index}`}
                type="button"
                onClick={() => setSelectedLineupId(player.id)}
                className={cn(
                  "absolute w-28 -translate-x-1/2 rounded-md border bg-white/95 px-2 py-2 text-left text-xs shadow-sm transition hover:bg-white",
                  selectedLineupId === player.id
                    ? "border-amber-400 ring-2 ring-amber-300"
                    : "border-slate-200",
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
            <h3 className="font-medium">Bench</h3>
          </div>
          <div className="grid gap-2 p-3">
            {bench.map((player) => (
              <button
                key={player.id}
                type="button"
                onClick={() => swapPlayer(player)}
                disabled={!selectedLineupId}
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

function MarketTab({
  team,
  bids,
  setBids,
  totalReserved,
}: {
  team: TeamAssignment;
  bids: Record<string, number>;
  setBids: (bids: Record<string, number>) => void;
  totalReserved: number;
}) {
  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Market</h2>
          <p className="text-sm text-slate-500">Reserve budget by placing bids on available players.</p>
        </div>
        <Badge>Reserved {formatMoney(totalReserved)}</Badge>
      </div>

      <Card className="overflow-hidden">
        <div className="divide-y divide-slate-200">
          {marketPlayers.map((player, index) => {
            const suggestedBid = 8000 + index * 2500;
            const bid = bids[player.id] ?? suggestedBid;

            return (
              <div
                key={player.id}
                className="grid gap-3 p-4 md:grid-cols-[1fr_180px_96px] md:items-center"
              >
                <div>
                  <p className="font-medium">{player.name}</p>
                  <p className="text-sm text-slate-500">
                    {player.position} · OVR {player.rating}
                  </p>
                </div>
                <input
                  type="number"
                  min={0}
                  max={team.budget}
                  value={bid}
                  onChange={(event) =>
                    setBids({
                      ...bids,
                      [player.id]: Number(event.target.value),
                    })
                  }
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  aria-label={`${player.name} bid`}
                />
                <Button type="button" onClick={() => setBids({ ...bids, [player.id]: bid })}>
                  Bid
                </Button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function MarketingTab({
  team,
  marketingSpend,
  setMarketingSpend,
  totalMarketing,
}: {
  team: TeamAssignment;
  marketingSpend: Record<string, number>;
  setMarketingSpend: (spend: Record<string, number>) => void;
  totalMarketing: number;
}) {
  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Marketing</h2>
          <p className="text-sm text-slate-500">Invest in fan growth and future revenue.</p>
        </div>
        <Badge>
          Planned {formatMoney(totalMarketing)} / {formatMoney(team.budget)}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {marketingOptions.map((option) => (
          <Card key={option.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium">{option.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{option.impact}</p>
              </div>
              <Badge>{formatMoney(option.cost)}</Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                type="number"
                min={0}
                max={team.budget}
                value={marketingSpend[option.id] ?? option.cost}
                onChange={(event) =>
                  setMarketingSpend({
                    ...marketingSpend,
                    [option.id]: Number(event.target.value),
                  })
                }
                className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                aria-label={`${option.name} budget`}
              />
              <Button
                type="button"
                onClick={() =>
                  setMarketingSpend({
                    ...marketingSpend,
                    [option.id]: marketingSpend[option.id] ?? option.cost,
                  })
                }
              >
                Buy
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function LeaderboardTab({
  game,
  standings,
}: {
  game: GameSummary;
  standings: {
    team: TeamSummary;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    pointDiff: number;
    points: number;
  }[];
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
            {standings.map((standing, index) => (
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
                    {[0, 1, 2, 3, 4].map((item) => (
                      <span key={item} className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ReportTab({
  team,
  standings,
}: {
  team: TeamAssignment;
  standings: {
    team: TeamSummary;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    pointDiff: number;
    points: number;
  }[];
}) {
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
            {standings.map((standing, index) => (
              <tr key={standing.team.id}>
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3 font-medium">{standing.team.name}</td>
                <td className="px-4 py-3">{standing.team.fans.toLocaleString()}</td>
                <td className="px-4 py-3">{formatMoney(standing.team.budget)}</td>
                <td className="px-4 py-3">{index === 0 ? "Win" : "Loss"}</td>
                <td className="px-4 py-3">
                  {standing.team.id === team.id ? "+8%" : "+2%"}
                </td>
                <td className="px-4 py-3">0</td>
                <td className="px-4 py-3">{standing.played}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
