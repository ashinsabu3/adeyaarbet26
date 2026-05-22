'use client';

import { useState } from 'react';
import { BETS, ME_ID, fmtMoney } from '@/lib/data';
import { BetCard } from '@/components';

export default function BetsScreen() {
  const [tab, setTab] = useState('open');
  const mine = BETS.filter(b => b.user === ME_ID);
  const filtered = tab === 'all' ? mine : mine.filter(b => b.status === tab);

  const totalOpen = mine.filter(b => b.status === 'open').reduce((s, b) => s + b.amount, 0);
  const totalWon  = mine.filter(b => b.status === 'won').reduce((s, b) => s + (b.payout - b.amount), 0);
  const settled   = mine.filter(b => b.status === 'won' || b.status === 'lost');
  const winRate   = settled.length
    ? Math.round(100 * mine.filter(b => b.status === 'won').length / settled.length)
    : 0;

  return (
    <div>
      <div className="section-head" style={{ marginTop: 8 }}>
        <div className="section-head__title display">My bets</div>
      </div>

      {/* Summary tiles */}
      <div className="stats-strip">
        {[
          { label: 'Open stake', val: fmtMoney(totalOpen), tint: 'gold' },
          { label: 'Won',        val: '+' + fmtMoney(totalWon), tint: 'win' },
          { label: 'Win rate',   val: winRate + '%', tint: null },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{
              fontSize: 18,
              color: s.tint === 'gold' ? 'var(--gold)' : s.tint === 'win' ? 'var(--win)' : 'var(--ink)',
            }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="chip-row" style={{ marginBottom: 12 }}>
        {[
          { id: 'open', label: `Open · ${mine.filter(b => b.status === 'open').length}` },
          { id: 'won',  label: 'Won' },
          { id: 'lost', label: 'Lost' },
          { id: 'all',  label: 'All' },
        ].map(t => (
          <button
            key={t.id}
            className={'chip ' + (tab === t.id ? 'active' : '')}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 28, color: 'var(--ink-3)' }}>
            No {tab} bets yet
          </div>
        )}
        {filtered.map(b => <BetCard key={b.id} bet={b} />)}
      </div>
    </div>
  );
}
