import {
  ENTRY_PRICE,
  IQ_EXPECTED_EARN,
  PRIZES,
  ODDS,
  money,
} from '../game/economy.js'

const MODES = [
  {
    id: 'classic',
    icon: '🏈',
    name: 'CLASSIC',
    blurb: 'Full stat lines visible. Draft on the numbers, chase the jackpot.',
    cost: ENTRY_PRICE,
  },
  {
    id: 'iq',
    icon: '🧠',
    name: 'FOOTBALL IQ',
    blurb: 'Stats hidden. Free to play — earn credits on what you actually know.',
    cost: 0,
  },
]

export default function Home({ onStart, balance }) {
  return (
    <div className="wrap home">
      <h1>Can you go <span>17-0</span>?</h1>
      <p className="sub">
        Spin a franchise and an era. Draft the best player on the board.
        Six rounds, one all-time roster, one perfect season to chase.
      </p>

      <div className="jackpot-card">
        <span className="jackpot-k">PERFECT SEASON PAYS</span>
        <span className="jackpot-v">{money(PRIZES[17])}</span>
        <span className="jackpot-odds">
          1 in {ODDS[17].toLocaleString()} · nine records pay, down to 9-8
        </span>
        <span className="play-money">Play credits · not real money</span>
      </div>

      <div className="eyebrow">Choose your mode</div>
      <div className="modes">
        {MODES.map((m) => {
          const short = balance < m.cost
          return (
            <div className="mode" key={m.id}>
              <div className="ico">{m.icon}</div>
              <h3>{m.name}</h3>
              <p>{m.blurb}</p>
              <button className="btn" onClick={() => onStart(m.id)} disabled={short}>
                {m.cost > 0 ? `PLAY · ${money(m.cost)}` : 'PLAY FREE'}
              </button>
              <span className="mode-note">
                {m.cost > 0
                  ? `Top prize ${money(PRIZES[17])}`
                  : `Earns about ${money(IQ_EXPECTED_EARN)} a season`}
              </span>
            </div>
          )
        })}
      </div>

      {balance < ENTRY_PRICE && (
        <div className="broke">
          Out of credits for Classic — play <strong>Football IQ</strong> free to
          earn your way back in.
        </div>
      )}
    </div>
  )
}
