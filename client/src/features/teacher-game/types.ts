export type TeacherTab = "teams" | "parameters" | "round" | "report" | "leaderboard";

export type ParameterKey = "injuryChance" | "fanGain" | "financialGrowth" | "luckFactor";

export type GameParameters = Record<ParameterKey, number>;

export type RoundAction = "launch" | "stop" | "next";

export type GameSummary = {
  id: string;
  name: string;
  joinCode: string;
  status: string;
  currentRound: number;
};

export type TeamMember = {
  id: string;
  userId: string;
  teamId: string;
  user: {
    id: string;
    name: string;
  };
};

export type Team = {
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

export type Participant = {
  id: string;
  name: string;
  joinedAt: string;
  teamId: string | null;
};

export type MatchResult = {
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

export type GameDetails = {
  game: GameSummary;
  teams: Team[];
  participants: Participant[];
  results: MatchResult[];
  parameters: Record<string, unknown>;
};
