import type { GameDetails, GameSummary, ServerBid, TeamSummary } from "./types";

type ApiErrorResponse = {
  error?: string;
};

type JoinGameResponse = ApiErrorResponse & {
  game?: GameSummary;
};

type AssignmentResponse = {
  assigned?: boolean;
  team?: TeamSummary;
};

async function readJson<T>(response: Response): Promise<T | null> {
  return response.json().catch(() => null) as Promise<T | null>;
}

export async function fetchGameDetails(gameId: string) {
  const response = await fetch(`/api/games/${gameId}`);
  if (!response.ok) return null;
  return readJson<GameDetails>(response);
}

export async function joinGameRequest({
  joinCode,
  studentId,
  studentName,
}: {
  joinCode: string;
  studentId: string;
  studentName: string;
}) {
  const response = await fetch("/api/games/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      joinCode,
      studentId,
      studentName,
    }),
  });
  const data = await readJson<JoinGameResponse>(response);

  if (!response.ok) {
    throw new Error(data?.error || "Invalid class code or game is not accepting participants.");
  }

  if (!data?.game) {
    throw new Error("Unable to join this game.");
  }

  return data.game;
}

export async function fetchAssignment(gameId: string, studentId: string) {
  const response = await fetch(
    `/api/games/${gameId}/assignment?studentId=${encodeURIComponent(studentId)}`,
  );
  if (!response.ok) return null;
  return readJson<AssignmentResponse>(response);
}

export async function submitBidRequest({
  gameId,
  teamId,
  playerId,
  amount,
}: {
  gameId: string;
  teamId: string;
  playerId: string;
  amount: number;
}) {
  const response = await fetch(`/api/games/${gameId}/teams/${teamId}/bids`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerId, amount }),
  });
  const data = await readJson<ApiErrorResponse & { bid?: ServerBid }>(response);

  if (!response.ok) {
    throw new Error(data?.error || "Unable to place bid");
  }
}

export async function submitMarketingRequest({
  gameId,
  teamId,
  pubInvestment,
  merchInvestment,
}: {
  gameId: string;
  teamId: string;
  pubInvestment: number;
  merchInvestment: number;
}) {
  const response = await fetch(`/api/games/${gameId}/teams/${teamId}/marketing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pubInvestment, merchInvestment }),
  });
  const data = await readJson<ApiErrorResponse>(response);

  if (!response.ok) {
    throw new Error(data?.error || "Unable to save marketing");
  }
}

export async function submitLineupRequest({
  gameId,
  teamId,
  starterPlayerIds,
}: {
  gameId: string;
  teamId: string;
  starterPlayerIds: string[];
}) {
  const response = await fetch(`/api/games/${gameId}/teams/${teamId}/lineup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ starterPlayerIds }),
  });
  const data = await readJson<ApiErrorResponse>(response);

  if (!response.ok) {
    throw new Error(data?.error || "Unable to save lineup");
  }
}

export async function submitReadyRequest({ gameId, teamId }: { gameId: string; teamId: string }) {
  const response = await fetch(`/api/games/${gameId}/teams/${teamId}/ready`, {
    method: "POST",
  });
  const data = await readJson<ApiErrorResponse>(response);

  if (!response.ok) {
    throw new Error(data?.error || "Unable to mark ready");
  }
}
