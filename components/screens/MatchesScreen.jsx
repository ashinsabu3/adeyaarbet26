'use client';

import { useState, useEffect } from 'react';
import { MATCHES, fmtDay, fmtDate } from '@/lib/data';
import { MatchCard } from '@/components';

// FIFA MatchStatus: 0/1 = upcoming, 3 = live; scores non-null = finished
function getFifaStatus(fifa) {
  if (fifa.HomeTeamScore != null && fifa.AwayTeamScore != null) return 'finished';
  if (fifa.MatchStatus === 3) return 'live';
  return 'upcoming';
}

function mergeWithFifa(staticMatch, fifaResults) {
  if (!fifaResults?.length) return staticMatch;
  const fifa = fifaResults.find(m =>
    (m.Home?.Abbreviation === staticMatch.home || m.Home?.IdCountry === staticMatch.home) &&
    (m.Away?.Abbreviation === staticMatch.away || m.Away?.IdCountry === staticMatch.away)
  );
  if (!fifa) return staticMatch;
  const stadiumName = fifa.Stadium?.Name?.[0]?.Description;
  const cityName = fifa.Stadium?.CityName?.[0]?.Description;
  const venue = stadiumName
    ? cityName ? `${stadiumName}, ${cityName}` : stadiumName
    : staticMatch.venue;
  const status = getFifaStatus(fifa);
  const score = (fifa.HomeTeamScore != null && fifa.AwayTeamScore != null)
    ? [fifa.HomeTeamScore, fifa.AwayTeamScore]
    : null;
  return { ...staticMatch, venue, fifaId: fifa.IdMatch, status, score };
}

export default function MatchesScreen({ onBet }) {
  const [filter, setFilter] = useState('all');
  const [fifaData, setFifaData] = useState(null);

  useEffect(() => {
    fetch('/api/fifa/matches')
      .then(r => r.json())
      .then(setFifaData)
      .catch(() => {});
  }, []);

  const matches = MATCHES.map(m => mergeWithFifa(m, fifaData));

  const filters = [
    { id: 'all',   label: 'All' },
    { id: 'live',  label: 'Live' },
    { id: 'today', label: 'Today' },
    { id: 'r32',   label: 'Round of 32' },
    { id: 'group', label: 'Group' },
  ];

  let filtered = matches;
  if (filter === 'live')  filtered = matches.filter(m => m.status === 'live');
  if (filter === 'today') filtered = matches.filter(m => m.date === '2026-06-29');
  if (filter === 'r32')   filtered = matches.filter(m => m.stage === 'R32');
  if (filter === 'group') filtered = matches.filter(m => m.stage === 'GROUP');

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
