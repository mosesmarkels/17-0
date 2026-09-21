const KEY = 'seventeen-and-0.profile'

// Six accent colours so players are visually distinguishable on the board.
export const COLORS = ['#f5821f', '#8b5cf6', '#35d07f', '#4b92db', '#e31837', '#ffb612']

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
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
