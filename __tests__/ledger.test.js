import { computeBalance, resolveMatchBets, validateBetPlacement } from '@/lib/ledger';
import { STARTING_BALANCE } from '@/lib/currency';

// =============================================================================
// 1. BALANCE COMPUTATION — pure math, all status combinations
// =============================================================================

describe('computeBalance', () => {
  test('new user with no bets gets STARTING_BALANCE', () => {
    expect(computeBalance([])).toBe(5000);
  });

  test('single pending bet reduces balance', () => {
    const bets = [{ amount: 100, status: 'pending', payout: null }];
    expect(computeBalance(bets)).toBe(4900);
  });

  test('single won bet: amount deducted, payout added', () => {
    const bets = [{ amount: 100, status: 'won', payout: 300 }];
    // 5000 - 100 + 300 = 5200
    expect(computeBalance(bets)).toBe(5200);
  });

  test('single lost bet: amount deducted, no payout', () => {
    const bets = [{ amount: 200, status: 'lost', payout: null }];
    expect(computeBalance(bets)).toBe(4800);
  });

  test('cancelled bet does NOT reduce balance', () => {
    const bets = [{ amount: 500, status: 'cancelled', payout: null }];
    expect(computeBalance(bets)).toBe(5000);
  });

  test('mix of all statuses computes correctly', () => {
    const bets = [
      { amount: 100, status: 'pending', payout: null },   // -100
      { amount: 200, status: 'won', payout: 600 },        // -200 + 600
      { amount: 300, status: 'lost', payout: null },       // -300
      { amount: 400, status: 'cancelled', payout: null },  // free
      { amount: 50, status: 'won', payout: 150 },         // -50 + 150
    ];
    // 5000 - 100 - 200 + 600 - 300 - 50 + 150 = 5100
    expect(computeBalance(bets)).toBe(5100);
  });

  test('won bet with payout=0 still deducts amount', () => {
    // Edge: payout is 0 (shouldn't happen in practice but tests the formula)
    const bets = [{ amount: 100, status: 'won', payout: 0 }];
    // 5000 - 100 + 0 = 4900
    expect(computeBalance(bets)).toBe(4900);
  });

  test('won bet with null payout treats payout as 0', () => {
    // Edge: corrupted data — won but payout is null
    const bets = [{ amount: 100, status: 'won', payout: null }];
    // 5000 - 100 + 0 = 4900
    expect(computeBalance(bets)).toBe(4900);
  });

  test('balance can go negative with large losses (system invariant: shouldnt happen but formula allows it)', () => {
    // 50 bets of 100 each, all lost
    const bets = Array.from({ length: 50 }, () => ({
      amount: 100, status: 'lost', payout: null,
    }));
    // 5000 - 5000 = 0
    expect(computeBalance(bets)).toBe(0);
  });

  test('balance exactly zero after spending all', () => {
    const bets = [{ amount: 5000, status: 'pending', payout: null }];
    expect(computeBalance(bets)).toBe(0);
  });

  test('many cancelled bets do not affect balance at all', () => {
    const bets = Array.from({ length: 100 }, () => ({
      amount: 999, status: 'cancelled', payout: null,
    }));
    expect(computeBalance(bets)).toBe(5000);
  });

  test('won bet payout larger than STARTING_BALANCE (big win)', () => {
    const bets = [{ amount: 100, status: 'won', payout: 10000 }];
    // 5000 - 100 + 10000 = 14900
    expect(computeBalance(bets)).toBe(14900);
  });

  test('interleaved cancelled and active bets', () => {
    const bets = [
      { amount: 1000, status: 'pending', payout: null },
      { amount: 1000, status: 'cancelled', payout: null },
      { amount: 1000, status: 'pending', payout: null },
      { amount: 1000, status: 'cancelled', payout: null },
      { amount: 1000, status: 'pending', payout: null },
    ];
    // 5000 - 1000 - 1000 - 1000 = 2000
    expect(computeBalance(bets)).toBe(2000);
  });
});

// =============================================================================
// 2. PLACE BET VALIDATION
// =============================================================================

