import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { repoService } from '../services/api'
import { DEMO_REPO_DATA, DEMO_VELOCITY, DEMO_CONTRIBUTORS } from '../constants/demoData'
import MetricSummaryWidget from '../components/MetricSummaryWidget'
import VelocityAreaChart from '../components/VelocityAreaChart'
import ContributorLeaderboardGrid from '../components/ContributorLeaderboardGrid'
import AIInsightsPanel from '../components/AIInsightsPanel'
import { RepoIcon, LockIcon, SyncIcon, ArrowLeftIcon, AlertIcon, CommitIcon, IssueIcon, PrIcon, PeopleIcon } from '../components/Icons'

const SYNC_COOLDOWN_MINUTES = 20

export default function RepositoryView() {
  const { repoId } = useParams()

  const [repo, setRepo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)
  const [lockMinutes, setLockMinutes] = useState(0)

  const fetchRepo = useCallback(async () => {
    try {
      const data = await repoService.getDetails(repoId)
      const repoData = data?.repo || data
      setRepo(repoData)
      updateLock(repoData.lastSyncedAt)
    } catch (err) {
      // Fallback to demo data
      setRepo(DEMO_REPO_DATA)
      updateLock(DEMO_REPO_DATA.lastSyncedAt)
      setError('Unable to reach backend. Showing cached snapshot.')
    } finally {
      setLoading(false)
    }
  }, [repoId])

  useEffect(() => {
    fetchRepo()
  }, [fetchRepo])

  // Re-calculate lock timer every 30s
  useEffect(() => {
    if (!repo?.lastSyncedAt) return
    const interval = setInterval(() => updateLock(repo.lastSyncedAt), 30000)
    return () => clearInterval(interval)
  }, [repo?.lastSyncedAt])

  function updateLock(lastSyncedAt) {
    if (!lastSyncedAt) { setLockMinutes(0); return }
    const elapsed = (Date.now() - new Date(lastSyncedAt).getTime()) / 60000
    const remaining = Math.ceil(SYNC_COOLDOWN_MINUTES - elapsed)
    setLockMinutes(remaining > 0 ? remaining : 0)
  }

  const handleSync = async () => {
    if (lockMinutes > 0 || syncing) return
    setSyncing(true)
    setError(null)
    try {
      const data = await repoService.getDetails(repoId)
      const updated = data?.repo || data
      setRepo(updated)
      updateLock(updated.lastSyncedAt)
    } catch (err) {
      setError(err.response?.data?.message || 'Sync failed. Please try again later.')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="repo-view-workspace is-loading animate-slide-up">
        <div className="skeleton-shimmer" style={{ width: 160, height: 36, borderRadius: 'var(--radius-sm)', marginBottom: 28 }} />
        
        {/* Header Skeleton */}
        <div style={{ marginBottom: 36 }}>
          <div className="skeleton-shimmer" style={{ width: '40%', height: 32, marginBottom: 12 }} />
          <div className="skeleton-shimmer" style={{ width: '25%', height: 16 }} />
        </div>

        {/* Sync Bar Skeleton */}
        <div className="skeleton-shimmer" style={{ height: 74, borderRadius: 'var(--radius-md)', marginBottom: 28 }} />

        {/* Metrics Row Skeleton */}
        <div className="skeleton-metrics">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-metric-widget">
              <div className="skeleton-shimmer skeleton-metric-label" />
              <div className="skeleton-shimmer skeleton-metric-value" />
            </div>
          ))}
        </div>

        {/* Grid Skeletons */}
        <div className="dashboard-grid">
          <div className="skeleton-shimmer" style={{ height: 420, borderRadius: 'var(--radius-lg)' }} />
          <div className="skeleton-shimmer" style={{ height: 420, borderRadius: 'var(--radius-lg)' }} />
        </div>
      </div>
    )
  }

  if (!repo) {
    return (
      <div className="empty-state">
        <div className="empty-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><AlertIcon size={48} /></div>
        <h3>Repository not found</h3>
        <p>The repository you're looking for doesn't exist or has been removed.</p>
        <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }} id="back-to-home-404">
          <ArrowLeftIcon size={14} /> Back to Dashboard
        </Link>
      </div>
    )
  }

  const metrics = repo.metrics || {}
  const velocity = repo.velocityData || DEMO_VELOCITY
  const contributors = repo.contributors || DEMO_CONTRIBUTORS

  return (
    <div className="repo-view-workspace animate-slide-up">
      {error && error.includes('Rate Limit') && (
        <div className="rate-limit-marquee animate-fade">
          <div className="marquee-content">
            <AlertIcon size={20} />
            <span>⚡ API Rate Limit Triggered: GitPulse is operating in high-performance cached mode. Synchronous updates paused.</span>
          </div>
          <button className="marquee-close" onClick={() => setError(null)} aria-label="Dismiss">×</button>
        </div>
      )}

      {/* Workspace Navigation & Sync Bar */}
      <div className="workspace-left">
        {/* Professional Repo Header Card */}
        <div className="repo-hero-card stagger-item delay-1">
          <div className="repo-hero-top">
            <Link to="/dashboard" className="back-link">
              <ArrowLeftIcon size={14} /> Back to Dashboard
            </Link>
            <div className="repo-hero-actions">
              <a
                href={repo.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <RepoIcon size={14} /> View on GitHub
              </a>
              <button
                className="btn btn-primary btn-sm btn-sync"
                onClick={handleSync}
                disabled={lockMinutes > 0 || syncing}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {syncing ? 'Synchronizing...' : lockMinutes > 0 ? `Locked ${lockMinutes}m` : <><SyncIcon size={13} /> Sync Now</>}
              </button>
            </div>
          </div>

          <div className="repo-hero-body">
            <div className="repo-hero-icon">
              <RepoIcon size={28} color="var(--primary)" />
            </div>
            <div className="repo-hero-info">
              <h1 className="repo-hero-name">{repo.repoName}</h1>
              <div className="repo-hero-meta">
                <span className="repo-hero-url">{repo.repoUrl}</span>
                <span className="repo-hero-divider">·</span>
                <span className={`repo-hero-status ${lockMinutes > 0 ? 'status-fresh' : 'status-stale'}`}>
                  <span className="repo-hero-dot" />
                  {lockMinutes > 0 ? 'Live Data' : 'Data Stale'}
                </span>
                <span className="repo-hero-divider">·</span>
                <span className="repo-hero-sync-time">
                  Last synced {repo.lastSyncedAt ? new Date(repo.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* 4-metric grid — 2×2 layout */}
        <div className="metric-row stagger-item delay-3">
          <MetricSummaryWidget
            label="Total Commits"
            value={metrics.commits ?? 0}
            change={metrics.commitsChange ?? 0}
            icon={<CommitIcon size={24} />}
          />
          <MetricSummaryWidget
            label="Open Issues"
            value={metrics.issues ?? 0}
            change={metrics.issuesChange ?? 0}
            icon={<IssueIcon size={24} />}
          />
          <MetricSummaryWidget
            label="Pull Requests"
            value={metrics.prs ?? 0}
            change={metrics.prsChange ?? 0}
            icon={<PrIcon size={24} />}
          />
          <MetricSummaryWidget
            label="Active Contributors"
            value={metrics.contributors ?? 0}
            change={metrics.contributorsChange ?? 0}
            icon={<PeopleIcon size={24} />}
          />
        </div>

        {/* AI Repository Intelligence — above the chart */}
        <div className="stagger-item delay-4">
          <AIInsightsPanel repoId={repoId} />
        </div>

        {/* High-Fidelity Area Chart */}
        <div className="stagger-item delay-5">
          <div className="chart-canvas-wrapper">
            <VelocityAreaChart data={velocity} />
          </div>
        </div>
      </div>

      <div className="workspace-right">
        {/* Ranked Leaderboard Grid */}
        <div className="stagger-item delay-5">
          <ContributorLeaderboardGrid contributors={contributors} />
        </div>
      </div>

      {/* Error Overlays */}
      {error && (
        <div className="alert-banner marquee-style animate-slide-down">
          <AlertIcon size={18} />
          <span>{error}</span>
          <button className="alert-dismiss" onClick={() => setError(null)}>✕</button>
        </div>
      )}
    </div>
  )
}


