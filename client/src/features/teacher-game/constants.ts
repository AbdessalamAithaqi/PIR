import type { GameParameters, ParameterKey, TeacherTab } from "./types";

export const parameterKeys = [
  "injuryChance",
  "fanGain",
  "financialGrowth",
  "luckFactor",
] as const satisfies readonly ParameterKey[];

export const tabs: { id: TeacherTab; label: string }[] = [
  { id: "teams", label: "Teams" },
  { id: "parameters", label: "Parameters" },
  { id: "round", label: "Round Management" },
  { id: "report", label: "Reports" },
  { id: "leaderboard", label: "Leaderboard" },
];

export const parameterLabels: Record<ParameterKey, string> = {
  injuryChance: "Injury chance",
  fanGain: "Fan gain",
  financialGrowth: "Financial growth",
  luckFactor: "Luck factor",
};

export const defaultParameters: GameParameters = {
  injuryChance: 12,
  fanGain: 20,
  financialGrowth: 8,
  luckFactor: 50,
};
