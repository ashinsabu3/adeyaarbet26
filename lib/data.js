// AdeYaar 2026 — Data layer
// FIFA World Cup 2026: 48 teams, 12 groups, hosted USA/CAN/MEX

export const FRIENDS = [
  { id: 'ashin',     name: 'Ashin',     balance: 14250 },
  { id: 'pratyush',  name: 'Pratyush',  balance: 9870  },
  { id: 'manan',     name: 'Manan',     balance: 18420 },
  { id: 'boidushya', name: 'Boidushya', balance: 7340  },
  { id: 'jayesh',    name: 'Jayesh',    balance: 12100 },
  { id: 'rahul',     name: 'Rahul',     balance: 21560 },
  { id: 'rohan',     name: 'Rohan',     balance: 10500 },
  { id: 'aryan',     name: 'Aryan',     balance: 8800  },
];

export const ME_ID = 'rahul';

export const TEAM = {
  ARG: { code: 'ARG', name: 'Argentina',     flag: '🇦🇷' },
  FRA: { code: 'FRA', name: 'France',        flag: '🇫🇷' },
  BRA: { code: 'BRA', name: 'Brazil',        flag: '🇧🇷' },
  ENG: { code: 'ENG', name: 'England',       flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  ESP: { code: 'ESP', name: 'Spain',         flag: '🇪🇸' },
  GER: { code: 'GER', name: 'Germany',       flag: '🇩🇪' },
  POR: { code: 'POR', name: 'Portugal',      flag: '🇵🇹' },
  NED: { code: 'NED', name: 'Netherlands',   flag: '🇳🇱' },
  USA: { code: 'USA', name: 'USA',           flag: '🇺🇸' },
  MEX: { code: 'MEX', name: 'Mexico',        flag: '🇲🇽' },
  CAN: { code: 'CAN', name: 'Canada',        flag: '🇨🇦' },
  ITA: { code: 'ITA', name: 'Italy',         flag: '🇮🇹' },
  BEL: { code: 'BEL', name: 'Belgium',       flag: '🇧🇪' },
  CRO: { code: 'CRO', name: 'Croatia',       flag: '🇭🇷' },
  URU: { code: 'URU', name: 'Uruguay',       flag: '🇺🇾' },
  COL: { code: 'COL', name: 'Colombia',      flag: '🇨🇴' },
  JPN: { code: 'JPN', name: 'Japan',         flag: '🇯🇵' },
  KOR: { code: 'KOR', name: 'South Korea',   flag: '🇰🇷' },
  AUS: { code: 'AUS', name: 'Australia',     flag: '🇦🇺' },
  SEN: { code: 'SEN', name: 'Senegal',       flag: '🇸🇳' },
  MAR: { code: 'MAR', name: 'Morocco',       flag: '🇲🇦' },
  EGY: { code: 'EGY', name: 'Egypt',         flag: '🇪🇬' },
  NGA: { code: 'NGA', name: 'Nigeria',       flag: '🇳🇬' },
  CIV: { code: 'CIV', name: 'Ivory Coast',   flag: '🇨🇮' },
  SUI: { code: 'SUI', name: 'Switzerland',   flag: '🇨🇭' },
  DEN: { code: 'DEN', name: 'Denmark',       flag: '🇩🇰' },
  POL: { code: 'POL', name: 'Poland',        flag: '🇵🇱' },
  SRB: { code: 'SRB', name: 'Serbia',        flag: '🇷🇸' },
  IRN: { code: 'IRN', name: 'Iran',          flag: '🇮🇷' },
  SAU: { code: 'SAU', name: 'Saudi Arabia',  flag: '🇸🇦' },
};

export const VENUE = {
  MET:  'MetLife Stadium, NJ',
  SOFI: 'SoFi Stadium, LA',
  AZT:  'Estadio Azteca, MEX',
  MB:   'Mercedes-Benz Stadium, ATL',
  ATT:  'AT&T Stadium, DAL',
  BMO:  'BMO Field, TOR',
  GIL:  'Gillette Stadium, BOS',
  LIN:  'Lincoln Financial, PHI',
  LUM:  'Lumen Field, SEA',
  ARR:  'Arrowhead, KC',
  HARD: 'Hard Rock Stadium, MIA',
  LEV:  "Levi's Stadium, SF",
};

export const MATCHES = [
  { id: 'M01', stage: 'R32', date: '2026-06-29', time: '19:00', venue: VENUE.MET,
    home: 'ARG', away: 'NGA', status: 'live', minute: 67, score: [2, 1],
    odds: { home: 1.45, draw: 4.20, away: 6.50 } },
  { id: 'M02', stage: 'R32', date: '2026-06-29', time: '21:00', venue: VENUE.AZT,
    home: 'MEX', away: 'CRO', status: 'live', minute: 23, score: [0, 0],
    odds: { home: 2.10, draw: 3.30, away: 3.40 } },
  { id: 'M03', stage: 'R32', date: '2026-06-29', time: '23:30', venue: VENUE.SOFI,
    home: 'BRA', away: 'KOR', status: 'upcoming',
    odds: { home: 1.30, draw: 5.00, away: 8.50 } },
  { id: 'M04', stage: 'R32', date: '2026-06-30', time: '19:00', venue: VENUE.ATT,
    home: 'FRA', away: 'SEN', status: 'upcoming',
    odds: { home: 1.55, draw: 3.90, away: 5.20 } },
  { id: 'M05', stage: 'R32', date: '2026-06-30', time: '21:00', venue: VENUE.MB,
    home: 'ENG', away: 'AUS', status: 'upcoming',
    odds: { home: 1.40, draw: 4.50, away: 7.00 } },
  { id: 'M06', stage: 'R32', date: '2026-06-30', time: '23:30', venue: VENUE.HARD,
    home: 'ESP', away: 'JPN', status: 'upcoming',
    odds: { home: 1.65, draw: 3.80, away: 4.40 } },
  { id: 'M07', stage: 'R32', date: '2026-07-01', time: '19:00', venue: VENUE.BMO,
    home: 'GER', away: 'CAN', status: 'upcoming',
    odds: { home: 1.50, draw: 4.10, away: 5.50 } },
  { id: 'M08', stage: 'R32', date: '2026-07-01', time: '21:00', venue: VENUE.LIN,
    home: 'POR', away: 'IRN', status: 'upcoming',
    odds: { home: 1.35, draw: 4.80, away: 7.50 } },
  { id: 'M09', stage: 'R32', date: '2026-07-01', time: '23:30', venue: VENUE.LUM,
    home: 'NED', away: 'COL', status: 'upcoming',
    odds: { home: 1.80, draw: 3.50, away: 4.00 } },
  { id: 'M10', stage: 'R32', date: '2026-07-02', time: '19:00', venue: VENUE.LEV,
    home: 'USA', away: 'BEL', status: 'upcoming',
    odds: { home: 2.40, draw: 3.30, away: 2.80 } },
  { id: 'M11', stage: 'R32', date: '2026-07-02', time: '21:00', venue: VENUE.GIL,
    home: 'ITA', away: 'URU', status: 'upcoming',
    odds: { home: 1.90, draw: 3.40, away: 3.80 } },
  { id: 'M12', stage: 'R32', date: '2026-07-02', time: '23:30', venue: VENUE.ARR,
    home: 'MAR', away: 'SUI', status: 'upcoming',
    odds: { home: 2.50, draw: 3.20, away: 2.70 } },
  { id: 'M00a', stage: 'GROUP', date: '2026-06-28', time: '21:00', venue: VENUE.MET,
    home: 'BRA', away: 'EGY', status: 'finished', score: [3, 0],
    odds: { home: 1.40, draw: 4.20, away: 6.50 } },
  { id: 'M00b', stage: 'GROUP', date: '2026-06-28', time: '23:30', venue: VENUE.AZT,
    home: 'POL', away: 'SAU', status: 'finished', score: [1, 1],
    odds: { home: 1.75, draw: 3.50, away: 4.20 } },
];

export const BRACKET = {
  R32: [
    { id: 'R32-1',  home: 'ARG', away: 'NGA' },
    { id: 'R32-2',  home: 'BRA', away: 'KOR' },
    { id: 'R32-3',  home: 'FRA', away: 'SEN' },
    { id: 'R32-4',  home: 'ENG', away: 'AUS' },
    { id: 'R32-5',  home: 'ESP', away: 'JPN' },
    { id: 'R32-6',  home: 'GER', away: 'CAN' },
    { id: 'R32-7',  home: 'POR', away: 'IRN' },
    { id: 'R32-8',  home: 'NED', away: 'COL' },
    { id: 'R32-9',  home: 'USA', away: 'BEL' },
    { id: 'R32-10', home: 'ITA', away: 'URU' },
    { id: 'R32-11', home: 'MAR', away: 'SUI' },
    { id: 'R32-12', home: 'MEX', away: 'CRO' },
    { id: 'R32-13', home: 'POR', away: 'DEN' },
    { id: 'R32-14', home: 'CIV', away: 'SRB' },
    { id: 'R32-15', home: 'URU', away: 'NGA' },
    { id: 'R32-16', home: 'CAN', away: 'KOR' },
  ],
};

export const GROUPS = [
  { id: 'A', teams: [
    { code: 'MEX', p: 3, w: 2, d: 1, l: 0, gf: 5, ga: 1, pts: 7 },
    { code: 'CAN', p: 3, w: 2, d: 0, l: 1, gf: 4, ga: 3, pts: 6 },
    { code: 'IRN', p: 3, w: 1, d: 1, l: 1, gf: 3, ga: 3, pts: 4 },
    { code: 'EGY', p: 3, w: 0, d: 0, l: 3, gf: 1, ga: 6, pts: 0 },
  ]},
  { id: 'B', teams: [
    { code: 'USA', p: 3, w: 2, d: 1, l: 0, gf: 6, ga: 2, pts: 7 },
    { code: 'BEL', p: 3, w: 2, d: 0, l: 1, gf: 5, ga: 3, pts: 6 },
    { code: 'KOR', p: 3, w: 1, d: 1, l: 1, gf: 3, ga: 3, pts: 4 },
    { code: 'SEN', p: 3, w: 0, d: 0, l: 3, gf: 2, ga: 8, pts: 0 },
  ]},
  { id: 'C', teams: [
    { code: 'ARG', p: 3, w: 3, d: 0, l: 0, gf: 8, ga: 1, pts: 9 },
    { code: 'POL', p: 3, w: 2, d: 0, l: 1, gf: 5, ga: 3, pts: 6 },
    { code: 'AUS', p: 3, w: 1, d: 0, l: 2, gf: 3, ga: 5, pts: 3 },
    { code: 'SAU', p: 3, w: 0, d: 0, l: 3, gf: 1, ga: 8, pts: 0 },
  ]},
  { id: 'D', teams: [
    { code: 'FRA', p: 3, w: 2, d: 1, l: 0, gf: 6, ga: 2, pts: 7 },
    { code: 'NED', p: 3, w: 2, d: 0, l: 1, gf: 4, ga: 3, pts: 6 },
    { code: 'JPN', p: 3, w: 1, d: 1, l: 1, gf: 3, ga: 4, pts: 4 },
    { code: 'NGA', p: 3, w: 0, d: 0, l: 3, gf: 1, ga: 5, pts: 0 },
  ]},
  { id: 'E', teams: [
    { code: 'BRA', p: 3, w: 3, d: 0, l: 0, gf: 9, ga: 2, pts: 9 },
    { code: 'CRO', p: 3, w: 1, d: 2, l: 0, gf: 4, ga: 3, pts: 5 },
    { code: 'COL', p: 3, w: 1, d: 1, l: 1, gf: 3, ga: 3, pts: 4 },
    { code: 'CIV', p: 3, w: 0, d: 1, l: 2, gf: 2, ga: 10, pts: 1 },
  ]},
  { id: 'F', teams: [
    { code: 'ENG', p: 3, w: 2, d: 1, l: 0, gf: 5, ga: 1, pts: 7 },
    { code: 'POR', p: 3, w: 2, d: 1, l: 0, gf: 5, ga: 2, pts: 7 },
    { code: 'URU', p: 3, w: 1, d: 1, l: 1, gf: 4, ga: 3, pts: 4 },
    { code: 'MAR', p: 3, w: 0, d: 1, l: 2, gf: 1, ga: 9, pts: 1 },
  ]},
];

export const BETS = [
  { id: 'B1',  user: 'ashin',    matchId: 'M01', pick: 'home', amount: 500,  oddsAt: 1.50, status: 'open', placedAt: '2026-06-29T18:42:00Z' },
  { id: 'B2',  user: 'rahul',    matchId: 'M01', pick: 'home', amount: 1000, oddsAt: 1.48, status: 'open', placedAt: '2026-06-29T18:00:00Z' },
  { id: 'B3',  user: 'manan',    matchId: 'M01', pick: 'away', amount: 200,  oddsAt: 6.20, status: 'open', placedAt: '2026-06-29T17:30:00Z' },
  { id: 'B4',  user: 'jayesh',   matchId: 'M01', pick: 'home', amount: 750,  oddsAt: 1.45, status: 'open', placedAt: '2026-06-29T18:55:00Z' },
  { id: 'B5',  user: 'pratyush', matchId: 'M02', pick: 'home', amount: 300,  oddsAt: 2.10, status: 'open', placedAt: '2026-06-29T20:15:00Z' },
  { id: 'B6',  user: 'rohan',    matchId: 'M02', pick: 'draw', amount: 250,  oddsAt: 3.30, status: 'open', placedAt: '2026-06-29T20:30:00Z' },
  { id: 'B7',  user: 'aryan',    matchId: 'M02', pick: 'away', amount: 400,  oddsAt: 3.40, status: 'open', placedAt: '2026-06-29T20:00:00Z' },
  { id: 'B8',  user: 'rahul',    matchId: 'M03', pick: 'home', amount: 1500, oddsAt: 1.30, status: 'open', placedAt: '2026-06-29T15:00:00Z' },
  { id: 'B9',  user: 'boidushya',matchId: 'M03', pick: 'away', amount: 100,  oddsAt: 8.50, status: 'open', placedAt: '2026-06-29T16:00:00Z' },
  { id: 'B10', user: 'manan',    matchId: 'M04', pick: 'home', amount: 800,  oddsAt: 1.55, status: 'open', placedAt: '2026-06-29T14:00:00Z' },
  { id: 'B11', user: 'rahul',    matchId: 'M05', pick: 'home', amount: 600,  oddsAt: 1.40, status: 'open', placedAt: '2026-06-29T14:30:00Z' },
  { id: 'B12', user: 'jayesh',   matchId: 'M06', pick: 'home', amount: 400,  oddsAt: 1.65, status: 'open', placedAt: '2026-06-29T13:00:00Z' },
  { id: 'B13', user: 'ashin',    matchId: 'M07', pick: 'away', amount: 250,  oddsAt: 5.50, status: 'open', placedAt: '2026-06-29T12:00:00Z' },
  { id: 'B14', user: 'rahul',    matchId: 'M10', pick: 'away', amount: 1200, oddsAt: 2.80, status: 'open', placedAt: '2026-06-29T11:00:00Z' },
  { id: 'B15', user: 'rahul',    matchId: 'M00a', pick: 'home', amount: 1000, oddsAt: 1.40, status: 'won',  payout: 1400, placedAt: '2026-06-28T19:00:00Z' },
  { id: 'B16', user: 'manan',    matchId: 'M00a', pick: 'home', amount: 800,  oddsAt: 1.40, status: 'won',  payout: 1120, placedAt: '2026-06-28T18:30:00Z' },
  { id: 'B17', user: 'ashin',    matchId: 'M00a', pick: 'draw', amount: 300,  oddsAt: 4.20, status: 'lost', placedAt: '2026-06-28T18:00:00Z' },
  { id: 'B18', user: 'rahul',    matchId: 'M00b', pick: 'draw', amount: 500,  oddsAt: 3.50, status: 'won',  payout: 1750, placedAt: '2026-06-28T22:00:00Z' },
  { id: 'B19', user: 'pratyush', matchId: 'M00b', pick: 'home', amount: 600,  oddsAt: 1.75, status: 'lost', placedAt: '2026-06-28T21:30:00Z' },
  { id: 'B20', user: 'jayesh',   matchId: 'M00b', pick: 'away', amount: 400,  oddsAt: 4.20, status: 'lost', placedAt: '2026-06-28T21:00:00Z' },
];

export const ACTIVITY = [
  { id: 'A1', user: 'jayesh',   text: 'bet ₹750 on Argentina',            when: '4m',  icon: '💰' },
  { id: 'A2', user: 'rahul',    text: 'won ₹1,750 on Poland v Saudi',     when: '12m', icon: '🏆' },
  { id: 'A3', user: 'ashin',    text: 'bet ₹500 on Argentina',            when: '18m', icon: '💰' },
  { id: 'A4', user: 'manan',    text: 'has 6 open bets totalling ₹4,150', when: '1h',  icon: '📈' },
  { id: 'A5', user: 'rohan',    text: 'bet ₹250 on Mexico-Croatia draw',  when: '2h',  icon: '💰' },
  { id: 'A6', user: 'pratyush', text: 'lost ₹600 on Poland win',          when: '14h', icon: '💔' },
];

// Helpers
export function getTeam(code) {
  return TEAM[code] || { code, name: code, flag: '🏳️' };
}
export function getFriend(id) {
  return FRIENDS.find(f => f.id === id);
}
export function getMatch(id) {
  return MATCHES.find(m => m.id === id);
}
export function fmtMoney(n) {
  if (n == null) return '—';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}
export function fmtCompact(n) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k';
  return String(n);
}
export function fmtDay(iso) {
  const d = new Date(iso + 'T00:00:00');
  const today = new Date('2026-06-29T00:00:00');
  const diff = Math.round((d - today) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}
export function fmtDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