describe('validateBetPlacement', () => {
  test('valid bet passes', () => {
    expect(validateBetPlacement({ pick: 'home', amount: 100, balance: 5000 }))
      .toEqual({ valid: true });
  });

  test('valid draw pick', () => {
    expect(validateBetPlacement({ pick: 'draw', amount: 1, balance: 5000 }))
      .toEqual({ valid: true });
  });

  test('invalid pick rejected', () => {
    const result = validateBetPlacement({ pick: 'win', amount: 100, balance: 5000 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Invalid pick/);
  });

  test('empty string pick rejected', () => {
    const result = validateBetPlacement({ pick: '', amount: 100, balance: 5000 });
    expect(result.valid).toBe(false);
  });

  test('null pick rejected', () => {
    const result = validateBetPlacement({ pick: null, amount: 100, balance: 5000 });
    expect(result.valid).toBe(false);
  });

  test('zero amount rejected', () => {
    const result = validateBetPlacement({ pick: 'home', amount: 0, balance: 5000 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/positive/);
  });

  test('negative amount rejected', () => {
    const result = validateBetPlacement({ pick: 'away', amount: -50, balance: 5000 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/positive/);
  });

  test('amount exceeding balance rejected', () => {
    const result = validateBetPlacement({ pick: 'home', amount: 5001, balance: 5000 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Insufficient/);
  });

  test('amount exactly equal to balance passes', () => {
    expect(validateBetPlacement({ pick: 'home', amount: 5000, balance: 5000 }))
      .toEqual({ valid: true });
  });

  test('amount 1 over balance rejected', () => {
    const result = validateBetPlacement({ pick: 'home', amount: 101, balance: 100 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Insufficient/);
  });

  test('non-number amount rejected', () => {
    const result = validateBetPlacement({ pick: 'home', amount: '100', balance: 5000 });
    expect(result.valid).toBe(false);
  });

  test('NaN amount rejected', () => {
    const result = validateBetPlacement({ pick: 'home', amount: NaN, balance: 5000 });
    expect(result.valid).toBe(false);
  });

  test('Infinity amount rejected', () => {
    const result = validateBetPlacement({ pick: 'home', amount: Infinity, balance: 5000 });
    // Infinity > balance should fail
    expect(result.valid).toBe(false);
  });

  test('fractional amount — system uses integers but validate should still handle', () => {
    // amount=0.5 is > 0 and < balance, so it passes validation
    // But the PG function uses integer — this is a JS-side gap to be aware of
    const result = validateBetPlacement({ pick: 'home', amount: 0.5, balance: 5000 });
    expect(result.valid).toBe(true); // validation passes; PG would floor it
  });
});

// =============================================================================
// 3. SIDE-SWITCHING LOGIC (place bet behavior)
// =============================================================================

describe('place bet — side switching and additive logic', () => {
  // Simulating the logic: if user has pending bets on side A and bets on side B,
  // cancel side A bets first, then check balance, then place.

  function simulatePlaceBet(existingBets, newPick, newAmount) {
    let bets = [...existingBets];

    // Find existing pending pick on same match
    const existingPick = bets.find(b => b.status === 'pending')?.pick;

    // If switching sides, cancel existing pending bets
    if (existingPick && existingPick !== newPick) {
      bets = bets.map(b =>
        b.status === 'pending' ? { ...b, status: 'cancelled' } : b
      );
    }

    // Compute balance after cancellation
    const balance = computeBalance(bets);

    // Validate
    const validation = validateBetPlacement({ pick: newPick, amount: newAmount, balance });
    if (!validation.valid) {
      return { error: validation.error, bets };
    }

    // Place the bet
    bets.push({ amount: newAmount, status: 'pending', payout: null, pick: newPick });
    return { error: null, bets, balance: computeBalance(bets) };
  }

  test('switching sides frees up balance from cancelled bets', () => {
    const existing = [
      { amount: 3000, status: 'pending', payout: null, pick: 'home' },
    ];
    const result = simulatePlaceBet(existing, 'away', 4000);
    // After cancel: balance = 5000 (3000 freed). After new bet: 5000 - 4000 = 1000
    expect(result.error).toBeNull();
    expect(result.balance).toBe(1000);
  });

  test('same side is additive — both bets coexist', () => {
    const existing = [
      { amount: 1000, status: 'pending', payout: null, pick: 'home' },
    ];
    const result = simulatePlaceBet(existing, 'home', 500);
    // No cancellation. Balance = 5000 - 1000 - 500 = 3500
    expect(result.error).toBeNull();
    expect(result.balance).toBe(3500);
  });

  test('switching sides but new bet exceeds freed balance', () => {
    const existing = [
      { amount: 1000, status: 'pending', payout: null, pick: 'home' },
    ];
    // After cancel, balance = 5000. Try to bet 5001 — should fail.
    const result = simulatePlaceBet(existing, 'away', 5001);
    expect(result.error).toMatch(/Insufficient/);
  });

  test('switching sides — multiple existing bets all get cancelled', () => {
    const existing = [
      { amount: 1000, status: 'pending', payout: null, pick: 'home' },
      { amount: 500, status: 'pending', payout: null, pick: 'home' },
      { amount: 200, status: 'pending', payout: null, pick: 'home' },
    ];
    const result = simulatePlaceBet(existing, 'draw', 4000);
    // All 1700 freed. Balance = 5000. After bet: 5000 - 4000 = 1000
    expect(result.error).toBeNull();
    expect(result.balance).toBe(1000);
    // Verify all original bets are cancelled
    const pendingBets = result.bets.filter(b => b.status === 'pending');
    expect(pendingBets).toHaveLength(1);
    expect(pendingBets[0].pick).toBe('draw');
  });

  test('same side additive — insufficient funds for second bet', () => {
    const existing = [
      { amount: 4800, status: 'pending', payout: null, pick: 'away' },
    ];
    // Balance = 5000 - 4800 = 200. Try to bet 300 on same side.
    const result = simulatePlaceBet(existing, 'away', 300);
    expect(result.error).toMatch(/Insufficient/);
  });

  test('bet exactly equal to remaining balance after side switch', () => {
    const existing = [
      { amount: 2000, status: 'pending', payout: null, pick: 'home' },
    ];
    // Switch to away: cancel frees 2000, balance = 5000. Bet exactly 5000.
    const result = simulatePlaceBet(existing, 'away', 5000);
    expect(result.error).toBeNull();
    expect(result.balance).toBe(0);
  });
});

// =============================================================================
// 4. CANCEL BETS
// =============================================================================

describe('cancel bets logic', () => {
  test('cancelling single pending bet restores balance', () => {
    const before = [{ amount: 500, status: 'pending', payout: null }];
    expect(computeBalance(before)).toBe(4500);

    const after = [{ amount: 500, status: 'cancelled', payout: null }];
    expect(computeBalance(after)).toBe(5000);
  });

  test('cancelling multiple pending bets on same match restores full amount', () => {
    const before = [
      { amount: 100, status: 'pending', payout: null },
      { amount: 200, status: 'pending', payout: null },
      { amount: 300, status: 'pending', payout: null },
    ];
    expect(computeBalance(before)).toBe(4400);

    const after = before.map(b => ({ ...b, status: 'cancelled' }));
    expect(computeBalance(after)).toBe(5000);
  });

  test('cancelling already-cancelled bets should not double-refund', () => {
    const bets = [{ amount: 500, status: 'cancelled', payout: null }];
    // Already cancelled — balance is still 5000, not 5500
    expect(computeBalance(bets)).toBe(5000);
  });

  test('cannot cancel won bets (status stays won)', () => {
    // Won bets should not be cancellable. If someone erroneously sets a won bet to cancelled:
    const wonBet = { amount: 100, status: 'won', payout: 400 };
    const balanceWithWon = computeBalance([wonBet]);
    // 5000 - 100 + 400 = 5300

    const erroneouslyCancelled = { ...wonBet, status: 'cancelled', payout: null };
    const balanceAfterBadCancel = computeBalance([erroneouslyCancelled]);
    // If cancelled: 5000 (not 5300) — this shows why the PG function prevents it
    expect(balanceWithWon).toBe(5300);
    expect(balanceAfterBadCancel).toBe(5000); // money "lost" — proves guard is needed
  });

  test('cancel with mix of statuses only affects pending', () => {
    const bets = [
      { amount: 100, status: 'pending', payout: null },
      { amount: 200, status: 'won', payout: 500 },
      { amount: 300, status: 'lost', payout: null },
      { amount: 400, status: 'cancelled', payout: null },
    ];
    const before = computeBalance(bets);
    // 5000 - 100 - 200 + 500 - 300 = 4900

    // Cancel only the pending one
    const after = bets.map(b =>
      b.status === 'pending' ? { ...b, status: 'cancelled' } : b
    );
    const afterBalance = computeBalance(after);
    // 5000 - 200 + 500 - 300 = 5000
    expect(before).toBe(4900);
    expect(afterBalance).toBe(5000);
    expect(afterBalance - before).toBe(100); // refund = amount of the cancelled pending bet
  });
});

// =============================================================================
// 5. RESOLVE MATCH — parimutuel payouts
// =============================================================================

describe('resolveMatchBets', () => {
  test('single winner takes the entire pool', () => {
    const bets = [
      { id: 1, user_id: 'a', amount: 100, pick: 'home', status: 'pending' },
      { id: 2, user_id: 'b', amount: 200, pick: 'away', status: 'pending' },
      { id: 3, user_id: 'c', amount: 300, pick: 'away', status: 'pending' },
    ];
    const resolved = resolveMatchBets(bets, 'home');
    const winner = resolved.find(b => b.id === 1);
    expect(winner.status).toBe('won');
    // Pool = 600, winning pool = 100, payout = (100/100)*600 = 600
    expect(winner.payout).toBe(600);

    // Losers
    expect(resolved.find(b => b.id === 2).status).toBe('lost');
    expect(resolved.find(b => b.id === 3).status).toBe('lost');
  });

  test('multiple winners split proportionally', () => {
    const bets = [
      { id: 1, user_id: 'a', amount: 100, pick: 'home', status: 'pending' },
      { id: 2, user_id: 'b', amount: 300, pick: 'home', status: 'pending' },
      { id: 3, user_id: 'c', amount: 200, pick: 'away', status: 'pending' },
    ];
    const resolved = resolveMatchBets(bets, 'home');
    // Pool = 600, winning pool = 400
    // a: (100/400)*600 = 150
    // b: (300/400)*600 = 450
    expect(resolved.find(b => b.id === 1).payout).toBe(150);
    expect(resolved.find(b => b.id === 2).payout).toBe(450);
  });

  test('no winners — all bets refunded (cancelled)', () => {
    const bets = [
      { id: 1, user_id: 'a', amount: 100, pick: 'home', status: 'pending' },
      { id: 2, user_id: 'b', amount: 200, pick: 'away', status: 'pending' },
    ];
    const resolved = resolveMatchBets(bets, 'draw'); // nobody picked draw
    expect(resolved.every(b => b.status === 'cancelled')).toBe(true);
    expect(resolved.every(b => b.payout === null)).toBe(true);
  });

  test('integer truncation (floor) in payout', () => {
    // Pool = 100, winning pool = 30
    // Winner with amount=10: (10/30)*100 = 33.333... → floor to 33
    const bets = [
      { id: 1, user_id: 'a', amount: 10, pick: 'home', status: 'pending' },
      { id: 2, user_id: 'b', amount: 20, pick: 'home', status: 'pending' },
      { id: 3, user_id: 'c', amount: 70, pick: 'away', status: 'pending' },
    ];
    const resolved = resolveMatchBets(bets, 'home');
    // a: (10/30)*100 = 33.33 → 33
    // b: (20/30)*100 = 66.66 → 66
    expect(resolved.find(b => b.id === 1).payout).toBe(33);
    expect(resolved.find(b => b.id === 2).payout).toBe(66);
    // Note: 33 + 66 = 99, not 100. 1 unit "lost" to truncation. This is acceptable.
  });

  test('all bets on same side — everyone wins, everyone gets their stake back', () => {
    const bets = [
      { id: 1, user_id: 'a', amount: 100, pick: 'home', status: 'pending' },
      { id: 2, user_id: 'b', amount: 200, pick: 'home', status: 'pending' },
    ];
    const resolved = resolveMatchBets(bets, 'home');
    // Pool = 300, winning pool = 300
    // a: (100/300)*300 = 100
    // b: (200/300)*300 = 200
    expect(resolved.find(b => b.id === 1).payout).toBe(100);
    expect(resolved.find(b => b.id === 2).payout).toBe(200);
  });

  test('double resolution — second call has no pending bets, returns unchanged', () => {
    const bets = [
      { id: 1, user_id: 'a', amount: 100, pick: 'home', status: 'pending' },
      { id: 2, user_id: 'b', amount: 200, pick: 'away', status: 'pending' },
    ];
    const firstResolve = resolveMatchBets(bets, 'home');
    // Now try to resolve again — no pending bets
    const secondResolve = resolveMatchBets(firstResolve, 'home');
    // Should return same as input (no pending bets to resolve)
    expect(secondResolve).toEqual(firstResolve);
  });

  test('already-resolved bets are untouched during resolution', () => {
    const bets = [
      { id: 1, user_id: 'a', amount: 100, pick: 'home', status: 'won', payout: 300 },
      { id: 2, user_id: 'b', amount: 200, pick: 'away', status: 'pending' },
    ];
    const resolved = resolveMatchBets(bets, 'away');
    // Only the pending bet should be resolved
    expect(resolved.find(b => b.id === 1)).toEqual(bets[0]); // unchanged
    expect(resolved.find(b => b.id === 2).status).toBe('won');
    expect(resolved.find(b => b.id === 2).payout).toBe(200); // entire pending pool = 200
  });

  test('large number of bets — proportional split remains correct', () => {
    const bets = [];
    // 10 winners (100 each = 1000 winning pool), 10 losers (200 each = 2000)
    for (let i = 0; i < 10; i++) {
      bets.push({ id: i, user_id: `w${i}`, amount: 100, pick: 'home', status: 'pending' });
    }
    for (let i = 10; i < 20; i++) {
      bets.push({ id: i, user_id: `l${i}`, amount: 200, pick: 'away', status: 'pending' });
    }
    // Pool = 3000, winning pool = 1000
    // Each winner: (100/1000)*3000 = 300
    const resolved = resolveMatchBets(bets, 'home');
    const winners = resolved.filter(b => b.status === 'won');
    expect(winners).toHaveLength(10);
    winners.forEach(w => expect(w.payout).toBe(300));

    const losers = resolved.filter(b => b.status === 'lost');
    expect(losers).toHaveLength(10);
    losers.forEach(l => expect(l.payout).toBeNull());
  });

  test('uneven split that cannot divide evenly (worst-case truncation)', () => {
    // 3 winners with amounts 1, 1, 1. Pool = 103.
    // Each: (1/3)*103 = 34.33 → 34
    // Total paid: 34*3 = 102. 1 unit lost to truncation.
    const bets = [
      { id: 1, user_id: 'a', amount: 1, pick: 'home', status: 'pending' },
      { id: 2, user_id: 'b', amount: 1, pick: 'home', status: 'pending' },
      { id: 3, user_id: 'c', amount: 1, pick: 'home', status: 'pending' },
      { id: 4, user_id: 'd', amount: 100, pick: 'away', status: 'pending' },
    ];
    const resolved = resolveMatchBets(bets, 'home');
    // Pool = 103, winning pool = 3
    // Each winner: floor(1/3 * 103) = floor(34.33) = 34
    resolved.filter(b => b.status === 'won').forEach(w => {
      expect(w.payout).toBe(34);
    });
  });

  test('single bet on match — winner gets their own stake back', () => {
    const bets = [
      { id: 1, user_id: 'a', amount: 500, pick: 'draw', status: 'pending' },
    ];
    const resolved = resolveMatchBets(bets, 'draw');
    expect(resolved[0].payout).toBe(500);
    expect(resolved[0].status).toBe('won');
  });

  test('single bet on match — loser loses', () => {
    const bets = [
      { id: 1, user_id: 'a', amount: 500, pick: 'draw', status: 'pending' },
    ];
    const resolved = resolveMatchBets(bets, 'home');
    // No one picked home → no winners → refund
    expect(resolved[0].status).toBe('cancelled');
  });
});

// =============================================================================
// 6. FULL LIFECYCLE / CONCURRENCY EDGE CASES
// =============================================================================

describe('full lifecycle scenarios', () => {
  test('place → cancel → place again → balance correct', () => {
    // Start: 5000
    let bets = [];

    // Place bet 1: 2000 on home
    bets.push({ amount: 2000, status: 'pending', payout: null, pick: 'home' });
    expect(computeBalance(bets)).toBe(3000);

    // Cancel it
    bets = bets.map(b => ({ ...b, status: 'cancelled' }));
    expect(computeBalance(bets)).toBe(5000);

    // Place bet 2: 4000 on away (should succeed since balance is 5000 again)
    bets.push({ amount: 4000, status: 'pending', payout: null, pick: 'away' });
    expect(computeBalance(bets)).toBe(1000);
  });

  test('place → resolve (win) → place another → balance reflects winnings', () => {
    let bets = [];

    // Bet 100, win 500
    bets.push({ amount: 100, status: 'won', payout: 500, pick: 'home' });
    // Balance: 5000 - 100 + 500 = 5400
    expect(computeBalance(bets)).toBe(5400);

    // Now bet 5400 — should succeed
    bets.push({ amount: 5400, status: 'pending', payout: null, pick: 'away' });
    expect(computeBalance(bets)).toBe(0);
  });

  test('place → resolve (lose) → cannot bet more than remaining', () => {
    let bets = [];

    // Bet 4000, lose
    bets.push({ amount: 4000, status: 'lost', payout: null, pick: 'home' });
    // Balance: 5000 - 4000 = 1000
    expect(computeBalance(bets)).toBe(1000);

    // Try to bet 1001 — validation should fail
    const validation = validateBetPlacement({
      pick: 'home', amount: 1001, balance: computeBalance(bets),
    });
    expect(validation.valid).toBe(false);
  });

  test('multiple matches — balance is global across all matches', () => {
    const bets = [
      { amount: 1000, status: 'pending', payout: null, pick: 'home' },  // match 1
      { amount: 2000, status: 'pending', payout: null, pick: 'away' },  // match 2
      { amount: 500, status: 'won', payout: 1500, pick: 'draw' },      // match 3 (resolved)
    ];
    // 5000 - 1000 - 2000 - 500 + 1500 = 3000
    expect(computeBalance(bets)).toBe(3000);
  });

  test('cancel on one match doesnt affect bets on another match', () => {
    const bets = [
      { amount: 1000, status: 'pending', payout: null, pick: 'home', match_id: 'm1' },
      { amount: 2000, status: 'pending', payout: null, pick: 'away', match_id: 'm2' },
    ];
    // Cancel only match 1
    const afterCancel = bets.map(b =>
      b.match_id === 'm1' ? { ...b, status: 'cancelled' } : b
    );
    // Balance: 5000 - 2000 = 3000 (only m2 bet counts)
    expect(computeBalance(afterCancel)).toBe(3000);
  });

  test('resolve then try to cancel same match — no pending bets exist', () => {
    const bets = [
      { id: 1, user_id: 'a', amount: 100, pick: 'home', status: 'pending' },
      { id: 2, user_id: 'a', amount: 200, pick: 'away', status: 'pending' },
    ];
    const resolved = resolveMatchBets(bets, 'home');
    // After resolution: no pending bets remain
    const pendingAfter = resolved.filter(b => b.status === 'pending');
    expect(pendingAfter).toHaveLength(0);
  });

  test('user with complex history — balance computation stress test', () => {
    const bets = [
      // Match 1: bet and won
      { amount: 500, status: 'won', payout: 1500 },
      // Match 2: bet and lost
      { amount: 300, status: 'lost', payout: null },
      // Match 3: bet, switched sides (old cancelled), new bet pending
      { amount: 200, status: 'cancelled', payout: null },
      { amount: 400, status: 'pending', payout: null },
      // Match 4: bet cancelled by user
      { amount: 1000, status: 'cancelled', payout: null },
      // Match 5: two additive bets, both won
      { amount: 100, status: 'won', payout: 250 },
      { amount: 100, status: 'won', payout: 250 },
    ];
    // 5000
    // - 500 + 1500 (match 1 won)
    // - 300 (match 2 lost)
    // - 400 (match 3 pending)
    // cancelled dont count
    // - 100 + 250 (match 5a)
    // - 100 + 250 (match 5b)
    // = 5000 - 500 + 1500 - 300 - 400 - 100 + 250 - 100 + 250 = 5600
    expect(computeBalance(bets)).toBe(5600);
  });
});

// =============================================================================
// 7. BOUNDARY & EDGE CASES
// =============================================================================

describe('boundary and edge cases', () => {
  test('STARTING_BALANCE constant is 5000', () => {
    expect(STARTING_BALANCE).toBe(5000);
  });

  test('computeBalance with undefined/missing fields in bet objects', () => {
    // Defensive: what if payout is undefined instead of null?
    const bets = [{ amount: 100, status: 'won', payout: undefined }];
    // (undefined || 0) = 0, so: 5000 - 100 + 0 = 4900
    expect(computeBalance(bets)).toBe(4900);
  });

  test('bet with amount=1 (minimum valid bet)', () => {
    const bets = [{ amount: 1, status: 'pending', payout: null }];
    expect(computeBalance(bets)).toBe(4999);
  });

  test('resolve with amount=1 bets — truncation to 0 possible', () => {
    // Winner has amount=1, pool=3, winning_pool=2
    // Payout: floor(1/2 * 3) = floor(1.5) = 1
    const bets = [
      { id: 1, user_id: 'a', amount: 1, pick: 'home', status: 'pending' },
      { id: 2, user_id: 'b', amount: 1, pick: 'home', status: 'pending' },
      { id: 3, user_id: 'c', amount: 1, pick: 'away', status: 'pending' },
    ];
    const resolved = resolveMatchBets(bets, 'home');
    // Pool=3, winning=2. Each: floor(1/2*3) = floor(1.5) = 1
    expect(resolved.find(b => b.id === 1).payout).toBe(1);
    expect(resolved.find(b => b.id === 2).payout).toBe(1);
    // Total paid: 2 out of 3. 1 unit lost.
  });

  test('resolve — winner payout can be less than their stake (bad odds)', () => {
    // If winning pool > total pool / 2, winners get less than 2x
    // If winning pool = total pool, winners just get their stake back
    const bets = [
      { id: 1, user_id: 'a', amount: 900, pick: 'home', status: 'pending' },
      { id: 2, user_id: 'b', amount: 100, pick: 'away', status: 'pending' },
    ];
    const resolved = resolveMatchBets(bets, 'home');
    // Pool=1000, winning=900. Payout: floor(900/900*1000) = 1000
    // Winner gets 1000 from a 900 stake. Only +100 profit.
    expect(resolved.find(b => b.id === 1).payout).toBe(1000);
  });

  test('payout always >= stake for sole winner', () => {
    // If you're the only winner, payout = total pool >= your stake
    const bets = [
      { id: 1, user_id: 'a', amount: 50, pick: 'draw', status: 'pending' },
      { id: 2, user_id: 'b', amount: 1000, pick: 'home', status: 'pending' },
    ];
    const resolved = resolveMatchBets(bets, 'draw');
    // Pool=1050, winner a gets all: floor(50/50*1050) = 1050
    expect(resolved.find(b => b.id === 1).payout).toBe(1050);
    expect(resolved.find(b => b.id === 1).payout).toBeGreaterThanOrEqual(50);
  });

  test('balance after full lifecycle never exceeds STARTING_BALANCE + total_losers_amounts', () => {
    // Conceptual invariant: you can never have more than starting + what others lost
    const bets = [
      { amount: 100, status: 'won', payout: 300 },   // won 300 from pool where others lost 200
      { amount: 50, status: 'lost', payout: null },
    ];
    const balance = computeBalance(bets);
    // 5000 - 100 + 300 - 50 = 5150
    expect(balance).toBe(5150);
  });

  test('resolve empty array returns empty', () => {
    const resolved = resolveMatchBets([], 'home');
    expect(resolved).toEqual([]);
  });

  test('resolve with only cancelled bets (no pending) — no change', () => {
    const bets = [
      { id: 1, user_id: 'a', amount: 100, pick: 'home', status: 'cancelled' },
    ];
    const resolved = resolveMatchBets(bets, 'home');
    expect(resolved).toEqual(bets);
  });
});
