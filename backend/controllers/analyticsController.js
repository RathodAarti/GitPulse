import axios from 'axios'
import Repository from '../models/Repository.js'
import AnalyticsCache from '../models/AnalyticsCache.js'

/** Cache validity window in minutes */
const SYNC_COOLDOWN_MINUTES = 20

/**
 * Build GitHub API authorization headers.
 * Prefers user-level PAT, falls back to the application-level default.
 */
function githubHeaders(user) {
  const token = user?.githubToken || process.env.GITHUB_DEFAULT_PAT
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'GitPulse-Server/1.0',
  }
  if (token) {
    headers.Authorization = `token ${token}`
  }
  return headers
}

/**
 * @route   GET /api/analytics/:repoId
 * @desc    Sync (if stale) and return compiled analytics for a repository
 * @access  Protected
 *
 * Implements the 20-minute cache chronometer guard:
 *   If (now - lastSyncedAt) < 20 min → serve from MongoDB cache
 *   Otherwise → fire concurrent GitHub API requests, recompute, persist
 */
export const getAnalytics = async (req, res) => {
  try {
    const { repoId } = req.params

    // ── Resolve the repository document ──────────────────────────
    const repo = await Repository.findOne({
      _id: repoId,
      ownerId: req.user._id,
    })

    if (!repo) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found or access denied.',
      })
    }

    // Extract owner/repo from the stored name (e.g. "facebook/react")
    const [owner, repoName] = repo.repoName.split('/')

    // ── Check existing cache ─────────────────────────────────────
    let cache = await AnalyticsCache.findOne({ repoId: repo._id })

    // ── Chronometer Guard: serve from cache if data is fresh ─────
    if (cache && cache.lastSyncedAt) {
      const elapsedMs = Date.now() - new Date(cache.lastSyncedAt).getTime()
      const elapsedMinutes = elapsedMs / (1000 * 60)

      if (elapsedMinutes < SYNC_COOLDOWN_MINUTES) {
        return res.status(200).json({
          success: true,
          fromCache: true,
          repo: buildResponsePayload(repo, cache),
        })
      }
    }

    // ── Concurrent Extraction Pipeline via Promise.all ────────────
    const headers = githubHeaders(req.user)
    const baseUrl = `https://api.github.com/repos/${owner}/${repoName}`

    let commitsData = []
    let issuesData = []
    let statsData = []

    try {
      const [commitsRes, issuesRes, statsRes] = await Promise.all([
        axios.get(`${baseUrl}/commits`, {
          params: { per_page: 100 },
          headers,
          timeout: 15000,
        }),
        axios.get(`${baseUrl}/issues`, {
          params: { per_page: 100, state: 'all' },
          headers,
          timeout: 15000,
        }),
        axios.get(`${baseUrl}/stats/contributors`, {
          headers,
          timeout: 15000,
        }).catch(() => ({ data: [] })), // Gracefully handle stats failures
      ])

      commitsData = commitsRes.data || []
      issuesData = issuesRes.data || []
      statsData = statsRes.data || []
    } catch (ghError) {
      // If GitHub is unreachable and we have a stale cache, serve it
      if (cache) {
        console.warn(
          `GitHub API error for ${repo.repoName}, serving stale cache:`,
          ghError.message
        )
        return res.status(200).json({
          success: true,
          fromCache: true,
          stale: true,
          repo: buildResponsePayload(repo, cache),
        })
      }

      // No cache exists — propagate the error
      if (ghError.response?.status === 403) {
        return res.status(429).json({
          success: false,
          message: 'GitHub API rate limit exceeded. Try again later.',
        })
      }
      throw ghError
    }

    // ── Map-Reduction & Statistical Accumulation ─────────────────

    // Separate issues from pull requests (GitHub includes PRs in /issues)
    const pureIssues = issuesData.filter((item) => !item.pull_request)
    const pullRequests = issuesData.filter((item) => item.pull_request)

    // Contributor breakdown — tally by commit author login
    const contributorMap = new Map()

    // 1. Initial tally from recent 100 commits (to get avatars and active status)
    for (const commit of commitsData) {
      const login = commit.author?.login || commit.commit?.author?.name || 'unknown'
      const avatar = commit.author?.avatar_url || ''

      if (!contributorMap.has(login)) {
        contributorMap.set(login, {
          username: login,
          avatarUrl: avatar,
          commitsCount: 0,
          issuesOpened: 0,
          prsMerged: 0,
          linesChanged: 0,
        })
      }
      contributorMap.get(login).commitsCount += 1
    }

    // 2. Integrate full stats data for lines changed and TOTAL commits
    let totalCommitsSum = 0
    if (Array.isArray(statsData) && statsData.length > 0) {
      for (const item of statsData) {
        const login = item.author?.login
        const lines = (item.weeks || []).reduce((acc, week) => acc + (week.a || 0) + (week.d || 0), 0)
        const totalCommits = item.total || 0
        totalCommitsSum += totalCommits

        if (login && contributorMap.has(login)) {
          contributorMap.get(login).commitsCount = totalCommits // Use true total
          contributorMap.get(login).linesChanged = lines
        } else if (login) {
          contributorMap.set(login, {
            username: login,
            avatarUrl: item.author?.avatar_url || '',
            commitsCount: totalCommits,
            issuesOpened: 0,
            prsMerged: 0,
            linesChanged: lines,
          })
        }
      }
    } else {
      // Fallback if stats API fails/empty
      totalCommitsSum = commitsData.length
    }

    // Overall metrics
    const overallMetrics = {
      totalCommits: totalCommitsSum,
      totalIssues: pureIssues.length,
      totalPRs: pullRequests.length,
      openIssuesCount: pureIssues.filter((i) => i.state === 'open').length,
    }

    // Tally issues opened per contributor
    for (const issue of pureIssues) {
      const login = issue.user?.login || 'unknown'
      if (contributorMap.has(login)) {
        contributorMap.get(login).issuesOpened += 1
      } else {
        contributorMap.set(login, {
          username: login,
          avatarUrl: issue.user?.avatar_url || '',
          commitsCount: 0,
          issuesOpened: 1,
          prsMerged: 0,
          linesChanged: 0,
        })
      }
    }

    // Tally PRs merged per contributor
    for (const pr of pullRequests) {
      const login = pr.user?.login || 'unknown'
      if (contributorMap.has(login)) {
        contributorMap.get(login).prsMerged += 1
      } else {
        contributorMap.set(login, {
          username: login,
          avatarUrl: pr.user?.avatar_url || '',
          commitsCount: 0,
          issuesOpened: 0,
          prsMerged: 1,
          linesChanged: 0,
        })
      }
    }

    // Sort contributors by commit count descending
    const contributorBreakdown = Array.from(contributorMap.values()).sort(
      (a, b) => b.commitsCount - a.commitsCount
    )

    // Timeline data — group commits, issues, and PRs by date (YYYY-MM-DD)
    const timelineMap = new Map()

    for (const commit of commitsData) {
      const dateStr = commit.commit?.author?.date?.substring(0, 10)
      if (!dateStr) continue
      if (!timelineMap.has(dateStr)) {
        timelineMap.set(dateStr, { date: dateStr, commits: 0, issues: 0, prs: 0 })
      }
      timelineMap.get(dateStr).commits += 1
    }

    for (const issue of pureIssues) {
      const dateStr = issue.created_at?.substring(0, 10)
      if (!dateStr) continue
      if (!timelineMap.has(dateStr)) {
        timelineMap.set(dateStr, { date: dateStr, commits: 0, issues: 0, prs: 0 })
      }
      timelineMap.get(dateStr).issues += 1
    }

    for (const pr of pullRequests) {
      const dateStr = pr.created_at?.substring(0, 10)
      if (!dateStr) continue
      if (!timelineMap.has(dateStr)) {
        timelineMap.set(dateStr, { date: dateStr, commits: 0, issues: 0, prs: 0 })
      }
      timelineMap.get(dateStr).prs += 1
    }

    // Sort timeline chronologically
    const timelineData = Array.from(timelineMap.values()).sort(
      (a, b) => a.date.localeCompare(b.date)
    )

    // ── Persist / Upsert the analytics cache ─────────────────────
    const now = new Date()

    if (cache) {
      cache.lastSyncedAt = now
      cache.overallMetrics = overallMetrics
      cache.contributorBreakdown = contributorBreakdown
      cache.timelineData = timelineData
      await cache.save()
    } else {
      cache = await AnalyticsCache.create({
        repoId: repo._id,
        lastSyncedAt: now,
        overallMetrics,
        contributorBreakdown,
        timelineData,
      })
    }

    // ── Stream final response ────────────────────────────────────
    res.status(200).json({
      success: true,
      fromCache: false,
      repo: buildResponsePayload(repo, cache),
    })
  } catch (error) {
    console.error('Analytics Sync Error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to sync analytics. Please try again.',
    })
  }
}

