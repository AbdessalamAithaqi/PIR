import express from "express";
import { randomUUID } from "crypto";
import prisma from "../lib/prisma.js";

const router = express.Router();
const defaultTeamNames = ["Team 1", "Team 2", "Team 3", "Team 4"];
const START_FAN_NUMBER = 1000;
const MAX_FAN_NUMBER = 1000000;
const START_TEAM_MONEY = 50000;
const INITIAL_PLAYER_STATS = 40;
const rosterNames = [
  "Tesseyre",
  "Siciliano",
  "Tafili",
  "Omby",
  "Griffiths",
  "Mendy",
  "Keletoana",
  "Geneste",
  "Guyon",
  "Bros",
  "Rayeur",
  "Masse",
  "Biastoto",
  "Noon",
  "Lewis",
  "Alaguy",
  "Guillendas",
  "Hull",
  "Camara",
  "Broncan",
  "Malaterre",
  "Peyramard",
  "Molala",
];
const positions = [
  "Loosehead",
  "Hooker",
  "Tighthead",
  "Lock",
  "Lock",
  "Flanker",
  "Number 8",
  "Flanker",
  "Scrum-half",
  "Fly-half",
  "Wing",
  "Centre",
  "Centre",
  "Wing",
  "Fullback",
  "Prop",
  "Lock",
  "Centre",
  "Wing",
  "Hooker",
  "Flanker",
  "Scrum-half",
  "Fullback",
];
const marketNames = [
  "Ramos",
  "Dupont",
  "Ntamack",
  "Atonio",
  "Marchand",
  "Woki",
  "Fickou",
  "Penaud",
  "Baille",
  "Ollivon",
  "Jalibert",
  "Macalou",
  "Faletau",
  "Russell",
  "Keenan",
];
const DEFAULT_PARAMETERS = {
  injuryChance: 12,
  fanGain: 20,
  financialGrowth: 8,
  luckFactor: 50,
};

type JoinedStudentRow = {
  id: string;
  name: string;
  joinedAt: string;
  teamId: string | null;
};

type DbTeam = {
  id: string;
  name: string;
  budget: number;
  fans: number;
  pubScore: number;
  merchScore: number;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  pointDiff: number;
  ready: number | boolean;
  gameId: string;
};

type DbPlayer = {
  id: string;
  name: string;
  position: string;
  stats: number;
  price: number;
  roundNumber: number;
  market: number;
  sold: number;
  gameId: string;
};

type DbTeamPlayer = DbPlayer & {
  teamPlayerId: string;
  starter: number;
  slot: number;
};

type DbBid = {
  id: string;
  amount: number;
  roundNumber: number;
  teamId: string;
  playerId: string;
};

type DbMarketingDecision = {
  id: string;
  roundNumber: number;
  pubInvestment: number;
  merchInvestment: number;
  teamId: string;
};

type DbMatchResult = {
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
  gameId: string;
};

type DbGameParameter = {
  id: string;
  injuryChance: number;
  fanGain: number;
  financialGrowth: number;
  luckFactor: number;
  gameId: string;
};

type DbTeamMember = {
  id: string;
  userId: string;
  teamId: string;
  userName: string;
};

type EnrichedTeam = DbTeam & {
  ready: boolean;
  members: {
    id: string;
    userId: string;
    teamId: string;
    user: { id: string; name: string };
  }[];
  roster: (DbTeamPlayer & { rating: number })[];
};

