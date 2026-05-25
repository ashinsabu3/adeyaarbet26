import { computeNetPositions, computeSettlement } from '@/lib/settlement';

// balance IS the net position — no starting balance concept
function prof(id, name, net) {
  return { id, display_name: name, username: id, balance: net };
}

// =============================================================================
// 1. computeNetPositions
// =============================================================================

describe('computeNetPositions', () => {
  test('empty list returns empty', () => {
    expect(computeNetPositions([])).toEqual([]);
  });

  test('user with balance 0 has net 0', () => {
    expect(computeNetPositions([prof('a', 'Alice', 0)])[0].net).toBe(0);
  });

  test('user with positive balance has positive net', () => {
    expect(computeNetPositions([prof('a', 'Alice', 500)])[0].net).toBe(500);
  });

  test('user with negative balance has negative net', () => {
    expect(computeNetPositions([prof('b', 'Bob', -300)])[0].net).toBe(-300);
  });

  test('prefers display_name over username', () => {
    const profile = { id: 'x', display_name: 'Xavier', username: 'xuser', balance: 0 };
    expect(computeNetPositions([profile])[0].name).toBe('Xavier');
  });

  test('falls back to username when display_name is absent', () => {
    const profile = { id: 'x', display_name: null, username: 'xuser', balance: 0 };
    expect(computeNetPositions([profile])[0].name).toBe('xuser');
  });

  test('preserves id field', () => {
    expect(computeNetPositions([prof('uid-123', 'Alice', 0)])[0].id).toBe('uid-123');
  });

  test('8-person group — all nets computed correctly', () => {
    const group = [
      prof('a', 'Alice',  1000),
      prof('b', 'Bob',    -500),
      prof('c', 'Carol',   200),
      prof('d', 'Dave',   -300),
      prof('e', 'Eve',     400),
      prof('f', 'Frank',  -800),
      prof('g', 'Grace',   100),
      prof('h', 'Hank',   -100),
    ];
    expect(computeNetPositions(group).map(r => r.net))
      .toEqual([1000, -500, 200, -300, 400, -800, 100, -100]);
  });

  test('does not mutate input profiles', () => {
    const profiles = [prof('a', 'Alice', 500)];
    const orig = profiles[0].balance;
    computeNetPositions(profiles);
    expect(profiles[0].balance).toBe(orig);
  });
});

// =============================================================================
// 2. Zero-sum invariant
// =============================================================================

describe('computeSettlement — zero-sum invariant', () => {
  test('in a parimutuel pool all nets sum to 0', () => {
    const group = [prof('a', 'Alice', 500), prof('b', 'Bob', -300), prof('c', 'Carol', -200)];
    const netSum = group.reduce((s, p) => s + p.balance, 0);
    expect(netSum).toBe(0);

    const txs = computeSettlement(group);
    const totalPaid = txs.reduce((s, t) => s + t.amount, 0);
    const totalReceived = txs.reduce((s, t) => s + t.amount, 0);
    expect(totalPaid).toBe(totalReceived);
  });
});

// =============================================================================
// 3. Basic cases
// =============================================================================

describe('computeSettlement — basic cases', () => {
  test('all at 0 — no transactions', () => {
    expect(computeSettlement([prof('a', 'A', 0), prof('b', 'B', 0), prof('c', 'C', 0)])).toHaveLength(0);
  });

  test('empty group — no transactions', () => {
    expect(computeSettlement([])).toHaveLength(0);
  });

  test('single person at zero — no transactions', () => {
    expect(computeSettlement([prof('a', 'Alice', 0)])).toHaveLength(0);
  });

  test('single creditor, single debtor — one transaction', () => {
    const txs = computeSettlement([prof('a', 'Alice', 500), prof('b', 'Bob', -500)]);
    expect(txs).toHaveLength(1);
    expect(txs[0].from.name).toBe('Bob');
    expect(txs[0].to.name).toBe('Alice');
    expect(txs[0].amount).toBe(500);
  });

  test('direction always debtor → creditor', () => {
    const txs = computeSettlement([prof('w', 'Winner', 200), prof('l', 'Loser', -200)]);
    expect(txs[0].from.id).toBe('l');
    expect(txs[0].to.id).toBe('w');
  });

  test('all transaction amounts are positive', () => {
    const txs = computeSettlement([prof('a', 'A', 1000), prof('b', 'B', -600), prof('c', 'C', -400)]);
    txs.forEach(tx => expect(tx.amount).toBeGreaterThan(0));
  });

  test('from/to objects include id and name', () => {
    const txs = computeSettlement([prof('uid-a', 'Alice', 300), prof('uid-b', 'Bob', -300)]);
    expect(txs[0].from).toEqual({ id: 'uid-b', name: 'Bob' });
    expect(txs[0].to).toEqual({ id: 'uid-a', name: 'Alice' });
  });
});

// =============================================================================
// 4. One creditor, multiple debtors
// =============================================================================

