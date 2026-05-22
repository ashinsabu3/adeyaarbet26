/**
 * Bet Store — State Machine & Edge Case Tests
 *
 * Tests the core betting invariants that must NEVER break:
 * 1. Balance can never go negative
 * 2. Bets are atomic (no partial state)
 * 3. Duplicate rapid bets cannot overdraw
 * 4. Match validation is strict
 * 5. Pool calculations are consistent
 * 6. State transitions are valid
 */

// Mock localStorage
const store = {};
const localStorageMock = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => { store[key] = value; },
  removeItem: (key) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
};

// Mock window for 'use client' module
global.window = { localStorage: localStorageMock };
global.localStorage = localStorageMock;

// Must set env before imports
jest.mock('@/lib/currency', () => ({
  CURRENCY_SYMBOL: '₹',
  CURRENCY_NAME: 'Coins',
  STARTING_BALANCE: 5000,
  fmtMoney: (n) => `₹${n}`,
}));

jest.mock('@/lib/data', () => ({
  MATCHES: [
    { id: 'A1', group: 'A', home: 'MEX', away: 'RSA', date: '2026-06-11', time: '19:00', venue: 'Estadio Azteca', status: 'upcoming' },
    { id: 'A2', group: 'A', home: 'KOR', away: 'CZE', date: '2026-06-12', time: '02:00', venue: 'Akron', status: 'upcoming' },
    { id: 'C2', group: 'C', home: 'BRA', away: 'MAR', date: '2026-06-13', time: '22:00', venue: 'MetLife', status: 'upcoming' },
    { id: 'FINISHED1', group: 'A', home: 'MEX', away: 'RSA', date: '2026-06-01', time: '19:00', venue: 'Test', status: 'finished' },
  ],
  FRIENDS: [
    { id: 'rahul', name: 'Rahul' },
    { id: 'ashin', name: 'Ashin' },
    { id: 'manan', name: 'Manan' },
  ],
  ME_ID: 'rahul',
}));

const {
  getBets,
  getMyBets,
  placeBet,
  getBalance,
  getBetsForMatch,
  getPoolForMatch,
  getFriendBalances,
  initBetStore,
} = require('../lib/bet-store');

