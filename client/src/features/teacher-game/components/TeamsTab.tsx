import { useMemo } from "react";
import type { DragEvent } from "react";
import { useI18n } from "../../../i18n";
import type { Participant, Team } from "../types";
import { Badge, Card } from "./ui";

export function TeamsTab({
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
  onDragStart: (event: DragEvent, studentId: string) => void;
  getDraggedStudentId: (event: DragEvent) => string;
  saving: boolean;
}) {
  const { t } = useI18n();
  const teamNameById = useMemo(() => new Map(teams.map((team) => [team.id, team.name])), [teams]);

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
          <h2 className="font-semibold">{t("teacherGame.joinedStudents")}</h2>
          <Badge>{participants.length}</Badge>
        </div>
        <div className="grid gap-2">
          {participants.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 px-3 py-8 text-center text-sm text-slate-500">
              {t("teacherGame.noStudents")}
            </p>
          ) : (
            participants.map((participant) => (
              <StudentPill
                key={participant.id}
                studentId={participant.id}
                name={participant.name}
                detail={participant.teamId ? teamNameById.get(participant.teamId) : t("teacherGame.unassigned")}
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
              <Badge>{t("common.membersCount", { count: team.members.length })}</Badge>
            </div>
            <div className="grid gap-2">
              {team.members.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-200 px-3 py-8 text-center text-sm text-slate-500">
                  {t("teacherGame.dropStudents")}
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
  onDragStart: (event: DragEvent, studentId: string) => void;
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
