import { Link } from "react-router-dom";
import type { DragEvent, Dispatch, SetStateAction } from "react";
import { tabs } from "../constants";
import type { GameDetails, GameParameters, RoundAction, TeacherTab } from "../types";
import { cn } from "../utils";
import { LeaderboardTab } from "./LeaderboardTab";
import { ParametersTab } from "./ParametersTab";
import { ReportTab } from "./ReportTab";
import { RoundManagementTab } from "./RoundManagementTab";
import { TeamsTab } from "./TeamsTab";
import { Badge } from "./ui";

export function TeacherGameDashboard({
  activeTab,
  setActiveTab,
  details,
  parameters,
  setParameters,
  saving,
  error,
  onAssignStudent,
  onUnassignStudent,
  onRoundAction,
  onSaveParameters,
  onDragStart,
  getDraggedStudentId,
}: {
  activeTab: TeacherTab;
  setActiveTab: (tab: TeacherTab) => void;
  details: GameDetails;
  parameters: GameParameters;
  setParameters: Dispatch<SetStateAction<GameParameters>>;
  saving: boolean;
  error: string;
  onAssignStudent: (studentId: string, teamId: string) => void;
  onUnassignStudent: (studentId: string) => void;
  onRoundAction: (action: RoundAction) => void;
  onSaveParameters: (parameters: GameParameters) => void;
  onDragStart: (event: DragEvent, studentId: string) => void;
  getDraggedStudentId: (event: DragEvent) => string;
}) {
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
        <p
          className="mx-auto mt-4 max-w-7xl rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === "teams" && (
          <TeamsTab
            participants={details.participants}
            teams={details.teams}
            onAssign={onAssignStudent}
            onUnassign={onUnassignStudent}
            onDragStart={onDragStart}
            getDraggedStudentId={getDraggedStudentId}
            saving={saving}
          />
        )}
        {activeTab === "parameters" && (
          <ParametersTab
            parameters={parameters}
            saving={saving}
            onChange={setParameters}
            onSave={onSaveParameters}
          />
        )}
        {activeTab === "round" && (
          <RoundManagementTab
            game={details.game}
            teams={details.teams}
            saving={saving}
            onRoundAction={onRoundAction}
          />
        )}
        {activeTab === "report" && <ReportTab details={details} />}
        {activeTab === "leaderboard" && <LeaderboardTab teams={details.teams} results={details.results} />}
      </section>
    </main>
  );
}
