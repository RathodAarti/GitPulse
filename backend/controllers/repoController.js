import axios from 'axios'
import Repository from '../models/Repository.js'
import AnalyticsCache from '../models/AnalyticsCache.js'

/**
 * Regex to extract {owner}/{repo} from various GitHub URL formats:
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo.git
 *   http://github.com/owner/repo/
 *   github.com/owner/repo
 */
const GITHUB_REPO_REGEX =
  /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?(?:\/)?$/

/**
 * Build authorization headers for GitHub API requests.
 * Prefers the user's personal token, falls back to the app-level PAT.
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
 * @route   POST /api/repos
 * @desc    Onboard a new GitHub repository for tracking
 * @access  Protected
 */
export const addRepository = async (req, res) => {
  try {
    const { repoUrl } = req.body

    // Extract owner and repo via regex
    const match = repoUrl.trim().match(GITHUB_REPO_REGEX)
    if (!match) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid GitHub URL format. Expected: https://github.com/owner/repo',
      })
    }

    const [, owner, repo] = match
    const repoName = `${owner}/${repo}`

    // Check for duplicates under this user
    const existing = await Repository.findOne({
      ownerId: req.user._id,
      repoName,
    })
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Repository "${repoName}" is already being tracked.`,
      })
    }

    // Verify the repository exists on GitHub
    try {
      await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: githubHeaders(req.user),
        timeout: 10000,
      })
    } catch (ghError) {
      if (ghError.response?.status === 404) {
        return res.status(404).json({
          success: false,
          message: `Repository "${repoName}" was not found on GitHub.`,
        })
      }
      if (ghError.response?.status === 403) {
        return res.status(429).json({
          success: false,
          message: 'GitHub API rate limit exceeded. Please try again later.',
        })
      }
      throw ghError // Re-throw unexpected errors
    }

    // Persist the repository document
    const repository = await Repository.create({
      ownerId: req.user._id,
      repoName,
      repoUrl: `https://github.com/${owner}/${repo}`,
    })

    res.status(201).json({
      success: true,
      repo: {
        id: repository._id,
        _id: repository._id,
        repoName: repository.repoName,
        repoUrl: repository.repoUrl,
        addedAt: repository.addedAt,
        lastSyncedAt: null,
        stats: { commits: 0, prs: 0, issues: 0, contributors: 0 },
      },
    })
  } catch (error) {
    console.error('Add Repository Error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to onboard repository. Please try again.',
    })
  }
}

/**
 * @route   GET /api/repos
 * @desc    List all tracked repositories for the authenticated user
 * @access  Protected
 */
export const getRepositories = async (req, res) => {
  try {
    const repos = await Repository.find({ ownerId: req.user._id }).sort({
      addedAt: -1,
    })

    // Enrich each repo with its cached analytics stats
    const enriched = await Promise.all(
      repos.map(async (repo) => {
        const cache = await AnalyticsCache.findOne({ repoId: repo._id })
        return {
          id: repo._id,
          _id: repo._id,
          repoName: repo.repoName,
          repoUrl: repo.repoUrl,
          addedAt: repo.addedAt,
          lastSyncedAt: cache?.lastSyncedAt || null,
          stats: cache
            ? {
                commits: cache.overallMetrics.totalCommits,
                prs: cache.overallMetrics.totalPRs,
                issues: cache.overallMetrics.totalIssues,
                contributors: cache.contributorBreakdown.length,
              }
            : { commits: 0, prs: 0, issues: 0, contributors: 0 },
        }
      })
    )

    res.status(200).json({ success: true, repos: enriched })
  } catch (error) {
    console.error('Get Repositories Error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve repositories.',
    })
  }
}

/**
 * @route   DELETE /api/repos/:id
 * @desc    Remove a tracked repository and its analytics cache
 * @access  Protected
 */
export const deleteRepository = async (req, res) => {
  try {
    const repo = await Repository.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    })

    if (!repo) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found or you do not have permission.',
      })
    }

    // Remove associated analytics cache
    await AnalyticsCache.deleteOne({ repoId: repo._id })

    // Remove the repository document
    await Repository.deleteOne({ _id: repo._id })

    res.status(200).json({
      success: true,
      message: `Repository "${repo.repoName}" has been removed.`,
    })
  } catch (error) {
    console.error('Delete Repository Error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to remove repository.',
    })
  }
}
