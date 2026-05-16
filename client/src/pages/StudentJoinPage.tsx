import { JoinScreen } from "../features/student-game/components/JoinScreen";
import { StudentDashboard } from "../features/student-game/components/StudentDashboard";
import { WaitingScreen } from "../features/student-game/components/WaitingScreen";
import { useStudentGame } from "../features/student-game/hooks/useStudentGame";

export function StudentJoinPage() {
  const studentGame = useStudentGame();

  if (studentGame.screen === "waiting" && studentGame.game) {
    return <WaitingScreen game={studentGame.game} onLeaveGame={studentGame.leaveGame} />;
  }

  if (studentGame.screen === "dashboard" && studentGame.currentGame && studentGame.team) {
    return (
      <StudentDashboard
        game={studentGame.currentGame}
        team={studentGame.team}
        activeTab={studentGame.activeTab}
        setActiveTab={studentGame.setActiveTab}
        lineup={studentGame.lineup}
        bench={studentGame.bench}
        selectedLineupId={studentGame.selectedLineupId}
        setSelectedLineupId={studentGame.setSelectedLineupId}
        swapPlayer={studentGame.swapPlayer}
        ready={studentGame.ready}
        bids={studentGame.bids}
        setBids={studentGame.setBids}
        totalReserved={studentGame.totalReserved}
        marketingSpend={studentGame.marketingSpend}
        setMarketingSpend={studentGame.setMarketingSpend}
        totalMarketing={studentGame.totalMarketing}
        standings={studentGame.standings}
        gameDetails={studentGame.gameDetails}
        onBid={studentGame.submitBid}
        onMarketing={studentGame.submitMarketing}
        onReady={studentGame.markReady}
        onRefresh={studentGame.refreshDashboard}
        onLeaveGame={studentGame.leaveGame}
        refreshing={studentGame.refreshing}
        error={studentGame.error}
        onDismissError={() => studentGame.setError("")}
        decisionOpen={studentGame.decisionOpen}
      />
    );
  }

  return (
    <JoinScreen
      joinCode={studentGame.joinCode}
      submitting={studentGame.submitting}
      error={studentGame.error}
      onSubmit={studentGame.joinGame}
      onJoinCodeChange={(value) => {
        studentGame.setJoinCode(value);
        studentGame.setError("");
      }}
    />
  );
}