describe('Bet Store — Core Invariants', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  // ─── BALANCE INVARIANTS ─────────────────────────────────────

  describe('Balance can never go negative', () => {
    test('fresh user has STARTING_BALANCE', () => {
      expect(getBalance()).toBe(5000);
    });

    test('placing bet deducts from balance', () => {
      placeBet('A1', 'home', 1000);
      expect(getBalance()).toBe(4000);
    });

    test('multiple bets deduct cumulatively', () => {
      placeBet('A1', 'home', 1000);
      placeBet('A2', 'away', 2000);
      placeBet('C2', 'draw', 500);
      expect(getBalance()).toBe(1500);
    });

    test('cannot bet more than available balance', () => {
      placeBet('A1', 'home', 4000);
      expect(() => placeBet('A2', 'away', 1500)).toThrow('Insufficient balance');
      expect(getBalance()).toBe(1000); // unchanged after failed bet
    });

    test('cannot bet exact balance + 1', () => {
      expect(() => placeBet('A1', 'home', 5001)).toThrow('Insufficient balance');
      expect(getBalance()).toBe(5000);
    });

    test('CAN bet exact full balance', () => {
      const bet = placeBet('A1', 'home', 5000);
      expect(bet).toBeDefined();
      expect(getBalance()).toBe(0);
    });

    test('after all-in, cannot bet even 1 more', () => {
      placeBet('A1', 'home', 5000);
      expect(() => placeBet('A2', 'away', 1)).toThrow('Insufficient balance');
    });
  });

  // ─── RACE CONDITION: RAPID DOUBLE-BET ──────────────────────

  describe('Race condition: rapid sequential bets', () => {
    test('two bets totaling more than balance — second must fail', () => {
      placeBet('A1', 'home', 3000);
      expect(() => placeBet('A2', 'away', 3000)).toThrow('Insufficient balance');
      expect(getBalance()).toBe(2000);
      expect(getMyBets()).toHaveLength(1);
    });

    test('many small bets draining balance — last one fails', () => {
      for (let i = 0; i < 10; i++) {
        placeBet('A1', 'home', 500);
      }
      // Balance should be 0 now
      expect(getBalance()).toBe(0);
      expect(() => placeBet('A2', 'away', 1)).toThrow('Insufficient balance');
      expect(getMyBets()).toHaveLength(10);
    });

    test('simultaneous-ish bets (sync JS so sequential, but tests the read-check-write pattern)', () => {
      // Place a bet, then immediately try to overdraw
      placeBet('A1', 'home', 4999);
      expect(getBalance()).toBe(1);
      placeBet('A2', 'away', 1); // exactly 1 left
      expect(getBalance()).toBe(0);
      expect(() => placeBet('C2', 'draw', 1)).toThrow('Insufficient balance');
    });
  });

  // ─── VALIDATION ────────────────────────────────────────────

  describe('Input validation', () => {
    test('rejects amount = 0', () => {
      expect(() => placeBet('A1', 'home', 0)).toThrow('Amount must be positive');
    });

    test('rejects negative amount', () => {
      expect(() => placeBet('A1', 'home', -100)).toThrow('Amount must be positive');
    });

    test('rejects invalid pick', () => {
      expect(() => placeBet('A1', 'home_win', 100)).toThrow('Invalid pick');
    });

    test('rejects empty pick', () => {
      expect(() => placeBet('A1', '', 100)).toThrow('Invalid pick');
    });

    test('rejects non-existent match', () => {
      expect(() => placeBet('Z99', 'home', 100)).toThrow('Match not found');
    });

    test('rejects undefined matchId', () => {
      expect(() => placeBet(undefined, 'home', 100)).toThrow('Match not found');
    });

    test('rejects bet on finished match', () => {
      expect(() => placeBet('FINISHED1', 'home', 100)).toThrow('Match already finished');
      expect(getBalance()).toBe(5000);
    });

    test('accepts valid picks: home, away, draw', () => {
      expect(placeBet('A1', 'home', 100)).toBeDefined();
      expect(placeBet('A1', 'away', 100)).toBeDefined();
      expect(placeBet('A1', 'draw', 100)).toBeDefined();
    });
  });

  // ─── BET OBJECT SHAPE ──────────────────────────────────────

  describe('Bet object integrity', () => {
    test('returned bet has all required fields', () => {
      const bet = placeBet('A1', 'home', 500);
      expect(bet).toMatchObject({
        matchId: 'A1',
        pick: 'home',
        amount: 500,
        status: 'pending',
        userId: 'rahul',
      });
      expect(bet.id).toBeTruthy();
      expect(bet.createdAt).toBeTruthy();
      expect(new Date(bet.createdAt).getTime()).not.toBeNaN();
    });

    test('oddsAt is null (parimutuel has no fixed odds)', () => {
      const bet = placeBet('A1', 'home', 500);
      expect(bet.oddsAt).toBeNull();
    });

    test('each bet gets a unique ID', () => {
      const bet1 = placeBet('A1', 'home', 100);
      const bet2 = placeBet('A2', 'away', 100);
      expect(bet1.id).not.toBe(bet2.id);
    });

    test('bet is immediately persisted and retrievable', () => {
      const bet = placeBet('A1', 'home', 500);
      const stored = getMyBets();
      expect(stored.find(b => b.id === bet.id)).toBeDefined();
    });
  });

  // ─── POOL CALCULATIONS ─────────────────────────────────────

  describe('Parimutuel pool calculations', () => {
    test('empty pool for match with no bets', () => {
      const pool = getPoolForMatch('A1');
      expect(pool.total).toBe(0);
      expect(pool.bettorCount).toBe(0);
      expect(pool.bySide).toEqual({ home: 0, away: 0, draw: 0 });
    });

    test('single bet creates correct pool', () => {
      placeBet('A1', 'home', 500);
      const pool = getPoolForMatch('A1');
      expect(pool.total).toBe(500);
      expect(pool.bettorCount).toBe(1);
      expect(pool.bySide.home).toBe(500);
      expect(pool.bySide.away).toBe(0);
      expect(pool.bySide.draw).toBe(0);
    });

    test('multiple bets on same side accumulate', () => {
      placeBet('A1', 'home', 500);
      placeBet('A1', 'home', 300);
      const pool = getPoolForMatch('A1');
      expect(pool.total).toBe(800);
      expect(pool.bySide.home).toBe(800);
    });

    test('bets on different sides split correctly', () => {
      placeBet('A1', 'home', 500);
      placeBet('A1', 'away', 300);
      placeBet('A1', 'draw', 200);
      const pool = getPoolForMatch('A1');
      expect(pool.total).toBe(1000);
      expect(pool.bySide.home).toBe(500);
      expect(pool.bySide.away).toBe(300);
      expect(pool.bySide.draw).toBe(200);
    });

    test('pool is match-specific (no cross-contamination)', () => {
      placeBet('A1', 'home', 500);
      placeBet('A2', 'away', 300);
      expect(getPoolForMatch('A1').total).toBe(500);
      expect(getPoolForMatch('A2').total).toBe(300);
      expect(getPoolForMatch('C2').total).toBe(0);
    });

    test('pool invariant: total = sum of all sides', () => {
      placeBet('A1', 'home', 500);
      placeBet('A1', 'away', 300);
      placeBet('A1', 'draw', 200);
      const pool = getPoolForMatch('A1');
      expect(pool.total).toBe(pool.bySide.home + pool.bySide.away + pool.bySide.draw);
    });
  });

  // ─── STATE PERSISTENCE ─────────────────────────────────────

  describe('State persistence', () => {
    test('bets survive across store reads', () => {
      placeBet('A1', 'home', 500);
      placeBet('A2', 'away', 300);
      // Simulate "fresh read"
      const bets = getBets();
      expect(bets.length).toBeGreaterThanOrEqual(2);
    });

    test('corrupted localStorage returns empty gracefully', () => {
      localStorageMock.setItem('adeyaar_bets', 'not-json{{{');
      expect(getBets()).toEqual([]);
      expect(getBalance()).toBe(5000);
    });

    test('empty localStorage returns empty gracefully', () => {
      localStorageMock.removeItem('adeyaar_bets');
      expect(getBets()).toEqual([]);
    });
  });

  // ─── EDGE CASES ────────────────────────────────────────────

  describe('Edge cases', () => {
    test('placing bet on same match multiple times is allowed', () => {
      placeBet('A1', 'home', 100);
      placeBet('A1', 'home', 100);
      placeBet('A1', 'away', 100); // betting other side same match
      expect(getMyBets()).toHaveLength(3);
      expect(getBalance()).toBe(4700);
    });

    test('float amounts — should handle non-integer gracefully', () => {
      // Whether we accept or reject floats, balance must stay consistent
      try {
        placeBet('A1', 'home', 100.5);
        expect(getBalance()).toBeLessThan(5000);
      } catch {
        expect(getBalance()).toBe(5000);
      }
    });

    test('very large number of bets does not corrupt store', () => {
      for (let i = 0; i < 50; i++) {
        placeBet('A1', 'home', 50);
      }
      expect(getMyBets()).toHaveLength(50);
      expect(getBalance()).toBe(2500);
      const pool = getPoolForMatch('A1');
      expect(pool.total).toBe(2500);
    });

    test('balance after failed bet is unchanged', () => {
      placeBet('A1', 'home', 4000);
      const balBefore = getBalance();
      try { placeBet('A2', 'away', 5000); } catch {}
      expect(getBalance()).toBe(balBefore);
      expect(getMyBets()).toHaveLength(1);
    });
  });

  // ─── PAYOUT CALCULATION INVARIANTS ─────────────────────────

  describe('Payout invariants (parimutuel)', () => {
    test('total payouts cannot exceed pool', () => {
      // This tests the formula, not the store directly
      // Pool = 1000, home side = 600, away = 400
      // If home wins: each home bettor gets (their_stake/600) * 1000
      // Total paid out = 1000 (the whole pool) — matches pool exactly
      const pool = 1000;
      const homeSide = 600;
      const awaySide = 400;

      // If home wins
      const homePayoutRatio = pool / homeSide;
      expect(homePayoutRatio * homeSide).toBe(pool); // all money distributed

      // If away wins
      const awayPayoutRatio = pool / awaySide;
      expect(awayPayoutRatio * awaySide).toBe(pool);
    });

    test('bettor on minority side gets higher payout ratio', () => {
      const pool = 1000;
      const homeSide = 800; // popular pick
      const awaySide = 200; // contrarian pick

      const homeRatio = pool / homeSide; // 1.25x
      const awayRatio = pool / awaySide; // 5x

      expect(awayRatio).toBeGreaterThan(homeRatio);
      expect(homeRatio).toBe(1.25);
      expect(awayRatio).toBe(5);
    });

    test('sole bettor on winning side gets entire pool', () => {
      const pool = 5000;
      const winningSide = 500; // only my bet on this side
      const ratio = pool / winningSide;
      const myPayout = 500 * ratio; // my stake * ratio
      expect(myPayout).toBe(pool); // I get everything
    });
  });
});

describe('Bet Store — Leaderboard', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test('getFriendBalances returns all friends', () => {
    const balances = getFriendBalances('alltime');
    expect(Object.keys(balances)).toContain('rahul');
    expect(Object.keys(balances)).toContain('ashin');
    expect(Object.keys(balances)).toContain('manan');
  });

  test('my balance in leaderboard matches getBalance()', () => {
    placeBet('A1', 'home', 1000);
    const balances = getFriendBalances('alltime');
    expect(balances['rahul']).toBe(getBalance());
  });

  test('getFriendBalances is deterministic (no flicker)', () => {
    const balances1 = getFriendBalances('alltime');
    const balances2 = getFriendBalances('alltime');
    expect(balances1).toEqual(balances2);
  });
});
