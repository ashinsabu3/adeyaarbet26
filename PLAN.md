# AdeYaar 26 — Feature Plan & Progress Tracker

> 4 features, 4 PRs. All concurrent. This file is the single source of truth.
> Checkboxes marked `[x]` when done. Append-only log at bottom.

---

## Engineering Rules (ALL PRs must follow)

### State Management
- **Single source of truth**: One state owner per data domain. Bets live in `BetStore`, user in `UserContext`, matches in `AdeYaarApp`.
- **No prop drilling > 2 levels**: If a prop passes through more than 2 components without being used, lift it to context or pass a narrower object.
- **Immutable updates only**: Never mutate state. Always spread/create new objects. `setBets([...bets, newBet])` not `bets.push(newBet)`.
- **Derived state is computed, never stored**: Don't `useState` for things computable from existing state (e.g., `totalOpen` = computed from bets array, not stored separately).

### Object Passing (OOP-aligned)
- **Pass domain objects, not primitives**: Components receive `match`, `bet`, `user` objects — not `matchId + homeCode + awayCode + venue`.
- **Shape contracts**: Each domain object has a defined shape. Components destructure only what they need.
  - `User: { id, username, display_name, avatar_url, balance }`
  - `Bet: { id, matchId, pick, amount, oddsAt, status, createdAt }`
  - `Match: { id, group, home, away, date, time, venue, status, score, minute }`
- **No God objects**: Don't pass the entire app state. Pass the narrowest object that satisfies the component.
- **Callbacks are typed contracts**: `onBet(match, pick)` not `onBet(matchId, homeCode, awayCode, pick, venue)`.

### Performance
- **No re-renders from stable data**: Match list (72 items), team data, venues — these are static. Memoize or hoist outside render.
- **`useMemo` for expensive derivations**: Filtering/sorting matches, computing leaderboard rankings, grouping by date — memoize these.
- **`useCallback` for handlers passed to lists**: `onBet`, `onNav`, filter handlers passed to map'd children must be stable references.
- **Lazy state initialization**: `useState(() => computeExpensiveThing())` for localStorage reads, initial bet hydration.
- **No fetch waterfalls**: Parallel fetches (FIFA + activity) via `Promise.all` or concurrent `useEffect`s, never sequential.
- **72 match cards is fine**: No virtualization needed at this scale. But avoid re-creating the full list on every filter chip click — memoize the filtered result.

### Component Rules
- **Components are pure functions of their props + hooks**: No side effects in render body.
- **One responsibility**: `MatchCard` renders a match. It doesn't fetch, filter, or manage bet state.
- **Event handlers bubble up**: Child emits intent (`onBet`), parent decides what to do (open sheet, update state).
- **Loading/error/empty states**: Every async-driven UI must handle all three. No bare `data.map(...)` without a null check.

---

## Betting & Economy Model

### Parimutuel Pool System
- All bets on a match go into a **pool**. Winners split the pool proportional to their stake.
- **No house edge** — money circulates between friends. Losers fund winners.
- Odds are **dynamic** — derived from how friends bet, not set by the app.

**Calculation:**
```
Pool = sum(all bets on match)
Winner payout = (my_stake / total_stake_on_winning_side) × Pool
If nobody bet the winning side → all bets refunded
```

**Example:** BRA vs MARAlso
- 5 friends bet ₹500 each on BRA → pool_home = ₹2500
- 3 friends bet ₹500 each on MAR → pool_away = ₹1500
- Total pool = ₹4000
- If MAR wins: each MAR bettor gets (500/1500) × 4000 = ₹1333 (profit ₹833)
- If BRA wins: each BRA bettor gets (500/2500) × 4000 = ₹800 (profit ₹300)

### Economy
- **Virtual currency** — play money, not real. Name/symbol TBD (placeholder in code).
- **Code constant**: `lib/currency.js` exports `CURRENCY_SYMBOL`, `CURRENCY_NAME`, `STARTING_BALANCE`.
- **Starting balance: 5,000** per person.
- **Wallet displayed top-right** on login (already the balance pill in AppHeader).
- **Settlement at tournament end** — net positive/negative displayed. Winners are owed, losers owe.
- **Pending balance** = wallet balance + unsettled open bets. Shown in header.

