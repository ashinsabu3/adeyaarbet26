import { NextResponse } from 'next/server';
import { FRIENDS, MATCHES, ME_ID, getTeam } from '@/lib/data';
import { CURRENCY_SYMBOL } from '@/lib/currency';

// Generate mock activity data server-side
function generateMockActivity() {
  const friends = FRIENDS.filter(f => f.id !== ME_ID);
  const picks = ['home', 'away', 'draw'];
  const amounts = [200, 300, 500, 750, 1000];
  const activity = [];

  for (let i = 0; i < 8; i++) {
    const friend = friends[i % friends.length];
    const match = MATCHES[i % MATCHES.length];
    const pick = picks[i % 3];
    const team = pick === 'home' ? getTeam(match.home) :
                 pick === 'away' ? getTeam(match.away) : null;
    const amount = amounts[i % amounts.length];

    activity.push({
      id: `activity-${i}`,
      userId: friend.id,
      username: friend.name,
      type: 'bet_placed',
      text: `bet ${CURRENCY_SYMBOL}${amount} on ${team ? team.name : 'Draw'}`,
      createdAt: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
    });
  }

  return activity;
}

export async function GET() {
  const activity = generateMockActivity();
  return NextResponse.json(activity);
}
