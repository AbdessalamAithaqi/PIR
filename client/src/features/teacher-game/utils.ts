import { defaultParameters, parameterKeys } from "./constants";
import type { GameParameters, Team } from "./types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function sanitizeParameters(parameters: unknown): GameParameters {
  const source =
    parameters && typeof parameters === "object"
      ? (parameters as Partial<Record<keyof GameParameters, unknown>>)
      : {};
  const nextParameters = { ...defaultParameters };

  parameterKeys.forEach((key) => {
    const value = Number(source[key]);
    nextParameters[key] = Number.isFinite(value) ? value : defaultParameters[key];
  });

  return nextParameters;
}

export function formatMoney(value: number) {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

export function sortStandings(teams: Team[]) {
  return [...teams].sort(
    (a, b) =>
      (b.points ?? 0) - (a.points ?? 0) ||
      (b.pointDiff ?? 0) - (a.pointDiff ?? 0) ||
      b.fans - a.fans,
  );
}
