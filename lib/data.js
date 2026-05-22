// AdeYaar 2026 — Real Data Layer
// FIFA World Cup 2026: 48 teams, 12 groups, hosted USA/CAN/MEX
// Simulated "now" = June 15, 2026 ~17:30 UTC (day 5 of tournament)

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
  // Group A
  MEX: { code: 'MEX', name: 'Mexico',             flag: '🇲🇽', group: 'A' },
  RSA: { code: 'RSA', name: 'South Africa',        flag: '🇿🇦', group: 'A' },
  KOR: { code: 'KOR', name: 'South Korea',         flag: '🇰🇷', group: 'A' },
  CZE: { code: 'CZE', name: 'Czech Republic',      flag: '🇨🇿', group: 'A' },
  // Group B
  CAN: { code: 'CAN', name: 'Canada',              flag: '🇨🇦', group: 'B' },
  BIH: { code: 'BIH', name: 'Bosnia-Herzegovina', flag: '🇧🇦', group: 'B' },
  QAT: { code: 'QAT', name: 'Qatar',               flag: '🇶🇦', group: 'B' },
  SUI: { code: 'SUI', name: 'Switzerland',         flag: '🇨🇭', group: 'B' },
  // Group C
  BRA: { code: 'BRA', name: 'Brazil',              flag: '🇧🇷', group: 'C' },
  MAR: { code: 'MAR', name: 'Morocco',             flag: '🇲🇦', group: 'C' },
  HAI: { code: 'HAI', name: 'Haiti',               flag: '🇭🇹', group: 'C' },
  SCO: { code: 'SCO', name: 'Scotland',            flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', group: 'C' },
  // Group D
  USA: { code: 'USA', name: 'USA',                 flag: '🇺🇸', group: 'D' },
  PAR: { code: 'PAR', name: 'Paraguay',            flag: '🇵🇾', group: 'D' },
  AUS: { code: 'AUS', name: 'Australia',           flag: '🇦🇺', group: 'D' },
  TUR: { code: 'TUR', name: 'Turkey',              flag: '🇹🇷', group: 'D' },
  // Group E
  GER: { code: 'GER', name: 'Germany',             flag: '🇩🇪', group: 'E' },
  CUW: { code: 'CUW', name: 'Curaçao',            flag: '🇨🇼', group: 'E' },
  CIV: { code: 'CIV', name: 'Ivory Coast',         flag: '🇨🇮', group: 'E' },
  ECU: { code: 'ECU', name: 'Ecuador',             flag: '🇪🇨', group: 'E' },
  // Group F
  NED: { code: 'NED', name: 'Netherlands',         flag: '🇳🇱', group: 'F' },
  JPN: { code: 'JPN', name: 'Japan',               flag: '🇯🇵', group: 'F' },
  SWE: { code: 'SWE', name: 'Sweden',              flag: '🇸🇪', group: 'F' },
  TUN: { code: 'TUN', name: 'Tunisia',             flag: '🇹🇳', group: 'F' },
  // Group G: Belgium, Egypt, Iran, New Zealand
  BEL: { code: 'BEL', name: 'Belgium',             flag: '🇧🇪', group: 'G' },
  EGY: { code: 'EGY', name: 'Egypt',               flag: '🇪🇬', group: 'G' },
  IRN: { code: 'IRN', name: 'Iran',                flag: '🇮🇷', group: 'G' },
  NZL: { code: 'NZL', name: 'New Zealand',         flag: '🇳🇿', group: 'G' },
  // Group H: Spain, Cape Verde, Saudi Arabia, Uruguay
  ESP: { code: 'ESP', name: 'Spain',               flag: '🇪🇸', group: 'H' },
  CPV: { code: 'CPV', name: 'Cape Verde',          flag: '🇨🇻', group: 'H' },
  SAU: { code: 'SAU', name: 'Saudi Arabia',        flag: '🇸🇦', group: 'H' },
  URU: { code: 'URU', name: 'Uruguay',             flag: '🇺🇾', group: 'H' },
  // Group I
  FRA: { code: 'FRA', name: 'France',              flag: '🇫🇷', group: 'I' },
  SEN: { code: 'SEN', name: 'Senegal',             flag: '🇸🇳', group: 'I' },
  IRQ: { code: 'IRQ', name: 'Iraq',                flag: '🇮🇶', group: 'I' },
  NOR: { code: 'NOR', name: 'Norway',              flag: '🇳🇴', group: 'I' },
  // Group J
  ARG: { code: 'ARG', name: 'Argentina',           flag: '🇦🇷', group: 'J' },
  ALG: { code: 'ALG', name: 'Algeria',             flag: '🇩🇿', group: 'J' },
  AUT: { code: 'AUT', name: 'Austria',             flag: '🇦🇹', group: 'J' },
  JOR: { code: 'JOR', name: 'Jordan',              flag: '🇯🇴', group: 'J' },
  // Group K
  POR: { code: 'POR', name: 'Portugal',            flag: '🇵🇹', group: 'K' },
  COD: { code: 'COD', name: 'DR Congo',            flag: '🇨🇩', group: 'K' },
  UZB: { code: 'UZB', name: 'Uzbekistan',          flag: '🇺🇿', group: 'K' },
  COL: { code: 'COL', name: 'Colombia',            flag: '🇨🇴', group: 'K' },
  // Group L
  ENG: { code: 'ENG', name: 'England',             flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'L' },
  CRO: { code: 'CRO', name: 'Croatia',             flag: '🇭🇷', group: 'L' },
  GHA: { code: 'GHA', name: 'Ghana',               flag: '🇬🇭', group: 'L' },
  PAN: { code: 'PAN', name: 'Panama',              flag: '🇵🇦', group: 'L' },
};

