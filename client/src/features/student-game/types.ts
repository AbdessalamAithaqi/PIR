export type GameSummary = {
  id: string;
  name: string;
  joinCode: string;
  status: string;
  currentRound?: number;
};

export type Player = {
  id: string;
  name: string;
  position: string;
  rating?: number;
  stats?: number;
  price?: number;
  starter?: boolean | number;
};

export type MarketPlayer = Player & {
  price: number;
  roundNumber: number;
};

export type TeamAssignment = {
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
};

export type TeamSummary = TeamAssignment & {
  members: { id: string; user: { id: string; name: string } }[];
  roster?: Player[];
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

export type ServerBid = {
  id: string;
  playerId: string;
  teamId: string;
  amount: number;
};

export type MarketingDecision = {
  id: string;
  teamId: string;
  roundNumber: number;
  pubInvestment: number;
  merchInvestment: number;
};

export type GameDetails = {
  game: Required<GameSummary>;
  teams: TeamSummary[];
  market: MarketPlayer[];
  bids: ServerBid[];
  marketingDecisions: MarketingDecision[];
  results: MatchResult[];
};

export type StudentScreen = "join" | "waiting" | "dashboard";

export type StudentTab = "team" | "market" | "marketing" | "leaderboard" | "report";

export type MarketingOption = {
  id: string;
  category: "Publicity" | "Merchandise";
  name: string;
  cost: number;
  impact: string;
};

export type StandingRow = {
  team: TeamSummary;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  pointDiff: number;
  points: number;
};