// Helper to generate a random 6-character alphanumeric join code
function generateJoinCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function ensureParticipantTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "GameParticipant" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "userId" TEXT NOT NULL,
      "gameId" TEXT NOT NULL,
      CONSTRAINT "GameParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "GameParticipant_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "GameInstance" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "GameParticipant_userId_gameId_key"
    ON "GameParticipant"("userId", "gameId")
  `);
}

async function ignoreExistingColumn(statement: string) {
  try {
    await prisma.$executeRawUnsafe(statement);
  } catch {
    // SQLite cannot add the same column twice. The app may run before migrations
    // in local demos, so we safely keep moving when the column already exists.
  }
}

async function ensureGameLoopTables() {
  await ensureParticipantTable();

  await ignoreExistingColumn(`ALTER TABLE "Team" ADD COLUMN "pubScore" REAL NOT NULL DEFAULT 0`);
  await ignoreExistingColumn(`ALTER TABLE "Team" ADD COLUMN "merchScore" REAL NOT NULL DEFAULT 0`);
  await ignoreExistingColumn(`ALTER TABLE "Team" ADD COLUMN "points" INTEGER NOT NULL DEFAULT 0`);
  await ignoreExistingColumn(`ALTER TABLE "Team" ADD COLUMN "wins" INTEGER NOT NULL DEFAULT 0`);
  await ignoreExistingColumn(`ALTER TABLE "Team" ADD COLUMN "draws" INTEGER NOT NULL DEFAULT 0`);
  await ignoreExistingColumn(`ALTER TABLE "Team" ADD COLUMN "losses" INTEGER NOT NULL DEFAULT 0`);
  await ignoreExistingColumn(`ALTER TABLE "Team" ADD COLUMN "pointDiff" INTEGER NOT NULL DEFAULT 0`);
  await ignoreExistingColumn(`ALTER TABLE "Team" ADD COLUMN "ready" BOOLEAN NOT NULL DEFAULT false`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Player" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "position" TEXT NOT NULL,
      "stats" INTEGER NOT NULL,
      "price" REAL NOT NULL,
      "roundNumber" INTEGER NOT NULL,
      "market" BOOLEAN NOT NULL DEFAULT false,
      "sold" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "gameId" TEXT NOT NULL,
      CONSTRAINT "Player_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "GameInstance" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "TeamPlayer" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "starter" BOOLEAN NOT NULL DEFAULT false,
      "slot" INTEGER NOT NULL DEFAULT 0,
      "teamId" TEXT NOT NULL,
      "playerId" TEXT NOT NULL,
      CONSTRAINT "TeamPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "TeamPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Bid" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "amount" REAL NOT NULL,
      "roundNumber" INTEGER NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "teamId" TEXT NOT NULL,
      "playerId" TEXT NOT NULL,
      CONSTRAINT "Bid_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "Bid_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "MarketingDecision" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "roundNumber" INTEGER NOT NULL,
      "pubInvestment" INTEGER NOT NULL DEFAULT 0,
      "merchInvestment" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      "teamId" TEXT NOT NULL,
      CONSTRAINT "MarketingDecision_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "MatchResult" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "roundNumber" INTEGER NOT NULL,
      "scoreA" REAL NOT NULL,
      "scoreB" REAL NOT NULL,
      "resultA" TEXT NOT NULL,
      "resultB" TEXT NOT NULL,
      "fanDeltaA" INTEGER NOT NULL,
      "fanDeltaB" INTEGER NOT NULL,
      "moneyDeltaA" REAL NOT NULL,
      "moneyDeltaB" REAL NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "gameId" TEXT NOT NULL,
      "teamAId" TEXT NOT NULL,
      "teamBId" TEXT NOT NULL,
      CONSTRAINT "MatchResult_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "GameInstance" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "GameParameter" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "injuryChance" INTEGER NOT NULL DEFAULT 12,
      "fanGain" INTEGER NOT NULL DEFAULT 20,
      "financialGrowth" INTEGER NOT NULL DEFAULT 8,
      "luckFactor" INTEGER NOT NULL DEFAULT 50,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      "gameId" TEXT NOT NULL,
      CONSTRAINT "GameParameter_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "GameInstance" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "TeamPlayer_teamId_playerId_key"
    ON "TeamPlayer"("teamId", "playerId")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Bid_teamId_playerId_roundNumber_key"
    ON "Bid"("teamId", "playerId", "roundNumber")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "MarketingDecision_teamId_roundNumber_key"
    ON "MarketingDecision"("teamId", "roundNumber")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "GameParameter_gameId_key"
    ON "GameParameter"("gameId")
  `);
}

function playerPrice(stats: number, roundNumber: number) {
  return Math.round((stats ** 2) / 10 + roundNumber * 100);
}

function clampInvestment(value: unknown) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return 0;
  return Math.max(0, Math.min(2, Math.floor(amount)));
}

function clampParameter(value: unknown, fallback: number) {
  const amount = Number(value ?? fallback);
  if (!Number.isFinite(amount)) return fallback;
  return Math.max(0, Math.min(100, Math.round(amount)));
}

function normalizeParameters(parameters: Partial<DbGameParameter>): DbGameParameter {
  return {
    id: parameters.id ?? "",
    gameId: parameters.gameId ?? "",
    injuryChance: clampParameter(parameters.injuryChance, DEFAULT_PARAMETERS.injuryChance),
    fanGain: clampParameter(parameters.fanGain, DEFAULT_PARAMETERS.fanGain),
    financialGrowth: clampParameter(parameters.financialGrowth, DEFAULT_PARAMETERS.financialGrowth),
    luckFactor: clampParameter(parameters.luckFactor, DEFAULT_PARAMETERS.luckFactor),
  };
}

async function getGameParameters(gameId: string) {
  await ensureGameLoopTables();
  const existing = await prisma.$queryRawUnsafe<DbGameParameter[]>(
    `
      SELECT id, injuryChance, fanGain, financialGrowth, luckFactor, gameId
      FROM GameParameter
      WHERE gameId = ?
      LIMIT 1
    `,
    gameId,
  );

  if (existing[0]) return normalizeParameters(existing[0]);

  const id = randomUUID();
  await prisma.$executeRawUnsafe(
    `
      INSERT INTO GameParameter (
        id, injuryChance, fanGain, financialGrowth, luckFactor, createdAt, updatedAt, gameId
      )
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)
    `,
    id,
    DEFAULT_PARAMETERS.injuryChance,
    DEFAULT_PARAMETERS.fanGain,
    DEFAULT_PARAMETERS.financialGrowth,
    DEFAULT_PARAMETERS.luckFactor,
    gameId,
  );

  return { id, gameId, ...DEFAULT_PARAMETERS };
}

function normalizeTeam(team: DbTeam): DbTeam & { ready: boolean } {
  return {
    ...team,
    ready: Boolean(team.ready),
  };
}

async function getTeams(gameId: string) {
  await ensureGameLoopTables();
  const teams = await prisma.$queryRawUnsafe<DbTeam[]>(
    `
      SELECT id, name, budget, fans, pubScore, merchScore, points, wins, draws, losses,
        pointDiff, ready, gameId
      FROM Team
      WHERE gameId = ?
      ORDER BY createdAt ASC
    `,
    gameId,
  );

  return teams.map(normalizeTeam);
}

async function getTeamRoster(teamId: string) {
  return prisma.$queryRawUnsafe<(DbTeamPlayer & { rating: number })[]>(
    `
      SELECT
        p.id, p.name, p.position, p.stats, p.stats as rating, p.price,
        p.roundNumber, p.market, p.sold, p.gameId,
        tp.id as teamPlayerId, tp.starter, tp.slot
      FROM TeamPlayer tp
      INNER JOIN Player p ON p.id = tp.playerId
      WHERE tp.teamId = ?
      ORDER BY tp.starter DESC, tp.slot ASC, p.name ASC
    `,
    teamId,
  );
}

