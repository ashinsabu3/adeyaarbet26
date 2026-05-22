import { FRIENDS, MATCHES, ME_ID, getTeam } from '@/lib/data';
import { CURRENCY_SYMBOL } from '@/lib/currency';

export function getActivity(bets) {
  if (!bets || bets.length === 0) return getDefaultActivity();

  // Build activity from actual bets (excluding current user for "friend activity")
  const friendBets = bets
    .filter(b => b.userId !== ME_ID)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  return friendBets.map(bet => {
    const friend = FRIENDS.find(f => f.id === bet.userId);
    const match = MATCHES.find(m => m.id === bet.matchId);
    const team = match
      ? bet.pick === 'home' ? getTeam(match.home) :
        bet.pick === 'away' ? getTeam(match.away) : null
      : null;
    const pickLabel = team ? team.name : 'Draw';

    return {
      id: bet.id,
      userId: bet.userId,
      username: friend?.name || bet.userId,
      type: 'bet_placed',
      text: `bet ${CURRENCY_SYMBOL}${bet.amount} on ${pickLabel}`,
      createdAt: bet.createdAt,
    };
  });
}

function getDefaultActivity() {
  // Fallback static activity for when store is empty
  const friends = FRIENDS.filter(f => f.id !== ME_ID);
  const picks = ['home', 'away', 'draw'];
  const amounts = [200, 300, 500, 750, 1000];
  const activity = [];

  for (let i = 0; i < 6; i++) {
    const friend = friends[i % friends.length];
    const match = MATCHES[i];
    const pick = picks[i % 3];
    const team = pick === 'home' ? getTeam(match.home) :
                 pick === 'away' ? getTeam(match.away) : null;
    const amount = amounts[i % amounts.length];

    activity.push({
      id: `default-${i}`,
      userId: friend.id,
      username: friend.name,
      type: 'bet_placed',
      text: `bet ${CURRENCY_SYMBOL}${amount} on ${team ? team.name : 'Draw'}`,
      createdAt: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
    });
  }

  return activity;
}
