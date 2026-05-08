import express from "express";
import { randomUUID } from "crypto";
import prisma from "../lib/prisma.js";

const router = express.Router();
const defaultTeamNames = ["Team 1", "Team 2", "Team 3", "Team 4"];

type JoinedStudentRow = {
  id: string;
  name: string;
  joinedAt: string;
  teamId: string | null;
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

async function ensureDefaultTeams(gameId: string) {
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
    const teams = await prisma.team.findMany({
      where: { gameId },
      orderBy: { createdAt: "asc" },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    const participants = await getJoinedStudents(gameId);

    res.json({ game, teams, participants });
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

    const membership = await prisma.teamMember.findFirst({
      where: {
        userId: studentId,
        team: { gameId },
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            budget: true,
            fans: true,
          },
        },
      },
    });

    res.json({
      assigned: Boolean(membership),
      team: membership?.team ?? null,
    });
  } catch (error) {
    console.error("Failed to fetch team assignment:", error);
    res.status(500).json({ error: "Failed to fetch team assignment" });
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
      data = {
        status: "ACTIVE",
        currentRound: Math.max(game.currentRound, 1),
      };
    } else if (action === "stop") {
      data = { status: "PAUSED" };
    } else if (action === "next") {
      const nextRound = Math.min(game.currentRound + 1, 6);
      data = {
        currentRound: nextRound,
        status: nextRound >= 6 ? "FINISHED" : "CREATED",
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
    
    res.status(201).json({ game: newGame });
  } catch (error) {
    console.error("Failed to create game:", error);
    res.status(500).json({ error: "Failed to create game" });
  }
});

export default router;
