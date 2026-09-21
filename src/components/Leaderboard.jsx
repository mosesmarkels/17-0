export default function Leaderboard({ games }) {
  return (
    <div className="wrap page">
      <h2>Your Best Rosters</h2>
      {games.length === 0 ? (
        <p>No seasons logged yet. Play a game and your results land here.</p>
      ) : (
        <div className="rows">
          {games.map((g, i) => (
            <div className="lb-row" key={i}>
              <div className={`lb-rank${i < 3 ? ' top' : ''}`}>{i + 1}</div>
              <div>
                <div className="lb-rec">{g.wins}-{g.losses}</div>
                <div className="lb-meta">
                  {g.mode === 'iq' ? 'Football IQ' : 'Classic'} · strength {g.strength} · {g.qb}
                </div>
              </div>
              <div className="lb-pts">{g.points.toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
