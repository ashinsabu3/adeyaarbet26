'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getTeam, fmtDate } from '@/lib/data';
import { Flag, Icon } from '@/components';

export default function SearchOverlay({ mode = 'overlay', onSelectMatch, onSelectUser, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Autofocus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Escape to close
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Debounced search
  const doSearch = useCallback((q) => {
    if (q.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      })
      .catch(() => {
        setResults({ matches: [], users: [] });
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val.trim()), 300);
  };

  const hasResults = results && (results.matches?.length > 0 || results.users?.length > 0);
  const isEmpty = results && !hasResults && query.trim().length >= 2;

  const content = (
    <div className="search-overlay__inner" onClick={(e) => e.stopPropagation()}>
      {/* Input row */}
      <div className="search-overlay__input-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="search-overlay__icon">
          <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="search-overlay__input"
          placeholder="Search teams, matches, friends..."
          value={query}
          onChange={handleChange}
        />
        <button className="search-overlay__close" onClick={onClose}>
          {Icon.close}
        </button>
      </div>

      {/* Results */}
      <div className="search-overlay__results">
        {loading && (
          <div className="search-overlay__state">Searching...</div>
        )}

        {!loading && isEmpty && (
          <div className="search-overlay__state">No results for &ldquo;{query.trim()}&rdquo;</div>
        )}

        {!loading && hasResults && (
          <>
            {results.matches?.length > 0 && (
              <div className="search-overlay__section">
                <div className="search-overlay__section-title">Matches</div>
                {results.matches.map(match => {
                  const home = getTeam(match.home);
                  const away = getTeam(match.away);
                  return (
                    <button
                      key={match.id}
                      className="search-overlay__result"
                      onClick={() => onSelectMatch(match)}
                    >
                      <div className="search-overlay__match-flags">
                        <Flag code={match.home} size="sm" />
                        <Flag code={match.away} size="sm" />
                      </div>
                      <div className="search-overlay__match-info">
                        <span className="search-overlay__match-teams">
                          {home.name} vs {away.name}
                        </span>
                        <span className="search-overlay__match-meta">
                          {match.group ? `Group ${match.group}` : 'Knockout'} · {fmtDate(match.date)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {results.users?.length > 0 && (
              <div className="search-overlay__section">
                <div className="search-overlay__section-title">Users</div>
                {results.users.map(user => (
                  <button
                    key={user.id}
                    className="search-overlay__result"
                    onClick={() => onSelectUser(user)}
                  >
                    <div className="search-overlay__user-avatar">
                      {user.display_name[0]}
                    </div>
                    <div className="search-overlay__match-info">
                      <span className="search-overlay__match-teams">{user.display_name}</span>
                      <span className="search-overlay__match-meta">@{user.username}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {!loading && !results && query.length === 0 && (
          <div className="search-overlay__state" style={{ opacity: 0.5 }}>
            Type at least 2 characters to search
          </div>
        )}
      </div>
    </div>
  );

  if (mode === 'dropdown') {
    return <div className="search-dropdown">{content}</div>;
  }

  // Full-screen overlay for mobile
  return (
    <div className="search-overlay" onClick={onClose}>
      {content}
    </div>
  );
}
