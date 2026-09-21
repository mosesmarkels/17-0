# 17-0

**▶ Play it: https://mosesmarkels.github.io/17-0/**

An NFL roster-building game in the style of [82-0](https://www.82-0.com), which
does the same thing for the NBA.

Spin a slot machine that lands on an NFL franchise and a decade, draft the best
player available from that team in that era, and repeat until your roster is
full. A simulation then turns those seven picks into a 17-game record. Going
17-0 is meant to be very nearly impossible.

## The economy

You start with **$21.00** in credits. A **Classic** season costs **$5.00**;
**Football IQ is free**. Extra re-rolls cost **$1.00** in either mode, once the
free team and era skips are spent. Nine records pay, from 9-8 up to a perfect
season.

| Record | Classic | Football IQ | Odds |
| ------ | ------- | ----------- | ---- |
| **17-0** | **$100** | $40 | 1 in 16,000 |
| 16-1 | $80 | $24 | 1 in 2,174 |
| 15-2 | $40 | $16 | 1 in 350 |
| 14-3 | $26 | $10 | 1 in 94 |
| 13-4 | $13 | $6.50 | 1 in 32 |
| 12-5 | $10 | $5 | 1 in 13 |
| 11-6 | $7 | $3.20 | 1 in 7 |
| 10-7 | $3.50 | $1.60 | 1 in 5 |
| 9-8 | $1.50 | $0.80 | 1 in 5 |

The lower tiers were rescaled with the entry price so the return-to-player
holds. The jackpot stays at $100: at 1 in 16,000 it moves the expected payout
by less than a cent either way.

**Football IQ is the earn-back loop.** It costs nothing to enter and pays the
shallower table — about **$1.69 a season**, so roughly three Football IQ
seasons fund one Classic entry. It is also the harder mode, since no stat lines
are shown, which is the point: you earn credits on what you know about football
rather than on what the box score tells you. You can never get stranded with an
empty balance and no way to play.

Expected payout is **$3.52** on a $5.00 entry — a 70.3% RTP against expert
play, 64% against casual play, so the house keeps roughly **$1.48 a season**. A
$1.00 re-roll adds about $0.64 of expected return, and because that is less
than it costs, the house's edge *grows* as players buy them.

The headline figure is deliberately misleading on its own: at 1 in 16,000 the
$100 jackpot supplies only **0.2%** of the expected payout. The economics live
entirely in the small, frequent prizes.

These numbers are fitted, not guessed. `npm run calibrate` replays 400,000
seasons against the live engine under both expert and casual strategies and
prints the RTP, the house edge and the re-roll ladder. **Re-run it after any
change to player ratings, position weights or the win curve** — all three move
the odds.

### This is demo credits, not money

The balance is a number in `localStorage`. Nothing takes a payment or pays a
prize, and no payment processor is wired up. Running this for real stakes is
licensed gambling almost everywhere — an entry fee plus chance plus a prize is
the textbook definition of a lottery — so it would need a gaming licence, a
processor that permits it, age and location verification, and legal advice
before any payment code gets written.

## Profiles and the shared leaderboard

On first visit players pick a name and a colour, stored in their browser. Each
profile also gets a stable id, generated once and kept for good.

**Seasons are attributed to that id, not to the display name.** This is what
keeps one human as one row on the leaderboard: reload the page and play again,
rename yourself, or go back to seasons played before profiles existed — they
all stay collapsed under a single player. Any local season missing an id is
claimed by the current profile on load, since there is only ever one profile
per browser.

Every finished season is written to local history **first** and then posted to
the shared board, so a network failure can never cost someone the game they
just played.

The leaderboard has two tabs: **Everyone** (one row per player, their single
best season, ranked by points) and **My seasons**.

### Going global

Out of the box `src/net/config.js` is empty, so the board runs in local-only
mode and shows just the seasons played in that browser — the app says so
plainly rather than pretending to be global. To connect every player:

1. Create a free project at [supabase.com](https://supabase.com) (no card needed).
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql).
3. In **Project Settings → API**, copy the *Project URL* and the *anon public*
   key into `src/net/config.js`.
4. Push. The workflow redeploys and the board goes global.

The anon key belongs in the client — it ships in the bundle of every Supabase
app — so committing it is fine. What protects the data is the row-level
security in the schema, not secrecy of that key. There is deliberately no
update or delete policy, so posted seasons cannot be rewritten or removed from
a browser.

**One honest limitation:** with no login, the insert policy trusts whoever is
calling it, so a determined person could post a fabricated score or play under
someone else's name. That is the price of a leaderboard with no accounts, and
it is usually the right trade for a game among friends. Closing it means adding
real auth (Supabase has it built in) so that seasons are tied to a verified
user.

## On phones

The layout is built for a phone first. Navigation sits in a fixed bottom bar
under the thumb rather than crowded into the header, which cannot hold the
logo, four links, an avatar and a balance at 375px. Inputs are 16px so iOS does
not zoom the page when one is focused, tap targets are at least 44px, and
`env(safe-area-inset-*)` keeps content clear of the notch and home indicator.

One trap worth knowing if you touch the header CSS: `backdrop-filter` makes an
element a containing block for its `position: fixed` descendants, so with it
applied the bottom nav pins to the bottom of the *header* instead of the
viewport. The mobile breakpoint drops it and paints a solid bar instead.

## Deploying

Every push to `main` rebuilds the site and publishes it to GitHub Pages via
`.github/workflows/deploy.yml` — there is nothing to run by hand. Production
builds use a `/17-0/` base path (see `vite.config.js`) because Pages serves the
site from a subdirectory; local `npm run dev` still runs from the root.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:5180.

To build a static copy for hosting: `npm run build` (output lands in `dist/`).

## The roster

Six rounds, six spots: **QB · RB · WR · WR · TE · DEF** (a full team defense).
Each round you spin once, then pick any player from that franchise-and-decade
who fits a spot you have not filled yet. You get one team re-spin and one era
re-spin per game.

## How scoring works

Each position is scored with its own formula — passing yards and sacks are not
comparable — and every player is then ranked *only against other players at the
same position*, producing a hidden 0–100 rating. The draft board never shows
that number; you see the stat line and read it yourself.

Roster spots are **not** equally important. Each carries a weight:

| Spot | Weight | Share of team strength |
| ---- | ------ | ---------------------- |
| QB   | 3.0    | 32% |
| D/ST | 1.6    | 17% |
| WR   | 1.4    | 15% (each) |
| RB   | 1.3    | 14% |
| TE   | 0.8    | 8%  |

Team strength is `75% × weighted average + 25% × weak link`, where the weak
link is whichever spot is costing the most — how far below the ceiling it sits,
scaled by how much that spot matters. Strength then runs through a non-linear
curve where each additional win is harder to earn than the last.

The practical effect: take the best possible roster and swap in the *worst*
quarterback in the pool and it goes 17-0 → 5-12. Do the same with the tight end
and it only slips to 13-4.

## Project layout

```
src/
  data/
    teams.js      32 franchises: colours, active decades, era-accurate names
    players.js    ~2,070 players, keyed by franchise + decade + position
    defenses.js   209 team-defense units, one per franchise per decade
  game/
    constants.js  decades, roster spots + weights, per-position stat lines
    engine.js     ratings, the draft pool, and the season simulation
  components/     Reel, Field, PlayerList, Game, Results, Home, HowToPlay…
```

## About the data

Every number is a **full-season figure** for the years a player spent with that
franchise inside that decade — not career totals and not per-game.

Players are normalised to a full season *in their own era* — 14 games through
1977, 16 through 2020, 17 since. Anyone who only played part of a season (a
rookie who took over mid-year, a starter who missed time) carries a `g` field
holding their average games played, and their volume stats are scaled up to the
pace they were actually on; those rows are marked **PACE** in the draft list.
Rate stats — passer rating, yards per carry, points allowed per game — already
account for playing time and are never scaled, and no partial season is
extrapolated more than 1.7×.

Without this, active 2020s players get badly underrated: Drake Maye's 2,276
rookie passing yards came in twelve starts, and taken flat they would grade him
as a replacement-level starter rather than the ~3,200-yard pace he was on. The figures
are carefully estimated for gameplay balance; they are not an official
statistical record. Sacks were not an official NFL statistic until 1982 and
tackles were unofficial for a long time after that, so older numbers in
particular are best-available approximations.

Because the engine reads raw statistical output the way the original does,
high-volume modern passing eras grade out generously against the 1960s and 70s.

Teams are shown by abbreviation and team colours. No NFL logos or marks are
used, and no code or assets from 82-0 were copied — only the game concept was
rebuilt from scratch for football.
