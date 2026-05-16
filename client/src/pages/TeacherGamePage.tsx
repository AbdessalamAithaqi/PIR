import { useParams } from "react-router-dom";
import { LoadingState } from "../features/teacher-game/components/LoadingState";
import { MissingGameState } from "../features/teacher-game/components/MissingGameState";
import { TeacherGameDashboard } from "../features/teacher-game/components/TeacherGameDashboard";
import { useTeacherGame } from "../features/teacher-game/hooks/useTeacherGame";

export function TeacherGamePage() {
  const { gameId } = useParams();
  const teacherGame = useTeacherGame(gameId);

  if (teacherGame.loading) {
    return <LoadingState />;
  }

  if (!teacherGame.details) {
    return <MissingGameState error={teacherGame.error} />;
  }

  return (
    <TeacherGameDashboard
      activeTab={teacherGame.activeTab}
      setActiveTab={teacherGame.setActiveTab}
      details={teacherGame.details}
      parameters={teacherGame.parameters}
      setParameters={teacherGame.setParameters}
      saving={teacherGame.saving}
      error={teacherGame.error}
      onAssignStudent={teacherGame.assignStudent}
      onUnassignStudent={teacherGame.unassignStudent}
      onRoundAction={teacherGame.updateRound}
      onSaveParameters={teacherGame.saveParameters}
      onDragStart={teacherGame.startStudentDrag}
      getDraggedStudentId={teacherGame.getDraggedStudentId}
    />
  );
}
