import { existsSync, readFileSync, readdirSync, unlinkSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import express, { type Express } from "express";
import request, { type SuperTest, type Test } from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

type Game = {
  id: string;
  joinCode: string;
  status: string;
  currentRound: number;
};

type Team = {
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
  ready: boolean;
  roster: { id: string; starter: boolean | number }[];
};

type MatchResult = {
  id: string;
  roundNumber: number;
  scoreA: number;
  scoreB: number;
  resultA: "win" | "draw" | "loss";
  resultB: "win" | "draw" | "loss";
  fanDeltaA: number;
  fanDeltaB: number;
  moneyDeltaA: number;
  moneyDeltaB: number;
  teamAId: string;
  teamBId: string;
};

type GameDetails = {
  game: Game;
  teams: Team[];
  participants: { id: string; teamId: string | null }[];
  market: { id: string; price: number }[];
  results: MatchResult[];
  parameters: GameParameters;
};

type GameParameters = {
  injuryChance: number;
  fanGain: number;
  financialGrowth: number;
  luckFactor: number;
};

const DEFAULT_PARAMETERS: GameParameters = {
  injuryChance: 12,
  fanGain: 20,
  financialGrowth: 8,
  luckFactor: 50,
};

let api: SuperTest<Test>;
let prisma: { $disconnect: () => Promise<void> };
let testDbPath = "";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3") as new (filename: string) => {
  exec: (sql: string) => void;
  close: () => void;
};

function pointsFor(outcome: string) {
  if (outcome === "win") return 3;
  if (outcome === "draw") return 1;
  return 0;
}

function fanBonus(outcome: string) {
  if (outcome === "win") return 5000;
  if (outcome === "draw") return 2000;
  return -1000;
}

function expectedRoundEconomy({
  fansBefore,
  pubScore,
  merchScore,
  outcome,
  roundNumber,
  parameters,
}: {
  fansBefore: number;
  pubScore: number;
  merchScore: number;
  outcome: string;
  roundNumber: number;
  parameters: GameParameters;
}) {
  const fanGainMultiplier = parameters.fanGain / DEFAULT_PARAMETERS.fanGain;
  const financialGrowthMultiplier = parameters.financialGrowth / DEFAULT_PARAMETERS.financialGrowth;
  const fanGain = Math.round(
    fansBefore * (0.05 + (pubScore + merchScore) / 50) * fanGainMultiplier,
  );
  const fanDelta = fanGain + fanBonus(outcome);
  const nextFans = Math.max(0, Math.min(1000000, fansBefore + fanDelta));
  const revenue = Math.round(roundNumber * 5000 * (nextFans / 5000) * financialGrowthMultiplier);
  const moneyDelta = revenue + (outcome === "win" ? roundNumber * 10000 : 0);

  return { fanDelta, moneyDelta, nextFans };
}

async function createApp() {
  testDbPath = join(process.cwd(), "prisma", `test-${process.pid}-${Date.now()}.db`);
  const dbUrl = `file:${testDbPath}`;
  process.env.DATABASE_URL = dbUrl;

  const db = new Database(testDbPath);
  const migrationRoot = join(process.cwd(), "prisma", "migrations");
  const migrations = readdirSync(migrationRoot)
    .filter((entry) => /^\d/.test(entry))
    .sort();

  for (const migration of migrations) {
    db.exec(readFileSync(join(migrationRoot, migration, "migration.sql"), "utf8"));
  }
  db.close();

  const [{ default: authRouter }, { default: gamesRouter }, prismaModule] = await Promise.all([
    import("./auth.js"),
    import("./games.js"),
    import("../lib/prisma.js"),
  ]);
  prisma = prismaModule.default;

  const app: Express = express();
  app.use(express.json());
  app.use("/api/auth", authRouter);
  app.use("/api/games", gamesRouter);
  api = request(app);
}

async function createGame(name: string) {
  const response = await api
    .post("/api/games")
    .send({ name, ownerId: `teacher-${name}` })
    .expect(201);

  return response.body.game as Game;
}

async function getGame(gameId: string) {
  const response = await api.get(`/api/games/${gameId}`).expect(200);
  return response.body as GameDetails;
}

