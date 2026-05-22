'use client';

import { useState, useEffect } from 'react';
import { fmtCompact } from '@/lib/data';
import { fmtMoney, STARTING_BALANCE } from '@/lib/currency';

export default function LeaderboardScreen({ user }) {
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setRankings(data); })
      .catch(() => {});
  }, []);

  const top3 = rankings.slice(0, 3);
  const podium = top3.length >= 3 ? [
    { ...top3[1], rank: 2 },
    { ...top3[0], rank: 1 },
    { ...top3[2], rank: 3 },
  ] : [];

  return (
    <div>
      <div className="section-head" style={{ marginTop: 8 }}>
        <div className="section-head__title display">Leaderboard</div>
      </div>

      {/* Podium */}
      {podium.length > 0 && (
        <div className="podium">
          {podium.map(f => (
            <div key={f.id} className={'podium-block rank' + f.rank}>
              <div className="podium-avatar">{(f.display_name || f.username)[0]}</div>
              <div className="podium-name">{f.display_name || f.username}</div>
              <div className="podium-amt">{fmtMoney(f.balance)}</div>
              <div className="podium-bar">{f.rank}</div>
            </div>
          ))}
        </div>
      )}

      {/* Full list */}
      <div className="card" style={{ padding: 0, margin: '0 16px 24px' }}>
        {rankings.map((f, i) => {
          const isMe = user && f.id === user.id;
          const delta = f.balance - STARTING_BALANCE;
          return (
            <div key={f.id} className={'lb-row ' + (isMe ? 'me' : '')}>
              <span className="lb-rank">{i + 1}</span>
              <div className="lb-avatar">{(f.display_name || f.username)[0]}</div>
              <div className="lb-name">
                {f.display_name || f.username}
                {isMe && (
                  <span style={{
                    marginLeft: 6, fontSize: 9, padding: '2px 6px',
                    background: 'var(--gold)', color: '#0a0a0a',
                    borderRadius: 4, fontWeight: 700, letterSpacing: '0.05em',
                  }}>YOU</span>
                )}
              </div>
              <span className="lb-amt">{fmtMoney(f.balance)}</span>
              <span className={'lb-delta ' + (delta >= 0 ? 'win' : 'loss')}>
                {delta >= 0 ? '↑' : '↓'} {fmtCompact(Math.abs(delta))}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{
        textAlign: 'center', fontSize: 11, color: 'var(--ink-3)',
        paddingBottom: 8, padding: '0 32px',
      }}>
        Settled at end of tournament · Winner takes the pot
      </div>
    </div>
  );
}
