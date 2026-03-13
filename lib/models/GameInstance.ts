export interface GameInstance {
    id: string;
    name: string;
    ownerId: string; // ID of the Teacher / Game Master
    currentRound: number;
    status: 'PENDING' | 'ACTIVE' | 'FINISHED';
}

let games: GameInstance[] = [];

export const GameInstanceModel = {
    findAll: async (): Promise<GameInstance[]> => {
        return games;
    },

    findById: async (id: string): Promise<GameInstance | undefined> => {
        return games.find(g => g.id === id);
    },

    create: async (data: Omit<GameInstance, "id" | "currentRound" | "status">): Promise<GameInstance> => {
        const newGame: GameInstance = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            currentRound: 0,
            status: 'PENDING'
        };
        games.push(newGame);
        return newGame;
    },

    update: async (id: string, updates: Partial<GameInstance>): Promise<GameInstance | null> => {
        const idx = games.findIndex(g => g.id === id);
        if (idx === -1) return null;
        games[idx] = { ...games[idx], ...updates };
        return games[idx];
    },

    delete: async (id: string): Promise<boolean> => {
        const initialLength = games.length;
        games = games.filter(g => g.id !== id);
        return games.length < initialLength;
    }
};
