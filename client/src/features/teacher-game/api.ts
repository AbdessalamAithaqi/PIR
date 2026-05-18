import type { GameDetails, GameParameters, RoundAction } from "./types";

type ApiErrorResponse = {
  error?: string;
};

async function readJson<T>(response: Response): Promise<T | null> {
  return response.json().catch(() => null) as Promise<T | null>;
}

export async function fetchGameDetails(gameId: string) {
  const response = await fetch(`/api/games/${gameId}`);
  if (!response.ok) {
    throw new Error("Failed to load game");
  }

  const data = await readJson<GameDetails>(response);
  if (!data) {
    throw new Error("Failed to load game");
  }

  return data;
}

export async function assignStudentRequest({
  gameId,
  teamId,
  studentId,
}: {
  gameId: string;
  teamId: string;
  studentId: string;
}) {
  const response = await fetch(`/api/games/${gameId}/teams/${teamId}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId }),
  });

  if (!response.ok) {
    throw new Error("Failed to assign student");
  }
}

export async function unassignStudentRequest({
  gameId,
  studentId,
}: {
  gameId: string;
  studentId: string;
}) {
  const response = await fetch(`/api/games/${gameId}/participants/${studentId}/assignment`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to unassign student");
  }
}

export async function updateRoundRequest({
  gameId,
  action,
}: {
  gameId: string;
  action: RoundAction;
}) {
  const response = await fetch(`/api/games/${gameId}/round`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });

  if (!response.ok) {
    throw new Error("Failed to update round");
  }
}

export async function saveParametersRequest({
  gameId,
  parameters,
}: {
  gameId: string;
  parameters: GameParameters;
}) {
  const response = await fetch(`/api/games/${gameId}/parameters`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parameters),
  });
  const data = await readJson<ApiErrorResponse & { parameters?: Record<string, unknown> }>(response);

  if (!response.ok) {
    throw new Error(data?.error || "Failed to save parameters");
  }

  return data?.parameters;
}
