'use client';

import { useState } from 'react';
import { MATCHES, fmtDay, fmtDate } from '@/lib/data';
import { MatchCard } from '@/components';

export default function MatchesScreen({ onBet }) {
  const [filter, setFilter] = useState('all');

  const filters = [
    { id: 'all',   label: 'All' },
    { id: 'live',  label: 'Live' },
    { id: 'today', label: 'Today' },
    { id: 'r32',   label: 'Round of 32' },
    { id: 'group', label: 'Group' },
  ];

  let filtered = MATCHES;
  if (filter === 'live')  filtered = MATCHES.filter(m => m.status === 'live');
  if (filter === 'today') filtered = MATCHES.filter(m => m.date === '2026-06-29');
  if (filter === 'r32')   filtered = MATCHES.filter(m => m.stage === 'R32');
  if (filter === 'group') filtered = MATCHES.filter(m => m.stage === 'GROUP');

  const byDate = {};
  filtered.forEach(m => { (byDate[m.date] = byDate[m.date] || []).push(m); });
  const dates = Object.keys(byDate).sort();

  return (
    <div>
      <div className="section-head" style={{ marginTop: 8 }}>
        <div className="section-head__title display">Fixtures</div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{filtered.length} matches</div>
      </div>

      <div className="chip-row" style={{ marginBottom: 12 }}>
        {filters.map(f => (
          <button
            key={f.id}
            className={'chip ' + (filter === f.id ? 'active' : '')}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {dates.map(date => (
        <div key={date} className="date-group">
          <div className="date-group__head">
            <div className="date-group__day">{fmtDay(date)}</div>
            <div className="date-group__date">{fmtDate(date)}</div>
          </div>
          {byDate[date].map(m => (
            <MatchCard key={m.id} match={m} onBet={onBet} />
          ))}
        </div>
      ))}
    </div>
  );
}
