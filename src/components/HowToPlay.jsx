import { ROUNDS, SLOTS } from '../game/constants.js'

const TOTAL_WEIGHT = SLOTS.reduce((a, s) => a + s.weight, 0)

export default function HowToPlay() {
  return (
    <div className="wrap page">
      <h2>How to Play</h2>
      <p>
        The object of 17-0 is to assemble a historical NFL roster capable of a
        perfect season. Your record is decided by a non-linear simulation that
        weighs the statistical output of seven picks across a 17-game schedule.
      </p>

      <h3>1. The Decades</h3>
      <p>The player pool is drawn from seven decades:</p>
      <ul>
        <li>1960s · 1970s · 1980s · 1990s · 2000s · 2010s · 2020s</li>
      </ul>
      <p>
        Franchises only appear in decades they actually played in, and they are
        listed under the name they wore at the time — a 1970s Titans spin is the
        Houston Oilers.
      </p>

      <h3>2. The Roster</h3>
      <p>{ROUNDS} rounds, {ROUNDS} roster spots:</p>
      <ul>
        <li><strong>QB</strong> — one quarterback</li>
        <li><strong>RB</strong> — one running back</li>
        <li><strong>WR ×2</strong> — two wide receivers</li>
        <li><strong>TE</strong> — one tight end</li>
        <li><strong>DEF</strong> — one full team defense from a single decade</li>
      </ul>

      <h3>3. How Players Are Judged</h3>
      <p>
        A quarterback's 4,000 passing yards and a defense's 44 sacks cannot be
        added together, so each position is scored on its own terms and then
        ranked <em>only against other players at that position</em>.
      </p>
      <p>
        You never see that score. The draft board shows you the stat line and
        nothing else — reading it is the game.
      </p>
      <p>
        Everyone is measured <strong>per full season</strong>, in their own era —
        14 games in the 1960s and 70s, 16 through 2020, 17 since. A player who
        only started part of the year gets their volume stats scaled up to the
        pace they were on, and their row is marked <strong>PACE</strong>. That is
        what stops an active 2020s player like Drake Maye, who took over as a
        rookie twelve games in, from being judged as though those were his
        numbers for a whole year. Rate stats — passer rating, yards per carry,
        points allowed per game — already account for playing time, so they are
        left untouched, and a partial season is never extrapolated more than
        1.7×.
      </p>
      <table>
        <thead>
          <tr><th>Position</th><th>What the engine reads</th></tr>
        </thead>
        <tbody>
          <tr><td>QB</td><td>Pass yards, TDs, interceptions, passer rating, rush yards</td></tr>
          <tr><td>RB</td><td>Rush yards, rush TDs, yards per carry, receptions, receiving yards</td></tr>
          <tr><td>WR / TE</td><td>Receptions, receiving yards, receiving TDs, yards per catch</td></tr>
          <tr><td>DEF</td><td>Points allowed, sacks, takeaways, yards allowed</td></tr>
        </tbody>
      </table>

      <h3>4. Not Every Spot Counts The Same</h3>
      <p>
        Football is not a game of equal parts, and neither is this. Each roster
        spot carries a different weight toward your team strength:
      </p>
      <table>
        <thead>
          <tr><th>Spot</th><th>Weight</th><th>What that means</th></tr>
        </thead>
        <tbody>
          {SLOTS.map((s) => (
            <tr key={s.id}>
              <td>{s.label}</td>
              <td>{s.weight.toFixed(1)}</td>
              <td>{Math.round((s.weight / TOTAL_WEIGHT) * 100)}% of team strength</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Landing a franchise quarterback is worth more than any other pick on the
        board, and whiffing on one is close to unrecoverable. A thin tight end,
        by contrast, costs you a game or two and not a season. Both receiver
        spots carry identical weight — they are interchangeable, so choosing
        which one to fill is never a real decision.
      </p>

      <h3>5. The Simulation</h3>
      <ul>
        <li>
          <strong>The weak link matters.</strong> Team strength is 75% your
          weighted average and 25% your weak link — whichever spot is costing you
          most, measured by how far below the ceiling it sits <em>and</em> how
          much that spot matters. One real hole costs you games no matter how
          loaded the rest of the roster is.
        </li>
        <li>
          <strong>The curve is not linear.</strong> Wins get exponentially
          harder to earn as strength climbs. Going from 12 wins to 14 is far
          harder than going from 4 to 6.
        </li>
        <li>
          <strong>17-0 is meant to be brutal.</strong> A perfect season requires
          a roster at or near the ceiling of the pool at every single spot.
        </li>
      </ul>

      <h3>6. The Skips</h3>
      <p>
        You get <strong>one team re-spin and one era re-spin per game</strong>.
        A team re-spin keeps your decade and rolls a new franchise; an era
        re-spin keeps the franchise and rolls a new decade. Spend them when the
        machine strands you somewhere thin.
      </p>

      <h3>7. Modes</h3>
      <ul>
        <li><strong>Classic</strong> — every stat line is visible.</li>
        <li><strong>Football IQ</strong> — stats hidden. Names only.</li>
      </ul>

      <div className="note">
        <strong>About the numbers.</strong> Every stat shown is a full-season
        figure for the years that player spent with that franchise inside that
        decade — not career totals. They are carefully estimated for gameplay,
        not an official statistical record: sacks were not an official NFL
        statistic until 1982 and tackles were unofficial for decades after that,
        so older figures are best-available approximations. Because the engine
        reads raw output the way the original does, high-volume modern passing
        eras do grade out generously against the 1960s and 70s.
      </div>
    </div>
  )
}
