import { NextResponse } from 'next/server';
import { MATCHES } from '@/lib/data';

// In-memory store for API layer (server-side demo)
let serverBets = [];

export async function GET() {
  return NextResponse.json(serverBets);
}

export async function POST(request) {
  try {
    const { matchId, pick, amount } = await request.json();

    // Validate
    if (!matchId || !pick || !amount) {
      return NextResponse.json({ error: 'Missing required fields: matchId, pick, amount' }, { status: 400 });
    }
    if (!['home', 'away', 'draw'].includes(pick)) {
      return NextResponse.json({ error: 'Invalid pick. Must be home, away, or draw' }, { status: 400 });
    }
    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
    }
    const match = MATCHES.find(m => m.id === matchId);
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const bet = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      matchId,
      pick,
      amount,
      oddsAt: null,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    serverBets = [...serverBets, bet];
    return NextResponse.json(bet, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
