import { PeopleIcon } from './Icons'

export default function ContributorLeaderboardGrid({ contributors }) {
  if (!contributors || contributors.length === 0) {
    return (
      <div className="empty-state-mini">
        <PeopleIcon size={32} />
        <p>No contributor data available.</p>
      </div>
    )
  }

  return (
    <div className="leaderboard-workspace">
      <div className="leaderboard-header">
        <div className="header-title-group">
          <PeopleIcon size={20} className="header-icon" />
          <h3 className="leaderboard-title">Contributor Velocity Leaderboard</h3>
        </div>
      </div>
      
      <div className="leaderboard-table-wrapper">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th className="text-center">Rank</th>
              <th>Contributor</th>
              <th className="text-right">Commits</th>
              <th className="text-right">Contribution Layer</th>
            </tr>
          </thead>
          <tbody>
            {contributors.map((c, i) => (
              <tr key={c.username || i} className="staggered-row is-visible">
                <td className="text-center">
                  <span className={`rank-badge rank-${i + 1}`}>
                    {i + 1}
                  </span>
                </td>
                <td>
                  <div className="contributor-cell">
                    <img src={c.avatarUrl} alt="" className="contributor-avatar" />
                    <div className="contributor-info">
                      <span className="contributor-name">{c.username || 'Anonymous'}</span>
                      {(c.commitsCount ?? 0) > 1000 && (
                        <span className="top-contributor-badge">
                          Top Contributor
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="text-right font-mono font-bold">
                  {(c.commitsCount ?? 0).toLocaleString()}
                </td>
                <td className="text-right">
                  <div className="velocity-bar-container">
                    <div 
                      className="velocity-bar-fill" 
                      style={{ width: `${((c.commitsCount ?? 0) / (contributors[0].commitsCount || 1)) * 100}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function formatLines(n) {
  if (n == null) return '—'
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}
