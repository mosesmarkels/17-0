import { PLAYERS } from '../data/players.js'
import { DEFENSES } from '../data/defenses.js'
import { TEAM_BY_ABBR, teamNameFor } from '../data/teams.js'
import { SLOTS, FULL_SEASON, COUNTING_STATS, MAX_PRORATE } from './constants.js'

// ── Composite value ──────────────────────────────────────────────────────
// A quarterback's 4,000 passing yards and an edge rusher's 14 sacks are not
// comparable numbers, so each position gets its own formula. The absolute
// scale of each formula does not matter: every player is later ranked only
// against others at the same position.
const COMPOSITE = {
  QB: (s) => s.py / 25 + s.ptd * 3 + s.rtg * 0.8 - s.int * 2.5 + s.ry / 25,
  RB: (s) => s.ry / 10 + s.rtd * 6 + s.ypc * 10 + s.rec * 1.5 + s.recy / 10,
  WR: (s) => s.rec * 2 + s.recy / 10 + s.rectd * 6 + s.ypr * 3,
  TE: (s) => s.rec * 2 + s.recy / 10 + s.rectd * 6 + s.ypr * 2,
  DEF: (s) => s.sk * 6 + s.int * 10 + s.tkl * 0.4 + s.ff * 4,
  DST: (s) => (30 - s.pa) * 8 + s.sk * 0.8 + s.to * 1.5 + (380 - s.ya) * 0.15,
}

// ── The pool ─────────────────────────────────────────────────────────────
// Team defenses join the player pool as position "DST" so the draft treats
// them like any other pick.
const DRAFTABLE = new Set(SLOTS.map((s) => s.pos))

// Put everyone on the same footing: a full season's production in their own
// era. A player whose entry carries `g` (average games played per season) only
// suited up for part of the year -- a rookie who took over in week six, a
// starter who missed time -- so their volume stats are scaled up to the pace
// they were actually on. This is what keeps active 2020s players from being
// judged on half a season's counting stats.
function prorate(stats, era, games) {
  const full = FULL_SEASON[era] ?? 16
  if (!games || games >= full) return { stats, paced: 0 }

  const factor = Math.min(full / games, MAX_PRORATE)
  const out = {}
  for (const [k, v] of Object.entries(stats)) {
    out[k] = COUNTING_STATS.has(k) ? Math.round(v * factor * 10) / 10 : v
  }
  return { stats: out, paced: games }
}

function buildPool() {
  const pool = PLAYERS.filter((p) => DRAFTABLE.has(p.p)).map((p, i) => {
    const { stats, paced } = prorate(p.s, p.e, p.g)
    return {
      id: `p${i}`,
      team: p.t,
      era: p.e,
      name: p.n,
      pos: p.p,
      stats,
      paced,
      games: p.g ?? null,
    }
  })

  DEFENSES.forEach((d, i) => {
    const team = TEAM_BY_ABBR[d.t]
    pool.push({
      id: `d${i}`,
      team: d.t,
      era: d.e,
      name: `${d.e} ${team ? team.name : d.t} Defense`,
      pos: 'DST',
      stats: d.s,
    })
  })

  // Rate every entry against the others at its own position. The rating blends
  // percentile rank (where you finished) with normalised value (how far ahead
  // you actually were), so a dominant player is rewarded for the gap and not
  // just for the placing.
  const byPos = {}
  pool.forEach((e) => {
    e.value = COMPOSITE[e.pos](e.stats)
    ;(byPos[e.pos] ||= []).push(e)
  })

  Object.values(byPos).forEach((group) => {
    const sorted = [...group].sort((a, b) => a.value - b.value)
    const min = sorted[0].value
    const max = sorted[sorted.length - 1].value
    const span = max - min || 1
    sorted.forEach((e, i) => {
      const percentile = sorted.length > 1 ? i / (sorted.length - 1) : 1
      const normalised = (e.value - min) / span
      e.rating = Math.round((0.5 * percentile + 0.5 * normalised) * 1000) / 10
    })
  })

  return pool
}

export const POOL = buildPool()

export function playersFor(team, era) {
  return POOL.filter((p) => p.team === team && p.era === era).sort(
    (a, b) => b.rating - a.rating,
  )
}

// Which of the still-open roster spots this player can fill.
export function eligibleSlots(player, roster) {
  return SLOTS.filter((s) => s.pos === player.pos && !roster[s.id])
}

// A spin is only allowed to land on a team/era that can actually fill one of
// the remaining roster spots -- otherwise a round could dead-end.
export function validCombos(teams, roster) {
  const needed = new Set(SLOTS.filter((s) => !roster[s.id]).map((s) => s.pos))
  const combos = []
  for (const t of teams) {
    for (const era of t.eras) {
      const ok = POOL.some(
        (p) => p.team === t.abbr && p.era === era && needed.has(p.pos),
      )
      if (ok) combos.push({ team: t.abbr, era })
    }
  }
  return combos
}

// ── The simulation ───────────────────────────────────────────────────────
const FLOOR = 0.08 // even a bad roster steals a game or two
const CURVE = 2.4 // each additional win costs more than the last

// The curve is scaled past 17 and then clamped. Without this headroom a
// perfect season would require a literally perfect roster -- the single
// best player in the pool at all six spots -- which is unreachable: across
// 1.2m simulated seasons team strength never once cleared 95. The headroom
// puts 17-0 at roughly strength 91, which is rare but genuinely winnable.
const HEADROOM = 20.3

export function simulate(roster) {
  const filled = SLOTS.filter((s) => roster[s.id]).map((s) => ({
    slot: s,
    player: roster[s.id],
  }))
  if (!filled.length) return null

  // Every spot is judged against its own weight, so a replacement-level
  // quarterback hurts far more than a replacement-level tight end.
  const totalWeight = filled.reduce((a, e) => a + e.slot.weight, 0)
  const weightedMean =
    filled.reduce((a, e) => a + e.slot.weight * e.player.rating, 0) / totalWeight

  // The weak link is whichever spot is costing the most, measured as how far
  // below the ceiling it sits, scaled by how much that spot matters. A bad
  // tight end is a scratch; a bad quarterback is a season.
  const maxWeight = Math.max(...filled.map((e) => e.slot.weight))
  let worst = filled[0]
  let worstDeficit = -1
  for (const e of filled) {
    const deficit = (100 - e.player.rating) * (e.slot.weight / maxWeight)
    if (deficit > worstDeficit) {
      worstDeficit = deficit
      worst = e
    }
  }
  const weakLink = 100 - worstDeficit

  const strength = 0.75 * weightedMean + 0.25 * weakLink
  const s = Math.max(0, Math.min(1, strength / 100))

  const raw = HEADROOM * (FLOOR + (1 - FLOOR) * Math.pow(s, CURVE))
  const wins = Math.max(0, Math.min(17, Math.round(raw)))

  return {
    wins,
    losses: 17 - wins,
    strength: Math.round(strength * 10) / 10,
    weakSlot: worst.slot.label,
    weakName: worst.player.name,
    points: Math.round(strength * strength * 100 + wins * 2000),
  }
}

export function labelFor(team, era) {
  return teamNameFor(team, era)
}