describe('computeSettlement — one creditor, multiple debtors', () => {
  test('one winner, two losers — two transactions', () => {
    const group = [prof('a', 'Alice', 700), prof('b', 'Bob', -300), prof('c', 'Carol', -400)];
    const txs = computeSettlement(group);
    expect(txs).toHaveLength(2);
    expect(txs.reduce((s, t) => s + t.amount, 0)).toBe(700);
  });

  test('all transactions go to single creditor', () => {
    const group = [prof('a', 'Alice', 900), prof('b', 'Bob', -400), prof('c', 'Carol', -500)];
    computeSettlement(group).forEach(tx => expect(tx.to.id).toBe('a'));
  });

  test('amounts match each debtor exactly', () => {
    const group = [prof('a', 'Alice', 700), prof('b', 'Bob', -300), prof('c', 'Carol', -400)];
    const txs = computeSettlement(group);
    expect(txs.find(t => t.from.id === 'b').amount).toBe(300);
    expect(txs.find(t => t.from.id === 'c').amount).toBe(400);
  });
});

// =============================================================================
// 5. Multiple creditors, one debtor
// =============================================================================

describe('computeSettlement — multiple creditors, one debtor', () => {
  test('one big loser pays multiple winners', () => {
    const group = [prof('a', 'Alice', 300), prof('b', 'Bob', 200), prof('c', 'Carol', -500)];
    const txs = computeSettlement(group);
    expect(txs).toHaveLength(2);
    txs.forEach(tx => expect(tx.from.id).toBe('c'));
    expect(txs.reduce((s, t) => s + t.amount, 0)).toBe(500);
  });
});

// =============================================================================
// 6. General multi-person
// =============================================================================

describe('computeSettlement — general multi-person', () => {
  test('2 creditors, 2 debtors — all debts settled', () => {
    const group = [prof('a', 'A', 500), prof('b', 'B', 300), prof('c', 'C', -400), prof('d', 'D', -400)];
    const txs = computeSettlement(group);
    const paid = {};
    txs.forEach(tx => { paid[tx.to.id] = (paid[tx.to.id] || 0) + tx.amount; });
    expect(paid['a']).toBe(500);
    expect(paid['b']).toBe(300);
  });

  test('full 8-person World Cup group', () => {
    const group = [
      prof('a', 'Arjun',  1200),
      prof('b', 'Bhanu',   400),
      prof('c', 'Chai',   -200),
      prof('d', 'Dev',    -300),
      prof('e', 'Eshaan', -100),
      prof('f', 'Fahad',  -500),
      prof('g', 'Gavin',  -300),
      prof('h', 'Harsh',  -200),
    ];
    expect(group.reduce((s, p) => s + p.balance, 0)).toBe(0); // zero-sum

    const txs = computeSettlement(group);
    const received = {}, paid = {};
    txs.forEach(tx => {
      received[tx.to.id]   = (received[tx.to.id]   || 0) + tx.amount;
      paid[tx.from.id]     = (paid[tx.from.id]     || 0) + tx.amount;
    });
    expect(received['a']).toBe(1200);
    expect(received['b']).toBe(400);
    expect(paid['c']).toBe(200);
    expect(paid['d']).toBe(300);
    expect(paid['e']).toBe(100);
    expect(paid['f']).toBe(500);
    expect(paid['g']).toBe(300);
    expect(paid['h']).toBe(200);
  });

  test('one person owes everyone — n-1 transactions', () => {
    const group = [prof('a', 'A', 200), prof('b', 'B', 300), prof('c', 'C', 100), prof('d', 'D', -600)];
    const txs = computeSettlement(group);
    expect(txs).toHaveLength(3);
    txs.forEach(tx => expect(tx.from.id).toBe('d'));
    expect(txs.reduce((s, t) => s + t.amount, 0)).toBe(600);
  });

  test('one person is owed by everyone — n-1 transactions', () => {
    const group = [prof('a', 'A', 600), prof('b', 'B', -200), prof('c', 'C', -200), prof('d', 'D', -200)];
    const txs = computeSettlement(group);
    expect(txs).toHaveLength(3);
    txs.forEach(tx => expect(tx.to.id).toBe('a'));
    expect(txs.reduce((s, t) => s + t.amount, 0)).toBe(600);
  });

  test('exact pair matches — 2 transactions for 2 matching pairs', () => {
    const group = [prof('a', 'A', 300), prof('b', 'B', 200), prof('c', 'C', -300), prof('d', 'D', -200)];
    const txs = computeSettlement(group);
    expect(txs).toHaveLength(2);
  });
});

// =============================================================================
// 7. Correctness: applying transactions zeroes all nets
// =============================================================================

