const KEY = 'seventeen-and-0.profile'

// Six accent colours so players are visually distinguishable on the board.
export const COLORS = ['#f5821f', '#8b5cf6', '#35d07f', '#4b92db', '#e31837', '#ffb612']

// A stable id, generated once and kept for good. Seasons are attributed to
// this rather than to the display name, so renaming yourself moves your whole
// history with you instead of splitting it into a second player.
function newId() {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  } catch {
    /* fall through */
  }
  return `p-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    // Profiles created before ids existed get one now, keeping their name.
    return p.id ? p : saveProfile({ ...p, id: newId() })
  } catch {
    return null
  }
}

export function makeProfile({ name, color }) {
  return { id: newId(), name, color }
}

// Every season in this browser belongs to whoever is playing in it -- there is
// only ever one profile here. Stamping them all with the current id and name
// is what keeps you as a single row after a reload, a rename, or seasons
// played before you had a profile at all.
export function claimSeasons(games, profile) {
  if (!profile) return games
  let changed = false
  const next = games.map((g) => {
    if (g.playerId === profile.id && g.player === profile.name) return g
    changed = true
    return { ...g, playerId: profile.id, player: profile.name }
  })
  return changed ? next : games
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile))
  } catch {
    /* private browsing — the name just won't survive a reload */
  }
  return profile
}

// Names go on a shared board, so keep them short, printable and unsurprising.
export function cleanName(raw) {
  return raw
    .replace(/[^\p{L}\p{N} _.'-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 18)
}

export function initialsOf(name) {
  const parts = name.split(/[\s_.-]+/).filter(Boolean)
  if (!parts.length) return '??'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}
