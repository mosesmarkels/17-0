import { SLOTS } from '../game/constants.js'
import { TEAM_BY_ABBR } from '../data/teams.js'

function initials(name) {
  const parts = name.replace(/[^A-Za-z .'-]/g, '').split(' ').filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function Field({ roster, highlight }) {
  return (
    <div className="field">
      {SLOTS.map((slot) => {
        const pick = roster[slot.id]
        const team = pick ? TEAM_BY_ABBR[pick.team] : null
        const open = !pick && highlight?.has(slot.pos)
        return (
          <div className="slot" key={slot.id} style={{ left: `${slot.x}%`, top: `${slot.y}%` }}>
            <div
              className={`jersey${pick ? ' filled' : ''}${open ? ' open' : ''}`}
              style={
                pick && team
                  ? { background: team.colors[0], borderColor: team.colors[1] }
                  : undefined
              }
              title={pick ? pick.name : slot.name}
            >
              {pick ? (pick.pos === 'DST' ? 'D' : initials(pick.name)) : slot.label}
            </div>
            <div className="tag">{slot.label}</div>
            {pick && <div className="who">{pick.pos === 'DST' ? pick.team : pick.name}</div>}
          </div>
        )
      })}
    </div>
  )
}