/**
 * Build a standardized response payload combining repository
 * metadata with analytics cache data.
 */
function buildResponsePayload(repo, cache) {
  const breakdown = cache.contributorBreakdown || []

  return {
    id: repo._id,
    _id: repo._id,
    repoName: repo.repoName,
    repoUrl: repo.repoUrl,
    lastSyncedAt: cache.lastSyncedAt,
    metrics: {
      commits: cache.overallMetrics.totalCommits,
      commitsChange: 0,
      issues: cache.overallMetrics.totalIssues,
      issuesChange: 0,
      prs: cache.overallMetrics.totalPRs,
      prsChange: 0,
      contributors: breakdown.length,
      contributorsChange: 0,
    },
    contributors: breakdown.map((c) => ({
      username: c.username,
      avatarUrl: c.avatarUrl,
      commits: c.commitsCount,
      prs: c.prsMerged,
      linesChanged: c.linesChanged,
    })),
    velocityData: (cache.timelineData || []).map((t) => ({
      date: formatDateShort(t.date),
      commits: t.commits,
      issues: t.issues,
      prs: t.prs,
    })),
  }
}

/**
 * Convert "YYYY-MM-DD" to a short display format like "May 26"
 */
function formatDateShort(dateStr) {
  try {
    const d = new Date(dateStr + 'T00:00:00Z')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
  } catch {
    return dateStr
  }
}
