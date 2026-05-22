import supabase from '@/lib/supabase';

export async function placeBet(userId, matchId, pick, amount) {
  if (!supabase) throw new Error('Database not configured');
  const { data, error } = await supabase.rpc('place_bet', {
    p_user_id: userId,
    p_match_id: matchId,
    p_pick: pick,
    p_amount: amount,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function getMyBets(userId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getBetsForMatch(matchId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .eq('match_id', matchId);
  if (error) throw new Error(error.message);
  return data;
}

export async function getPoolForMatch(matchId) {
  const bets = await getBetsForMatch(matchId);
  const total = bets.reduce((s, b) => s + b.amount, 0);
  const bettorCount = new Set(bets.map(b => b.user_id)).size;
  const bySide = { home: 0, away: 0, draw: 0 };
  bets.forEach(b => { bySide[b.pick] = (bySide[b.pick] || 0) + b.amount; });
  return { total, bettorCount, bySide };
}

export async function getBalance(userId) {
  if (!supabase) return 5000;
  const { data, error } = await supabase
    .from('profiles')
    .select('balance')
    .eq('id', userId)
    .single();
  if (error) throw new Error(error.message);
  return data.balance;
}

export async function getLeaderboard() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, balance')
    .order('balance', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getActivity(limit = 20) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('activity')
    .select('*, profiles(username, display_name)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data;
}