async function ensureTeamRosters(gameId: string) {
  const teams = await getTeams(gameId);

  for (const team of teams) {
    const existing = await prisma.$queryRawUnsafe<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM TeamPlayer WHERE teamId = ?`,
      team.id,
    );

    if (Number(existing[0]?.count ?? 0) > 0) continue;

    for (let index = 0; index < rosterNames.length; index += 1) {
      const playerId = randomUUID();
      await prisma.$executeRawUnsafe(
        `
          INSERT INTO Player (id, name, position, stats, price, roundNumber, market, sold, gameId)
          VALUES (?, ?, ?, ?, 0, 0, false, false, ?)
        `,
        playerId,
        rosterNames[index],
        positions[index],
        INITIAL_PLAYER_STATS,
        gameId,
      );
      await prisma.$executeRawUnsafe(
        `
          INSERT INTO TeamPlayer (id, starter, slot, teamId, playerId)
          VALUES (?, ?, ?, ?, ?)
        `,
        randomUUID(),
        index < 15,
        index,
        team.id,
        playerId,
      );
    }
  }
}

async function ensureMarketPlayers(gameId: string, roundNumber: number) {
  if (roundNumber < 1) return;

  await ensureGameLoopTables();
  const existing = await prisma.$queryRawUnsafe<{ count: number }[]>(
    `SELECT COUNT(*) as count FROM Player WHERE gameId = ? AND roundNumber = ? AND market = true`,
    gameId,
    roundNumber,
  );

  if (Number(existing[0]?.count ?? 0) >= 15) return;

  for (let index = 0; index < marketNames.length; index += 1) {
    const skillIncrease = roundNumber * ((index % 10) + 1);
    const stats = INITIAL_PLAYER_STATS + skillIncrease;
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO Player (id, name, position, stats, price, roundNumber, market, sold, gameId)
        VALUES (?, ?, ?, ?, ?, ?, true, false, ?)
      `,
      randomUUID(),
      `${marketNames[index]} R${roundNumber}`,
      positions[index % positions.length],
      stats,
      playerPrice(stats, roundNumber),
      roundNumber,
      gameId,
    );
  }
}

async function getMarket(gameId: string, roundNumber: number) {
  if (roundNumber < 1) return [];
  await ensureMarketPlayers(gameId, roundNumber);
  return prisma.$queryRawUnsafe<DbPlayer[]>(
    `
      SELECT id, name, position, stats, price, roundNumber, market, sold, gameId
      FROM Player
      WHERE gameId = ? AND roundNumber = ? AND market = true AND sold = false
      ORDER BY stats DESC, price ASC
    `,
    gameId,
    roundNumber,
  );
}

async function getRoundBids(gameId: string, roundNumber: number) {
  if (roundNumber < 1) return [];
  return prisma.$queryRawUnsafe<DbBid[]>(
    `
      SELECT b.id, b.amount, b.roundNumber, b.teamId, b.playerId
      FROM Bid b
      INNER JOIN Player p ON p.id = b.playerId
      WHERE p.gameId = ? AND b.roundNumber = ?
      ORDER BY b.amount DESC
    `,
    gameId,
    roundNumber,
  );
}

async function getMarketingDecisions(gameId: string, roundNumber: number) {
  if (roundNumber < 1) return [];
  return prisma.$queryRawUnsafe<DbMarketingDecision[]>(
    `
      SELECT md.id, md.roundNumber, md.pubInvestment, md.merchInvestment, md.teamId
      FROM MarketingDecision md
      INNER JOIN Team t ON t.id = md.teamId
      WHERE t.gameId = ? AND md.roundNumber = ?
    `,
    gameId,
    roundNumber,
  );
}

async function getMatchResults(gameId: string) {
  return prisma.$queryRawUnsafe<DbMatchResult[]>(
    `
      SELECT id, roundNumber, scoreA, scoreB, resultA, resultB, fanDeltaA, fanDeltaB,
        moneyDeltaA, moneyDeltaB, teamAId, teamBId, gameId
      FROM MatchResult
      WHERE gameId = ?
      ORDER BY roundNumber ASC, createdAt ASC
    `,
    gameId,
  );
}

async function getTeamMembers(gameId: string) {
  return prisma.$queryRawUnsafe<DbTeamMember[]>(
    `
      SELECT tm.id, tm.userId, tm.teamId, u.name as userName
      FROM TeamMember tm
      INNER JOIN Team t ON t.id = tm.teamId
      INNER JOIN User u ON u.id = tm.userId
      WHERE t.gameId = ?
      ORDER BY tm.createdAt ASC
    `,
    gameId,
  );
}

async function getEnrichedTeams(gameId: string): Promise<EnrichedTeam[]> {
  await ensureTeamRosters(gameId);
  const [teams, members] = await Promise.all([getTeams(gameId), getTeamMembers(gameId)]);

  return Promise.all(
    teams.map(async (team) => {
      const teamMembers = members
        .filter((member) => member.teamId === team.id)
        .map((member) => ({
          id: member.id,
          userId: member.userId,
          teamId: member.teamId,
          user: { id: member.userId, name: member.userName },
        }));
      const roster = await getTeamRoster(team.id);
      return {
        ...team,
        members: teamMembers,
        roster,
      };
    }),
  );
}