describe('computeSettlement — correctness: applying transactions zeroes nets', () => {
  function applyAndVerify(group) {
    const txs = computeSettlement(group);
    const net = {};
    group.forEach(p => { net[p.id] = p.balance; });
    txs.forEach(tx => {
      net[tx.from.id] += tx.amount;
      net[tx.to.id]   -= tx.amount;
    });
    return Object.values(net).every(n => n === 0);
  }

  test('2 players',       () => expect(applyAndVerify([prof('a', 'A',  400), prof('b', 'B', -400)])).toBe(true));
  test('3 players',       () => expect(applyAndVerify([prof('a', 'A',  700), prof('b', 'B', -300), prof('c', 'C', -400)])).toBe(true));
  test('4 players asymmetric', () => expect(applyAndVerify([
    prof('a', 'A',  1000), prof('b', 'B', -200), prof('c', 'C', -300), prof('d', 'D', -500),
  ])).toBe(true));
  test('5 players', () => expect(applyAndVerify([
    prof('a', 'A',  500), prof('b', 'B',  300), prof('c', 'C', -100), prof('d', 'D', -400), prof('e', 'E', -300),
  ])).toBe(true));
  test('8 players full group', () => expect(applyAndVerify([
    prof('a', 'A',  800), prof('b', 'B',  600), prof('c', 'C',  200),
    prof('d', 'D', -300), prof('e', 'E', -400), prof('f', 'F', -200),
    prof('g', 'G', -500), prof('h', 'H', -200),
  ])).toBe(true));
});

// =============================================================================
// 8. Edge cases
// =============================================================================

describe('computeSettlement — edge cases', () => {
  test('single person with positive net — no creditor pair, no crash', () => {
    const txs = computeSettlement([prof('a', 'A', 100)]);
    expect(Array.isArray(txs)).toBe(true);
  });

  test('single person with negative net — no crash', () => {
    const txs = computeSettlement([prof('a', 'A', -100)]);
    expect(Array.isArray(txs)).toBe(true);
  });

  test('does not mutate input profiles', () => {
    const group = [prof('a', 'A', 300), prof('b', 'B', -300)];
    const orig = group[0].balance;
    computeSettlement(group);
    expect(group[0].balance).toBe(orig);
  });

  test('people at exactly 0 are excluded from transactions', () => {
    const group = [prof('a', 'A', 0), prof('b', 'B', 200), prof('c', 'C', -200)];
    const txs = computeSettlement(group);
    const ids = new Set(txs.flatMap(tx => [tx.from.id, tx.to.id]));
    expect(ids.has('a')).toBe(false);
  });

  test('smallest possible debt (1) — one transaction', () => {
    const txs = computeSettlement([prof('a', 'A', 1), prof('b', 'B', -1)]);
    expect(txs).toHaveLength(1);
    expect(txs[0].amount).toBe(1);
  });

  test('very large amounts — no overflow', () => {
    const txs = computeSettlement([prof('a', 'A', 100000), prof('b', 'B', -100000)]);
    expect(txs[0].amount).toBe(100000);
  });

  test('deterministic for same input', () => {
    const group = [prof('a', 'A', 500), prof('b', 'B', 300), prof('c', 'C', -400), prof('d', 'D', -400)];
    expect(computeSettlement(group)).toEqual(computeSettlement(group));
  });

  test('returns objects with expected shape', () => {
    const txs = computeSettlement([prof('a', 'A', 100), prof('b', 'B', -100)]);
    expect(txs[0]).toMatchObject({
      from:   { id: expect.any(String), name: expect.any(String) },
      to:     { id: expect.any(String), name: expect.any(String) },
      amount: expect.any(Number),
    });
  });
});

// =============================================================================
// 9. World Cup end-of-tournament scenario
// =============================================================================

describe('World Cup end-of-tournament scenario', () => {
  test('final standings — settlements zero all debts', () => {
    const finalStandings = [
      { id: 'jay', display_name: 'Jayesh',  username: 'jay', balance:  1200 },
      { id: 'arj', display_name: 'Arjun',   username: 'arj', balance:   800 },
      { id: 'moh', display_name: 'Mohan',   username: 'moh', balance:   500 },
      { id: 'raj', display_name: 'Raj',     username: 'raj', balance:  -400 },
      { id: 'dev', display_name: 'Dev',     username: 'dev', balance:  -500 },
      { id: 'sam', display_name: 'Sam',     username: 'sam', balance:  -600 },
      { id: 'vik', display_name: 'Vikram',  username: 'vik', balance:  -500 },
      { id: 'adi', display_name: 'Aditya',  username: 'adi', balance:  -500 },
    ];
    expect(finalStandings.reduce((s, p) => s + p.balance, 0)).toBe(0);

    const txs = computeSettlement(finalStandings);
    const net = {};
    finalStandings.forEach(p => { net[p.id] = p.balance; });
    txs.forEach(tx => {
      net[tx.from.id] += tx.amount;
      net[tx.to.id]   -= tx.amount;
    });
    Object.values(net).forEach(n => expect(n).toBe(0));
  });

  test('mid-tournament with pending bets — system still settles current state', () => {
    // Pending bets reduce net (money locked in bets)
    const mid = [prof('a', 'A', 300), prof('b', 'B', -100), prof('c', 'C', -200)];
    const txs = computeSettlement(mid);
    expect(txs.reduce((s, t) => s + t.amount, 0)).toBe(300);
  });
});
