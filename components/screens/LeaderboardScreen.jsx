'use client';

import { useState } from 'react';
import { FRIENDS, ME_ID, fmtMoney, fmtCompact } from '@/lib/data';

export default function LeaderboardScreen({ balance }) {
  const [period, setPeriod] = useState('alltime');
  const sorted = [...FRIENDS].sort((a, b) => b.balance - a.balance);
  const top3 = sorted.slice(0, 3);

  // podium order: 2nd, 1st, 3rd
  const podium = [
    { ...top3[1], rank: 2 },
    { ...top3[0], rank: 1 },
    { ...top3[2], rank: 3 },
  ];

  return (
    <div>
      <div className="section-head" style={{ marginTop: 8 }}>
        <div className="section-head__title display">Leaderboard</div>
      </div>

      <div className="chip-row" style={{ marginBottom: 18 }}>
        {[
          { id: 'alltime', label: 'All time' },
          { id: 'week',    label: 'This week' },
          { id: 'today',   label: 'Today' },
        ].map(p => (
          <button
            key={p.id}
            className={'chip ' + (period === p.id ? 'active' : '')}
            onClick={() => setPeriod(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div className="podium">
        {podium.map(f => (
          <div key={f.id} className={'podium-block rank' + f.rank}>
            <div className="podium-avatar">{f.name[0]}</div>
            <div className="podium-name">{f.name}</div>
            <div className="podium-amt">{fmtMoney(f.balance)}</div>
            <div className="podium-bar">{f.rank}</div>
          </div>
        ))}
      </div>

      {/* Full list */}
      <div className="card" style={{ padding: 0, margin: '0 16px 24px' }}>
        {sorted.map((f, i) => {
          const isMe = f.id === ME_ID;
          const delta = i % 3 === 0 ? +Math.round(f.balance * 0.08)
                      : i % 3 === 1 ? -Math.round(f.balance * 0.04)
                      : +Math.round(f.balance * 0.02);
          return (
            <div key={f.id} className={'lb-row ' + (isMe ? 'me' : '')}>
              <span className="lb-rank">{i + 1}</span>
              <div className="lb-avatar">{f.name[0]}</div>
              <div className="lb-name">
                {f.name}
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