function roundRobinPairs(teams: (DbTeam & { ready: boolean })[], roundNumber: number) {
  const fallbackPattern: [number, number, number, number] = [0, 1, 2, 3];
  const patterns: [number, number, number, number][] = [
    [0, 1, 2, 3],
    [0, 2, 1, 3],
    [0, 3, 1, 2],
    [1, 0, 3, 2],
    [2, 0, 3, 1],
    [3, 0, 2, 1],
  ];
  const pattern = patterns[(roundNumber - 1) % patterns.length] ?? fallbackPattern;
  return [
    [teams[pattern[0]], teams[pattern[1]]],
    [teams[pattern[2]], teams[pattern[3]]],
  ].filter(([teamA, teamB]) => teamA && teamB) as [
    DbTeam & { ready: boolean },
    DbTeam & { ready: boolean },
  ][];
}

async function averageStarterStats(teamId: string) {
  const rows = await prisma.$queryRawUnsafe<{ averageStats: number | null }[]>(
    `
      SELECT AVG(p.stats) as averageStats
      FROM TeamPlayer tp
      INNER JOIN Player p ON p.id = tp.playerId
      WHERE tp.teamId = ? AND tp.starter = true
    `,
    teamId,
  );

  return Number(rows[0]?.averageStats ?? INITIAL_PLAYER_STATS);
}

function deterministicLuck(teamId: string, roundNumber: number) {
  const seed = [...teamId].reduce((sum, char) => sum + char.charCodeAt(0), roundNumber * 97);
  return (Math.sin(seed) + 1) / 2;
}

async function calculateTeamScore(
  team: DbTeam & { ready: boolean },
  roundNumber: number,
  parameters: DbGameParameter,
) {
  const avgPlayersStats = await averageStarterStats(team.id);
  const luck = deterministicLuck(team.id, roundNumber);
  const injuryPenalty = luck * 100 < parameters.injuryChance ? 5 : 0;
  const adjustedPlayerStats = Math.max(0, avgPlayersStats - injuryPenalty);
  const luckWeight = 0.2 * (parameters.luckFactor / DEFAULT_PARAMETERS.luckFactor);

  return (
    (adjustedPlayerStats / 100) * 0.4 +
    (team.fans / MAX_FAN_NUMBER) * 0.2 +
    ((team.pubScore + team.merchScore) / 20) * 0.2 +
    luck * luckWeight
  );
}

function marketingCost(roundNumber: number, currentScore: number, investments: number) {
  let cost = 0;
  for (let step = 0; step < investments; step += 1) {
    cost += roundNumber * 7000 * (1 + Math.min(10, currentScore + step) / 10);
  }
  return Math.round(cost);
}

async function applyMarketingDecision(team: DbTeam & { ready: boolean }, roundNumber: number) {
  const decisions = await prisma.$queryRawUnsafe<DbMarketingDecision[]>(
    `
      SELECT id, roundNumber, pubInvestment, merchInvestment, teamId
      FROM MarketingDecision
      WHERE teamId = ? AND roundNumber = ?
      LIMIT 1
    `,
    team.id,
    roundNumber,
  );
  const decision = decisions[0];

  if (!decision) return normalizeTeam(team);

  const pubInvestment = Math.min(10 - team.pubScore, clampInvestment(decision.pubInvestment));
  const merchInvestment = Math.min(10 - team.merchScore, clampInvestment(decision.merchInvestment));
  const pubCost = marketingCost(roundNumber, team.pubScore, pubInvestment);
  const merchCost = marketingCost(roundNumber, team.merchScore, merchInvestment);
  const nextBudget = Math.max(0, team.budget - pubCost - merchCost);

  await prisma.$executeRawUnsafe(
    `
      UPDATE Team
      SET pubScore = ?, merchScore = ?, budget = ?
      WHERE id = ?
    `,
    Math.min(10, team.pubScore + pubInvestment),
    Math.min(10, team.merchScore + merchInvestment),
    nextBudget,
    team.id,
  );

  return {
    ...team,
    pubScore: Math.min(10, team.pubScore + pubInvestment),
    merchScore: Math.min(10, team.merchScore + merchInvestment),
    budget: nextBudget,
  };
}

async function resolveBids(gameId: string, roundNumber: number) {
  const market = await getMarket(gameId, roundNumber);

  for (const player of market) {
    const winningBids = await prisma.$queryRawUnsafe<DbBid[]>(
      `
        SELECT id, amount, roundNumber, teamId, playerId
        FROM Bid
        WHERE playerId = ? AND roundNumber = ? AND amount >= ?
        ORDER BY amount DESC, createdAt ASC
        LIMIT 1
      `,
      player.id,
      roundNumber,
      player.price,
    );
    const winningBid = winningBids[0];

    if (!winningBid) continue;

    const teams = await getTeams(gameId);
    const winningTeam = teams.find((team) => team.id === winningBid.teamId);
    if (!winningTeam || winningTeam.budget < winningBid.amount) continue;

    await prisma.$executeRawUnsafe(
      `UPDATE Team SET budget = budget - ? WHERE id = ?`,
      winningBid.amount,
      winningTeam.id,
    );
    await prisma.$executeRawUnsafe(
      `UPDATE Player SET market = false, sold = true WHERE id = ?`,
      player.id,
    );
    await prisma.$executeRawUnsafe(
      `
        INSERT OR IGNORE INTO TeamPlayer (id, starter, slot, teamId, playerId)
        VALUES (?, false, ?, ?, ?)
      `,
      randomUUID(),
      100 + roundNumber,
      winningTeam.id,
      player.id,
    );
  }
}

function outcomeLabel(scoreFor: number, scoreAgainst: number) {
  if (scoreFor > scoreAgainst) return "win";
  if (scoreFor < scoreAgainst) return "loss";
  return "draw";
}

