import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

type TeacherTab = "teams" | "parameters" | "round" | "report" | "leaderboard";

const parameterKeys = ["injuryChance", "fanGain", "financialGrowth", "luckFactor"] as const;
type ParameterKey = (typeof parameterKeys)[number];
type GameParameters = Record<ParameterKey, number>;

type GameSummary = {
  id: string;
  name: string;
  joinCode: string;
  status: string;
  currentRound: number;
};

type TeamMember = {
  id: string;
  userId: string;
  teamId: string;
  user: {
    id: string;
    name: string;
  };
};

type Team = {
  id: string;
  name: string;
  budget: number;
  fans: number;
  pubScore?: number;
  merchScore?: number;
  points?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  pointDiff?: number;
  ready?: boolean;
  members: TeamMember[];
};

type Participant = {
  id: string;
  name: string;
  joinedAt: string;
  teamId: string | null;
};

type GameDetails = {
  game: GameSummary;
  teams: Team[];
  participants: Participant[];
  results: MatchResult[];
  parameters: Record<string, unknown>;
};

type MatchResult = {
  id: string;
  roundNumber: number;
  scoreA: number;
  scoreB: number;
  resultA: string;
  resultB: string;
  fanDeltaA: number;
  fanDeltaB: number;
  moneyDeltaA: number;
  moneyDeltaB: number;
  teamAId: string;
  teamBId: string;
};

const tabs: { id: TeacherTab; label: string }[] = [
  { id: "teams", label: "Teams" },
  { id: "parameters", label: "Parameters" },
  { id: "round", label: "Round Management" },
  { id: "report", label: "Reports" },
  { id: "leaderboard", label: "Leaderboard" },
];

const parameterLabels: Record<ParameterKey, string> = {
  injuryChance: "Injury chance",
  fanGain: "Fan gain",
  financialGrowth: "Financial growth",
  luckFactor: "Luck factor",
};

const defaultParameters: GameParameters = {
  injuryChance: 12,
  fanGain: 20,
  financialGrowth: 8,
  luckFactor: 50,
};

