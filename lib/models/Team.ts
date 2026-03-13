export interface Team {
    id: string;
    gameInstanceId: string;
    name: string;
    money: number;
    fans: number;
    playerIds: string[];
}

let teams: Team[] = [];

export const TeamModel = {
    findAllByGame: async (gameInstanceId: string): Promise<Team[]> => {
        return teams.filter(t => t.gameInstanceId === gameInstanceId);
    },

    findById: async (id: string): Promise<Team | undefined> => {
        return teams.find(t => t.id === id);
    },

    create: async (data: Omit<Team, "id">): Promise<Team> => {
        const newTeam = { ...data, id: Math.random().toString(36).substr(2, 9) };
        teams.push(newTeam);
        return newTeam;
    },

    update: async (id: string, updates: Partial<Team>): Promise<Team | null> => {
        const idx = teams.findIndex(t => t.id === id);
        if (idx === -1) return null;
        teams[idx] = { ...teams[idx], ...updates };
        return teams[idx];
    },

    delete: async (id: string): Promise<boolean> => {
        const initialLength = teams.length;
        teams = teams.filter(t => t.id !== id);
        return teams.length < initialLength;
    }
};
