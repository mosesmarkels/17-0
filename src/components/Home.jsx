import { ENTRY_PRICE, PRIZES, ODDS, money } from '../game/economy.js'

const MODES = [
  {
    id: 'classic',
    icon: '🏈',
    name: 'CLASSIC',
    blurb: 'Full stat lines visible. Draft on the numbers.',
  },
  {
    id: 'iq',
    icon: '🧠',
    name: 'FOOTBALL IQ',
    blurb: 'Stats hidden. Draft on what you actually know.',
  },
]

export default function Home({ onStart, balance }) {
  const short = balance < ENTRY_PRICE
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
        {MODES.map((m) => (
          <div className="mode" key={m.id}>
            <div className="ico">{m.icon}</div>
            <h3>{m.name}</h3>
            <p>{m.blurb}</p>
            <button
              className="btn"
              onClick={() => onStart(m.id)}
              disabled={short}
            >
              PLAY · {money(ENTRY_PRICE)}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
