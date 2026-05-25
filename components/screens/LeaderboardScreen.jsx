'use client';

import { useState, useEffect } from 'react';
import { fmtCompact, getMatch, getTeam } from '@/lib/data';
import { fmtMoney, STARTING_BALANCE, CURRENCY_SYMBOL } from '@/lib/currency';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatActivity(item) {
  const name = item.profiles?.display_name || 'Someone';
  const p = item.payload || {};
  const match = p.match_id ? getMatch(p.match_id) : null;
  const teamCode = p.pick && match ? (p.pick === 'home' ? match.home : p.pick === 'away' ? match.away : 'Draw') : '';
  const teamName = teamCode && teamCode !== 'Draw' ? getTeam(teamCode)?.name || teamCode : teamCode;

  switch (item.type) {
    case 'bet_placed':
      return `${name} bet ${CURRENCY_SYMBOL}${p.amount} on ${teamName}`;
    case 'bet_won':
      return `${name} won ${CURRENCY_SYMBOL}${p.payout}`;
    case 'bet_cancelled':
      return `${name} cancelled bet${p.reason === 'side_switch' ? ' (switched sides)' : ''}`;
    case 'bet_lost':
      return `${name} lost a bet`;
    default:
      return `${name} — ${item.type}`;
  }
}

export default function LeaderboardScreen({ user }) {
  const [rankings, setRankings] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setRankings(data); })
      .catch(() => {});
    fetch('/api/activity?limit=20')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setActivity(data); })
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
