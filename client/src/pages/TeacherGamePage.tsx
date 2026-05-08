import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

type TeacherTab = "teams" | "parameters" | "round" | "report" | "leaderboard";

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
};

type ParameterKey = "injuryChance" | "fanGain" | "financialGrowth" | "luckFactor";

const tabs: { id: TeacherTab; label: string }[] = [
  { id: "teams", label: "Teams" },
  { id: "parameters", label: "Parameters" },
  { id: "round", label: "Round Management" },
  { id: "report", label: "Reports" },
  { id: "leaderboard", label: "Leaderboard" },
];

const parameterLabels: Record<ParameterKey, string> = {
  injuryChance: "Chance %",
  fanGain: "Gain",
  financialGrowth: "Growth",
  luckFactor: "Luck",
};

const defaultParameters: Record<ParameterKey, number> = {
  injuryChance: 12,
  fanGain: 20,
  financialGrowth: 8,
  luckFactor: 50,
};

export function TeacherGamePage() {
  const { gameId } = useParams();
  const [activeTab, setActiveTab] = useState<TeacherTab>("teams");
  const [details, setDetails] = useState<GameDetails | null>(null);
  const [parameters, setParameters] = useState(defaultParameters);
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

  function getDraggedStudentId(event: React.DragEvent) {
    return event.dataTransfer.getData("application/x-student-id");
  }

  function startStudentDrag(event: React.DragEvent, studentId: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-student-id", studentId);
  }

  if (loading) {
    return <div className="min-h-screen bg-white p-12 text-4xl text-black">Loading game...</div>;
  }

  if (!details) {
    return (
      <main className="min-h-screen bg-white p-12 text-black">
        <Link to="/teacher" className="text-4xl text-black underline">
          Back
        </Link>
        <p className="mt-12 text-4xl text-red-600">{error || "Game not found"}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="border-b border-black px-8 py-8">
        <div className="flex flex-wrap items-center gap-12">
          <Link
            to="/teacher"
            className="rounded-2xl border border-black px-12 py-8 text-6xl text-black no-underline transition hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            Back
          </Link>
          <h1 className="text-6xl font-normal underline">{details.game.name}</h1>
          <div className="ml-auto text-right">
            <p className="font-mono text-4xl">{details.game.joinCode}</p>
            <p className="text-xl uppercase tracking-wide">{details.game.status}</p>
          </div>
        </div>
      </header>

      <nav className="flex flex-wrap gap-5 border-b border-black px-8 py-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`border border-black px-1 text-4xl font-normal transition hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-100 xl:text-5xl ${
              activeTab === tab.id ? "bg-gray-100 underline" : "bg-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {error && (
        <p className="px-8 pt-6 text-2xl text-red-600" role="alert">
          {error}
        </p>
      )}

      <section className="px-5 py-6">
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
          <ParametersTab parameters={parameters} onChange={setParameters} />
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
        {activeTab === "leaderboard" && <LeaderboardTab teams={details.teams} />}
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
    <div className="grid min-h-[720px] grid-cols-1 gap-3 lg:grid-cols-[380px_1fr]">
      <aside
        className="border border-black p-8"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const studentId = getDraggedStudentId(event);
          if (studentId) onUnassign(studentId);
        }}
      >
        <h2 className="mb-6 text-4xl font-bold">Name List</h2>
        <div className="grid gap-4">
          {participants.length === 0 ? (
            <p className="text-3xl text-gray-500">No students</p>
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
      </aside>

      <div className="grid gap-5 lg:grid-cols-2">
        {teams.slice(0, 4).map((team) => (
          <section
            key={team.id}
            className="min-h-80 border border-black p-8 transition hover:bg-gray-50"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const studentId = getDraggedStudentId(event);
              if (studentId) onAssign(studentId, team.id);
            }}
          >
            <h2 className="mb-6 text-4xl font-bold">{team.name}</h2>
            <div className="grid gap-4">
              {team.members.length === 0 ? (
                <p className="text-3xl text-gray-500">Empty</p>
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
          </section>
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
  detail?: string;
  onDragStart: (event: React.DragEvent, studentId: string) => void;
  disabled: boolean;
}) {
  return (
    <div
      draggable={!disabled}
      onDragStart={(event) => onDragStart(event, studentId)}
      className="cursor-move rounded border border-black bg-white px-4 py-3 text-3xl"
    >
      <span>{name}</span>
      {detail && <span className="ml-3 text-xl text-gray-500">{detail}</span>}
    </div>
  );
}

function ParametersTab({
  parameters,
  onChange,
}: {
  parameters: Record<ParameterKey, number>;
  onChange: (parameters: Record<ParameterKey, number>) => void;
}) {
  return (
    <div className="grid max-w-3xl gap-16 px-10 py-24">
      {(Object.keys(parameters) as ParameterKey[]).map((key) => (
        <label key={key} className="grid grid-cols-[1fr_132px] items-center gap-10">
          <span className="text-6xl underline">{parameterLabels[key]}</span>
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
            className="h-16 rounded-lg border border-black px-4 text-center text-3xl outline-none focus:ring-4 focus:ring-blue-100"
          />
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
            className="col-span-2 w-full"
          />
        </label>
      ))}
    </div>
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
  const readyStates = [false, false, false, false];

  return (
    <div className="grid gap-12 px-10 py-24 lg:grid-cols-[320px_1fr]">
      <div className="grid max-w-80 gap-12">
        <button
          type="button"
          disabled={saving}
          onClick={() => onRoundAction("launch")}
          className="rounded-2xl border border-black bg-white px-10 py-7 text-6xl underline transition hover:bg-gray-50 disabled:opacity-60"
        >
          Launch
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => onRoundAction("next")}
          className="rounded-2xl border border-black bg-white px-10 py-7 text-6xl underline transition hover:bg-gray-50 disabled:opacity-60"
        >
          Next
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => onRoundAction("stop")}
          className="rounded-2xl border border-black bg-white px-10 py-7 text-6xl underline transition hover:bg-gray-50 disabled:opacity-60"
        >
          Stop
        </button>
      </div>

      <div className="grid content-start gap-10">
        <div>
          <p className="text-5xl">Round {game.currentRound} / 6</p>
          <p className="mt-3 text-3xl uppercase tracking-wide">{game.status}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {readyStates.map((ready, index) => (
            <div
              key={teams[index]?.id ?? index}
              className="flex h-28 w-28 items-center justify-center rounded-2xl border border-black text-7xl"
            >
              {ready ? "✓" : "×"}
            </div>
          ))}
        </div>
        <p className="text-3xl">Ready teams 0 / 4</p>
      </div>
    </div>
  );
}

function ReportTab({ details }: { details: GameDetails }) {
  const assignedStudents = details.participants.filter((participant) => participant.teamId).length;

  return (
    <div className="grid gap-8 p-10 md:grid-cols-2 xl:grid-cols-4">
      <ReportTile label="Students" value={details.participants.length} />
      <ReportTile label="Assigned" value={assignedStudents} />
      <ReportTile label="Teams" value={details.teams.length} />
      <ReportTile label="Code" value={details.game.joinCode} />
    </div>
  );
}

function ReportTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-black p-8">
      <p className="text-3xl">{label}</p>
      <p className="mt-8 text-6xl">{value}</p>
    </div>
  );
}

function LeaderboardTab({ teams }: { teams: Team[] }) {
  return (
    <div className="overflow-x-auto p-10">
      <table className="w-full min-w-[760px] border-collapse text-left text-3xl">
        <thead>
          <tr>
            <th className="border border-black p-4">Team</th>
            <th className="border border-black p-4">Students</th>
            <th className="border border-black p-4">Fans</th>
            <th className="border border-black p-4">Budget</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id}>
              <td className="border border-black p-4">{team.name}</td>
              <td className="border border-black p-4">{team.members.length}</td>
              <td className="border border-black p-4">{team.fans.toLocaleString()}</td>
              <td className="border border-black p-4">
                {team.budget.toLocaleString(undefined, {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
