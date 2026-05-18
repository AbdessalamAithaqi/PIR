import type { GameInstance } from "./types";

type GamesResponse = {
  games?: GameInstance[];
};

async function readJson<T>(response: Response): Promise<T | null> {
  return response.json().catch(() => null) as Promise<T | null>;
}

export async function fetchTeacherGames(ownerId: string) {
  const response = await fetch(`/api/games?ownerId=${ownerId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch games");
  }

  const data = await readJson<GamesResponse>(response);
  return data?.games ?? [];
}

export async function createTeacherGame({
  name,
  ownerId,
}: {
  name: string;
  ownerId: string;
}) {
  const response = await fetch("/api/games", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, ownerId }),
  });

  if (!response.ok) {
    throw new Error("Failed to create game");
  }
}

export async function deleteTeacherGame(gameId: string) {
  const response = await fetch(`/api/games/${gameId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete game");
  }
}
