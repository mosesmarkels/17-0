import { useMemo, useState } from 'react'
import { STAT_LINES } from '../game/constants.js'
import { eligibleSlots } from '../game/engine.js'

function fmt(v, dec) {
  if (v === undefined || v === null) return '—'
  return dec ? v.toFixed(dec) : Math.round(v).toLocaleString()
}

export default function PlayerList({ players, roster, hideStats, onPick }) {
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState(null)

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return players
    return players.filter((p) => p.name.toLowerCase().includes(needle))
  }, [players, q])

  return (
    <>
      <input
        className="search"
        placeholder="Search players…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="rows">
        {shown.length === 0 && <div className="empty">No players match that search.</div>}
        {shown.map((p) => {
          const slots = eligibleSlots(p, roster)
          const locked = slots.length === 0
          const isOpen = openId === p.id
          return (
            <div key={p.id} className={`row${locked ? ' locked' : ''}${isOpen ? ' sel' : ''}`}>
              <button
                className="row-main"
                disabled={locked}
                aria-expanded={isOpen}
                aria-label={
                  [
                    p.name,
                    p.pos,
                    p.paced > 0 ? 'shown at full-season pace' : '',
                    locked ? 'no roster spot left' : '',
                  ]
                    .filter(Boolean)
                    .join(', ')
                }
                onClick={() => setOpenId(isOpen ? null : p.id)}
              >
                <span className="row-top">
                  <span className="row-name">{p.name}</span>
                  <span className="row-pos">{p.pos}</span>
                  {p.paced > 0 && (
                    <span
                      className="row-pace"
                      title={`Only ${p.paced} games a season — shown at full-season pace`}
                    >
                      PACE
                    </span>
                  )}
                </span>

                {!hideStats && (
                  <span className="row-stats">
                    {STAT_LINES[p.pos].map((s) => (
                      <span className="stat" key={s.key}>
                        <span className="k">{s.label}</span>
                        <span className="v">{fmt(p.stats[s.key], s.dec)}</span>
                      </span>
                    ))}
                  </span>
                )}
              </button>

              {isOpen && slots.length > 0 && (
                <div className="pick-bar">
                  <span className="lbl">Draft to:</span>
                  {slots.map((s) => (
                    <button
                      key={s.id}
                      className="pick"
                      aria-label={`Draft ${p.name} at ${s.name}`}
                      onClick={() => {
                        setOpenId(null)
                        setQ('')
                        onPick(p, s)
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