function pointsForOutcome(outcome: string) {
  if (outcome === "win") return 3;
  if (outcome === "draw") return 1;
  return 0;
}

function fanBonus(outcome: string) {
  if (outcome === "win") return 5000;
  if (outcome === "draw") return 2000;
  return -1000;
}

async function updateTeamAfterMatch(
  team: DbTeam & { ready: boolean },
  roundNumber: number,
  outcome: string,
  scoreFor: number,
  scoreAgainst: number,
  parameters: DbGameParameter,
) {
  const fanGainMultiplier = parameters.fanGain / DEFAULT_PARAMETERS.fanGain;
  const financialGrowthMultiplier = parameters.financialGrowth / DEFAULT_PARAMETERS.financialGrowth;
  const fanGain = Math.round(
    team.fans * (0.05 + (team.pubScore + team.merchScore) / 50) * fanGainMultiplier,
  );
  const fanDelta = fanGain + fanBonus(outcome);
  const nextFans = Math.max(0, Math.min(MAX_FAN_NUMBER, team.fans + fanDelta));
  const revenue = Math.round(roundNumber * 5000 * (nextFans / 5000) * financialGrowthMultiplier);
  const matchBonus = outcome === "win" ? roundNumber * 10000 : 0;
  const moneyDelta = revenue + matchBonus;
  const scoreDiff = scoreFor - scoreAgainst;

  await prisma.$executeRawUnsafe(
    `
      UPDATE Team
      SET fans = ?, budget = budget + ?, points = points + ?,
        wins = wins + ?, draws = draws + ?, losses = losses + ?,
        pointDiff = pointDiff + ?
      WHERE id = ?
    `,
    nextFans,
    moneyDelta,
    pointsForOutcome(outcome),
    outcome === "win" ? 1 : 0,
    outcome === "draw" ? 1 : 0,
    outcome === "loss" ? 1 : 0,
    scoreDiff,
    team.id,
  );

  return { fanDelta, moneyDelta };
}

