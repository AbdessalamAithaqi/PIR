import type { TranslationKey } from "../../i18n";
import type { GameParameters, ParameterKey, TeacherTab } from "./types";

export const parameterKeys = [
  "injuryChance",
  "fanGain",
  "financialGrowth",
  "luckFactor",
] as const satisfies readonly ParameterKey[];

export const tabs: { id: TeacherTab; labelKey: TranslationKey }[] = [
  { id: "teams", labelKey: "teacherGame.tabs.teams" },
  { id: "parameters", labelKey: "teacherGame.tabs.parameters" },
  { id: "round", labelKey: "teacherGame.tabs.round" },
  { id: "report", labelKey: "teacherGame.tabs.report" },
  { id: "leaderboard", labelKey: "teacherGame.tabs.leaderboard" },
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
