import { NextResponse } from 'next/server';
import { TeamModel } from '@/lib/models/Team';

// GET: Fetch teams by GameInstanceId
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
        return NextResponse.json({ error: 'gameId query param is required' }, { status: 400 });
    }

    const teams = await TeamModel.findAllByGame(gameId);
    return NextResponse.json(teams);
}

// POST: Register a new team
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newTeam = await TeamModel.create({
            gameInstanceId: body.gameInstanceId,
            name: body.name,
            money: body.money || 1000000,
            fans: body.fans || 5000,
            playerIds: []
        });
        return NextResponse.json(newTeam, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }
}