### Display in UI
- AppHeader (top-right): `{{SYMBOL}}4,250` (current available balance)
- On hover/tap: tooltip showing `Available: {{SYMBOL}}4,250 | Locked in bets: {{SYMBOL}}750`
- Leaderboard: ranked by `starting_balance + net_profit_from_settled_bets`
- My Bets: shows live pool odds (how much you'd win if your side wins now)
- All money formatting goes through `fmtMoney()` which reads from `CURRENCY_SYMBOL`

---

## Current UI Audit — What Works vs What's Broken

### WORKING (no changes needed):
- Tab navigation (5 tabs, mobile + desktop)
- Match cards rendering with team flags, scores, venues, IST times
- Match filter chips (All/Live/Today/R32/Group) — filtering logic works
- Bracket screen — group/knockout toggle, 12 groups render, knockout bracket scrolls
- FIFA API proxy — fetches live match data
- Responsive layout switch (mobile < 1024px, desktop ≥ 1024px)
- Hero match display (featured/live match)

### BROKEN / SHELL (needs implementation):
| UI Element | Problem |
|------------|---------|
| **Bet placement "Place bet" button** | Opens login modal that queries `supabase.from('users')` — crashes without DB |
| **My Bets screen** | Reads `BETS = []` — always empty. Placed bets never persisted |
| **Leaderboard period filters** | All 3 periods show identical static data (cosmetic buttons) |
| **Home → "Open bets" stat** | Always 0 (reads from empty BETS) |
| **Home → "Today's net" stat** | Always +₹0 (reads from empty BETS) |
| **Home → "Group rank" stat** | Hardcoded "#1" |
| **Home → Friend activity** | `ACTIVITY = []` — section renders empty |
| **Desktop search bar** | Visual only, no handler |
| **Desktop notification bell** | Visual only |
| **Desktop settings gear** | Visual only |
| **Desktop sidebar user profile** | Hardcoded to ME_ID |

---

## Concurrency Contract

All PRs branch off `main` independently. No blocking dependencies.

```
main ──┬── feat/oauth-login       (PR #1)
       ├── feat/search            (PR #2)
       ├── feat/betting-engine    (PR #3) ← THE CORE FEATURE
       └── feat/e2e-playwright    (PR #4)
```

- **Fallback principle:** Every feature works without Supabase. Returns mock data or uses `ME_ID`.
- **Shared hook:** `useUser()` returns session user OR `{ id: 'rahul', username: 'rahul', balance: 14250 }`.
- **API convention:** 503 when Supabase unconfigured + mock fallback where possible.

---

## Feature 1: Auth (Google OAuth + Email/Password + Account Linking)

**Requirement:** Two auth methods, seamless UX:
1. **Google OAuth** — one-click, auto-derive username from profile
2. **Email/Password** — sign up with email + choose username, password login thereafter
3. **Account linking** — if someone signs up with Google then tries email login with same email, link accounts (no duplicate). Vice versa too.

**Auth UX rules:**
- Email is the identity anchor (unchangeable after signup)
- Username is changeable (profile setting)
- Password reset via email (Supabase magic link / reset flow)
- On login page: "Sign in with Google" button + email/password form + "Forgot password?" link
- On signup: email + password + display name. Username auto-derived from display name (editable).

### Implementation Checklist

- [x] `supabase/migrations/001_initial_schema.sql` — profiles table + trigger
- [x] `lib/supabase-server.js` — server client with null guard
- [x] `lib/supabase-browser.js` — browser client
- [x] `middleware.js` — session refresh, passes through when unconfigured
- [x] `app/auth/callback/route.js` — OAuth code exchange
- [x] `app/login/page.js` — Google sign-in with Suspense
- [x] `lib/hooks.js` — `useUser()` hook (session user OR ME_ID fallback)
- [x] `app/api/auth/me/route.js` — GET current user profile
- [x] `components/AdeYaarApp.jsx` — use `useUser()`, pass user to all screens
- [x] `components/index.jsx` — remove `LoginModal`, remove login step from `PlaceBetSheet`
- [x] `components/desktop/DesktopApp.jsx` — sidebar profile from `useUser()`
- [ ] `app/login/page.js` — add email/password form (sign in + sign up toggle)
- [ ] `app/login/page.js` — "Forgot password?" triggers `supabase.auth.resetPasswordForEmail()`
- [ ] `app/auth/callback/route.js` — handle password reset token type
- [ ] Account linking: Supabase handles this natively when same email used across providers
- [ ] `app/settings/page.js` — change username (optional, future)

### Test Checklist

- [x] Unit: `useUser()` returns ME_ID fallback when no session
- [ ] Unit: username derivation "John Doe" → "johndoe"
- [x] Integration: middleware passes through when unconfigured (curl /)
- [ ] Integration: `/auth/callback` no code → redirect to /login?error (curl)
- [x] Integration: `/api/auth/me` → 401 without session (curl)
- [ ] Unit: Login page renders Google button + email form (RTL)
- [ ] Integration: sign up with email → profile created with derived username
- [ ] Integration: sign in with same email via Google → accounts linked (no duplicate)
- [ ] Integration: forgot password → reset email triggered

---

## Feature 2: Search (Matches + Friends)

**Requirement:** Unified search. Desktop: wire existing search bar. Mobile: search icon → overlay.

### Implementation Checklist

- [x] `app/api/search/route.js` — working, tested via curl
- [ ] `components/SearchOverlay.jsx` — debounced input, grouped results, click-to-navigate
- [ ] `components/index.jsx` — add search icon to `AppHeader`
- [ ] `components/desktop/DesktopApp.jsx` — wire search bar `onChange` → API → dropdown
- [ ] `components/AdeYaarApp.jsx` — search open/close state, SearchOverlay render

### Test Checklist

- [x] `GET /api/search?q=brazil` → 3 Brazil matches (curl ✓)
- [x] `GET /api/search?q=miami` → venue matches (curl ✓)
- [x] `GET /api/search` (no q) → 400 (curl ✓)
- [ ] `GET /api/search?q=zzz` → empty results (curl)
- [ ] Unit: SearchOverlay renders input (RTL)
- [ ] Unit: debounce logic (RTL + mock fetch)
- [ ] Unit: click result fires navigation callback (RTL)

---

## Feature 3: Betting Engine + Activity Feed + Leaderboard

**Requirement:** The core loop. Place bets that persist. See your bets. Leaderboard reflects real balances. Activity feed shows friend actions. Home stats are live.

### What this fixes:
- Bet placement no longer crashes (removes supabase `users` table query)
- Bets persist (local state + optional Supabase)
- My Bets screen shows placed bets
- Leaderboard updates based on bet outcomes
- Home stats (open bets, net, rank) are live
- Friend activity feed populated

### Implementation Checklist

- [ ] `lib/bet-store.js` — client-side bet store (persists to localStorage + syncs to Supabase when available)
- [ ] `app/api/bets/route.js` — POST place bet, GET list bets (with localStorage fallback)
- [ ] `app/api/activity/route.js` — update: mock fallback returns demo activity when Supabase unconfigured
- [ ] `lib/mock-activity.js` — static mock activity entries for demo mode
- [ ] `components/index.jsx` — `PlaceBetSheet`: remove login step, call bet store directly, fire `onConfirm`
- [ ] `components/AdeYaarApp.jsx` — bet state: persist placed bets, pass to BetsScreen + HomeScreen
- [ ] `components/screens/BetsScreen.jsx` — read from bet store instead of `BETS` constant
- [ ] `components/screens/HomeScreen.jsx` — stats from bet store, activity from API/mock
- [ ] `components/screens/LeaderboardScreen.jsx` — compute rankings from initial balance ± bet outcomes
- [ ] `lib/data.js` — remove `BETS = []`, `ACTIVITY = []` (dead exports)

### Test Checklist

- [ ] Integration: `POST /api/bets` with valid payload → 201 (curl)
- [ ] Integration: `POST /api/bets` invalid match_id → 400 (curl)
- [ ] Integration: `GET /api/bets` → list of placed bets (curl)
- [ ] Integration: `GET /api/activity` → mock activity (curl, no Supabase)
- [ ] Unit: bet-store.js — place bet, balance deducted, bet recorded
- [ ] Unit: bet-store.js — bet with amount > balance rejected
- [ ] Unit: BetsScreen renders placed bets (RTL)
- [ ] Unit: HomeScreen stats reflect bet state (RTL)
- [ ] Unit: LeaderboardScreen ranks update with bet outcomes (RTL)
- [ ] Unit: PlaceBetSheet confirm flow (no login step) (RTL)

---

## Feature 4: Playwright E2E Test Suite

**Requirement:** Browser-based E2E. Covers all tabs, buttons, interactive flows. No Supabase required.

### Implementation Checklist

- [ ] `package.json` — `@playwright/test` dev dep, `test:e2e` script
- [ ] `playwright.config.js` — baseURL, webServer (next dev), projects
- [ ] `e2e/navigation.spec.js` — 5 tabs, correct screen content
- [ ] `e2e/matches.spec.js` — filter chips work, cards render, odds buttons open sheet
- [ ] `e2e/bet-flow.spec.js` — odds → sheet → pick → slider → presets → confirm → toast
- [ ] `e2e/bracket.spec.js` — group/knockout toggle, 12 groups, bracket scroll
- [ ] `e2e/leaderboard.spec.js` — period filters, podium, "YOU" badge
- [ ] `e2e/bets.spec.js` — filter chips, bet cards render after placing
- [ ] `e2e/search.spec.js` — overlay open, type, results (skip if not merged)
- [ ] `e2e/login.spec.js` — page renders, Google button visible
- [ ] `e2e/responsive.spec.js` — mobile frame vs desktop sidebar at 1024px
- [ ] `.gitignore` — e2e artifacts

### Test Scenarios

| Scenario | Viewport | Assertions |
|----------|----------|------------|
| Tab navigation (all 5) | Both | Screen title changes, content renders |
| Match filter chips | Mobile | List count changes per filter |
| Odds button → bet sheet | Mobile | Sheet visible, pick highlighted |
| Bet sheet → slider → confirm → toast | Mobile | Amount updates, toast appears |
| After bet: My Bets shows entry | Mobile | Bet card with correct team/amount |
| Bracket group ↔ knockout | Desktop | View switches, content changes |
| Leaderboard period chips | Mobile | Active chip styles |
| Responsive breakpoint | 375px + 1280px | Phone frame vs sidebar |
| Home stats update after bet | Mobile | Open bets count increments |

---

## Progress Log (append-only)

```
[2026-05-22 14:25] DONE: supabase/migrations/001_initial_schema.sql — profiles, activity, bets tables
[2026-05-22 14:25] DONE: lib/supabase-server.js — server client with null guard
[2026-05-22 14:25] DONE: lib/supabase-browser.js — browser client
[2026-05-22 14:25] DONE: middleware.js — passes through when unconfigured
[2026-05-22 14:25] DONE: app/auth/callback/route.js — OAuth code exchange
[2026-05-22 14:25] DONE: app/login/page.js — Google sign-in with Suspense
[2026-05-22 14:25] DONE: app/api/search/route.js — unified search
[2026-05-22 14:25] DONE: app/api/activity/route.js — GET/POST with 503 fallback
[2026-05-22 14:25] DONE: .env.example — cleaned up
[2026-05-22 14:25] DONE: next build passes
[2026-05-22 14:25] VERIFIED: curl /api/search?q=brazil → 3 matches ✓
[2026-05-22 14:25] VERIFIED: curl /api/search?q=miami → 4 matches ✓
[2026-05-22 14:25] VERIFIED: curl /api/search (no q) → 400 ✓
[2026-05-22 14:25] VERIFIED: curl /api/activity → 503 ✓
[2026-05-22 14:25] VERIFIED: curl / → 200 ✓
[2026-05-22 14:25] VERIFIED: curl /login → 200 ✓
[2026-05-22 14:30] AUDIT: Full UI audit — identified all broken/shell elements
[2026-05-22 14:30] RESTRUCTURED: Feature 3 is now "Betting Engine + Activity + Leaderboard" (the core broken loop)
[2026-05-22 14:55] DONE: feat/oauth-login branch — build passes, committed (3025ab9)
[2026-05-22 14:55] DONE: feat/search branch — build passes, committed (b668181)
[2026-05-22 14:55] DONE: feat/e2e-playwright branch — committed (3482e9b)
[2026-05-22 14:55] DONE: feat/betting-engine branch — build passes, committed (c4aefe3)
[2026-05-22 14:55] VERIFIED: POST /api/bets valid → 201 + bet object ✓
[2026-05-22 14:55] VERIFIED: POST /api/bets invalid matchId → 400 "Match not found" ✓
[2026-05-22 14:55] VERIFIED: GET /api/activity → mock activity with friend names ✓
[2026-05-22 14:55] VERIFIED: GET /api/bets → empty array (server-side, client uses localStorage) ✓
[2026-05-22 14:55] VERIFIED: All 4 branches build clean, no cross-contamination ✓
[2026-05-22 14:56] UPDATED: Feature 1 expanded to include email/password auth + account linking
```