export const VENUE = {
  MET:   'MetLife Stadium, New Jersey',
  SOFI:  'SoFi Stadium, Los Angeles',
  AZT:   'Estadio Azteca, Mexico City',
  MB:    'Mercedes-Benz Stadium, Atlanta',
  ATT:   'AT&T Stadium, Dallas',
  BMO:   'BMO Field, Toronto',
  GIL:   'Gillette Stadium, Boston',
  LIN:   'Lincoln Financial Field, Philadelphia',
  LUM:   'Lumen Field, Seattle',
  ARR:   'Arrowhead Stadium, Kansas City',
  HARD:  'Hard Rock Stadium, Miami',
  LEV:   "Levi's Stadium, San Francisco",
  BCP:   'BC Place, Vancouver',
  AKRON: 'Estadio Akron, Guadalajara',
  BBVA:  'Estadio BBVA, Monterrey',
  NRG:   'NRG Stadium, Houston',
};

// All times UTC. status: 'finished' | 'live' | 'upcoming'
// Simulated now = Jun 15 17:30 UTC
export const MATCHES = [
  // ── GROUP A ─────────────────────────────────────────────────────────────
  { id: 'A1', group:'A', md:1, date:'2026-06-11', time:'19:00', venue: VENUE.AZT,
    home:'MEX', away:'RSA', status:'finished', score:[2,0],
    odds:{ home:1.60, draw:3.80, away:5.50 } },
  { id: 'A2', group:'A', md:1, date:'2026-06-12', time:'02:00', venue: VENUE.AKRON,
    home:'KOR', away:'CZE', status:'finished', score:[1,2],
    odds:{ home:2.60, draw:3.20, away:2.60 } },
  { id: 'A3', group:'A', md:2, date:'2026-06-18', time:'16:00', venue: VENUE.MB,
    home:'CZE', away:'RSA', status:'upcoming',
    odds:{ home:1.85, draw:3.50, away:4.20 } },
  { id: 'A4', group:'A', md:2, date:'2026-06-19', time:'01:00', venue: VENUE.AKRON,
    home:'MEX', away:'KOR', status:'upcoming',
    odds:{ home:1.70, draw:3.60, away:5.00 } },
  { id: 'A5', group:'A', md:3, date:'2026-06-25', time:'01:00', venue: VENUE.AZT,
    home:'CZE', away:'MEX', status:'upcoming',
    odds:{ home:3.00, draw:3.20, away:2.20 } },
  { id: 'A6', group:'A', md:3, date:'2026-06-25', time:'01:00', venue: VENUE.BBVA,
    home:'RSA', away:'KOR', status:'upcoming',
    odds:{ home:3.60, draw:3.10, away:2.10 } },

  // ── GROUP B ─────────────────────────────────────────────────────────────
  { id: 'B1', group:'B', md:1, date:'2026-06-12', time:'23:00', venue: VENUE.BMO,
    home:'CAN', away:'BIH', status:'finished', score:[2,0],
    odds:{ home:1.65, draw:3.70, away:5.20 } },
  { id: 'B2', group:'B', md:1, date:'2026-06-14', time:'02:00', venue: VENUE.LEV,
    home:'QAT', away:'SUI', status:'finished', score:[0,2],
    odds:{ home:4.50, draw:3.40, away:1.75 } },
  { id: 'B3', group:'B', md:2, date:'2026-06-19', time:'02:00', venue: VENUE.SOFI,
    home:'SUI', away:'BIH', status:'upcoming',
    odds:{ home:1.55, draw:3.90, away:5.50 } },
  { id: 'B4', group:'B', md:2, date:'2026-06-19', time:'05:00', venue: VENUE.BCP,
    home:'CAN', away:'QAT', status:'upcoming',
    odds:{ home:1.30, draw:4.80, away:9.00 } },
  { id: 'B5', group:'B', md:3, date:'2026-06-25', time:'02:00', venue: VENUE.BCP,
    home:'SUI', away:'CAN', status:'upcoming',
    odds:{ home:2.80, draw:3.20, away:2.50 } },
  { id: 'B6', group:'B', md:3, date:'2026-06-25', time:'02:00', venue: VENUE.LUM,
    home:'BIH', away:'QAT', status:'upcoming',
    odds:{ home:2.10, draw:3.30, away:3.40 } },

  // ── GROUP C ─────────────────────────────────────────────────────────────
  { id: 'C1', group:'C', md:1, date:'2026-06-13', time:'01:00', venue: VENUE.GIL,
    home:'HAI', away:'SCO', status:'finished', score:[0,2],
    odds:{ home:5.00, draw:3.60, away:1.60 } },
  { id: 'C2', group:'C', md:1, date:'2026-06-13', time:'22:00', venue: VENUE.MET,
    home:'BRA', away:'MAR', status:'finished', score:[3,0],
    odds:{ home:1.35, draw:4.80, away:7.50 } },
  { id: 'C3', group:'C', md:2, date:'2026-06-19', time:'00:30', venue: VENUE.LIN,
    home:'BRA', away:'HAI', status:'upcoming',
    odds:{ home:1.10, draw:8.00, away:18.00 } },
  { id: 'C4', group:'C', md:2, date:'2026-06-19', time:'22:00', venue: VENUE.GIL,
    home:'SCO', away:'MAR', status:'upcoming',
    odds:{ home:2.10, draw:3.20, away:3.50 } },
  { id: 'C5', group:'C', md:3, date:'2026-06-24', time:'22:00', venue: VENUE.HARD,
    home:'SCO', away:'BRA', status:'upcoming',
    odds:{ home:6.50, draw:4.20, away:1.40 } },
  { id: 'C6', group:'C', md:3, date:'2026-06-24', time:'22:00', venue: VENUE.MB,
    home:'MAR', away:'HAI', status:'upcoming',
    odds:{ home:1.55, draw:3.80, away:5.20 } },

  // ── GROUP D ─────────────────────────────────────────────────────────────
  { id: 'D1', group:'D', md:1, date:'2026-06-12', time:'01:00', venue: VENUE.SOFI,
    home:'USA', away:'PAR', status:'finished', score:[2,1],
    odds:{ home:1.80, draw:3.50, away:4.40 } },
  { id: 'D2', group:'D', md:1, date:'2026-06-13', time:'04:00', venue: VENUE.BCP,
    home:'AUS', away:'TUR', status:'finished', score:[0,2],
    odds:{ home:2.50, draw:3.20, away:2.80 } },
  { id: 'D3', group:'D', md:2, date:'2026-06-19', time:'19:00', venue: VENUE.LUM,
    home:'USA', away:'AUS', status:'upcoming',
    odds:{ home:1.50, draw:4.00, away:6.00 } },
  { id: 'D4', group:'D', md:2, date:'2026-06-19', time:'03:00', venue: VENUE.LEV,
    home:'TUR', away:'PAR', status:'upcoming',
    odds:{ home:1.90, draw:3.40, away:3.80 } },
  { id: 'D5', group:'D', md:3, date:'2026-06-25', time:'02:00', venue: VENUE.SOFI,
    home:'TUR', away:'USA', status:'upcoming',
    odds:{ home:3.20, draw:3.20, away:2.20 } },
  { id: 'D6', group:'D', md:3, date:'2026-06-25', time:'02:00', venue: VENUE.LEV,
    home:'PAR', away:'AUS', status:'upcoming',
    odds:{ home:2.20, draw:3.20, away:3.20 } },

  // ── GROUP E ─────────────────────────────────────────────────────────────
  { id: 'E1', group:'E', md:1, date:'2026-06-14', time:'17:00', venue: VENUE.NRG,
    home:'GER', away:'CUW', status:'finished', score:[5,0],
    odds:{ home:1.05, draw:12.00, away:28.00 } },
  { id: 'E2', group:'E', md:1, date:'2026-06-14', time:'23:00', venue: VENUE.LIN,
    home:'CIV', away:'ECU', status:'finished', score:[1,2],
    odds:{ home:2.40, draw:3.20, away:2.90 } },
  { id: 'E3', group:'E', md:2, date:'2026-06-20', time:'20:00', venue: VENUE.BMO,
    home:'GER', away:'CIV', status:'upcoming',
    odds:{ home:1.40, draw:4.20, away:7.50 } },
  { id: 'E4', group:'E', md:2, date:'2026-06-21', time:'00:00', venue: VENUE.ARR,
    home:'ECU', away:'CUW', status:'upcoming',
    odds:{ home:1.25, draw:5.50, away:11.00 } },
  { id: 'E5', group:'E', md:3, date:'2026-06-25', time:'20:00', venue: VENUE.LIN,
    home:'CUW', away:'CIV', status:'upcoming',
    odds:{ home:5.50, draw:3.80, away:1.55 } },
  { id: 'E6', group:'E', md:3, date:'2026-06-25', time:'20:00', venue: VENUE.MET,
    home:'ECU', away:'GER', status:'upcoming',
    odds:{ home:4.50, draw:3.60, away:1.70 } },

  // ── GROUP F ─────────────────────────────────────────────────────────────
  { id: 'F1', group:'F', md:1, date:'2026-06-14', time:'02:00', venue: VENUE.BBVA,
    home:'SWE', away:'TUN', status:'finished', score:[1,1],
    odds:{ home:1.90, draw:3.40, away:3.80 } },
  { id: 'F2', group:'F', md:1, date:'2026-06-14', time:'08:00', venue: VENUE.ATT,
    home:'NED', away:'JPN', status:'finished', score:[2,0],
    odds:{ home:1.55, draw:3.80, away:5.50 } },
  { id: 'F3', group:'F', md:2, date:'2026-06-20', time:'17:00', venue: VENUE.NRG,
    home:'NED', away:'SWE', status:'upcoming',
    odds:{ home:1.70, draw:3.60, away:4.80 } },
  { id: 'F4', group:'F', md:2, date:'2026-06-21', time:'04:00', venue: VENUE.BBVA,
    home:'TUN', away:'JPN', status:'upcoming',
    odds:{ home:3.20, draw:3.20, away:2.20 } },
  { id: 'F5', group:'F', md:3, date:'2026-06-25', time:'23:00', venue: VENUE.ATT,
    home:'JPN', away:'SWE', status:'upcoming',
    odds:{ home:2.80, draw:3.20, away:2.60 } },
  { id: 'F6', group:'F', md:3, date:'2026-06-26', time:'00:00', venue: VENUE.ARR,
    home:'TUN', away:'NED', status:'upcoming',
    odds:{ home:6.00, draw:4.00, away:1.50 } },

  // ── GROUP G: Belgium · Egypt · Iran · New Zealand ────────────────────────
  { id: 'G1', group:'G', md:1, date:'2026-06-15', time:'19:00', venue: VENUE.LUM,
    home:'BEL', away:'EGY', status:'live', minute:62, score:[1,0],
    odds:{ home:1.45, draw:4.00, away:6.50 } },
  { id: 'G2', group:'G', md:1, date:'2026-06-16', time:'01:00', venue: VENUE.SOFI,
    home:'IRN', away:'NZL', status:'upcoming',
    odds:{ home:1.75, draw:3.40, away:4.80 } },
  { id: 'G3', group:'G', md:2, date:'2026-06-21', time:'19:00', venue: VENUE.SOFI,
    home:'BEL', away:'IRN', status:'upcoming',
    odds:{ home:1.50, draw:3.90, away:6.20 } },
  { id: 'G4', group:'G', md:2, date:'2026-06-22', time:'01:00', venue: VENUE.BCP,
    home:'NZL', away:'EGY', status:'upcoming',
    odds:{ home:2.60, draw:3.10, away:2.80 } },
  { id: 'G5', group:'G', md:3, date:'2026-06-27', time:'03:00', venue: VENUE.LUM,
    home:'EGY', away:'IRN', status:'upcoming',
    odds:{ home:2.80, draw:3.20, away:2.50 } },
  { id: 'G6', group:'G', md:3, date:'2026-06-27', time:'03:00', venue: VENUE.BCP,
    home:'NZL', away:'BEL', status:'upcoming',
    odds:{ home:6.50, draw:4.00, away:1.40 } },

  // ── GROUP H: Spain · Cape Verde · Saudi Arabia · Uruguay ─────────────────
  { id: 'H1', group:'H', md:1, date:'2026-06-15', time:'16:00', venue: VENUE.MB,
    home:'ESP', away:'CPV', status:'live', minute:85, score:[3,0],
    odds:{ home:1.15, draw:7.50, away:16.00 } },
  { id: 'H2', group:'H', md:1, date:'2026-06-15', time:'22:00', venue: VENUE.HARD,
    home:'SAU', away:'URU', status:'upcoming',
    odds:{ home:3.80, draw:3.30, away:1.95 } },
  { id: 'H3', group:'H', md:2, date:'2026-06-21', time:'16:00', venue: VENUE.MB,
    home:'ESP', away:'SAU', status:'upcoming',
    odds:{ home:1.18, draw:7.00, away:13.00 } },
  { id: 'H4', group:'H', md:2, date:'2026-06-21', time:'22:00', venue: VENUE.HARD,
    home:'URU', away:'CPV', status:'upcoming',
    odds:{ home:1.30, draw:5.00, away:9.00 } },
  { id: 'H5', group:'H', md:3, date:'2026-06-27', time:'00:00', venue: VENUE.NRG,
    home:'CPV', away:'SAU', status:'upcoming',
    odds:{ home:3.50, draw:3.20, away:2.10 } },
  { id: 'H6', group:'H', md:3, date:'2026-06-27', time:'00:00', venue: VENUE.AKRON,
    home:'URU', away:'ESP', status:'upcoming',
    odds:{ home:6.00, draw:4.00, away:1.45 } },

  // ── GROUP I: France · Senegal · Iraq · Norway ────────────────────────────
  { id: 'I1', group:'I', md:1, date:'2026-06-16', time:'19:00', venue: VENUE.MET,
    home:'FRA', away:'SEN', status:'upcoming',
    odds:{ home:1.50, draw:3.90, away:5.80 } },
  { id: 'I2', group:'I', md:1, date:'2026-06-16', time:'22:00', venue: VENUE.GIL,
    home:'IRQ', away:'NOR', status:'upcoming',
    odds:{ home:3.60, draw:3.20, away:2.00 } },
  { id: 'I3', group:'I', md:2, date:'2026-06-22', time:'21:00', venue: VENUE.LIN,
    home:'FRA', away:'IRQ', status:'upcoming',
    odds:{ home:1.18, draw:7.00, away:14.00 } },
  { id: 'I4', group:'I', md:2, date:'2026-06-23', time:'00:00', venue: VENUE.MET,
    home:'NOR', away:'SEN', status:'upcoming',
    odds:{ home:2.00, draw:3.30, away:3.80 } },
  { id: 'I5', group:'I', md:3, date:'2026-06-26', time:'19:00', venue: VENUE.GIL,
    home:'NOR', away:'FRA', status:'upcoming',
    odds:{ home:4.20, draw:3.50, away:1.80 } },
  { id: 'I6', group:'I', md:3, date:'2026-06-26', time:'19:00', venue: VENUE.BMO,
    home:'SEN', away:'IRQ', status:'upcoming',
    odds:{ home:1.65, draw:3.50, away:5.50 } },

  // ── GROUP J: Argentina · Algeria · Austria · Jordan ──────────────────────
  { id: 'J1', group:'J', md:1, date:'2026-06-16', time:'01:00', venue: VENUE.ARR,
    home:'ARG', away:'ALG', status:'upcoming',
    odds:{ home:1.35, draw:4.50, away:8.00 } },
  { id: 'J2', group:'J', md:1, date:'2026-06-16', time:'04:00', venue: VENUE.LEV,
    home:'AUT', away:'JOR', status:'upcoming',
    odds:{ home:1.60, draw:3.70, away:5.80 } },
  { id: 'J3', group:'J', md:2, date:'2026-06-22', time:'17:00', venue: VENUE.ATT,
    home:'ARG', away:'AUT', status:'upcoming',
    odds:{ home:1.40, draw:4.20, away:7.50 } },
  { id: 'J4', group:'J', md:2, date:'2026-06-23', time:'03:00', venue: VENUE.LEV,
    home:'JOR', away:'ALG', status:'upcoming',
    odds:{ home:3.80, draw:3.30, away:1.90 } },
  { id: 'J5', group:'J', md:3, date:'2026-06-28', time:'02:00', venue: VENUE.ARR,
    home:'ALG', away:'AUT', status:'upcoming',
    odds:{ home:2.60, draw:3.10, away:2.80 } },
  { id: 'J6', group:'J', md:3, date:'2026-06-28', time:'02:00', venue: VENUE.ATT,
    home:'JOR', away:'ARG', status:'upcoming',
    odds:{ home:9.00, draw:5.00, away:1.30 } },

  // ── GROUP K: Portugal · DR Congo · Uzbekistan · Colombia ─────────────────
  { id: 'K1', group:'K', md:1, date:'2026-06-17', time:'02:00', venue: VENUE.AZT,
    home:'UZB', away:'COL', status:'upcoming',
    odds:{ home:3.40, draw:3.30, away:2.10 } },
  { id: 'K2', group:'K', md:1, date:'2026-06-17', time:'17:00', venue: VENUE.NRG,
    home:'POR', away:'COD', status:'upcoming',
    odds:{ home:1.30, draw:4.80, away:9.00 } },
  { id: 'K3', group:'K', md:2, date:'2026-06-23', time:'02:00', venue: VENUE.AKRON,
    home:'COL', away:'COD', status:'upcoming',
    odds:{ home:1.75, draw:3.50, away:4.80 } },
  { id: 'K4', group:'K', md:2, date:'2026-06-23', time:'17:00', venue: VENUE.NRG,
    home:'POR', away:'UZB', status:'upcoming',
    odds:{ home:1.20, draw:6.50, away:13.00 } },
  { id: 'K5', group:'K', md:3, date:'2026-06-27', time:'23:30', venue: VENUE.HARD,
    home:'COL', away:'POR', status:'upcoming',
    odds:{ home:4.50, draw:3.50, away:1.75 } },
  { id: 'K6', group:'K', md:3, date:'2026-06-27', time:'23:30', venue: VENUE.MB,
    home:'COD', away:'UZB', status:'upcoming',
    odds:{ home:1.90, draw:3.30, away:3.80 } },

  // ── GROUP L: England · Croatia · Ghana · Panama ───────────────────────────
  { id: 'L1', group:'L', md:1, date:'2026-06-17', time:'19:00', venue: VENUE.ATT,
    home:'ENG', away:'CRO', status:'upcoming',
    odds:{ home:1.70, draw:3.60, away:4.80 } },
  { id: 'L2', group:'L', md:1, date:'2026-06-17', time:'23:00', venue: VENUE.BMO,
    home:'GHA', away:'PAN', status:'upcoming',
    odds:{ home:2.00, draw:3.20, away:3.80 } },
  { id: 'L3', group:'L', md:2, date:'2026-06-23', time:'20:00', venue: VENUE.GIL,
    home:'ENG', away:'GHA', status:'upcoming',
    odds:{ home:1.45, draw:4.10, away:7.00 } },
  { id: 'L4', group:'L', md:2, date:'2026-06-23', time:'23:00', venue: VENUE.BMO,
    home:'PAN', away:'CRO', status:'upcoming',
    odds:{ home:3.80, draw:3.30, away:1.95 } },
  { id: 'L5', group:'L', md:3, date:'2026-06-27', time:'21:00', venue: VENUE.MET,
    home:'PAN', away:'ENG', status:'upcoming',
    odds:{ home:8.50, draw:4.80, away:1.35 } },
  { id: 'L6', group:'L', md:3, date:'2026-06-27', time:'21:00', venue: VENUE.LIN,
    home:'CRO', away:'GHA', status:'upcoming',
    odds:{ home:1.90, draw:3.30, away:3.80 } },
];

