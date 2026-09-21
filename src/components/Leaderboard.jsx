import { useEffect, useState } from 'react'
import { fetchGlobal } from '../net/leaderboard.js'
import { initialsOf, COLORS } from '../game/profile.js'
import { money } from '../game/economy.js'

// Stable colour per name so a player looks the same to everyone, even though
// only their own browser knows the colour they actually picked.
function colorFor(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return COLORS[h % COLORS.length]
}

export default function Leaderboard({ games, profile }) {
  const [tab, setTab] = useState('global')
  const [state, setState] = useState({ loading: true, online: false, rows: [] })

  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true }))
    fetchGlobal().then((r) => {
      if (alive) setState({ loading: false, ...r })
    })
    return () => {
      alive = false
    }
  }, [games.length])

  return (
    <div className="wrap page">
      <h2>Leaderboard</h2>

      <div className="tabs">
        <button className={tab === 'global' ? 'on' : ''} onClick={() => setTab('global')}>
          Everyone
        </button>
        <button className={tab === 'mine' ? 'on' : ''} onClick={() => setTab('mine')}>
          My seasons
        </button>
      </div>

      {tab === 'global' ? (
        <>
          {!state.loading && !state.online && (
            <div className="note">
              <strong>Showing local results only.</strong> No leaderboard backend
              is connected yet, so this board can only see seasons played in this
              browser. Connect one and every player shows up here automatically —
              see “Going global” in the README.
            </div>
          )}

          {state.loading ? (
            <p>Loading the board…</p>
          ) : state.rows.length === 0 ? (
            <p>No seasons logged yet. Play one and you’ll appear here.</p>
          ) : (
            <div className="rows">
              {state.rows.map((r, i) => {
                const me = profile && r.player === profile.name
                return (
                  <div className={`lb-row${me ? ' me' : ''}`} key={r.player + i}>
                    <span className={`lb-rank${i < 3 ? ' top' : ''}`}>{i + 1}</span>
                    <span
                      className="avatar"
                      style={{ background: me ? profile.color : colorFor(r.player) }}
                    >
                      {initialsOf(r.player)}
                    </span>
                    <div>
                      <div className="lb-name">
                        {r.player}
                        {me && <span className="you">YOU</span>}
                      </div>
                      <div className="lb-meta">
                        best {r.wins}-{r.losses} ·{' '}
                        {r.mode === 'iq' ? 'Football IQ' : 'Classic'} · {r.qb}
                      </div>
                    </div>
                    <span className="lb-pts">{r.points.toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          )}
        </>
      ) : games.length === 0 ? (
        <p>You haven’t finished a season yet.</p>
      ) : (
        <div className="rows">
          {games.map((g, i) => (
            <div className="lb-row" key={i}>
              <span className={`lb-rank${i < 3 ? ' top' : ''}`}>{i + 1}</span>
              <div>
                <div className="lb-rec">
                  {g.wins}-{g.losses}
                </div>
                <div className="lb-meta">
                  {g.mode === 'iq' ? 'Football IQ' : 'Classic'} · strength{' '}
                  {g.strength} · {g.qb}
                  {g.prize > 0 && ` · won ${money(g.prize)}`}
                </div>
              </div>
              <span className="lb-pts">{g.points.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
