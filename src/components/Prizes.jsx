import {
  PRIZES,
  IQ_PRIZES,
  ODDS,
  ENTRY_PRICE,
  REROLL_PRICE,
  IQ_EXPECTED_EARN,
  STARTING_BALANCE,
  HOUSE,
  money,
} from '../game/economy.js'

const RECORDS = Object.keys(PRIZES)
  .map(Number)
  .sort((a, b) => b - a)

export default function Prizes() {
  return (
    <div className="wrap page">
      <h2>Prizes &amp; Odds</h2>
      <p>
        You start with <strong>{money(STARTING_BALANCE)}</strong> in credits. A
        Classic season costs{' '}
        <strong>{money(ENTRY_PRICE)}</strong>,{' '}
        <strong>Football IQ is free</strong>, and extra re-rolls are{' '}
        <strong>{money(REROLL_PRICE)}</strong> each in either mode. You are paid
        on your final record.
      </p>

      <table>
        <thead>
          <tr>
            <th>Record</th>
            <th>Classic</th>
            <th>Football IQ</th>
            <th>Odds</th>
          </tr>
        </thead>
        <tbody>
          {RECORDS.map((w) => (
            <tr key={w}>
              <td className={w === 17 ? 'jackpot' : ''}>
                {w}-{17 - w}{w === 17 ? ' — perfect season' : ''}
              </td>
              <td className={w === 17 ? 'jackpot' : ''}>{money(PRIZES[w])}</td>
              <td>{money(IQ_PRIZES[w])}</td>
              <td>1 in {ODDS[w].toLocaleString()}</td>
            </tr>
          ))}
          <tr>
            <td>8-9 or worse</td>
            <td>—</td>
            <td>—</td>
            <td>—</td>
          </tr>
        </tbody>
      </table>

      <h3>Running out of credits</h3>
      <p>
        You can't get stranded. <strong>Football IQ costs nothing to enter</strong>{' '}
        and pays a shallower table, worth about{' '}
        <strong>{money(IQ_EXPECTED_EARN)}</strong> a season — so roughly three
        Football IQ seasons fund one Classic entry. It is the harder mode, with
        no stat lines to read, which is the point: you earn credits on what you
        actually know about football rather than on what the box score tells you.
      </p>

      <h3>The honest numbers</h3>
      <ul>
        <li>
          Something pays out on about <strong>{HOUSE.payingShare}%</strong> of
          seasons.
        </li>
        <li>
          Expected return is <strong>{money(HOUSE.expectedPayout)}</strong> on a{' '}
          {money(ENTRY_PRICE)} entry — an RTP of{' '}
          <strong>{HOUSE.rtpExpert}%</strong> for strong play and{' '}
          {HOUSE.rtpCasual}% for casual play. The house keeps the rest.
        </li>
        <li>
          A {money(REROLL_PRICE)} re-roll is worth about{' '}
          {money(HOUSE.rerollValue)} in added expected return, so re-rolls carry
          a heavier margin than the entry does.
        </li>
        <li>
          The {money(PRIZES[17])} jackpot is the headline, but at 1 in{' '}
          {ODDS[17].toLocaleString()} it carries only{' '}
          <strong>{HOUSE.jackpotShareOfPayout}%</strong> of the expected payout.
          Nearly all of the return comes from the ordinary records.
        </li>
        <li>
          Odds were measured over 400,000 simulated seasons against the live
          engine. They move if player ratings, position weights or the win
          curve change.
        </li>
      </ul>

      <div className="note">
        <strong>These are demo credits, not money.</strong> Nothing here takes a
        real payment or pays a real prize, and the balance lives only in this
        browser. Running this for actual stakes is licensed gambling in
        essentially every jurisdiction — prize plus chance plus an entry fee is
        the textbook definition — so it would need a gaming licence, a processor
        that permits it, age and location checks, and legal advice well before
        any payment code is written.
      </div>
    </div>
  )
}
