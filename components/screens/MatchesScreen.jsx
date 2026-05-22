'use client';

import { useState } from 'react';
import { fmtDay, fmtDate } from '@/lib/data';
import { MatchCard } from '@/components';

export default function MatchesScreen({ matches = [], onBet }) {
  const [filter, setFilter] = useState('all');

  const filters = [
    { id: 'all',   label: 'All' },
    { id: 'live',  label: 'Live' },
    { id: 'today', label: 'Today' },
    { id: 'r32',   label: 'Round of 32' },
    { id: 'group', label: 'Group' },
  ];

  const TODAY = new Date().toISOString().split('T')[0];

  let filtered = matches;
  if (filter === 'live')  filtered = matches.filter(m => m.status === 'live');
  if (filter === 'today') filtered = matches.filter(m => m.date === TODAY);
  if (filter === 'r32')   filtered = matches.filter(m => !m.group);
  if (filter === 'group') filtered = matches.filter(m => !!m.group);

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
