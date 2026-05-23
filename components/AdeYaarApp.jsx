'use client';

import { useState, useEffect, useCallback } from 'react';
import { MATCHES, getMatch, getTeam } from '@/lib/data';
import { STARTING_BALANCE, fmtMoney } from '@/lib/currency';
import { useUser } from '@/lib/hooks';
import { AppHeader, TabBar, PlaceBetSheet, Toast } from '@/components';
import HomeScreen from '@/components/screens/HomeScreen';
import MatchesScreen from '@/components/screens/MatchesScreen';
import BracketScreen from '@/components/screens/BracketScreen';
import LeaderboardScreen from '@/components/screens/LeaderboardScreen';
import BetsScreen from '@/components/screens/BetsScreen';
import DesktopApp from '@/components/desktop/DesktopApp';

function getFifaStatus(fifa) {
  if (fifa.HomeTeamScore != null && fifa.AwayTeamScore != null) return 'finished';
  if (fifa.MatchStatus === 3) return 'live';
  return 'upcoming';
}

function mergeWithFifa(staticMatch, fifaResults) {
  if (!fifaResults?.length) return { ...staticMatch, status: 'upcoming' };
  const fifa = fifaResults.find(m =>
    m.Home?.Abbreviation === staticMatch.home &&
    m.Away?.Abbreviation === staticMatch.away
  );
  if (!fifa) return { ...staticMatch, status: 'upcoming' };
  const stadiumName = fifa.Stadium?.Name?.[0]?.Description;
  const cityName = fifa.Stadium?.CityName?.[0]?.Description;
  const venue = stadiumName
    ? cityName ? `${stadiumName}, ${cityName}` : stadiumName
    : staticMatch.venue;
  const status = getFifaStatus(fifa);
  const score = (fifa.HomeTeamScore != null && fifa.AwayTeamScore != null)
    ? [fifa.HomeTeamScore, fifa.AwayTeamScore]
    : null;
  const minute = fifa.MatchMinute ?? null;
  return { ...staticMatch, venue, fifaId: fifa.IdMatch, status, score, minute };
}

