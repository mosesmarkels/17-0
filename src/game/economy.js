// ── Money ────────────────────────────────────────────────────────────────
// Everything is held in whole cents. Never use floats for money.
//
// These numbers are not guesses. They were fitted by simulating 400,000
// seasons against the live engine under both expert play (spends every skip,
// always takes the best board it has seen) and casual play, then solving for
// an entry price that holds a positive margin against the BETTER of the two.
// Re-run scripts/calibrate to re-validate after any change to ratings,
// weights or the win curve -- all three move these odds.

export const ENTRY_PRICE = 300 // $3.00 a season
export const REROLL_PRICE = 100 // $1.00 a re-roll
export const FREE_SKIPS = { team: 1, era: 1 }
export const MAX_BOUGHT_REROLLS = 6

// Paid on the final record. The jackpot is the headline, but note how little
// of the expected payout it actually carries -- see PAYOUT_SHARE below.
export const PRIZES = {
  17: 10000,
  16: 5000,
  15: 2500,
  14: 1600,
  13: 800,
  12: 600,
  11: 400,
  10: 200,
  9: 100,
}

// Measured odds, expert play, 400k seasons. Published so the table is honest.
export const ODDS = {
  17: 16000,
  16: 2174,
  15: 350,
  14: 94,
  13: 32,
  12: 13,
  11: 7,
  10: 5,
  9: 5,
}

// Headline economics at ENTRY_PRICE with no re-rolls bought.
export const HOUSE = {
  expectedPayout: 210, // $2.10 per season, expert play
  rtpExpert: 70.0,
  rtpCasual: 63.9,
  edgeExpert: 30.0,
  profitPerPlay: 90, // $0.90
  rerollValue: 35, // a $1 re-roll is worth about $0.35, so it keeps ~65%
  payingShare: 65.4, // % of seasons that pay something
  jackpotShareOfPayout: 0.3, // % of expected payout carried by the jackpot
}

export const prizeFor = (wins) => PRIZES[wins] ?? 0

export const money = (cents) =>
  (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
