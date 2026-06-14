import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { repoService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import RepositoryCard from '../components/RepositoryCard'
import MetricSummaryWidget from '../components/MetricSummaryWidget'
import { RepoIcon, CommitIcon, PrIcon, IssueIcon, AlertIcon, SearchIcon, PeopleIcon, ShieldIcon } from '../components/Icons'

// Demo data for fallback
const DEMO_REPOS = [
  {
    id: 'demo-1',
    repoName: 'facebook/react',
    repoUrl: 'https://github.com/facebook/react',
    lastSyncedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    addedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    stats: { commits: 18420, prs: 3210, issues: 1892, contributors: 1640 },
  },
  {
    id: 'demo-2',
    repoName: 'vercel/next.js',
    repoUrl: 'https://github.com/vercel/next.js',
    lastSyncedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    addedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    stats: { commits: 22150, prs: 5080, issues: 2410, contributors: 3020 },
  },
  {
    id: 'demo-3',
    repoName: 'microsoft/vscode',
    repoUrl: 'https://github.com/microsoft/vscode',
    lastSyncedAt: new Date(Date.now() - 120 * 60000).toISOString(),
    addedAt: new Date(Date.now() - 120 * 60000).toISOString(),
    stats: { commits: 112000, prs: 8900, issues: 6200, contributors: 1950 },
  },
]

export default function Home() {
  const { user } = useAuth()
  const [repos, setRepos] = useState([])
  const [repoUrl, setRepoUrl] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('addedAt')
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchRepos = useCallback(async () => {
    try {
      const data = await repoService.getAll()
      setRepos(data?.repos || data || [])
    } catch (err) {
      setRepos(DEMO_REPOS)
      setAlert({
        type: 'error',
        message: 'Unable to connect to backend. Displaying cached data.',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRepos()
  }, [fetchRepos])

  const handleOnboard = async (e) => {
    e.preventDefault()
    if (!repoUrl.trim() || submitting) return

    setSubmitting(true)
    setAlert(null)

    try {
      const data = await repoService.onboard(repoUrl.trim())
      const newRepo = data?.repo || data
      setRepos((prev) => [newRepo, ...prev])
      setRepoUrl('')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to onboard repository.'
      if (err.response?.status === 429) {
        setAlert({
          type: 'error',
          message: '⚡ API Rate Limit Reached — Please wait before adding more repositories.',
        })
      } else {
        setAlert({ type: 'error', message: msg })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await repoService.delete(id)
      setRepos((prev) => prev.filter((r) => (r._id || r.id) !== id))
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to remove repository.',
      })
    }
  }

  const dismissAlert = () => setAlert(null)

  // Global Metrics Calculations
  const totalCommits = repos.reduce((sum, r) => sum + (r.stats?.commits || 0), 0)
  const totalPRs = repos.reduce((sum, r) => sum + (r.stats?.prs || 0), 0)
  const totalIssues = repos.reduce((sum, r) => sum + (r.stats?.issues || 0), 0)
  const totalContributors = repos.reduce((sum, r) => sum + (r.stats?.contributors || 0), 0)

  // Filtering & Sorting logic
  const filteredRepos = repos
    .filter((repo) => {
      const nameMatch = repo.repoName?.toLowerCase().includes(searchTerm.toLowerCase())
      const urlMatch = repo.repoUrl?.toLowerCase().includes(searchTerm.toLowerCase())
      return nameMatch || urlMatch
    })
    .sort((a, b) => {
      if (sortBy === 'commits') {
        return (b.stats?.commits || 0) - (a.stats?.commits || 0)
      }
      if (sortBy === 'contributors') {
        return (b.stats?.contributors || 0) - (a.stats?.contributors || 0)
      }
      if (sortBy === 'name') {
        return (a.repoName || '').localeCompare(b.repoName || '')
      }
      return new Date(b.addedAt || 0) - new Date(a.addedAt || 0)
    })

  return (
    <div className="workspace-pulse-container animate-slide-up">
      {/* Security Question Prompt */}
      {!user?.securityQuestion && (
        <div className="security-prompt-banner animate-fade">
          <div className="prompt-content">
            <ShieldIcon size={20} />
            <span>Protect your account: Set a security question to enable password recovery.</span>
          </div>
          <Link to="/settings" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            Set Security Question
          </Link>
        </div>
      )}
      
      {alert && alert.type === 'error' && alert.message.includes('Rate Limit') && (
        <div className="rate-limit-marquee animate-fade">
          <div className="marquee-content">
            <AlertIcon size={20} />
            <span>⚡ Signal Saturation: GitPulse is operating in optimized high-performance mode. Synchronous updates temporarily suspended.</span>
          </div>
          <button className="marquee-close" onClick={() => setAlert(null)} aria-label="Dismiss">×</button>
        </div>
      )}

      {/* Onboarding Tool Dock */}
      <div className={`onboard-tool-dock reveal-on-scroll ${submitting ? 'is-loading' : ''}`}>
        <form onSubmit={handleOnboard} className="onboard-form-refined">
          <div className="onboard-input-group">
            <label htmlFor="repo-url-input" className="sr-only">GitHub Repository URL</label>
            <RepoIcon size={20} className="onboard-icon" aria-hidden="true" />
            <input
              id="repo-url-input"
              type="text"
              placeholder="Paste a GitHub URL (e.g. https://github.com/facebook/react)"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={submitting}
              className="onboard-input-refined"
              aria-label="GitHub Repository URL"
            />
          </div>
          <button type="submit" className="btn btn-primary onboard-submit" disabled={submitting}>
            {submitting ? 'Adding Repository...' : 'Track Repository'}
          </button>
        </form>
        {submitting && (
          <div className="onboard-loading-overlay animate-fade" role="status">
            <div className="loader-pulse" />
            <span>Fetching repository data...</span>
          </div>
        )}
      </div>

      {/* Global Metrics Summary */}
      <div className="metric-row reveal-on-scroll">
        <MetricSummaryWidget 
          label="Total Commits" 
          value={totalCommits} 
          icon={<CommitIcon size={20} />} 
        />
        <MetricSummaryWidget 
          label="Pull Requests" 
          value={totalPRs} 
          icon={<PrIcon size={20} />} 
        />
        <MetricSummaryWidget 
          label="Open Issues" 
          value={totalIssues} 
          icon={<IssueIcon size={20} />} 
        />
        <MetricSummaryWidget 
          label="Contributors" 
          value={totalContributors} 
          icon={<PeopleIcon size={20} />} 
        />
      </div>

      <div className="catalog-controls reveal-on-scroll">
        <div className="search-box">
          <label htmlFor="search-input" className="sr-only">Search repositories</label>
          <SearchIcon size={18} className="search-icon" aria-hidden="true" />
          <input
            id="search-input"
            type="text"
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search repositories"
          />
        </div>
        <div className="sort-controls">
          <label htmlFor="sort-select" className="sr-only">Sort repositories</label>
          <select 
            id="sort-select"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort repositories"
          >
            <option value="addedAt">Recently Added</option>
            <option value="commits">Most Commits</option>
            <option value="contributors">Most Contributors</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-grid">
          {[1, 2, 3].map(i => <div key={i} className="skeleton-card skeleton-shimmer"></div>)}
        </div>
      ) : (
        <div className="repo-grid stagger-item delay-7">
          {filteredRepos.map((repo, idx) => (
            <div key={repo._id || repo.id} className="reveal-on-scroll" style={{ transitionDelay: `${idx * 0.05}s` }}>
              <RepositoryCard
                repo={repo}
                onDelete={handleDelete}
              />
            </div>
          ))}
          {filteredRepos.length === 0 && (
            <div className="empty-state animate-fade">
              <RepoIcon size={48} />
              <p>{searchTerm ? `No repositories match "${searchTerm}".` : 'No repositories yet. Paste a GitHub URL above to start tracking.'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
