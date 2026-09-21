import { SUPABASE_URL, SUPABASE_ANON_KEY, isOnline } from './config.js'

const TABLE = 'seasons'
const LOCAL = 'seventeen-and-0.games'

function headers(extra = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  }
}

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL) || '[]')
  } catch {
    return []
  }
}

// Posting a season is fire-and-forget on purpose: a leaderboard that is
// unreachable should never cost someone the game they just played. The run is
// always kept locally first, so nothing is lost if this fails.
export async function submitSeason(entry) {
  if (!isOnline()) return { ok: false, reason: 'offline' }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: 'POST',
      headers: headers({ Prefer: 'return=minimal' }),
      body: JSON.stringify({
        player: entry.player,
        wins: entry.wins,
        losses: entry.losses,
        points: entry.points,
        strength: entry.strength,
        prize: entry.prize,
        mode: entry.mode,
        qb: entry.qb,
      }),
    })
    return res.ok ? { ok: true } : { ok: false, reason: `http ${res.status}` }
  } catch (err) {
    return { ok: false, reason: String(err) }
  }
}

// One row per player -- their single best season -- ranked. Falls back to the
// local history so the board is never empty while offline.
export async function fetchGlobal(limit = 100) {
  if (!isOnline()) {
    return { online: false, rows: rankBest(readLocal()) }
  }
  try {
    const url =
      `${SUPABASE_URL}/rest/v1/${TABLE}` +
      `?select=player,wins,losses,points,strength,mode,qb,created_at` +
      `&order=points.desc&limit=1000`
    const res = await fetch(url, { headers: headers() })
    if (!res.ok) throw new Error(`http ${res.status}`)
    const rows = await res.json()
    return { online: true, rows: rankBest(rows).slice(0, limit) }
  } catch (err) {
    return { online: false, rows: rankBest(readLocal()), error: String(err) }
  }
}

// Collapse many seasons into a per-player best, highest points first.
function rankBest(rows) {
  const best = new Map()
  for (const r of rows) {
    const name = r.player || 'Guest'
    const prev = best.get(name)
    if (!prev || r.points > prev.points) best.set(name, { ...r, player: name })
  }
  return [...best.values()].sort((a, b) => b.points - a.points)
}

export async function countSeasons() {
  if (!isOnline()) return readLocal().length
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?select=player`,
      { headers: headers({ Prefer: 'count=exact', Range: '0-0' }) },
    )
    const range = res.headers.get('content-range')
    return range ? Number(range.split('/')[1]) : 0
  } catch {
    return 0
  }
}
