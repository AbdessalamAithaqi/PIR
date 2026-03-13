import { NextResponse } from 'next/server';
import { GameInstanceModel } from '@/lib/models/GameInstance';

// GET: Fetch all games
export async function GET() {
    const games = await GameInstanceModel.findAll();
    return NextResponse.json(games);
}

// POST: Create a new game
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newGame = await GameInstanceModel.create({
            name: body.name,
            ownerId: body.ownerId || 'admin_123', // Hardcoded fallback for now
        });
        return NextResponse.json(newGame, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }
}
