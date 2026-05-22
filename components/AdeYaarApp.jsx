'use client';

import { useState, useEffect, useCallback } from 'react';
import { MATCHES, getMatch, getTeam } from '@/lib/data';
import { STARTING_BALANCE, fmtMoney } from '@/lib/currency';
import { useUser } from '@/lib/hooks';
import { initBetStore, placeBet, getBalance, getMyBets, getPoolForMatch } from '@/lib/bet-store';
import { AppHeader, TabBar, PlaceBetSheet, Toast } from '@/components';
import SearchOverlay from '@/components/SearchOverlay';
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
  const [searchOpen, setSearchOpen] = useState(false);

  // Sync balance from user once resolved
  useEffect(() => {
    if (!loading && user) {
      setBalance(prev => prev === null ? user.balance : prev);
    }
  }, [user, loading]);

  // Initialize bet store and load state
  useEffect(() => {
    initBetStore();
    setBalance(getBalance());
    setBets(getMyBets());
  }, []);

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

  const matches = MATCHES.map(m => mergeWithFifa(m, fifaData));

  const openBet  = useCallback((match, pick) => setBetSheet({ match, pick }), []);
  const closeBet = useCallback(() => setBetSheet(null), []);

  const handleSearchClose = useCallback(() => setSearchOpen(false), []);
  const handleSearchOpen = useCallback(() => setSearchOpen(true), []);
  const handleSelectMatch = useCallback((match) => {
    setSearchOpen(false);
    setTab('matches');
  }, []);
  const handleSelectUser = useCallback((user) => {
    setSearchOpen(false);
    setTab('leaders');
  }, []);

  const confirmBet = useCallback(({ matchId, pick, amount }) => {
    try {
      const liveMatch = matches.find(m => m.id === matchId);
      if (liveMatch && liveMatch.status === 'finished') {
        throw new Error('Match already finished');
      }
      placeBet(matchId, pick, amount);
      setBalance(getBalance());
      setBets(getMyBets());
      setBetSheet(null);
      const match = getMatch(matchId);
      const team = pick === 'home' ? getTeam(match.home) :
                   pick === 'away' ? getTeam(match.away) : null;
      setToast(`Bet placed · ${fmtMoney(amount)} on ${team ? team.name : 'Draw'}`);
    } catch (err) {
      setToast(`Error: ${err.message}`);
      setBetSheet(null);
    }
  }, [matches]);

  const poolInfo = betSheet ? getPoolForMatch(betSheet.match.id) : null;

  if (loading || balance === null) {
    return (
      <div className="stage">
        <div className="phone-frame">
          <div className="app" data-theme={theme}>
            <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--ink-3)' }}>
              Loading...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isDesktop) {
    return (
      <>
        <DesktopApp
          tab={tab} setTab={setTab}
          balance={balance} openBet={openBet}
          matches={matches}
          user={user}
          onSelectMatch={handleSelectMatch}
          onSelectUser={handleSelectUser}
        />
        {betSheet && (
          <PlaceBetSheet
            match={betSheet.match}
            pick={betSheet.pick}
            balance={balance}
            poolInfo={poolInfo}
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
      {/* Phone frame */}
      <div className="phone-frame">
        <div className="app" data-theme={theme}>
          <AppHeader balance={balance} onTap={() => setTab('bets')} onSearchOpen={handleSearchOpen} />

          <div className="scroll">
            {tab === 'home'    && <HomeScreen matches={matches} balance={balance} bets={bets} onBet={openBet} onNav={setTab} />}
            {tab === 'matches' && <MatchesScreen matches={matches} onBet={openBet} />}
            {tab === 'bracket' && <BracketScreen matches={matches} />}
            {tab === 'leaders' && <LeaderboardScreen balance={balance} />}
            {tab === 'bets'    && <BetsScreen bets={bets} />}
          </div>

          <TabBar active={tab} onChange={setTab} />

          {betSheet && (
            <PlaceBetSheet
              match={betSheet.match}
              pick={betSheet.pick}
              balance={balance}
              poolInfo={poolInfo}
              onClose={closeBet}
              onConfirm={confirmBet}
            />
          )}

          {toast && <Toast message={toast} onDone={() => setToast(null)} />}

          {searchOpen && (
            <SearchOverlay
              mode="overlay"
              onSelectMatch={handleSelectMatch}
              onSelectUser={handleSelectUser}
              onClose={handleSearchClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