async function createAssignedGame(name: string) {
  const game = await createGame(name);

  for (let index = 0; index < 4; index += 1) {
    await api
      .post("/api/games/join")
      .send({
        joinCode: game.joinCode,
        studentId: `${name}-student-${index}`,
        studentName: `Student ${index + 1}`,
      })
      .expect(200);
  }

  let details = await getGame(game.id);
  for (let index = 0; index < 4; index += 1) {
    await api
      .post(`/api/games/${game.id}/teams/${details.teams[index].id}/members`)
      .send({ studentId: details.participants[index].id })
      .expect(200);
  }

  details = await getGame(game.id);
  return { game, details };
}

async function saveParameters(gameId: string, parameters: Partial<GameParameters>) {
  const response = await api.put(`/api/games/${gameId}/parameters`).send(parameters).expect(200);
  return response.body.parameters as GameParameters;
}

async function launchRound(gameId: string) {
  await api.post(`/api/games/${gameId}/round`).send({ action: "launch" }).expect(200);
  return getGame(gameId);
}

async function submitTeamDecisions(
  gameId: string,
  details: GameDetails,
  marketing: { pubInvestment: number; merchInvestment: number },
) {
  for (const team of details.teams) {
    const starters = team.roster
      .filter((player) => Boolean(player.starter))
      .slice(0, 15)
      .map((player) => player.id);

    await api
      .post(`/api/games/${gameId}/teams/${team.id}/lineup`)
      .send({ starterPlayerIds: starters })
      .expect(200);
    await api.post(`/api/games/${gameId}/teams/${team.id}/marketing`).send(marketing).expect(200);
    await api.post(`/api/games/${gameId}/teams/${team.id}/ready`).expect(200);
  }
}

async function closeRound(gameId: string) {
  await api.post(`/api/games/${gameId}/round`).send({ action: "stop" }).expect(200);
  await api.post(`/api/games/${gameId}/round`).send({ action: "next" }).expect(200);
  return getGame(gameId);
}

async function playRound(
  gameId: string,
  marketing: { pubInvestment: number; merchInvestment: number } = {
    pubInvestment: 0,
    merchInvestment: 0,
  },
) {
  const details = await launchRound(gameId);
  await submitTeamDecisions(gameId, details, marketing);
  return closeRound(gameId);
}

function assertRoundOneEconomy(
  result: MatchResult,
  teamId: string,
  outcome: string,
  fanDelta: number,
  moneyDelta: number,
  expectedScores: { pubScore: number; merchScore: number },
  parameters: GameParameters,
) {
  const expected = expectedRoundEconomy({
    fansBefore: 1000,
    pubScore: expectedScores.pubScore,
    merchScore: expectedScores.merchScore,
    outcome,
    roundNumber: 1,
    parameters,
  });

  expect(fanDelta, `${teamId} fan delta`).toBe(expected.fanDelta);
  expect(moneyDelta, `${teamId} money delta`).toBe(expected.moneyDelta);
}

function aggregateResults(results: MatchResult[]) {
  const rows = new Map<
    string,
    { wins: number; draws: number; losses: number; points: number; pointDiff: number; played: number }
  >();

  function rowFor(teamId: string) {
    const current = rows.get(teamId) ?? {
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0,
      pointDiff: 0,
      played: 0,
    };
    rows.set(teamId, current);
    return current;
  }

  for (const result of results) {
    const teamA = rowFor(result.teamAId);
    const teamB = rowFor(result.teamBId);

    teamA.played += 1;
    teamB.played += 1;
    teamA.wins += result.resultA === "win" ? 1 : 0;
    teamA.draws += result.resultA === "draw" ? 1 : 0;
    teamA.losses += result.resultA === "loss" ? 1 : 0;
    teamA.points += pointsFor(result.resultA);
    teamA.pointDiff += result.scoreA - result.scoreB;

    teamB.wins += result.resultB === "win" ? 1 : 0;
    teamB.draws += result.resultB === "draw" ? 1 : 0;
    teamB.losses += result.resultB === "loss" ? 1 : 0;
    teamB.points += pointsFor(result.resultB);
    teamB.pointDiff += result.scoreB - result.scoreA;
  }

  return rows;
}

beforeAll(async () => {
  await createApp();
}, 30000);

afterAll(async () => {
  await prisma?.$disconnect();
  if (testDbPath && existsSync(testDbPath)) unlinkSync(testDbPath);
});

