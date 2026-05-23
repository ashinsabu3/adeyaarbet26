import { STARTING_BALANCE } from './currency';

/**
 * Compute a user's balance from their bet history.
 * This is the canonical JS implementation of the ledger formula:
 *   balance = STARTING_BALANCE - SUM(amount WHERE status != 'cancelled') + SUM(payout WHERE status = 'won')
 *
 * @param {Array<{amount: number, status: string, payout: number|null}>} bets
 * @returns {number}
 */
export function computeBalance(bets) {
  let balance = STARTING_BALANCE;
  for (const b of bets) {
    if (b.status !== 'cancelled') balance -= b.amount;
    if (b.status === 'won') balance += (b.payout || 0);
  }
  return balance;
}

/**
 * Determine the parimutuel payout for each bet given a winning side.
 * Returns a new array of bets with status and payout resolved.
 *
 * @param {Array<{id: any, user_id: string, amount: number, pick: string, status: string}>} bets - all pending bets on this match
 * @param {string} winner - 'home' | 'away' | 'draw'
 * @returns {Array<{id: any, user_id: string, amount: number, pick: string, status: string, payout: number|null}>}
 */
export function resolveMatchBets(bets, winner) {
  const pendingBets = bets.filter(b => b.status === 'pending');
  const totalPool = pendingBets.reduce((sum, b) => sum + b.amount, 0);
  const winningPool = pendingBets
    .filter(b => b.pick === winner)
    .reduce((sum, b) => sum + b.amount, 0);

  if (totalPool === 0) {
    return bets; // nothing to resolve
  }

  // No winners: refund everyone
  if (winningPool === 0) {
    return bets.map(b =>
      b.status === 'pending'
        ? { ...b, status: 'cancelled', payout: null }
        : b
    );
  }

  return bets.map(b => {
    if (b.status !== 'pending') return b;
    if (b.pick === winner) {
      // Floor integer payout (matches PG ::integer cast)
      const payout = Math.floor((b.amount / winningPool) * totalPool);
      return { ...b, status: 'won', payout };
    }
    return { ...b, status: 'lost', payout: null };
  });
}

/**
 * Validate a bet placement request.
 * Returns { valid: true } or { valid: false, error: string }
 */
export function validateBetPlacement({ pick, amount, balance }) {
  if (!['home', 'away', 'draw'].includes(pick)) {
    return { valid: false, error: 'Invalid pick' };
  }
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return { valid: false, error: 'Amount must be positive' };
  }
  if (amount > balance) {
    return { valid: false, error: 'Insufficient balance' };
  }
  return { valid: true };
}
