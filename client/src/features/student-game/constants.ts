import type { CSSProperties } from "react";
import type { MarketingOption, Player, StudentTab } from "./types";

export const STUDENT_STORAGE_KEY = "pir-demo-student-id";
export const JOINED_GAME_STORAGE_KEY = "pir-demo-joined-game";

export const tabs: { id: StudentTab; label: string }[] = [
  { id: "team", label: "Team" },
  { id: "market", label: "Market" },
  { id: "marketing", label: "Marketing" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "report", label: "Report" },
];

export const startingPlayers: Player[] = [
  { id: "p1", name: "Tesseyre", position: "Loosehead", rating: 74 },
  { id: "p2", name: "Siciliano", position: "Hooker", rating: 78 },
  { id: "p3", name: "Tafili", position: "Tighthead", rating: 76 },
  { id: "p4", name: "Omby", position: "Lock", rating: 73 },
  { id: "p5", name: "Griffiths", position: "Lock", rating: 79 },
  { id: "p6", name: "Mendy", position: "Flanker", rating: 80 },
  { id: "p7", name: "Keletoana", position: "Number 8", rating: 82 },
  { id: "p8", name: "Geneste", position: "Flanker", rating: 77 },
  { id: "p9", name: "Guyon", position: "Scrum-half", rating: 75 },
  { id: "p10", name: "Bros", position: "Fly-half", rating: 81 },
  { id: "p11", name: "Rayeur", position: "Wing", rating: 72 },
  { id: "p12", name: "Masse", position: "Centre", rating: 76 },
  { id: "p13", name: "Biastoto", position: "Centre", rating: 78 },
  { id: "p14", name: "Noon", position: "Wing", rating: 79 },
  { id: "p15", name: "Lewis", position: "Fullback", rating: 83 },
];

export const benchPlayers: Player[] = [
  { id: "b1", name: "Alaguy", position: "Prop", rating: 70 },
  { id: "b2", name: "Guillendas", position: "Lock", rating: 69 },
  { id: "b3", name: "Hull", position: "Centre", rating: 71 },
  { id: "b4", name: "Camara", position: "Wing", rating: 72 },
  { id: "b5", name: "Broncan", position: "Hooker", rating: 68 },
  { id: "b6", name: "Malaterre", position: "Flanker", rating: 70 },
  { id: "b7", name: "Peyramard", position: "Scrum-half", rating: 67 },
  { id: "b8", name: "Molala", position: "Fullback", rating: 73 },
];

export const marketingOptions: MarketingOption[] = [
  {
    id: "campus",
    category: "Publicity",
    name: "Campus campaign",
    cost: 4000,
    impact: "Fan-growth marketing for this round.",
  },
  {
    id: "social",
    category: "Publicity",
    name: "Social media push",
    cost: 3000,
    impact: "Fan-growth marketing for this round.",
  },
  {
    id: "merch",
    category: "Merchandise",
    name: "Merch stand",
    cost: 6500,
    impact: "Revenue marketing for this round.",
  },
  {
    id: "sponsor",
    category: "Merchandise",
    name: "Local sponsor event",
    cost: 9000,
    impact: "Revenue marketing for this round.",
  },
  {
    id: "family",
    category: "Merchandise",
    name: "Family match day",
    cost: 5500,
    impact: "Revenue marketing for this round.",
  },
];

export const playerPositions: CSSProperties[] = [
  { top: "5%", left: "18%" },
  { top: "5%", left: "45%" },
  { top: "5%", left: "72%" },
  { top: "20%", left: "32%" },
  { top: "20%", left: "59%" },
  { top: "35%", left: "22%" },
  { top: "35%", left: "45%" },
  { top: "35%", left: "68%" },
  { top: "51%", left: "38%" },
  { top: "51%", left: "58%" },
  { top: "63%", left: "16%" },
  { top: "66%", left: "34%" },
  { top: "66%", left: "58%" },
  { top: "63%", left: "78%" },
  { top: "82%", left: "47%" },
];
