'use client';

import { useState } from 'react';
import { getFriend, getMatch, getTeam, ME_ID, fmtCompact } from '@/lib/data';
import { AppHeader, TabBar, PlaceBetSheet, Toast } from '@/components';
import HomeScreen from '@/components/screens/HomeScreen';
import MatchesScreen from '@/components/screens/MatchesScreen';
import BracketScreen from '@/components/screens/BracketScreen';
import LeaderboardScreen from '@/components/screens/LeaderboardScreen';
import BetsScreen from '@/components/screens/BetsScreen';

export default function AdeYaarApp() {
  const theme = 'midnight';
  const [tab, setTab]     = useState('home');
  const [betSheet, setBetSheet] = useState(null); // { match, pick }
  const [toast, setToast]       = useState(null);
  const [balance, setBalance]   = useState(getFriend(ME_ID).balance);

  const openBet  = (match, pick) => setBetSheet({ match, pick });
  const closeBet = () => setBetSheet(null);

  const confirmBet = ({ matchId, pick, amount, oddsAt }) => {
    setBalance(b => b - amount);
    setBetSheet(null);
    const match = getMatch(matchId);
    const team  = pick === 'home' ? getTeam(match.home) :
                  pick === 'away' ? getTeam(match.away) : null;
    setToast(`Bet placed · ₹${amount.toLocaleString('en-IN')} on ${team ? team.name : 'Draw'}`);
  };

  return (
    <div className="stage">
      {/* Desktop info panel */}
      <div className="info-panel">
        <div>
          <h1>AdeYaar 26</h1>
          <div className="tag">Friend-group betting · FIFA 2026</div>
          <p>48 teams, 12 groups, 104 matches across USA, Canada and Mexico.</p>
        </div>
        <ul>
          <li><span>Stack</span><b>Next.js · App Router</b></li>
          <li><span>Hosting</span><b>Vercel</b></li>
          <li><span>Teams</span><b>48 · real 2026 draw</b></li>
          <li><span>Screens</span><b>Home · Matches · Bracket · Leaders · Bets</b></li>
        </ul>
      </div>

      {/* Phone frame */}
      <div className="phone-frame">
        <div className="app" data-theme={theme}>
          <AppHeader balance={balance} onTap={() => setTab('bets')} />

          <div className="scroll">
            {tab === 'home'    && <HomeScreen balance={balance} onBet={openBet} onNav={setTab} />}
            {tab === 'matches' && <MatchesScreen onBet={openBet} />}
            {tab === 'bracket' && <BracketScreen />}
            {tab === 'leaders' && <LeaderboardScreen balance={balance} />}
            {tab === 'bets'    && <BetsScreen />}
          </div>

          <TabBar active={tab} onChange={setTab} />

          {betSheet && (
            <PlaceBetSheet
              match={betSheet.match}
              pick={betSheet.pick}
              balance={balance}
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
