import { useEffect, useState } from 'react'
import Home from './components/Home.jsx'
import Game from './components/Game.jsx'
import HowToPlay from './components/HowToPlay.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import Prizes from './components/Prizes.jsx'
import Wallet from './components/Wallet.jsx'
import { entryPriceFor, STARTING_BALANCE } from './game/economy.js'

const STORE = 'seventeen-and-0.games'
const PURSE = 'seventeen-and-0.balance'

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private browsing — state just isn't persisted */
  }
}

export default function App() {
  const [view, setView] = useState('home')
  const [mode, setMode] = useState('classic')
  const [games, setGames] = useState([])
  const [balance, setBalance] = useState(STARTING_BALANCE)
  const [notice, setNotice] = useState('')
  const [runId, setRunId] = useState(0)

  useEffect(() => {
    setGames(load(STORE, []))
    setBalance(load(PURSE, STARTING_BALANCE))
  }, [])

  function adjust(delta) {
    setBalance((b) => {
      const next = b + delta
      save(PURSE, next)
      return next
    })
  }

  // Returns false when there isn't enough on the balance, so callers can
  // refuse the action rather than letting it go negative.
  function spend(cents) {
    if (balance < cents) {
      setNotice('Not enough credits. Tap your balance to top up.')
      return false
    }
    adjust(-cents)
    return true
  }

  function recordGame(result, roster, playedMode, prize) {
    if (prize > 0) adjust(prize)
    const entry = {
      wins: result.wins,
      losses: result.losses,
      strength: result.strength,
      points: result.points,
      prize,
      mode: playedMode,
      qb: roster.QB?.name ?? '—',
      at: Date.now(),
    }
    const next = [...games, entry].sort((a, b) => b.points - a.points).slice(0, 50)
    setGames(next)
    save(STORE, next)
  }

  function start(m) {
    const price = entryPriceFor(m)
    if (price > 0 && !spend(price)) return
    setNotice('')
    setMode(m)
    setRunId((n) => n + 1)
    setView('game')
  }

  function topUp() {
    adjust(STARTING_BALANCE)
    setNotice(`Added ${(STARTING_BALANCE / 100).toFixed(2)} in demo credits.`)
  }

  return (
    <div className="app">
      <header className="hdr">
        <div className="wrap hdr-in">
          <button className="logo" onClick={() => setView('home')}>
            17<b>-0</b>
          </button>
          <nav className="nav">
            <button className={view === 'home' ? 'on' : ''} onClick={() => setView('home')}>
              Home
            </button>
            <button className={view === 'prizes' ? 'on' : ''} onClick={() => setView('prizes')}>
              Prizes
            </button>
            <button className={view === 'board' ? 'on' : ''} onClick={() => setView('board')}>
              My Rosters
            </button>
            <button className={view === 'how' ? 'on' : ''} onClick={() => setView('how')}>
              Rules
            </button>
          </nav>
          <Wallet balance={balance} onTopUp={topUp} />
        </div>
      </header>

      {notice && <div className="notice">{notice}</div>}

      {view === 'home' && <Home onStart={start} balance={balance} />}
      {view === 'game' && (
        <Game
          key={`${mode}-${runId}`}
          mode={mode}
          balance={balance}
          spend={spend}
          onHome={() => setView('home')}
          onFinish={recordGame}
          onPlayAgain={() => start(mode)}
        />
      )}
      {view === 'how' && <HowToPlay />}
      {view === 'prizes' && <Prizes />}
      {view === 'board' && <Leaderboard games={games} />}

      <footer className="foot">
        17-0 · demo credits only — no real money is taken or paid · stats are
        per-season estimates for play, not an official record
      </footer>
    </div>
  )
}
