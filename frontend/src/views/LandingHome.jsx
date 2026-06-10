import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import PublicNavbar from '../components/PublicNavbar'
import { ZapIcon, ShieldIcon, TrophyIcon, SearchIcon, RepoIcon, CommitIcon, PrIcon, IssueIcon } from '../components/Icons'
import Logo from '../components/Logo'

/* ── Quick preview card for a public repo ── */
function RepoPreviewCard({ data }) {
  return (
    <div className="landing-repo-card">
      <div className="landing-repo-header">
        <RepoIcon size={18} color="var(--primary)" />
        <span className="landing-repo-name">{data.full_name}</span>
        {data.language && <span className="landing-repo-lang">{data.language}</span>}
      </div>
      {data.description && (
        <p className="landing-repo-desc">{data.description}</p>
      )}
      <div className="landing-repo-stats">
        <span><CommitIcon size={14} /> {data.stargazers_count?.toLocaleString()} stars</span>
        <span><PrIcon size={14} /> {data.forks_count?.toLocaleString()} forks</span>
        <span><IssueIcon size={14} /> {data.open_issues_count?.toLocaleString()} issues</span>
      </div>
      <div className="landing-repo-cta">
        <a href={data.html_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
          View on GitHub
        </a>
        <Link to="/login" className="btn btn-primary btn-sm">
          Track in GitPulse →
        </Link>
      </div>
    </div>
  )
}

export default function LandingHome() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [repoQuery, setRepoQuery] = useState('')
  const [previewData, setPreviewData] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState('')

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const handlePreview = async (e) => {
    e.preventDefault()
    if (!repoQuery.trim()) return

    // Extract owner/repo from URL or direct input
    let repoPath = repoQuery.trim()
    const urlMatch = repoPath.match(/github\.com\/([^/]+\/[^/\s?#]+)/)
    if (urlMatch) repoPath = urlMatch[1]
    repoPath = repoPath.replace(/\.git$/, '').replace(/^\//, '')

    if (!repoPath.includes('/')) {
      setPreviewError('Please enter a valid GitHub repo (e.g. facebook/react or a GitHub URL)')
      return
    }

    setPreviewLoading(true)
    setPreviewError('')
    setPreviewData(null)

    try {
      const res = await axios.get(`https://api.github.com/repos/${repoPath}`)
      setPreviewData(res.data)
    } catch (err) {
      if (err.response?.status === 404) {
        setPreviewError('Repository not found. Check the name and try again.')
      } else if (err.response?.status === 403) {
        setPreviewError('GitHub API rate limit reached. Sign in to GitPulse for full access.')
      } else {
        setPreviewError('Could not fetch repository data. Please try again.')
      }
    } finally {
      setPreviewLoading(false)
    }
  }

  return (
    <div className="landing-page">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="hero-workspace">
        <div className="hero-container">
          <div className="hero-text-content stagger-item delay-1">
            <div className="hero-badge">
              <span className="pulse-dot"></span>
              Real-time Analytics Active
            </div>
            <h1 className="hero-title animate-tagline">
              <span className="tagline-word">Git</span>
              <span className="tagline-word">Intelligence,</span>
              <span className="tagline-word highlight-pulse">Pulsing</span>
              <span className="tagline-word">in</span>
              <span className="tagline-word highlight-realtime">Real-Time.</span>
            </h1>
            <p>
              Instantly explore any GitHub repository — commits, contributors, velocity trends, and health scores.
              Sign in to track unlimited repos and unlock full analytics.
            </p>
            <div className="hero-cta-row stagger-item delay-2">
              <Link to="/login" className="btn btn-primary btn-large">
                Start Tracking Free ➔
              </Link>
            </div>
            <div className="hero-meta-text stagger-item delay-3">
              No credit card required. Works with any public repository.
            </div>
          </div>

          {/* Repo Search Panel */}
          <div className="hero-visual stagger-item delay-4">
            <div className="landing-search-panel">
              <div className="landing-search-header">
                <RepoIcon size={20} color="var(--primary)" />
                <span>Preview any repository — no sign in needed</span>
              </div>

              <form onSubmit={handlePreview} className="landing-search-form">
                <div className="landing-search-input-wrap">
                  <SearchIcon size={18} className="landing-search-icon" />
                  <input
                    type="text"
                    value={repoQuery}
                    onChange={e => { setRepoQuery(e.target.value); setPreviewError('') }}
                    placeholder="github.com/facebook/react or facebook/react"
                    className="landing-search-input"
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={previewLoading}>
                  {previewLoading ? 'Fetching...' : 'Preview Repo'}
                </button>
              </form>

              {previewError && (
                <p className="landing-search-error">{previewError}</p>
              )}

              {previewData && <RepoPreviewCard data={previewData} />}

              {!previewData && !previewError && !previewLoading && (
                <div className="landing-search-hints">
                  <p className="landing-search-hint-title">Try these popular repos:</p>
                  {['facebook/react', 'vercel/next.js', 'microsoft/vscode'].map(r => (
                    <button
                      key={r}
                      className="landing-search-hint-btn"
                      onClick={() => { setRepoQuery(r); setPreviewError('') }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}

              <div className="landing-search-upgrade">
                <Link to="/login">Sign in</Link> to track unlimited repos, sync data, and see full contributor analytics.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="features-matrix">
        <div className="section-header text-center stagger-item delay-5">
          <h2 className="section-title">Everything you need to understand your codebase</h2>
          <p className="section-subtitle">From commit velocity to contributor leaderboards — all in one place.</p>
        </div>

        <div className="feature-grid">
          <div className="feature-card stagger-item delay-6" tabIndex="0">
            <div className="feature-icon-wrapper"><ZapIcon size={24} /></div>
            <h3>Instant Repository Insights</h3>
            <p>Paste any GitHub URL and see commits, PRs, issues, and top contributors in seconds. No setup needed.</p>
          </div>
          <div className="feature-card stagger-item delay-7" tabIndex="0">
            <div className="feature-icon-wrapper"><ShieldIcon size={24} /></div>
            <h3>Smart Data Caching</h3>
            <p>20-minute intelligent cache prevents rate limit exhaustion while keeping your analytics fresh and fast.</p>
          </div>
          <div className="feature-card stagger-item delay-8" tabIndex="0">
            <div className="feature-icon-wrapper"><TrophyIcon size={24} /></div>
            <h3>Contributor Leaderboards</h3>
            <p>Identify top performers, spot bus factor risks, and celebrate your most active contributors automatically.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-main">
            <Logo size={40} showText={true} />
            <h2>Experience the Heartbeat.</h2>
            <Link to="/login" className="btn btn-primary btn-large">
              Start Tracking Free ➔
            </Link>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <a href="#">Documentation</a>
              <a href="#">GitHub</a>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 GitPulse Analytics. Professional-grade repository telemetry.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
