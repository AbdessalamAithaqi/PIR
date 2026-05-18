import { LoadingState } from "../features/teacher-dashboard/components/LoadingState";
import { TeacherDashboardView } from "../features/teacher-dashboard/components/TeacherDashboardView";
import { useTeacherDashboard } from "../features/teacher-dashboard/hooks/useTeacherDashboard";

export function TeacherDashboard() {
  const teacherDashboard = useTeacherDashboard();

  if (teacherDashboard.loading) {
    return <LoadingState />;
  }

  return (
    <TeacherDashboardView
      games={teacherDashboard.games}
      creating={teacherDashboard.creating}
      error={teacherDashboard.error}
      onCreateGame={teacherDashboard.createGame}
      onDeleteGame={teacherDashboard.deleteGame}
    />
  );
}