export const BRACKET = {
  R32: Array.from({ length: 16 }, (_, i) => ({ id: `R32-${i+1}`, home: 'TBD', away: 'TBD' })),
  R16: Array.from({ length: 8 },  (_, i) => ({ id: `R16-${i+1}`, home: 'TBD', away: 'TBD' })),
  QF:  Array.from({ length: 4 },  (_, i) => ({ id: `QF-${i+1}`,  home: 'TBD', away: 'TBD' })),
  SF:  Array.from({ length: 2 },  (_, i) => ({ id: `SF-${i+1}`,  home: 'TBD', away: 'TBD' })),
  F:   [{ id: 'F1', home: 'TBD', away: 'TBD' }],
};

// MD1 results after first 5 days
export const GROUPS = [
  { id:'A', teams:[
    { code:'MEX', p:1, w:1, d:0, l:0, gf:2, ga:0, pts:3 },
    { code:'CZE', p:1, w:1, d:0, l:0, gf:2, ga:1, pts:3 },
    { code:'KOR', p:1, w:0, d:0, l:1, gf:1, ga:2, pts:0 },
    { code:'RSA', p:1, w:0, d:0, l:1, gf:0, ga:2, pts:0 },
  ]},
  { id:'B', teams:[
    { code:'CAN', p:1, w:1, d:0, l:0, gf:2, ga:0, pts:3 },
    { code:'SUI', p:1, w:1, d:0, l:0, gf:2, ga:0, pts:3 },
    { code:'BIH', p:1, w:0, d:0, l:1, gf:0, ga:2, pts:0 },
    { code:'QAT', p:1, w:0, d:0, l:1, gf:0, ga:2, pts:0 },
  ]},
  { id:'C', teams:[
    { code:'BRA', p:1, w:1, d:0, l:0, gf:3, ga:0, pts:3 },
    { code:'SCO', p:1, w:1, d:0, l:0, gf:2, ga:0, pts:3 },
    { code:'MAR', p:1, w:0, d:0, l:1, gf:0, ga:3, pts:0 },
    { code:'HAI', p:1, w:0, d:0, l:1, gf:0, ga:2, pts:0 },
  ]},
  { id:'D', teams:[
    { code:'USA', p:1, w:1, d:0, l:0, gf:2, ga:1, pts:3 },
    { code:'TUR', p:1, w:1, d:0, l:0, gf:2, ga:0, pts:3 },
    { code:'PAR', p:1, w:0, d:0, l:1, gf:1, ga:2, pts:0 },
    { code:'AUS', p:1, w:0, d:0, l:1, gf:0, ga:2, pts:0 },
  ]},
  { id:'E', teams:[
    { code:'GER', p:1, w:1, d:0, l:0, gf:5, ga:0, pts:3 },
    { code:'ECU', p:1, w:1, d:0, l:0, gf:2, ga:1, pts:3 },
    { code:'CIV', p:1, w:0, d:0, l:1, gf:1, ga:2, pts:0 },
    { code:'CUW', p:1, w:0, d:0, l:1, gf:0, ga:5, pts:0 },
  ]},
  { id:'F', teams:[
    { code:'NED', p:1, w:1, d:0, l:0, gf:2, ga:0, pts:3 },
    { code:'SWE', p:1, w:0, d:1, l:0, gf:1, ga:1, pts:1 },
    { code:'TUN', p:1, w:0, d:1, l:0, gf:1, ga:1, pts:1 },
    { code:'JPN', p:1, w:0, d:0, l:1, gf:0, ga:2, pts:0 },
  ]},
  { id:'G', teams:[
    { code:'BEL', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
    { code:'EGY', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
    { code:'IRN', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
    { code:'NZL', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
  ]},
  { id:'H', teams:[
    { code:'ESP', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
    { code:'CPV', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
    { code:'SAU', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
    { code:'URU', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
  ]},
  { id:'I', teams:[
    { code:'FRA', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
    { code:'NOR', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
    { code:'SEN', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
    { code:'IRQ', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
  ]},
  { id:'J', teams:[
    { code:'ARG', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
    { code:'AUT', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
    { code:'ALG', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
    { code:'JOR', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
  ]},
  { id:'K', teams:[
    { code:'POR', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
    { code:'COL', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
    { code:'COD', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
    { code:'UZB', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
  ]},
  { id:'L', teams:[
    { code:'ENG', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
    { code:'CRO', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
    { code:'GHA', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
    { code:'PAN', p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 },
  ]},
];

export const BETS = [
  { id:'B1',  user:'rahul',    matchId:'H1', pick:'home', amount:1500, oddsAt:1.15, status:'open',  placedAt:'2026-06-15T15:30:00Z' },
  { id:'B2',  user:'jayesh',   matchId:'H1', pick:'home', amount:800,  oddsAt:1.15, status:'open',  placedAt:'2026-06-15T15:00:00Z' },
  { id:'B3',  user:'ashin',    matchId:'G1', pick:'home', amount:600,  oddsAt:1.45, status:'open',  placedAt:'2026-06-15T18:45:00Z' },
  { id:'B4',  user:'rahul',    matchId:'G1', pick:'home', amount:1000, oddsAt:1.45, status:'open',  placedAt:'2026-06-15T18:00:00Z' },
  { id:'B5',  user:'manan',    matchId:'G1', pick:'away', amount:200,  oddsAt:6.50, status:'open',  placedAt:'2026-06-15T17:30:00Z' },
  { id:'B6',  user:'pratyush', matchId:'H2', pick:'away', amount:500,  oddsAt:1.95, status:'open',  placedAt:'2026-06-15T10:00:00Z' },
  { id:'B7',  user:'rohan',    matchId:'I1', pick:'home', amount:400,  oddsAt:1.50, status:'open',  placedAt:'2026-06-15T12:00:00Z' },
  { id:'B8',  user:'rahul',    matchId:'J1', pick:'home', amount:1200, oddsAt:1.35, status:'open',  placedAt:'2026-06-15T08:00:00Z' },
  { id:'B9',  user:'aryan',    matchId:'K2', pick:'home', amount:700,  oddsAt:1.30, status:'open',  placedAt:'2026-06-15T09:00:00Z' },
  // Settled bets
  { id:'B10', user:'rahul',    matchId:'A1', pick:'home', amount:1000, oddsAt:1.60, status:'won',  payout:1600, placedAt:'2026-06-11T18:00:00Z' },
  { id:'B11', user:'rahul',    matchId:'C2', pick:'home', amount:800,  oddsAt:1.35, status:'won',  payout:1080, placedAt:'2026-06-13T21:00:00Z' },
  { id:'B12', user:'rahul',    matchId:'D1', pick:'home', amount:600,  oddsAt:1.80, status:'won',  payout:1080, placedAt:'2026-06-12T00:00:00Z' },
  { id:'B13', user:'rahul',    matchId:'B2', pick:'away', amount:500,  oddsAt:1.75, status:'won',  payout:875,  placedAt:'2026-06-13T23:00:00Z' },
  { id:'B14', user:'rahul',    matchId:'A2', pick:'away', amount:400,  oddsAt:2.60, status:'won',  payout:1040, placedAt:'2026-06-11T22:00:00Z' },
  { id:'B15', user:'jayesh',   matchId:'A1', pick:'home', amount:500,  oddsAt:1.60, status:'won',  payout:800,  placedAt:'2026-06-11T17:00:00Z' },
  { id:'B16', user:'manan',    matchId:'C2', pick:'home', amount:1000, oddsAt:1.35, status:'won',  payout:1350, placedAt:'2026-06-13T21:30:00Z' },
  { id:'B17', user:'ashin',    matchId:'D2', pick:'home', amount:400,  oddsAt:2.50, status:'lost', placedAt:'2026-06-13T03:00:00Z' },
  { id:'B18', user:'pratyush', matchId:'E1', pick:'away', amount:300,  oddsAt:28.00,status:'lost', placedAt:'2026-06-14T16:00:00Z' },
];

export const ACTIVITY = [
  { id:'A1', user:'rahul',    text:'bet ₹1,500 on Spain · 85\'',         when:'12m', icon:'💰' },
  { id:'A2', user:'jayesh',   text:'bet ₹800 on Spain to win',           when:'26m', icon:'💰' },
  { id:'A3', user:'ashin',    text:'bet ₹600 on Belgium',                when:'40m', icon:'💰' },
  { id:'A4', user:'rahul',    text:'won ₹1,600 on Mexico win (Jun 11)',  when:'4d',  icon:'🏆' },
  { id:'A5', user:'manan',    text:'won ₹1,350 on Brazil · 3–0 Morocco',when:'2d',  icon:'🏆' },
  { id:'A6', user:'ashin',    text:'lost ₹400 on Australia',            when:'2d',  icon:'💔' },
];

// ── Helpers ──────────────────────────────────────────────────────
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
  const today = new Date('2026-06-15T00:00:00');
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
