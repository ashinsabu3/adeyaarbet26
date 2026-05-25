'use client';

import { useState, useEffect } from 'react';
import { fmtCompact } from '@/lib/data';
import { fmtMoney, fmtNet, CURRENCY_SYMBOL } from '@/lib/currency';

export default function LeaderboardScreen({ user }) {
  const [rankings, setRankings] = useState([]);
  const [settlement, setSettlement] = useState([]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setRankings(data); })
      .catch(() => {});
    fetch('/api/settlement')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data.transactions)) setSettlement(data.transactions); })
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
              <div className="podium-amt" style={{ color: f.balance >= 0 ? 'var(--win)' : 'var(--loss)' }}>{fmtNet(f.balance)}</div>
              <div className="podium-bar">{f.rank}</div>
            </div>
          ))}
        </div>
      )}

      {/* Full list */}
      <div className="card" style={{ padding: 0, margin: '0 16px 24px' }}>
        {rankings.map((f, i) => {
          const isMe = user && f.id === user.id;
          const delta = f.balance;
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
              <span className={'lb-amt ' + (delta >= 0 ? 'win' : 'loss')} style={{ color: delta >= 0 ? 'var(--win)' : 'var(--loss)' }}>
                {fmtNet(f.balance)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Settlement plan */}
      <div className="section-head" style={{ marginTop: 8 }}>
        <div className="section-head__title display">Settlement plan</div>
      </div>
      <div className="card" style={{ margin: '0 16px 24px', padding: '4px 0' }}>
        {settlement.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
            All square — no payments needed yet
          </div>
        ) : (
          settlement.map((tx, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px',
              borderBottom: i < settlement.length - 1 ? '1px solid var(--line)' : 'none',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'var(--loss)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>
                {tx.from.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  <span style={{ color: 'var(--loss)' }}>{tx.from.name}</span>
                  {' pays '}
                  <span style={{ color: 'var(--win)' }}>{tx.to.name}</span>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15, color: 'var(--gold)', flexShrink: 0 }}>
                {CURRENCY_SYMBOL}{tx.amount.toLocaleString('en-IN')}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{
        textAlign: 'center', fontSize: 11, color: 'var(--ink-3)',
        paddingBottom: 8, padding: '0 32px 16px',
      }}>
        Minimum transactions · settled at end of World Cup
      </div>

      {/* Activity feed */}
      {activity.length > 0 && (
        <div style={{ margin: '16px 16px 24px' }}>
          <div className="section-head" style={{ marginBottom: 8 }}>
            <div className="section-head__title" style={{ fontSize: 16 }}>Recent Activity</div>
          </div>
          <div className="card" style={{ padding: 0 }}>
            {activity.map((item, i) => (
              <div key={item.id || i} style={{
                padding: '10px 14px',
                borderBottom: i < activity.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 12, color: 'var(--ink-1)' }}>
                  {formatActivity(item)}
                </span>
                <span style={{ fontSize: 10, color: 'var(--ink-3)', whiteSpace: 'nowrap', marginLeft: 8 }}>
                  {item.created_at ? timeAgo(item.created_at) : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
