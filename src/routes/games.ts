import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

// Helper to generate a random 6-character alphanumeric join code
function generateJoinCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
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
    // In a real app we'd loop if not unique, but collisions are rare
    
    const newGame = await prisma.gameInstance.create({
      data: {
        name,
        ownerId: user.id,
        joinCode,
        status: "CREATED",
        currentRound: 0,
      }
    });
    
    res.status(201).json({ game: newGame });
  } catch (error) {
    console.error("Failed to create game:", error);
    res.status(500).json({ error: "Failed to create game" });
  }
});

export default router;
