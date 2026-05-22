'use client';

import { useState } from 'react';
import { getFriend, getMatch, getTeam, ME_ID, MATCHES, fmtCompact } from '@/lib/data';
import { AppHeader, TabBar, PlaceBetSheet, Toast } from '@/components';
import HomeScreen from '@/components/screens/HomeScreen';
import MatchesScreen from '@/components/screens/MatchesScreen';
import BracketScreen from '@/components/screens/BracketScreen';
import LeaderboardScreen from '@/components/screens/LeaderboardScreen';
import BetsScreen from '@/components/screens/BetsScreen';

const THEMES = ['stadium', 'newsroom', 'midnight'];

export default function AdeYaarApp() {
  const [theme, setTheme] = useState('stadium');
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
      {/* Desktop info panel */}
      <div className="info-panel">
        <div>
          <h1>AdeYaar 26</h1>
          <div className="tag">Friend-group betting · FIFA 2026</div>
          <p>A mobile-first redesign of the 2022 group pool, refreshed for the first 48-team World Cup.</p>
        </div>
        <ul>
          <li><span>Stack</span><b>Next.js · App Router</b></li>
          <li><span>Hosting</span><b>Vercel</b></li>
          <li><span>Themes</span><b>3 · swap below ↘</b></li>
          <li><span>Screens</span><b>Home · Fixtures · Bracket · Leaders · Bets</b></li>
        </ul>
        {/* Theme switcher on desktop */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {THEMES.map(t => (
            <button
              key={t}
              className={'theme-btn ' + (theme === t ? 'active' : '')}
              onClick={() => setTheme(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Phone frame */}
      <div className="phone-frame">
        <div className="app" data-theme={theme}>
          {/* Mobile theme switcher */}
          <div style={{
            position: 'absolute', top: 12, right: 12, zIndex: 20,
            display: 'flex', gap: 4,
          }} className="mobile-theme-row">
            {THEMES.map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  border: '1.5px solid',
                  borderColor: theme === t ? 'var(--gold)' : 'var(--line-strong)',
                  color: theme === t ? 'var(--gold)' : 'var(--ink-3)',
                  background: theme === t ? 'var(--gold-soft)' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                {t[0].toUpperCase() + t.slice(1, 3)}
              </button>
            ))}
          </div>

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
