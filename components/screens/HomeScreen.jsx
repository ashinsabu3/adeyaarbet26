'use client';

import { BETS, ACTIVITY, ME_ID, getFriend, fmtCompact } from '@/lib/data';
import { HeroMatch, MatchCard, SectionHead } from '@/components';

export default function HomeScreen({ matches = [], balance, onBet, onNav }) {
  const live = matches.filter(m => m.status === 'live');
  const upcoming = matches.filter(m => m.status === 'upcoming').slice(0, 3);
  const featured = live[0] || upcoming[0];
  const myOpenBets = BETS.filter(b => b.user === ME_ID && b.status === 'open').length;
  const myWonToday = BETS.filter(b => b.user === ME_ID && b.status === 'won')
    .reduce((s, b) => s + (b.payout - b.amount), 0);

  return (
    <div>
      <HeroMatch match={featured} onBet={onBet} />

      {/* Stats strip */}
      <div className="stats-strip">
        {[
          { label: 'Open bets', val: myOpenBets, sub: 'placed', tint: null },
          { label: "Today's net", val: '+' + fmtCompact(myWonToday), sub: 'won', tint: 'win' },
          { label: 'Group rank', val: '#1', sub: 'of 8', tint: 'gold' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{
              color: s.tint === 'win' ? 'var(--win)' : s.tint === 'gold' ? 'var(--gold)' : 'var(--ink)',
            }}>{s.val}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Live matches */}
      {live.length > 0 && (
        <>
          <SectionHead title="Live now" more="All matches" onMore={() => onNav('matches')} />
          <div className="date-group" style={{ marginBottom: 8 }}>
            {live.map(m => <MatchCard key={m.id} match={m} onBet={onBet} />)}
          </div>
        </>
      )}

      {/* Upcoming */}
      <SectionHead title="Up next" more="Fixtures" onMore={() => onNav('matches')} />
      <div className="date-group" style={{ marginBottom: 8 }}>
        {upcoming.map(m => <MatchCard key={m.id} match={m} onBet={onBet} />)}
      </div>

      {/* Friend activity */}
      <SectionHead title="Friend activity" more="See all" onMore={() => onNav('leaders')} />
      <div className="ticker" style={{ paddingBottom: 8 }}>
        {ACTIVITY.map(a => {
          const friend = getFriend(a.user);
          return (
            <div key={a.id} className="ticker-item">
              <div className="ticker-avatar">{friend?.name[0]}</div>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600 }}>{friend?.name}</span>{' '}
                <span style={{ color: 'var(--ink-2)' }}>{a.text}</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{a.when}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