async function simulateRound(gameId: string, roundNumber: number) {
  const existing = await prisma.$queryRawUnsafe<{ count: number }[]>(
    `SELECT COUNT(*) as count FROM MatchResult WHERE gameId = ? AND roundNumber = ?`,
    gameId,
    roundNumber,
  );

  if (Number(existing[0]?.count ?? 0) > 0) return;

  await ensureTeamRosters(gameId);
  await resolveBids(gameId, roundNumber);

  const teamsBeforeMarketing = await getTeams(gameId);
  for (const team of teamsBeforeMarketing) {
    await applyMarketingDecision(team, roundNumber);
  }

  const teams = await getTeams(gameId);
  const pairs = roundRobinPairs(teams, roundNumber);
  const parameters = await getGameParameters(gameId);

  for (const [teamA, teamB] of pairs) {
    const rawScoreA = await calculateTeamScore(teamA, roundNumber, parameters);
    const rawScoreB = await calculateTeamScore(teamB, roundNumber, parameters);
    const scoreA = Math.round(rawScoreA * 100);
    const scoreB = Math.round(rawScoreB * 100);
    const resultA = outcomeLabel(scoreA, scoreB);
    const resultB = outcomeLabel(scoreB, scoreA);
    const deltaA = await updateTeamAfterMatch(teamA, roundNumber, resultA, scoreA, scoreB, parameters);
    const deltaB = await updateTeamAfterMatch(teamB, roundNumber, resultB, scoreB, scoreA, parameters);

    await prisma.$executeRawUnsafe(
      `
        INSERT INTO MatchResult (
          id, roundNumber, scoreA, scoreB, resultA, resultB,
          fanDeltaA, fanDeltaB, moneyDeltaA, moneyDeltaB, gameId, teamAId, teamBId
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      randomUUID(),
      roundNumber,
      scoreA,
      scoreB,
      resultA,
      resultB,
      deltaA.fanDelta,
      deltaB.fanDelta,
      deltaA.moneyDelta,
      deltaB.moneyDelta,
      gameId,
      teamA.id,
      teamB.id,
    );
  }

  await prisma.$executeRawUnsafe(`UPDATE Team SET ready = false WHERE gameId = ?`, gameId);
}

async function ensureDefaultTeams(gameId: string) {
  await ensureGameLoopTables();
  const teams = await prisma.team.findMany({
    where: { gameId },
    orderBy: { createdAt: "asc" },
  });

  if (teams.length >= defaultTeamNames.length) {
    return teams;
  }

  const existingNames = new Set(teams.map((team) => team.name));
  const missingNames = defaultTeamNames.filter((name) => !existingNames.has(name));

  for (const name of missingNames.slice(0, defaultTeamNames.length - teams.length)) {
    await prisma.team.create({
      data: { name, gameId },
    });
  }

  return prisma.team.findMany({
    where: { gameId },
    orderBy: { createdAt: "asc" },
  });
}

async function getJoinedStudents(gameId: string) {
  await ensureParticipantTable();

  return prisma.$queryRawUnsafe<JoinedStudentRow[]>(
    `
      SELECT
        u.id,
        u.name,
        gp.createdAt as joinedAt,
        (
          SELECT tm.teamId
          FROM TeamMember tm
          INNER JOIN Team assignedTeam ON assignedTeam.id = tm.teamId
          WHERE tm.userId = u.id AND assignedTeam.gameId = gp.gameId
          LIMIT 1
        ) as teamId
      FROM GameParticipant gp
      INNER JOIN User u ON u.id = gp.userId
      WHERE gp.gameId = ?
      ORDER BY gp.createdAt ASC
    `,
    gameId,
  );
}

// GET /api/games
// Lists all games (optionally filtered by ownerId query param)
router.get("/", async (req, res) => {
  try {
    const { ownerId } = req.query;
    
    const filter = ownerId ? { ownerId: String(ownerId) } : {};
    
    const games = await prisma.gameInstance.findMany({
      where: filter,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { teams: true }
        }
      }
    });
    
    res.json({ games });
  } catch (error) {
    console.error("Failed to fetch games:", error);
    res.status(500).json({ error: "Failed to fetch games" });
  }
});

// POST /api/games/join
// Validates a student join code and records the authenticated student for lookup.
router.post("/join", async (req, res) => {
  try {
    const { joinCode, studentId, studentName } = req.body;
    const normalizedJoinCode = String(joinCode ?? "").trim().toUpperCase();
    const normalizedStudentId = String(studentId ?? "").trim();

    if (!normalizedJoinCode || !normalizedStudentId) {
      return res.status(400).json({ error: "Missing join code or student ID" });
    }

    const game = await prisma.gameInstance.findUnique({
      where: { joinCode: normalizedJoinCode },
      select: {
        id: true,
        name: true,
        joinCode: true,
        status: true,
      },
    });

    if (!game) {
      return res.status(404).json({ error: "No game found for this class code" });
    }

    if (!["CREATED", "ACTIVE"].includes(game.status)) {
      return res.status(409).json({ error: "This game is not accepting participants" });
    }

    await prisma.user.upsert({
      where: { id: normalizedStudentId },
      update: {
        name: studentName || "Student",
        role: "STUDENT",
      },
      create: {
        id: normalizedStudentId,
        name: studentName || "Student",
        role: "STUDENT",
      },
    });

    await ensureParticipantTable();
    await prisma.$executeRawUnsafe(
      `
        INSERT OR IGNORE INTO GameParticipant (id, userId, gameId)
        VALUES (?, ?, ?)
      `,
      randomUUID(),
      normalizedStudentId,
      game.id,
    );

    res.json({ game });
  } catch (error) {
    console.error("Failed to join game:", error);
    res.status(500).json({ error: "Failed to join game" });
  }
});

// GET /api/games/:gameId
// Fetches a single game with its teams, members, and joined students.
router.get("/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await prisma.gameInstance.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        name: true,
        joinCode: true,
        status: true,
        currentRound: true,
      },
    });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    await ensureDefaultTeams(gameId);
    await ensureTeamRosters(gameId);
    const [teams, participants, market, bids, marketingDecisions, results, parameters] = await Promise.all([
      getEnrichedTeams(gameId),
      getJoinedStudents(gameId),
      getMarket(gameId, game.currentRound),
      getRoundBids(gameId, game.currentRound),
      getMarketingDecisions(gameId, game.currentRound),
      getMatchResults(gameId),
      getGameParameters(gameId),
    ]);

    res.json({ game, teams, participants, market, bids, marketingDecisions, results, parameters });
  } catch (error) {
    console.error("Failed to fetch game:", error);
    res.status(500).json({ error: "Failed to fetch game" });
  }
});

// GET /api/games/:gameId/assignment
// Returns a student's team assignment for a game, if the teacher has assigned one.
router.get("/:gameId/assignment", async (req, res) => {
  try {
    const { gameId } = req.params;
    const studentId = String(req.query.studentId ?? "").trim();

    if (!studentId) {
      return res.status(400).json({ error: "Missing student ID" });
    }

    await ensureGameLoopTables();
    const membership = await prisma.$queryRawUnsafe<(DbTeam & { memberId: string })[]>(
      `
        SELECT t.id, t.name, t.budget, t.fans, t.pubScore, t.merchScore, t.points, t.wins,
          t.draws, t.losses, t.pointDiff, t.ready, t.gameId, tm.id as memberId
        FROM TeamMember tm
        INNER JOIN Team t ON t.id = tm.teamId
        WHERE tm.userId = ? AND t.gameId = ?
        LIMIT 1
      `,
      studentId,
      gameId,
    );
    const assignedTeam = membership[0] ? normalizeTeam(membership[0]) : null;

    res.json({
      assigned: Boolean(assignedTeam),
      team: assignedTeam,
    });
  } catch (error) {
    console.error("Failed to fetch team assignment:", error);
    res.status(500).json({ error: "Failed to fetch team assignment" });
  }
});

// PUT /api/games/:gameId/parameters
// Persists teacher-controlled simulation knobs for this game.
router.put("/:gameId/parameters", async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await prisma.gameInstance.findUnique({ where: { id: gameId } });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const parameters = normalizeParameters({
      injuryChance: req.body.injuryChance,
      fanGain: req.body.fanGain,
      financialGrowth: req.body.financialGrowth,
      luckFactor: req.body.luckFactor,
      gameId,
    });

    await ensureGameLoopTables();
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO GameParameter (
          id, injuryChance, fanGain, financialGrowth, luckFactor, createdAt, updatedAt, gameId
        )
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)
        ON CONFLICT(gameId) DO UPDATE SET
          injuryChance = excluded.injuryChance,
          fanGain = excluded.fanGain,
          financialGrowth = excluded.financialGrowth,
          luckFactor = excluded.luckFactor,
          updatedAt = CURRENT_TIMESTAMP
      `,
      randomUUID(),
      parameters.injuryChance,
      parameters.fanGain,
      parameters.financialGrowth,
      parameters.luckFactor,
      gameId,
    );

    res.json({ parameters: await getGameParameters(gameId) });
  } catch (error) {
    console.error("Failed to save parameters:", error);
    res.status(500).json({ error: "Failed to save parameters" });
  }
});

