export interface Round {
    id: string;
    gameInstanceId: string;
    roundNumber: number;
    status: 'OPEN' | 'CLOSED' | 'SIMULATED';
}

let rounds: Round[] = [];

export const RoundModel = {
    findByGameAndNumber: async (gameId: string, roundNumber: number): Promise<Round | undefined> => {
        return rounds.find(r => r.gameInstanceId === gameId && r.roundNumber === roundNumber);
    },

    create: async (data: Omit<Round, "id">): Promise<Round> => {
        const newRound = { ...data, id: Math.random().toString(36).substr(2, 9) };
        rounds.push(newRound);
        return newRound;
    },

    updateStatus: async (id: string, status: Round['status']): Promise<Round | null> => {
        const idx = rounds.findIndex(r => r.id === id);
        if (idx === -1) return null;
        rounds[idx].status = status;
        return rounds[idx];
    }
};