function sanitizeParameters(parameters: unknown): GameParameters {
  const source =
    parameters && typeof parameters === "object"
      ? (parameters as Partial<Record<ParameterKey, unknown>>)
      : {};
  const nextParameters = { ...defaultParameters };

  parameterKeys.forEach((key) => {
    const value = Number(source[key]);
    nextParameters[key] = Number.isFinite(value) ? value : defaultParameters[key];
  });

  return nextParameters;
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
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
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
}) {
  return (
    <div {...props} className={cn("rounded-lg border border-slate-200 bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}

export function TeacherGamePage() {
  const { gameId } = useParams();
  const [activeTab, setActiveTab] = useState<TeacherTab>("teams");
  const [details, setDetails] = useState<GameDetails | null>(null);
  const [parameters, setParameters] = useState<GameParameters>(defaultParameters);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchGame = useCallback(async () => {
    if (!gameId) return;

    try {
      const response = await fetch(`/api/games/${gameId}`);
      if (!response.ok) throw new Error("Failed to load game");
      const data = await response.json();
      setDetails(data);
      if (data.parameters) setParameters(sanitizeParameters(data.parameters));
      setError("");
    } catch (err) {
      setError("Failed to load game");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  async function assignStudent(studentId: string, teamId: string) {
    if (!gameId) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/games/${gameId}/teams/${teamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      if (!response.ok) throw new Error("Failed to assign student");
      await fetchGame();
    } catch (err) {
      setError("Failed to assign student");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function unassignStudent(studentId: string) {
    if (!gameId) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/games/${gameId}/participants/${studentId}/assignment`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to unassign student");
      await fetchGame();
    } catch (err) {
      setError("Failed to unassign student");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function updateRound(action: "launch" | "stop" | "next") {
    if (!gameId) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/games/${gameId}/round`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error("Failed to update round");
      await fetchGame();
    } catch (err) {
      setError("Failed to update round");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function saveParameters(nextParameters: GameParameters) {
    if (!gameId) return;

    const safeParameters = sanitizeParameters(nextParameters);
    setSaving(true);
    try {
      const response = await fetch(`/api/games/${gameId}/parameters`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(safeParameters),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Failed to save parameters");
      if (data?.parameters) setParameters(sanitizeParameters(data.parameters));
      await fetchGame();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save parameters");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function getDraggedStudentId(event: React.DragEvent) {
    return event.dataTransfer.getData("application/x-student-id");
  }

  function startStudentDrag(event: React.DragEvent, studentId: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-student-id", studentId);
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-50 p-8 text-sm text-slate-500">Loading game...</div>;
  }

  if (!details) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-950">
        <Link to="/teacher" className="text-sm font-medium text-slate-700 hover:text-slate-950">
          Back
        </Link>
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error || "Game not found"}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              to="/teacher"
              className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 no-underline transition hover:bg-slate-50 hover:text-slate-950"
            >
              Back
            </Link>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{details.game.name}</h1>
              <p className="text-sm text-slate-500">Teacher management</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{details.game.status}</Badge>
            <span className="rounded-md bg-slate-950 px-3 py-1.5 font-mono text-sm font-semibold text-white">
              {details.game.joinCode}
            </span>
          </div>
        </div>
      </header>

      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
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
        </div>
      </nav>

      {error && (
        <p className="mx-auto mt-4 max-w-7xl rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === "teams" && (
          <TeamsTab
            participants={details.participants}
            teams={details.teams}
            onAssign={assignStudent}
            onUnassign={unassignStudent}
            onDragStart={startStudentDrag}
            getDraggedStudentId={getDraggedStudentId}
            saving={saving}
          />
        )}
        {activeTab === "parameters" && (
          <ParametersTab
            parameters={parameters}
            saving={saving}
            onChange={setParameters}
            onSave={saveParameters}
          />
        )}
        {activeTab === "round" && (
          <RoundManagementTab
            game={details.game}
            teams={details.teams}
            saving={saving}
            onRoundAction={updateRound}
          />
        )}
        {activeTab === "report" && <ReportTab details={details} />}
        {activeTab === "leaderboard" && (
          <LeaderboardTab teams={details.teams} results={details.results} />
        )}
      </section>
    </main>
  );
}

function TeamsTab({
  participants,
  teams,
  onAssign,
  onUnassign,
  onDragStart,
  getDraggedStudentId,
  saving,
}: {
  participants: Participant[];
  teams: Team[];
  onAssign: (studentId: string, teamId: string) => void;
  onUnassign: (studentId: string) => void;
  onDragStart: (event: React.DragEvent, studentId: string) => void;
  getDraggedStudentId: (event: React.DragEvent) => string;
  saving: boolean;
}) {
  const teamNameById = useMemo(
    () => new Map(teams.map((team) => [team.id, team.name])),
    [teams],
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <Card
        className="p-4"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const studentId = getDraggedStudentId(event);
          if (studentId) onUnassign(studentId);
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Joined students</h2>
          <Badge>{participants.length}</Badge>
        </div>
        <div className="grid gap-2">
          {participants.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 px-3 py-8 text-center text-sm text-slate-500">
              No students yet
            </p>
          ) : (
            participants.map((participant) => (
              <StudentPill
                key={participant.id}
                studentId={participant.id}
                name={participant.name}
                detail={participant.teamId ? teamNameById.get(participant.teamId) : "Unassigned"}
                onDragStart={onDragStart}
                disabled={saving}
              />
            ))
          )}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {teams.slice(0, 4).map((team) => (
          <Card
            key={team.id}
            className="min-h-56 p-4 transition hover:border-slate-300"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const studentId = getDraggedStudentId(event);
              if (studentId) onAssign(studentId, team.id);
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">{team.name}</h2>
              <Badge>{team.members.length} members</Badge>
            </div>
            <div className="grid gap-2">
              {team.members.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-200 px-3 py-8 text-center text-sm text-slate-500">
                  Drop students here
                </p>
              ) : (
                team.members.map((member) => (
                  <StudentPill
                    key={member.id}
                    studentId={member.user.id}
                    name={member.user.name}
                    onDragStart={onDragStart}
                    disabled={saving}
                  />
                ))
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StudentPill({
  studentId,
  name,
  detail,
  onDragStart,
  disabled,
}: {
  studentId: string;
  name: string;
  detail?: string | undefined;
  onDragStart: (event: React.DragEvent, studentId: string) => void;
  disabled: boolean;
}) {
  return (
    <div
      draggable={!disabled}
      onDragStart={(event) => onDragStart(event, studentId)}
      className="cursor-move rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition hover:bg-slate-50"
    >
      <span className="font-medium">{name}</span>
      {detail && <span className="ml-2 text-xs text-slate-500">{detail}</span>}
    </div>
  );
}

function ParametersTab({
  parameters,
  saving,
  onChange,
  onSave,
}: {
  parameters: GameParameters;
  saving: boolean;
  onChange: (parameters: GameParameters) => void;
  onSave: (parameters: GameParameters) => void;
}) {
  return (
    <Card className="max-w-3xl p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-semibold">Game parameters</h2>
          <p className="text-sm text-slate-500">Tune global simulation variables.</p>
        </div>
        <Button type="button" disabled={saving} onClick={() => onSave(parameters)}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
      <div className="grid gap-5">
        {parameterKeys.map((key) => (
          <label key={key} className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">{parameterLabels[key]}</span>
              <input
                type="number"
                min={0}
                max={100}
                value={parameters[key]}
                onChange={(event) =>
                  onChange({
                    ...parameters,
                    [key]: Number(event.target.value),
                  })
                }
                className="h-9 w-20 rounded-md border border-slate-200 px-2 text-center text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={parameters[key]}
              onChange={(event) =>
                onChange({
                  ...parameters,
                  [key]: Number(event.target.value),
                })
              }
              className="w-full accent-slate-950"
            />
          </label>
        ))}
      </div>
    </Card>
  );
}

function RoundManagementTab({
  game,
  teams,
  saving,
  onRoundAction,
}: {
  game: GameSummary;
  teams: Team[];
  saving: boolean;
  onRoundAction: (action: "launch" | "stop" | "next") => void;
}) {
  const readyStates = teams.slice(0, 4).map((team) => Boolean(team.ready));
  const readyCount = readyStates.filter(Boolean).length;

  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <Card className="grid content-start gap-3 p-4">
        <Button
          type="button"
          disabled={saving}
          onClick={() => onRoundAction("launch")}
        >
          Launch
        </Button>
        <Button
          type="button"
          disabled={saving}
          onClick={() => onRoundAction("next")}
          variant="secondary"
        >
          Move to next round
        </Button>
        <Button
          type="button"
          disabled={saving}
          onClick={() => onRoundAction("stop")}
          variant="secondary"
        >
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
        <p className="mt-4 text-sm text-slate-500">Ready teams {readyCount} / {teams.length}</p>
      </Card>
    </div>
  );
}

function ReportTab({ details }: { details: GameDetails }) {
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

function LeaderboardTab({ teams, results }: { teams: Team[]; results: MatchResult[] }) {
  const standings = [...teams].sort(
    (a, b) =>
      (b.points ?? 0) - (a.points ?? 0) ||
      (b.pointDiff ?? 0) - (a.pointDiff ?? 0) ||
      b.fans - a.fans,
  );

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="font-semibold">Leaderboard</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">W</th>
              <th className="px-4 py-3">D</th>
              <th className="px-4 py-3">L</th>
              <th className="px-4 py-3">PD</th>
              <th className="px-4 py-3">PTS</th>
              <th className="px-4 py-3">Fans</th>
              <th className="px-4 py-3">Budget</th>
              <th className="px-4 py-3">Form</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {standings.map((team) => {
              const teamResults = results
                .filter((r) => r.teamAId === team.id || r.teamBId === team.id)
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
                  <td className="px-4 py-3">
                    {team.budget.toLocaleString(undefined, {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {teamResults.reverse().map((r) => {
                        const outcome = r.teamAId === team.id ? r.resultA : r.resultB;
                        let colorClass = "bg-slate-300";
                        if (outcome === "win") colorClass = "bg-green-500";
                        if (outcome === "loss") colorClass = "bg-red-500";
                        if (outcome === "draw") colorClass = "bg-amber-500";

                        return (
                          <span
                            key={r.id}
                            className={`h-2.5 w-2.5 rounded-full ${colorClass}`}
                            title={outcome.charAt(0).toUpperCase() + outcome.slice(1)}
                          />
                        );
                      })}
                      {Array.from({ length: Math.max(0, 5 - teamResults.length) }).map((_, i) => (
                        <span key={`empty-${i}`} className="h-2.5 w-2.5 rounded-full bg-slate-200" />
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
