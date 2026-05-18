import { STUDENT_STORAGE_KEY } from "./constants";
import type { GameDetails, Player, StandingRow } from "./types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function getDemoStudentId() {
  const storedId = window.localStorage.getItem(STUDENT_STORAGE_KEY);
  if (storedId) return storedId;

  const newId = `student-${crypto.randomUUID()}`;
  window.localStorage.setItem(STUDENT_STORAGE_KEY, newId);
  return newId;
}

export function formatMoney(value: number) {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

export function toPlayer(player: Player): Player {
  return {
    ...player,
    rating: Number(player.rating ?? player.stats ?? 40),
  };
}

export function isStarter(player: Player) {
  return player.starter === true || player.starter === 1;
}

export function splitRoster(roster: Player[] = []) {
  const players = roster.map(toPlayer);
  return {
    starters: players.filter(isStarter).slice(0, 15),
    bench: players.filter((player) => !isStarter(player)),
  };
}

export function buildStandings(gameDetails: GameDetails | null): StandingRow[] {
  return (gameDetails?.teams ?? [])
    .map((standingTeam) => ({
      team: standingTeam,
      played: (standingTeam.wins ?? 0) + (standingTeam.draws ?? 0) + (standingTeam.losses ?? 0),
      wins: standingTeam.wins ?? 0,
      draws: standingTeam.draws ?? 0,
      losses: standingTeam.losses ?? 0,
      pointDiff: standingTeam.pointDiff ?? 0,
      points: standingTeam.points ?? 0,
    }))
    .sort((a, b) => b.points - a.points || b.pointDiff - a.pointDiff || b.team.fans - a.team.fans);
}