describe("tournament API", () => {
  it("creates sessions and uses authenticated identities for game ownership and joining", async () => {
    const teacherLogin = await api.get("/api/auth/login?role=TEACHER&next=/teacher").expect(302);
    const teacherCookie = teacherLogin.headers["set-cookie"];
    expect(teacherCookie).toBeDefined();

    const teacherMe = await api.get("/api/auth/me").set("Cookie", teacherCookie).expect(200);
    expect(teacherMe.body.user).toMatchObject({
      id: "demo-teacher",
      role: "TEACHER",
    });

    const created = await api
      .post("/api/games")
      .set("Cookie", teacherCookie)
      .send({ name: "authenticated-game" })
      .expect(201);
    const game = created.body.game as Game;

    const teacherGames = await api.get("/api/games").set("Cookie", teacherCookie).expect(200);
    expect(teacherGames.body.games.some((item: Game) => item.id === game.id)).toBe(true);

    const studentLogin = await api.get("/api/auth/login?role=STUDENT&next=/student").expect(302);
    const studentCookie = studentLogin.headers["set-cookie"];
    await api
      .post("/api/games/join")
      .set("Cookie", studentCookie)
      .send({ joinCode: game.joinCode })
      .expect(200);

    const details = await getGame(game.id);
    expect(details.participants.some((participant) => participant.id === "demo-student")).toBe(true);
  });

  it("persists parameters and locks student decisions outside an active round", async () => {
    const { game, details } = await createAssignedGame("locks-and-parameters");
    const team = details.teams[0];
    const starters = team.roster.filter((player) => Boolean(player.starter)).map((player) => player.id);

    expect(details.parameters).toMatchObject(DEFAULT_PARAMETERS);

    const parameters = await saveParameters(game.id, {
      injuryChance: 120,
      fanGain: -5,
      financialGrowth: 16,
      luckFactor: 75,
    });
    expect(parameters).toMatchObject({
      injuryChance: 100,
      fanGain: 0,
      financialGrowth: 16,
      luckFactor: 75,
    });

    const reloaded = await getGame(game.id);
    expect(reloaded.parameters).toMatchObject(parameters);

    await api
      .post(`/api/games/${game.id}/teams/${team.id}/lineup`)
      .send({ starterPlayerIds: starters })
      .expect(409);
    await api
      .post(`/api/games/${game.id}/teams/${team.id}/marketing`)
      .send({ pubInvestment: 1, merchInvestment: 1 })
      .expect(409);
    await api.post(`/api/games/${game.id}/teams/${team.id}/ready`).expect(409);
    await api
      .post(`/api/games/${game.id}/teams/${team.id}/bids`)
      .send({ playerId: "not-open-yet", amount: 1000 })
      .expect(409);
  });

  it("calculates round one fans, money, results, and team standings from the formulas", async () => {
    const { game } = await createAssignedGame("round-one-formulas");
    const parameters = await saveParameters(game.id, {
      injuryChance: 0,
      fanGain: 20,
      financialGrowth: 8,
      luckFactor: 50,
    });
    const details = await playRound(game.id);

    expect(details.results).toHaveLength(2);

    for (const result of details.results) {
      assertRoundOneEconomy(
        result,
        result.teamAId,
        result.resultA,
        result.fanDeltaA,
        result.moneyDeltaA,
        { pubScore: 0, merchScore: 0 },
        parameters,
      );
      assertRoundOneEconomy(
        result,
        result.teamBId,
        result.resultB,
        result.fanDeltaB,
        result.moneyDeltaB,
        { pubScore: 0, merchScore: 0 },
        parameters,
      );
    }

    const expectedRows = aggregateResults(details.results);
    for (const team of details.teams) {
      const expected = expectedRows.get(team.id);
      expect(expected).toBeDefined();
      expect(team.wins).toBe(expected?.wins);
      expect(team.draws).toBe(expected?.draws);
      expect(team.losses).toBe(expected?.losses);
      expect(team.points).toBe(expected?.points);
      expect(team.pointDiff).toBe(expected?.pointDiff);

      const teamResult = details.results.find(
        (result) => result.teamAId === team.id || result.teamBId === team.id,
      );
      const fanDelta = teamResult?.teamAId === team.id ? teamResult.fanDeltaA : teamResult?.fanDeltaB ?? 0;
      const moneyDelta =
        teamResult?.teamAId === team.id ? teamResult.moneyDeltaA : teamResult?.moneyDeltaB ?? 0;
      expect(team.fans).toBe(1000 + fanDelta);
      expect(team.budget).toBe(50000 + moneyDelta);
    }
  });

  it("lets fanGain and financialGrowth parameters change fan and money deltas", async () => {
    const { game } = await createAssignedGame("boosted-economy");
    const parameters = await saveParameters(game.id, {
      injuryChance: 0,
      fanGain: 40,
      financialGrowth: 16,
      luckFactor: 50,
    });
    const details = await playRound(game.id);

    for (const result of details.results) {
      assertRoundOneEconomy(
        result,
        result.teamAId,
        result.resultA,
        result.fanDeltaA,
        result.moneyDeltaA,
        { pubScore: 0, merchScore: 0 },
        parameters,
      );
      assertRoundOneEconomy(
        result,
        result.teamBId,
        result.resultB,
        result.fanDeltaB,
        result.moneyDeltaB,
        { pubScore: 0, merchScore: 0 },
        parameters,
      );
    }

    expect(details.results.some((result) => Math.abs(result.fanDeltaA) !== 950)).toBe(true);
  });

  it("applies marketing scores to fan growth and subtracts investment costs before revenue", async () => {
    const { game } = await createAssignedGame("marketing-economy");
    const parameters = await saveParameters(game.id, {
      injuryChance: 0,
      fanGain: 20,
      financialGrowth: 8,
      luckFactor: 50,
    });
    const details = await playRound(game.id, { pubInvestment: 1, merchInvestment: 1 });

    for (const result of details.results) {
      assertRoundOneEconomy(
        result,
        result.teamAId,
        result.resultA,
        result.fanDeltaA,
        result.moneyDeltaA,
        { pubScore: 1, merchScore: 1 },
        parameters,
      );
      assertRoundOneEconomy(
        result,
        result.teamBId,
        result.resultB,
        result.fanDeltaB,
        result.moneyDeltaB,
        { pubScore: 1, merchScore: 1 },
        parameters,
      );
    }

    for (const team of details.teams) {
      const teamResult = details.results.find(
        (result) => result.teamAId === team.id || result.teamBId === team.id,
      );
      const fanDelta = teamResult?.teamAId === team.id ? teamResult.fanDeltaA : teamResult?.fanDeltaB ?? 0;
      const moneyDelta =
        teamResult?.teamAId === team.id ? teamResult.moneyDeltaA : teamResult?.moneyDeltaB ?? 0;

      expect(team.pubScore).toBe(1);
      expect(team.merchScore).toBe(1);
      expect(team.fans).toBe(1000 + fanDelta);
      expect(team.budget).toBe(50000 - 14000 + moneyDelta);
    }
  });

  it("plays a full six-round tournament and keeps leaderboard/report source data consistent", async () => {
    const { game } = await createAssignedGame("full-season-audit");
    await saveParameters(game.id, {
      injuryChance: 0,
      fanGain: 20,
      financialGrowth: 8,
      luckFactor: 50,
    });

    let details = await playRound(game.id);
    for (let round = 2; round <= 6; round += 1) {
      details = await playRound(game.id);
    }

    expect(details.game.status).toBe("FINISHED");
    expect(details.game.currentRound).toBe(6);
    expect(details.results).toHaveLength(12);

    const expectedRows = aggregateResults(details.results);
    for (const team of details.teams) {
      const expected = expectedRows.get(team.id);
      expect(expected).toBeDefined();
      expect(expected?.played).toBe(6);
      expect(team.wins).toBe(expected?.wins);
      expect(team.draws).toBe(expected?.draws);
      expect(team.losses).toBe(expected?.losses);
      expect(team.points).toBe(expected?.points);
      expect(team.pointDiff).toBe(expected?.pointDiff);
      expect(team.ready).toBe(false);
    }

    const latestRound = Math.max(...details.results.map((result) => result.roundNumber));
    const latestResults = details.results.filter((result) => result.roundNumber === latestRound);
    expect(latestResults).toHaveLength(2);
    for (const team of details.teams) {
      expect(
        latestResults.some((result) => result.teamAId === team.id || result.teamBId === team.id),
      ).toBe(true);
    }
  });
});
