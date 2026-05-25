'use client';

import { useState, useMemo, useRef } from 'react';
import { fmtMoney } from '@/lib/currency';
import { BetCard } from '@/components';

function AccountSection({ user, onProfileUpdate }) {
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, username, displayName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (onProfileUpdate) onProfileUpdate(data);
      setEditing(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('Max 2MB'); return; }

    setError(null);
    setSaving(true);
    try {
      const supabaseBrowser = (await import('@/lib/supabase-browser')).default;
      if (!supabaseBrowser) throw new Error('Not available');

      const ext = file.name.split('.').pop();
      const path = `${user.id}.${ext}`;
      const { error: upErr } = await supabaseBrowser.storage
        .from('user_pics')
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const { data: urlData } = supabaseBrowser.storage.from('user_pics').getPublicUrl(path);
      const avatarUrl = urlData.publicUrl + '?t=' + Date.now();

      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, avatarUrl }),
      });
      if (!res.ok) throw new Error('Failed to save');
      if (onProfileUpdate) onProfileUpdate({ avatar_url: avatarUrl });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = user?.avatar_url;

  return (
    <div style={{ padding: '12px 16px', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: avatarSrc ? `url(${avatarSrc}) center/cover` : 'rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer', border: '2px solid rgba(255,255,255,0.15)',
          }}
        >
          {!avatarSrc && (user?.display_name?.[0] || '?')}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
        <div style={{ flex: 1 }}>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Display name"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '6px 10px', color: '#fff', fontSize: 13 }}
              />
              <input
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="username"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '6px 10px', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'var(--font-mono)' }}
              />
            </div>
          ) : (
            <>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{user?.display_name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}>@{user?.username}</div>
            </>
          )}
        </div>
        {editing ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleSave} disabled={saving} style={{ background: '#4ade80', color: '#000', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              {saving ? '...' : 'Save'}
            </button>
            <button onClick={() => { setEditing(false); setError(null); }} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: 11, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '6px 12px', fontSize: 11, cursor: 'pointer' }}>
            Edit
          </button>
        )}
      </div>
      {error && <div style={{ marginTop: 8, fontSize: 11, color: '#f87171' }}>{error}</div>}
    </div>
  );
}

export default function BetsScreen({ bets = [], onCancelBet, user, onProfileUpdate }) {
  const [tab, setTab] = useState('pending');

  const filtered = useMemo(() => {
    if (tab === 'all') return bets;
    return bets.filter(b => b.status === tab);
  }, [bets, tab]);

  const totalOpen = useMemo(
    () => bets.filter(b => b.status === 'pending').reduce((s, b) => s + b.amount, 0),
    [bets]
  );
  const totalWon = useMemo(
    () => bets.filter(b => b.status === 'won').reduce((s, b) => s + ((b.payout || 0) - b.amount), 0),
    [bets]
  );
  const settled = bets.filter(b => b.status === 'won' || b.status === 'lost');
  const winRate = settled.length
    ? Math.round(100 * bets.filter(b => b.status === 'won').length / settled.length)
    : 0;

  return (
    <div>
      <AccountSection user={user} onProfileUpdate={onProfileUpdate} />

      <div className="section-head" style={{ marginTop: 0 }}>
        <div className="section-head__title display">My Bets</div>
      </div>

      <div className="stats-strip">
        {[
          { label: 'Open stake', val: fmtMoney(totalOpen), tint: 'gold' },
          { label: 'Won',        val: '+' + fmtMoney(totalWon), tint: 'win' },
          { label: 'Win rate',   val: winRate + '%', tint: null },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{
              fontSize: 18,
              color: s.tint === 'gold' ? 'var(--gold)' : s.tint === 'win' ? 'var(--win)' : 'var(--ink)',
            }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="chip-row" style={{ marginBottom: 12 }}>
        {[
          { id: 'pending', label: `Open · ${bets.filter(b => b.status === 'pending').length}` },
          { id: 'won',  label: 'Won' },
          { id: 'lost', label: 'Lost' },
          { id: 'all',  label: 'All' },
        ].map(t => (
          <button
            key={t.id}
            className={'chip ' + (tab === t.id ? 'active' : '')}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 28, color: 'var(--ink-3)' }}>
            {bets.length === 0 ? 'Place your first bet!' : `No ${tab} bets yet`}
          </div>
        )}
        {filtered.map(b => <BetCard key={b.id} bet={b} onCancelBet={onCancelBet} />)}
      </div>
    </div>
  );
}
