import { useEffect, useState } from 'react'
import Home from './components/Home.jsx'
import Game from './components/Game.jsx'
import HowToPlay from './components/HowToPlay.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import Prizes from './components/Prizes.jsx'
import Wallet from './components/Wallet.jsx'
import Profile from './components/Profile.jsx'
import {
  loadProfile,
  saveProfile,
  makeProfile,
  claimSeasons,
  initialsOf,
} from './game/profile.js'
import { submitSeason } from './net/leaderboard.js'
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
  const [profile, setProfile] = useState(null)
  const [editingProfile, setEditingProfile] = useState(false)

  useEffect(() => {
    const saved = loadProfile()
    const history = claimSeasons(load(STORE, []), saved)
    setGames(history)
    save(STORE, history)
    setBalance(load(PURSE, STARTING_BALANCE))
    setProfile(saved)
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
      playerId: profile?.id ?? null,
      player: profile?.name ?? 'Guest',
      wins: result.wins,
      losses: result.losses,
      strength: result.strength,
      points: result.points,
      prize,
      mode: playedMode,
      qb: roster.QB?.name ?? '—',
      at: Date.now(),
    }
    // Save locally first, then push to the shared board. If the network call
    // fails the season is still safely recorded here.
    const next = [...games, entry].sort((a, b) => b.points - a.points).slice(0, 50)
    setGames(next)
    save(STORE, next)
    submitSeason(entry)
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

  function storeProfile(next) {
    // Keep the existing id on a rename so the history follows the person.
    const full = profile ? { ...profile, ...next } : makeProfile(next)
    saveProfile(full)
    setProfile(full)
    const claimed = claimSeasons(games, full)
    setGames(claimed)
    save(STORE, claimed)
    setEditingProfile(false)
  }

  // First visit: ask for a name before anything else, since it is what the
  // shared leaderboard identifies people by.
  if (!profile || editingProfile) {
    return (
      <div className="app">
        <Profile
          profile={profile}
          onSave={storeProfile}
          onClose={() => setEditingProfile(false)}
        />
      </div>
    )
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
              Leaderboard
            </button>
            <button className={view === 'how' ? 'on' : ''} onClick={() => setView('how')}>
              Rules
            </button>
          </nav>
          <button
            className="avatar me-chip"
            style={{ background: profile.color }}
            onClick={() => setEditingProfile(true)}
            title={`${profile.name} — edit profile`}
          >
            {initialsOf(profile.name)}
          </button>
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
      {view === 'board' && <Leaderboard games={games} profile={profile} />}

      <footer className="foot">
        17-0 · demo credits only — no real money is taken or paid · stats are
        per-season estimates for play, not an official record
      </footer>
    </div>
  )
}