// POST /api/games/:gameId/teams/:teamId/members
// Assigns or moves a joined student into one of this game's teams.
router.post("/:gameId/teams/:teamId/members", async (req, res) => {
  try {
    const { gameId, teamId } = req.params;
    const studentId = String(req.body.studentId ?? "").trim();

    if (!studentId) {
      return res.status(400).json({ error: "Missing student ID" });
    }

    const team = await prisma.team.findFirst({
      where: { id: teamId, gameId },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found for this game" });
    }

    await ensureParticipantTable();
    const participant = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT id FROM GameParticipant WHERE userId = ? AND gameId = ? LIMIT 1`,
      studentId,
      gameId,
    );

    if (participant.length === 0) {
      return res.status(404).json({ error: "Student has not joined this game" });
    }

    const gameTeams = await prisma.team.findMany({
      where: { gameId },
      select: { id: true },
    });
    const teamIds = gameTeams.map((gameTeam) => gameTeam.id);

    if (teamIds.length > 0) {
      await prisma.teamMember.deleteMany({
        where: {
          userId: studentId,
          teamId: { in: teamIds },
        },
      });
    }

    await prisma.teamMember.create({
      data: {
        userId: studentId,
        teamId,
      },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to assign student:", error);
    res.status(500).json({ error: "Failed to assign student" });
  }
});

// POST /api/games/:gameId/teams/:teamId/lineup
// Saves the 15 starters used by the next simulated match.
router.post("/:gameId/teams/:teamId/lineup", async (req, res) => {
  try {
    const { gameId, teamId } = req.params;
    const starterPlayerIds = Array.isArray(req.body.starterPlayerIds)
      ? req.body.starterPlayerIds.map((id: unknown) => String(id))
      : [];
    const game = await prisma.gameInstance.findUnique({ where: { id: gameId } });

    if (!game) return res.status(404).json({ error: "Game not found" });
    if (game.status !== "ACTIVE") return res.status(409).json({ error: "Round is not open" });

    if (starterPlayerIds.length === 0 || starterPlayerIds.length > 15) {
      return res.status(400).json({ error: "Choose between 1 and 15 starters" });
    }

    const teams = await getTeams(gameId);
    if (!teams.some((team) => team.id === teamId)) {
      return res.status(404).json({ error: "Team not found for this game" });
    }

    const placeholders = starterPlayerIds.map(() => "?").join(",");
    const ownedPlayers = await prisma.$queryRawUnsafe<{ playerId: string }[]>(
      `
        SELECT playerId FROM TeamPlayer
        WHERE teamId = ? AND playerId IN (${placeholders})
      `,
      teamId,
      ...starterPlayerIds,
    );

    if (ownedPlayers.length !== starterPlayerIds.length) {
      return res.status(400).json({ error: "Lineup includes a player not owned by this team" });
    }

    await prisma.$executeRawUnsafe(`UPDATE TeamPlayer SET starter = false WHERE teamId = ?`, teamId);
    for (let index = 0; index < starterPlayerIds.length; index += 1) {
      await prisma.$executeRawUnsafe(
        `UPDATE TeamPlayer SET starter = true, slot = ? WHERE teamId = ? AND playerId = ?`,
        index,
        teamId,
        starterPlayerIds[index],
      );
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to save lineup:", error);
    res.status(500).json({ error: "Failed to save lineup" });
  }
});

// POST /api/games/:gameId/teams/:teamId/bids
// Places or updates a round bid. Money is reserved conceptually until round close.
router.post("/:gameId/teams/:teamId/bids", async (req, res) => {
  try {
    const { gameId, teamId } = req.params;
    const playerId = String(req.body.playerId ?? "");
    const amount = Number(req.body.amount ?? 0);
    const game = await prisma.gameInstance.findUnique({ where: { id: gameId } });

    if (!game) return res.status(404).json({ error: "Game not found" });
    if (game.status !== "ACTIVE") return res.status(409).json({ error: "Round is not open" });
    if (!playerId || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid bid" });
    }

    const teams = await getTeams(gameId);
    const team = teams.find((item) => item.id === teamId);
    if (!team) return res.status(404).json({ error: "Team not found for this game" });
    if (amount > team.budget) return res.status(400).json({ error: "Bid exceeds team budget" });

    const marketPlayers = await prisma.$queryRawUnsafe<DbPlayer[]>(
      `
        SELECT id, name, position, stats, price, roundNumber, market, sold, gameId
        FROM Player
        WHERE id = ? AND gameId = ? AND roundNumber = ? AND market = true AND sold = false
        LIMIT 1
      `,
      playerId,
      gameId,
      game.currentRound,
    );

    if (!marketPlayers[0]) return res.status(404).json({ error: "Market player not found" });
    if (amount < marketPlayers[0].price) {
      return res.status(400).json({ error: "Bid must meet the starting price" });
    }

    await prisma.$executeRawUnsafe(
      `
        INSERT INTO Bid (id, amount, roundNumber, teamId, playerId)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(teamId, playerId, roundNumber) DO UPDATE SET amount = excluded.amount
      `,
      randomUUID(),
      amount,
      game.currentRound,
      teamId,
      playerId,
    );

    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to place bid:", error);
    res.status(500).json({ error: "Failed to place bid" });
  }
});

// POST /api/games/:gameId/teams/:teamId/marketing
// Saves up to two public relations and merchandising investments for this round.
router.post("/:gameId/teams/:teamId/marketing", async (req, res) => {
  try {
    const { gameId, teamId } = req.params;
    const pubInvestment = clampInvestment(req.body.pubInvestment);
    const merchInvestment = clampInvestment(req.body.merchInvestment);
    const game = await prisma.gameInstance.findUnique({ where: { id: gameId } });

    if (!game) return res.status(404).json({ error: "Game not found" });
    if (game.status !== "ACTIVE") return res.status(409).json({ error: "Round is not open" });

    const teams = await getTeams(gameId);
    if (!teams.some((team) => team.id === teamId)) {
      return res.status(404).json({ error: "Team not found for this game" });
    }

    await prisma.$executeRawUnsafe(
      `
        INSERT INTO MarketingDecision (
          id, roundNumber, pubInvestment, merchInvestment, createdAt, updatedAt, teamId
        )
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)
        ON CONFLICT(teamId, roundNumber) DO UPDATE SET
          pubInvestment = excluded.pubInvestment,
          merchInvestment = excluded.merchInvestment,
          updatedAt = CURRENT_TIMESTAMP
      `,
      randomUUID(),
      game.currentRound,
      pubInvestment,
      merchInvestment,
      teamId,
    );

    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to save marketing:", error);
    res.status(500).json({ error: "Failed to save marketing" });
  }
});

// POST /api/games/:gameId/teams/:teamId/ready
// Marks the team as ready after decisions are saved.
router.post("/:gameId/teams/:teamId/ready", async (req, res) => {
  try {
    const { gameId, teamId } = req.params;
    const game = await prisma.gameInstance.findUnique({ where: { id: gameId } });

    if (!game) return res.status(404).json({ error: "Game not found" });
    if (game.status !== "ACTIVE") return res.status(409).json({ error: "Round is not open" });

    const teams = await getTeams(gameId);
    if (!teams.some((team) => team.id === teamId)) {
      return res.status(404).json({ error: "Team not found for this game" });
    }

    await prisma.$executeRawUnsafe(`UPDATE Team SET ready = true WHERE id = ?`, teamId);
    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to mark ready:", error);
    res.status(500).json({ error: "Failed to mark ready" });
  }
});

// DELETE /api/games/:gameId/participants/:studentId/assignment
// Removes a student's team assignment while keeping them in the joined list.
router.delete("/:gameId/participants/:studentId/assignment", async (req, res) => {
  try {
    const { gameId, studentId } = req.params;
    const gameTeams = await prisma.team.findMany({
      where: { gameId },
      select: { id: true },
    });

    await prisma.teamMember.deleteMany({
      where: {
        userId: studentId,
        teamId: { in: gameTeams.map((team) => team.id) },
      },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to unassign student:", error);
    res.status(500).json({ error: "Failed to unassign student" });
  }
});

// POST /api/games/:gameId/round
// Updates round lifecycle controls for the teacher.
router.post("/:gameId/round", async (req, res) => {
  try {
    const { gameId } = req.params;
    const action = String(req.body.action ?? "");
    const game = await prisma.gameInstance.findUnique({ where: { id: gameId } });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    let data: { status?: string; currentRound?: number };

    if (action === "launch") {
      const roundNumber = Math.max(game.currentRound, 1);
      await ensureDefaultTeams(gameId);
      await ensureTeamRosters(gameId);
      await ensureMarketPlayers(gameId, roundNumber);
      await prisma.$executeRawUnsafe(`UPDATE Team SET ready = false WHERE gameId = ?`, gameId);
      data = {
        status: "ACTIVE",
        currentRound: roundNumber,
      };
    } else if (action === "stop") {
      data = { status: "PAUSED" };
    } else if (action === "next") {
      const roundToSimulate = Math.max(game.currentRound, 1);
      await simulateRound(gameId, roundToSimulate);
      const nextRound = Math.min(roundToSimulate + 1, 6);
      const finished = roundToSimulate >= 6;
      if (!finished) await ensureMarketPlayers(gameId, nextRound);
      data = {
        currentRound: finished ? 6 : nextRound,
        status: finished ? "FINISHED" : "CREATED",
      };
    } else {
      return res.status(400).json({ error: "Unknown round action" });
    }

    const updatedGame = await prisma.gameInstance.update({
      where: { id: gameId },
      data,
    });

    res.json({ game: updatedGame });
  } catch (error) {
    console.error("Failed to update round:", error);
    res.status(500).json({ error: "Failed to update round" });
  }
});

// POST /api/games
// Creates a new game instance
router.post("/", async (req, res) => {
  try {
    const { name, ownerId } = req.body;
    
    if (!name || !ownerId) {
      return res.status(400).json({ error: "Missing name or ownerId" });
    }

    await ensureGameLoopTables();

    // Ensure the user exists, or create a mock teacher if not for testing
    let user = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!user) {
       user = await prisma.user.create({
         data: {
           id: ownerId,
           name: "Mock Teacher",
           role: "TEACHER"
         }
       });
    }

    let joinCode = generateJoinCode();
    while (await prisma.gameInstance.findUnique({ where: { joinCode } })) {
      joinCode = generateJoinCode();
    }
    
    const newGame = await prisma.gameInstance.create({
      data: {
        name,
        ownerId: user.id,
        joinCode,
        status: "CREATED",
        currentRound: 0,
        teams: {
          create: defaultTeamNames.map((teamName) => ({ name: teamName })),
        },
      }
    });
    await ensureTeamRosters(newGame.id);
    await getGameParameters(newGame.id);
    
    res.status(201).json({ game: newGame });
  } catch (error) {
    console.error("Failed to create game:", error);
    res.status(500).json({ error: "Failed to create game" });
  }
});

export default router;
