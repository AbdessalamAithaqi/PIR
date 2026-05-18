export type GameInstance = {
  id: string;
  name: string;
  joinCode: string;
  status: string;
  currentRound: number;
  _count: {
    teams: number;
  };
};