export default function AdeYaarApp() {
  const theme = 'midnight';
  const { user, loading } = useUser();
  const [tab, setTab]           = useState('home');
  const [betSheet, setBetSheet] = useState(null);
  const [toast, setToast]       = useState(null);
  const [balance, setBalance]   = useState(STARTING_BALANCE);
  const [bets, setBets]         = useState([]);
  const [fifaData, setFifaData] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [poolInfo, setPoolInfo] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }
    fetch(`/api/profile?id=${user.id}`)
      .then(r => {
        if (r.status === 404) {
          localStorage.removeItem('adeyaar_user');
          import('@/lib/supabase-browser').then(m => m.default?.auth.signOut());
          window.location.href = '/login';
        }
      })
      .catch(() => {});
  }, [user, loading]);

  const refreshData = useCallback(() => {
    if (!user) return;
    fetch(`/api/bets?user_id=${user.id}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setBets(data); })
      .catch(() => {});
    fetch(`/api/profile?id=${user.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setBalance(data.balance); })
      .catch(() => {});
  }, [user]);

  useEffect(() => { refreshData(); }, [refreshData]);

  useEffect(() => {
    fetch('/api/fifa/matches')
      .then(r => r.json())
      .then(setFifaData)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mq.matches);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Load pool info when bet sheet opens
  useEffect(() => {
    if (!betSheet) { setPoolInfo(null); return; }
    fetch(`/api/pool?match_id=${betSheet.match.id}`)
      .then(r => r.json())
      .then(setPoolInfo)
      .catch(() => setPoolInfo(null));
  }, [betSheet]);

  const matches = MATCHES.map(m => mergeWithFifa(m, fifaData));

  const openBet  = useCallback((match, pick) => setBetSheet({ match, pick }), []);
  const closeBet = useCallback(() => setBetSheet(null), []);

  const cancelBet = useCallback(async (matchId) => {
    if (!user) return;
    if (!confirm('Cancel your bet on this match? Your stake will be refunded.')) return;
    try {
      const res = await fetch('/api/bets/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, matchId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBalance(data.balance);
      setBets(prev => prev.map(b =>
        b.match_id === matchId && b.status === 'pending'
          ? { ...b, status: 'cancelled' }
          : b
      ));
      setToast(`Bet cancelled · ${fmtMoney(data.refunded)} refunded`);
    } catch (err) {
      setToast(`Error: ${err.message}`);
    }
  }, [user]);

  const handleLogout = useCallback(async () => {
    localStorage.removeItem('adeyaar_user');
    const { default: supabaseBrowser } = await import('@/lib/supabase-browser');
    if (supabaseBrowser) await supabaseBrowser.auth.signOut();
    window.location.href = '/login';
  }, []);

  const confirmBet = useCallback(async ({ matchId, pick, amount }) => {
    if (!user) return;
    try {
      const liveMatch = matches.find(m => m.id === matchId);
      if (liveMatch && liveMatch.status === 'finished') {
        throw new Error('Match already finished');
      }

      const res = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, matchId, pick, amount }),
      });
      const data = await res.json();

      if (res.status === 503) {
        setBalance(b => b - amount);
        setBets(prev => [{ id: Date.now(), match_id: matchId, pick, amount, status: 'pending', created_at: new Date().toISOString() }, ...prev]);
      } else if (!res.ok) {
        throw new Error(data.error || 'Failed to place bet');
      } else {
        setBalance(data.balance);
        refreshData();
      }

      setBetSheet(null);
      const match = getMatch(matchId);
      const team = pick === 'home' ? getTeam(match.home) :
                   pick === 'away' ? getTeam(match.away) : null;
      setToast(`Bet placed · ${fmtMoney(amount)} on ${team ? team.name : 'Draw'}`);
    } catch (err) {
      setToast(`Error: ${err.message}`);
      setBetSheet(null);
    }
  }, [matches, user, refreshData]);

  if (loading || !user) return null;

  if (isDesktop) {
    return (
      <>
        <DesktopApp
          tab={tab} setTab={setTab}
          balance={balance} openBet={openBet}
          matches={matches} user={user} onLogout={handleLogout} bets={bets} onCancelBet={cancelBet}
        />
        {betSheet && (
          <PlaceBetSheet
            match={betSheet.match}
            pick={betSheet.pick}
            balance={balance}
            poolInfo={poolInfo}
            existingBets={bets.filter(b => (b.match_id || b.matchId) === betSheet.match.id && b.status === 'pending')}
            onClose={closeBet}
            onConfirm={confirmBet}
          />
        )}
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </>
    );
  }

  return (
    <div className="stage">
      <div className="phone-frame">
        <div className="app" data-theme={theme}>
          <AppHeader balance={balance} user={user} onTap={() => setTab('bets')} />

          <div className="scroll">
            {tab === 'home'    && <HomeScreen matches={matches} balance={balance} bets={bets} onBet={openBet} onCancelBet={cancelBet} onNav={setTab} user={user} />}
            {tab === 'matches' && <MatchesScreen matches={matches} onBet={openBet} bets={bets} onCancelBet={cancelBet} />}
            {tab === 'bracket' && <BracketScreen matches={matches} />}
            {tab === 'leaders' && <LeaderboardScreen user={user} />}
            {tab === 'bets'    && <BetsScreen bets={bets} onCancelBet={cancelBet} />}
          </div>

          <TabBar active={tab} onChange={setTab} />

          {betSheet && (
            <PlaceBetSheet
              match={betSheet.match}
              pick={betSheet.pick}
              balance={balance}
              poolInfo={poolInfo}
              existingBets={bets.filter(b => (b.match_id || b.matchId) === betSheet.match.id && b.status === 'pending')}
              onClose={closeBet}
              onConfirm={confirmBet}
            />
          )}

          {toast && <Toast message={toast} onDone={() => setToast(null)} />}
        </div>
      </div>
    </div>
  );
}
