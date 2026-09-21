// Decades used by the slot machine, oldest first.
export const ERAS = ['60s', '70s', '80s', '90s', '00s', '10s', '20s']

export const ERA_LABEL = {
  '60s': '1960s',
  '70s': '1970s',
  '80s': '1980s',
  '90s': '1990s',
  '00s': '2000s',
  '10s': '2010s',
  '20s': '2020s',
}

// The six roster spots, one per round.
//
// `weight` is how much that spot counts toward team strength. Football is not
// a game of equal parts: a quarterback swings a season far harder than a tight
// end does, so the weights are deliberately lopsided. Both receiver spots carry
// the same weight -- they are interchangeable, so ranking one above the other
// would only be a fake decision.
export const SLOTS = [
  { id: 'QB', pos: 'QB', label: 'QB', name: 'Quarterback', weight: 3.0, x: 50, y: 70 },
  { id: 'RB', pos: 'RB', label: 'RB', name: 'Running Back', weight: 1.3, x: 30, y: 88 },
  { id: 'WR1', pos: 'WR', label: 'WR', name: 'Wide Receiver', weight: 1.4, x: 14, y: 62 },
  { id: 'WR2', pos: 'WR', label: 'WR', name: 'Wide Receiver', weight: 1.4, x: 86, y: 62 },
  { id: 'TE', pos: 'TE', label: 'TE', name: 'Tight End', weight: 0.8, x: 70, y: 66 },
  { id: 'DST', pos: 'DST', label: 'D/ST', name: 'Team Defense', weight: 1.6, x: 50, y: 28 },
]

export const ROUNDS = SLOTS.length

// Which stat keys each position shows in the draft list, and how to render them.
export const STAT_LINES = {
  QB: [
    { key: 'py', label: 'PASS YD' },
    { key: 'ptd', label: 'PASS TD' },
    { key: 'int', label: 'INT' },
    { key: 'rtg', label: 'RATING', dec: 1 },
    { key: 'ry', label: 'RUSH YD' },
  ],
  RB: [
    { key: 'ry', label: 'RUSH YD' },
    { key: 'rtd', label: 'RUSH TD' },
    { key: 'ypc', label: 'YPC', dec: 1 },
    { key: 'rec', label: 'REC' },
    { key: 'recy', label: 'REC YD' },
  ],
  WR: [
    { key: 'rec', label: 'REC' },
    { key: 'recy', label: 'REC YD' },
    { key: 'rectd', label: 'REC TD' },
    { key: 'ypr', label: 'YPR', dec: 1 },
  ],
  TE: [
    { key: 'rec', label: 'REC' },
    { key: 'recy', label: 'REC YD' },
    { key: 'rectd', label: 'REC TD' },
    { key: 'ypr', label: 'YPR', dec: 1 },
  ],
  DEF: [
    { key: 'sk', label: 'SACKS', dec: 1 },
    { key: 'int', label: 'INT', dec: 1 },
    { key: 'tkl', label: 'TACKLES' },
    { key: 'ff', label: 'FF', dec: 1 },
  ],
  DST: [
    { key: 'pa', label: 'PTS ALW', dec: 1 },
    { key: 'sk', label: 'SACKS' },
    { key: 'to', label: 'TAKEAWAYS' },
    { key: 'ya', label: 'YDS ALW' },
  ],
}

// Every stat above is a per-season average across the years that player spent
// with that franchise inside that decade. D/ST numbers are per-season too.
export const STAT_FOOTNOTE = 'Per-season averages with that franchise during that decade.'

// How long a full season was in each decade. Seasons ran 14 games until 1978,
// 16 games until 2020, and 17 games since.
export const FULL_SEASON = {
  '60s': 14,
  '70s': 14,
  '80s': 16,
  '90s': 16,
  '00s': 16,
  '10s': 16,
  '20s': 17,
}

// Volume stats scale with playing time, so a player who only started half a
// season has a depressed average. These get prorated to a full season. Rate
// stats (passer rating, yards per carry, points allowed per game) already
// account for playing time and must be left alone.
export const COUNTING_STATS = new Set([
  'py', 'ptd', 'int', 'ry', 'rtd', 'rec', 'recy', 'rectd', 'sk', 'tkl', 'ff', 'to',
])

// A partial season is a small sample, so refuse to extrapolate wildly from it.
export const MAX_PRORATE = 1.7
