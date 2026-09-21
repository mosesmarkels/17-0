import { useState } from 'react'
import { SLOTS } from '../game/constants.js'
import { labelFor } from '../game/engine.js'
import RecordReveal from './RecordReveal.jsx'
import { money, ENTRY_PRICE } from '../game/economy.js'

function verdict(wins) {
  if (wins === 17) return 'Perfection. Nobody touched you.'
  if (wins >= 15) return 'A bye and a parade — but not immortality.'
  if (wins >= 13) return 'Top seed. One bad Sunday away from history.'
  if (wins >= 11) return 'Playoff team. Not a juggernaut.'
  if (wins >= 9) return 'You squeaked into January.'
  if (wins >= 6) return 'Watching the postseason from home.'
  if (wins >= 3) return 'Rough year. Good draft position.'
  return 'That is a top-three pick.'
}

export default function Results({ roster, result, prize, onPlayAgain, onHome }) {
  const [done, setDone] = useState(false)
  const perfect = result.wins === 17

  return (
    <div className="wrap res">
      <div className="cap">{done ? 'Final Record' : 'Simulating Season…'}</div>

      <RecordReveal
        wins={result.wins}
        losses={result.losses}
        perfect={perfect}
        onDone={() => setDone(true)}
      />

      <p className="sr-only" aria-live="polite">
        {done ? `Final record: ${result.wins} and ${result.losses}.` : ''}
      </p>

      <div className={`after-reveal${done ? ' in' : ''}`}>
        <div className={`payout${prize > 0 ? ' won' : ''}`}>
          {prize > 0 ? (
            <>
              <span className="payout-k">YOU WON</span>
              <span className="payout-v">{money(prize)}</span>
            </>
          ) : (
            <span className="payout-k">No prize — 9-8 or better pays</span>
          )}
        </div>

        <div className="verdict">{verdict(result.wins)}</div>

        <div className="meters">
          <div className="meter">
            <div className="k">STRENGTH</div>
            <div className="v">{result.strength}</div>
          </div>
          <div className="meter">
            <div className="k">WEAK LINK</div>
            <div className="v">{result.weakSlot}</div>
          </div>
          <div className="meter">
            <div className="k">POINTS</div>
            <div className="v">{result.points.toLocaleString()}</div>
          </div>
        </div>

        <div className="recap">
          {SLOTS.map((slot) => {
            const p = roster[slot.id]
            if (!p) return null
            return (
              <div className="recap-row" key={slot.id}>
                <span className="recap-slot">{slot.label}</span>
                <div className="recap-who">
                  <div className="recap-name">{p.name}</div>
                  <div className="recap-meta">
                    {labelFor(p.team, p.era)} · {p.era}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="res-actions">
          <button className="btn" onClick={onPlayAgain}>
            PLAY AGAIN · {money(ENTRY_PRICE)}
          </button>
          <button className="btn ghost" onClick={onHome}>HOME</button>
        </div>
      </div>
    </div>
  )
}
