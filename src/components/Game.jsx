import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ERAS, ROUNDS, SLOTS } from '../game/constants.js'
import { TEAMS } from '../data/teams.js'
import { playersFor, validCombos, simulate, labelFor } from '../game/engine.js'
import {
  FREE_SKIPS,
  REROLL_PRICE,
  MAX_BOUGHT_REROLLS,
  prizeFor,
  entryPriceFor,
  money,
} from '../game/economy.js'
import Reel from './Reel.jsx'
import Field from './Field.jsx'
import PlayerList from './PlayerList.jsx'
import Results from './Results.jsx'

const SPIN_MS = 2600
const TEAM_POOL = TEAMS.map((t) => t.abbr)

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function Game({ mode, balance, spend, onHome, onFinish, onPlayAgain }) {
  const [roster, setRoster] = useState({})
  const [round, setRound] = useState(1)
  const [phase, setPhase] = useState('idle') // idle | spinning | landed | done
  const [combo, setCombo] = useState(null)
  const [free, setFree] = useState({ ...FREE_SKIPS })
  const [bought, setBought] = useState(0)
  const [result, setResult] = useState(null)
  const [prize, setPrize] = useState(0)
  const timer = useRef(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  const openPositions = useMemo(
    () => new Set(SLOTS.filter((s) => !roster[s.id]).map((s) => s.pos)),
    [roster],
  )

  // Only land on a franchise/era that can still fill an open roster spot.
  const startSpin = useCallback(
    (lock) => {
      const combos = validCombos(TEAMS, roster)
      let choices = combos
      if (lock === 'team' && combo) choices = combos.filter((c) => c.team === combo.team)
      if (lock === 'era' && combo) choices = combos.filter((c) => c.era === combo.era)
      if (!choices.length) choices = combos

      // Re-spinning should actually change something when it can.
      if (combo && choices.length > 1) {
        const different = choices.filter(
          (c) => !(c.team === combo.team && c.era === combo.era),
        )
        if (different.length) choices = different
      }

      setCombo(pick(choices))
      setPhase('spinning')
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setPhase('landed'), SPIN_MS + 120)
    },
    [roster, combo],
  )

  // A skip is free until that kind runs out, then it costs REROLL_PRICE.
  // `lock` says which reel to hold steady while the other rolls again.
  function useSkip(kind, lock) {
    if (free[kind] > 0) {
      setFree((f) => ({ ...f, [kind]: f[kind] - 1 }))
      startSpin(lock)
      return
    }
    if (bought >= MAX_BOUGHT_REROLLS) return
    if (!spend(REROLL_PRICE)) return
    setBought((n) => n + 1)
    startSpin(lock)
  }

  const respinTeam = () => useSkip('team', 'era') // keep the era, roll the team
  const respinEra = () => useSkip('era', 'team') // keep the team, roll the era

  function skipState(kind) {
    if (free[kind] > 0) return { label: String(free[kind]), paid: false, disabled: false }
    const out = bought >= MAX_BOUGHT_REROLLS
    return {
      label: money(REROLL_PRICE),
      paid: true,
      disabled: out || balance < REROLL_PRICE,
    }
  }

  function draft(player, slot) {
    const next = { ...roster, [slot.id]: player }
    setRoster(next)
    if (round >= ROUNDS) {
      const res = simulate(next)
      const won = prizeFor(res.wins, mode)
      setResult(res)
      setPrize(won)
      setPhase('done')
      onFinish?.(res, next, mode, won)
    } else {
      setRound((r) => r + 1)
      setCombo(null)
      setPhase('idle')
    }
  }



  if (phase === 'done' && result) {
    return (
      <Results
        roster={roster}
        result={result}
        prize={prize}
        mode={mode}
        replayPrice={entryPriceFor(mode)}
        onPlayAgain={onPlayAgain}
        onHome={onHome}
      />
    )
  }

  const available = combo && phase === 'landed' ? playersFor(combo.team, combo.era) : []
  const spinning = phase === 'spinning'

  return (
    <div className="wrap game">
      <div className="roundbar">
        <div className="txt">
          Round {round} / {ROUNDS} — {mode === 'iq' ? 'Football IQ' : 'Classic'}
        </div>
        <div className="pips">
          {Array.from({ length: ROUNDS }, (_, i) => (
            <span
              key={i}
              className={`pip${i + 1 < round ? ' done' : i + 1 === round ? ' now' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="reels">
        <Reel
          label="Team"
          accent="linear-gradient(180deg,#f5821f,#b45a0d)"
          pool={TEAM_POOL}
          value={combo?.team}
          spinning={spinning}
          duration={SPIN_MS}
        />
        <Reel
          label="Era"
          accent="linear-gradient(180deg,#8b5cf6,#5b34c4)"
          pool={ERAS}
          value={combo?.era}
          spinning={spinning}
          duration={SPIN_MS - 500}
        />
      </div>

      {phase === 'landed' && (
        <div className="respins">
          <button
            className="respin"
            style={{ background: 'linear-gradient(180deg,#f5821f,#b45a0d)' }}
            onClick={respinTeam}
            disabled={skipState('team').disabled}
          >
            ↻ Team{' '}
            <span className={`n${skipState('team').paid ? ' paid' : ''}`}>
              {skipState('team').label}
            </span>
          </button>
          <button
            className="respin"
            style={{ background: 'linear-gradient(180deg,#8b5cf6,#5b34c4)' }}
            onClick={respinEra}
            disabled={skipState('era').disabled}
          >
            ↻ Era{' '}
            <span className={`n${skipState('era').paid ? ' paid' : ''}`}>
              {skipState('era').label}
            </span>
          </button>
        </div>
      )}

      <Field roster={roster} highlight={openPositions} />

      {phase !== 'landed' && (
        <button className="spin-btn" onClick={() => startSpin()} disabled={spinning}>
          {spinning ? 'SPINNING…' : 'SPIN'}
        </button>
      )}

      {phase === 'landed' && combo && (
        <div className="draft">
          <div className="draft-hd">{combo.team} · {combo.era}</div>
          <div className="draft-sub">
            {labelFor(combo.team, combo.era)} — per full season
          </div>
          <PlayerList
            players={available}
            roster={roster}
            hideStats={mode === 'iq'}
            onPick={draft}
          />
        </div>
      )}
    </div>
  )
}
