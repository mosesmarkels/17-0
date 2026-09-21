// ── Money ────────────────────────────────────────────────────────────────
// Everything is held in whole cents. Never use floats for money.
//
// These numbers are not guesses. They were fitted by simulating 400,000
// seasons against the live engine under both expert play (spends every skip,
// always takes the best board it has seen) and casual play, then solving for
// an entry price that holds a positive margin against the BETTER of the two.
// Re-run scripts/calibrate to re-validate after any change to ratings,
// weights or the win curve -- all three move these odds.

export const ENTRY_PRICE = 500 // $5.00 a season in Classic
export const IQ_ENTRY_PRICE = 0 // Football IQ is free -- it is how you earn
export const REROLL_PRICE = 100 // $1.00 a re-roll, in either mode
export const STARTING_BALANCE = 2100 // $21.00 -- four Classic seasons, plus change
export const FREE_SKIPS = { team: 1, era: 1 }
export const MAX_BOUGHT_REROLLS = 6

// Paid on the final record. The jackpot is the headline, but note how little
// of the expected payout it actually carries -- see PAYOUT_SHARE below.
export const PRIZES = {
  17: 10000,
  16: 8000,
  15: 4000,
  14: 2600,
  13: 1300,
  12: 1000,
  11: 700,
  10: 350,
  9: 150,
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
  expectedPayout: 352, // $3.52 per season, expert play
  rtpExpert: 70.3,
  rtpCasual: 64.0,
  edgeExpert: 29.7,
  profitPerPlay: 148, // $1.48
  rerollValue: 64, // a $1 re-roll adds about $0.64, so it still keeps ~36%
  payingShare: 65.4, // % of seasons that pay something
  jackpotShareOfPayout: 0.2, // % of expected payout carried by the jackpot
}

// Football IQ costs nothing to enter, so it pays a much shallower table.
// It is the earn-back loop: no stat lines, no jackpot, but you cannot go
// broke and get stuck. Roughly $1.04 a season at the measured odds, so about
// three Football IQ seasons funds one Classic entry.
export const IQ_PRIZES = {
  17: 4000,
  16: 2400,
  15: 1600,
  14: 1000,
  13: 650,
  12: 500,
  11: 320,
  10: 160,
  9: 80,
}

export const entryPriceFor = (mode) => (mode === 'iq' ? IQ_ENTRY_PRICE : ENTRY_PRICE)

export const tableFor = (mode) => (mode === 'iq' ? IQ_PRIZES : PRIZES)

export const prizeFor = (wins, mode) => tableFor(mode)[wins] ?? 0

// What a free Football IQ season is worth on average, at the measured odds.
export const IQ_EXPECTED_EARN = 169 // $1.69

export const money = (cents) =>
  (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
