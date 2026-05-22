'use client';

import { MATCHES, FRIENDS, ME_ID } from '@/lib/data';
import { STARTING_BALANCE } from '@/lib/currency';

const STORAGE_KEY = 'adeyaar_bets';
const SEEDED_KEY = 'adeyaar_seeded';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function readStore() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStore(bets) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bets));
}

// Seed random friend bets on first load for demo purposes
function seedFriendBets() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(SEEDED_KEY)) return;

  const friends = FRIENDS.filter(f => f.id !== ME_ID);
  const matchIds = MATCHES.slice(0, 12).map(m => m.id);
  const picks = ['home', 'away', 'draw'];
  const amounts = [100, 200, 250, 300, 500, 750, 1000];
  const seededBets = [];

  // Generate 12-15 random bets from friends
  const count = 12 + Math.floor(Math.random() * 4);
  for (let i = 0; i < count; i++) {
    const friend = friends[Math.floor(Math.random() * friends.length)];
    const matchId = matchIds[Math.floor(Math.random() * matchIds.length)];
    const pick = picks[Math.floor(Math.random() * picks.length)];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    const hoursAgo = Math.floor(Math.random() * 48);

    seededBets.push({
      id: generateId() + i,
      userId: friend.id,
      matchId,
      pick,
      amount,
      oddsAt: null,
      status: 'pending',
      createdAt: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
    });
  }

  const existing = readStore();
  writeStore([...existing, ...seededBets]);
  localStorage.setItem(SEEDED_KEY, 'true');
}

export function initBetStore() {
  seedFriendBets();
}

export function getBets() {
  return readStore();
}

export function getMyBets() {
  return readStore().filter(b => b.userId === ME_ID);
}

export function getBetsForMatch(matchId) {
  return readStore().filter(b => b.matchId === matchId);
}

export function getPoolForMatch(matchId) {
  const bets = getBetsForMatch(matchId);
  const total = bets.reduce((s, b) => s + b.amount, 0);
  const bettorCount = new Set(bets.map(b => b.userId)).size;
  const bySide = { home: 0, away: 0, draw: 0 };
  bets.forEach(b => { bySide[b.pick] = (bySide[b.pick] || 0) + b.amount; });
  return { total, bettorCount, bySide };
}

export function placeBet(matchId, pick, amount) {
  // Validate
  if (!amount || amount <= 0) throw new Error('Amount must be positive');
  if (!['home', 'away', 'draw'].includes(pick)) throw new Error('Invalid pick');

  const match = MATCHES.find(m => m.id === matchId);
  if (!match) throw new Error('Match not found');
  if (match.status === 'finished') throw new Error('Match already finished');

  const currentBalance = getBalance();
  if (amount > currentBalance) throw new Error('Insufficient balance');

  const bet = {
    id: generateId(),
    userId: ME_ID,
    matchId,
    pick,
    amount,
    oddsAt: null,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  // Re-read store and re-check balance to guard against race conditions
  // (e.g., React StrictMode double-renders or rapid sequential calls)
  const bets = readStore();
  const pendingTotal = bets
    .filter(b => b.userId === ME_ID && b.status === 'pending')
    .reduce((s, b) => s + b.amount, 0);
  const wonPayouts = bets
    .filter(b => b.userId === ME_ID && b.status === 'won')
    .reduce((s, b) => s + (b.payout || 0), 0);
  const freshBalance = STARTING_BALANCE - pendingTotal + wonPayouts;
  if (amount > freshBalance) throw new Error('Insufficient balance');

  writeStore([...bets, bet]);
  return bet;
}

export function getBalance() {
  const myBets = getMyBets();
  const pending = myBets
    .filter(b => b.status === 'pending')
    .reduce((s, b) => s + b.amount, 0);
  const wonPayouts = myBets
    .filter(b => b.status === 'won')
    .reduce((s, b) => s + (b.payout || 0), 0);
  return STARTING_BALANCE - pending + wonPayouts;
}

// Simple deterministic hash for stable "random" bonuses per friend+period
function stableHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getFriendBalances(period) {
  const allBets = readStore();
  const now = new Date();

  let relevantBets = allBets;
  if (period === 'today') {
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    relevantBets = allBets.filter(b => b.createdAt >= todayStart);
  } else if (period === 'week') {
    const weekAgo = new Date(now - 7 * 86400000).toISOString();
    relevantBets = allBets.filter(b => b.createdAt >= weekAgo);
  }

  // For demo: compute balances based on pending bets as "exposure"
  // Friends who bet more have lower available balance (simulating activity)
  const balances = {};
  FRIENDS.forEach(f => {
    const friendBets = relevantBets.filter(b => b.userId === f.id);
    const totalStaked = friendBets.reduce((s, b) => s + b.amount, 0);
    const wonPayouts = friendBets
      .filter(b => b.status === 'won')
      .reduce((s, b) => s + (b.payout || 0), 0);
    // For demo: deterministic variance so leaderboard is stable across re-renders
    const bonus = f.id === ME_ID ? 0 : stableHash(f.id + ':' + (period || 'alltime')) % 500;
    balances[f.id] = STARTING_BALANCE - totalStaked + wonPayouts + bonus;
  });

  // Override my own balance with real calculation
  balances[ME_ID] = getBalance();
  return balances;
}
