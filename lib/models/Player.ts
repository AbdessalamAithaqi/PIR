export interface Player {
  id: string;
  name: string;
  position: string;
  skill: number;
  price: number;
}

// In-memory array for conceptual scaffolding. 
// Replace with a real database (e.g. Prisma + PostgreSQL) in later tasks.
let players: Player[] = [];

export const PlayerModel = {
  findAll: async (): Promise<Player[]> => {
    return players;
  },

  findById: async (id: string): Promise<Player | undefined> => {
    return players.find(p => p.id === id);
  },

  create: async (playerData: Omit<Player, "id">): Promise<Player> => {
    const newPlayer = { ...playerData, id: Math.random().toString(36).substr(2, 9) };
    players.push(newPlayer);
    return newPlayer;
  },

  update: async (id: string, updates: Partial<Player>): Promise<Player | null> => {
    const idx = players.findIndex(p => p.id === id);
    if (idx === -1) return null;
    players[idx] = { ...players[idx], ...updates };
    return players[idx];
  },

  delete: async (id: string): Promise<boolean> => {
    const initialLength = players.length;
    players = players.filter(p => p.id !== id);
    return players.length < initialLength;
  }
};
