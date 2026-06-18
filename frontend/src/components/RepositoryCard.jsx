import { Link, useNavigate } from 'react-router-dom'
import { RepoIcon, ClockIcon, DashboardIcon, TrashIcon, LinkIcon } from './Icons'

export default function RepositoryCard({ repo, onDelete }) {
  const { repoName, repoUrl, lastSyncedAt, stats } = repo
  const navigate = useNavigate()

  const timeSinceSync = lastSyncedAt
    ? getTimeSince(new Date(lastSyncedAt))
    : 'Never synced'

  const handleCardClick = (e) => {
    // Prevent navigation if the user clicked an interactive action element inside the card
    if (e.target.closest('a') || e.target.closest('button')) {
      return
    }
    navigate(`/dashboard/repo/${repo._id || repo.id}`)
  }

  return (
    <div className="repo-card animate-fade" onClick={handleCardClick}>
      <div className="repo-card-body">
        <div className="repo-card-header">
          <div className="repo-card-title">
            <RepoIcon size={20} className="repo-icon-primary" />
            <h3>{repoName || extractRepoName(repoUrl)}</h3>
          </div>
          <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="repo-link-external" title="View on GitHub">
            <LinkIcon size={16} />
          </a>
        </div>
        
        <p className="repo-url-text">{repoUrl}</p>

        <div className="repo-stats-grid">
          <div className="repo-stat-item">
            <div className="stat-num">{stats?.commits ?? '—'}</div>
            <div className="stat-name">Commits</div>
          </div>
          <div className="repo-stat-item">
            <div className="stat-num">{stats?.prs ?? '—'}</div>
            <div className="stat-name">PRs</div>
          </div>
          <div className="repo-stat-item">
            <div className="stat-num">{stats?.contributors ?? '—'}</div>
            <div className="stat-name">Developers</div>
          </div>
        </div>

        <div className="repo-card-footer">
          <div className="sync-status">
            <span className="pulse-dot-mini"></span>
            Synced {timeSinceSync}
          </div>
          
          <div className="card-action-row">
            <Link to={`/dashboard/repo/${repo._id || repo.id}`} className="btn btn-primary btn-sm">
              <DashboardIcon size={14} /> View Analytics
            </Link>
            <button 
              className="btn btn-danger btn-sm" 
              aria-label={`Delete ${repoName || extractRepoName(repoUrl)}`}
              onClick={() => {
                if (window.confirm(`Remove "${repoName || extractRepoName(repoUrl)}" from your dashboard?`)) {
                  onDelete(repo._id || repo.id)
                }
              }}
            >
              <TrashIcon size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function extractRepoName(url) {
  if (!url) return 'Unknown'
  const parts = url.replace(/\.git$/, '').split('/')
  return parts.slice(-2).join('/')
}

function getTimeSince(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
