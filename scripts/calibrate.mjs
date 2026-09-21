import { POOL, simulate } from '../src/game/engine.js'
import { TEAMS } from '../src/data/teams.js'
import { SLOTS } from '../src/game/constants.js'
import { PRIZES as CLASSIC_PRIZES, ENTRY_PRICE, REROLL_PRICE as RR } from '../src/game/economy.js'

const byCombo = new Map()
for (const p of POOL) {
  const k = p.team + '|' + p.era
  if (!byCombo.has(k)) byCombo.set(k, [])
  byCombo.get(k).push(p)
}
const combos = []
for (const t of TEAMS) for (const era of t.eras) {
  const players = byCombo.get(t.abbr + '|' + era)
  if (players?.length) combos.push({ team: t.abbr, era, players, offers: new Set(players.map(p => p.pos)) })
}
const pick = (a) => a[(Math.random() * a.length) | 0]
// Read straight from the app so the two can never drift apart.
const PRIZES = Object.fromEntries(
  Object.entries(CLASSIC_PRIZES).map(([w, cents]) => [w, cents / 100]),
)
const ENTRY = ENTRY_PRICE / 100
const REROLL = RR / 100

// "expert": keeps the best board seen across skips. "casual": commits to the
// first acceptable board and often leaves skips unspent.
function play(mode, extra) {
  const roster = {}
  let skips = 2 + extra
  for (let round = 0; round < SLOTS.length; round++) {
    const open = SLOTS.filter(s => !roster[s.id])
    const need = new Set(open.map(s => s.pos))
    const ch = combos.filter(c => [...need].some(n => c.offers.has(n)))
    let best = null
    const maxLook = mode === 'expert' ? 1 + skips : (skips > 0 && Math.random() < 0.5 ? 2 : 1)
    let used = 0
    for (let look = 0; look < maxLook; look++) {
      const combo = pick(ch)
      let cand = null
      for (const p of combo.players) {
        if (!need.has(p.pos)) continue
        for (const s of open) {
          if (s.pos !== p.pos) continue
          const sc = s.weight * p.rating
          if (!cand || sc > cand.sc) cand = { sc, player: p, slot: s }
        }
      }
      if (cand && (!best || cand.sc > best.sc)) best = cand
      if (look > 0) used++
      if (best && best.player.rating >= (mode === 'expert' ? 92 : 78)) break
    }
    skips -= used
    if (skips < 0) skips = 0
    if (!best) return null
    roster[best.slot.id] = best.player
  }
  return simulate(roster)
}

const N = Number(process.argv[2] || 400000)
for (const mode of ['expert', 'casual']) {
  const dist = new Array(18).fill(0)
  let pay = 0
  for (let i = 0; i < N; i++) {
    const r = play(mode, 0)
    if (!r) continue
    dist[r.wins]++
    pay += PRIZES[r.wins] || 0
  }
  const ev = pay / N
  console.log(`\n=== ${mode.toUpperCase()} · ${N.toLocaleString()} seasons · entry $${ENTRY} ===`)
  console.log(`expected payout $${ev.toFixed(4)}   RTP ${(100 * ev / ENTRY).toFixed(1)}%   house edge ${(100 * (1 - ev / ENTRY)).toFixed(1)}%`)
  console.log(`house profit per play $${(ENTRY - ev).toFixed(4)}`)
  console.log('\nrecord   odds          prize    contributes')
  for (let w = 17; w >= 9; w--) {
    const p = dist[w] / N
    console.log(
      `${w}-${17 - w}`.padStart(6),
      (p ? '1 in ' + Math.round(1 / p).toLocaleString() : 'never').padStart(13),
      ('$' + PRIZES[w]).padStart(7),
      ('$' + (p * PRIZES[w]).toFixed(4)).padStart(13),
    )
  }
  const anyPrize = dist.slice(9).reduce((a, b) => a + b, 0) / N
  console.log(`\nsomething paid on ${(100 * anyPrize).toFixed(1)}% of seasons`)
}

// House exposure as players buy re-rolls
console.log('\n=== RE-ROLL LADDER (expert play) ===')
console.log('bought   total cost   EV payout   house profit')
for (const extra of [0, 1, 2, 3, 4, 5, 6]) {
  let pay = 0
  const M = Math.min(N, 200000)
  for (let i = 0; i < M; i++) { const r = play('expert', extra); if (r) pay += PRIZES[r.wins] || 0 }
  const ev = pay / M
  const cost = ENTRY + extra * REROLL
  console.log(
    String(extra).padStart(6),
    ('$' + cost.toFixed(2)).padStart(12),
    ('$' + ev.toFixed(4)).padStart(11),
    ('$' + (cost - ev).toFixed(4)).padStart(14),
  )
}
