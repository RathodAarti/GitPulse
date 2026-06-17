import Groq from 'groq-sdk'
import Repository from '../models/Repository.js'
import AnalyticsCache from '../models/AnalyticsCache.js'

// Lazy client — instantiated on first use so dotenv has time to load
let _groq = null
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return _groq
}

function calcBusFactor(contributors) {
  if (!contributors || contributors.length === 0)
    return { factor: 0, risk: 'unknown', topContributor: null, topPercent: 0 }
  const total = contributors.reduce((s, c) => s + (c.commitsCount || 0), 0)
  if (total === 0) return { factor: 0, risk: 'unknown', topContributor: null, topPercent: 0 }
  const sorted = [...contributors].sort((a, b) => b.commitsCount - a.commitsCount)
  const top = sorted[0]
  const topPercent = Math.round((top.commitsCount / total) * 100)
  let cumulative = 0, factor = 0
  for (const c of sorted) {
    cumulative += c.commitsCount
    factor++
    if (cumulative / total >= 0.5) break
  }
  const risk = topPercent >= 70 ? 'critical' : topPercent >= 50 ? 'high' : topPercent >= 30 ? 'medium' : 'low'
  return { factor, risk, topContributor: top.username, topPercent }
}

function detectVelocityTrend(timelineData) {
  if (!timelineData || timelineData.length < 4)
    return { trend: 'insufficient data', change: 0 }
  const recent = timelineData.slice(-7)
  const older = timelineData.slice(-14, -7)
  const recentAvg = recent.reduce((s, d) => s + d.commits, 0) / recent.length
  const olderAvg = older.length > 0
    ? older.reduce((s, d) => s + d.commits, 0) / older.length
    : recentAvg
  if (olderAvg === 0) return { trend: 'new activity', change: 100 }
  const change = Math.round(((recentAvg - olderAvg) / olderAvg) * 100)
  const trend = change >= 15 ? 'accelerating' : change <= -15 ? 'declining' : 'stable'
  return { trend, change }
}

/**
 * @route   GET /api/ai/repo-insights/:repoId
 * @desc    Generate AI-powered insights for a repository
 * @access  Protected
 */
export const getRepoInsights = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY)
      return res.status(503).json({ success: false, message: 'AI service not configured. Add GROQ_API_KEY to .env' })

    const repo = await Repository.findOne({ _id: req.params.repoId, ownerId: req.user._id })
    if (!repo) return res.status(404).json({ success: false, message: 'Repository not found.' })

    const cache = await AnalyticsCache.findOne({ repoId: repo._id })
    if (!cache) return res.status(404).json({ success: false, message: 'No analytics data. Please sync the repository first.' })

    const { overallMetrics, contributorBreakdown, timelineData } = cache
    const busFactor = calcBusFactor(contributorBreakdown)
    const velocity = detectVelocityTrend(timelineData)

    const topContributors = (contributorBreakdown || [])
      .slice(0, 5)
      .map(c => `${c.username} (${c.commitsCount} commits, ${c.prsMerged} PRs, ${c.issuesOpened} issues)`)
      .join('; ')

    const recentActivity = (timelineData || [])
      .slice(-7)
      .map(d => `${d.date}: ${d.commits} commits, ${d.prs} PRs, ${d.issues} issues`)
      .join('\n')

    const prompt = `You are a senior engineering analytics expert. Analyze this GitHub repository and write a concise, professional insights report.

Repository: ${repo.repoName}
Last synced: ${cache.lastSyncedAt ? new Date(cache.lastSyncedAt).toLocaleDateString() : 'unknown'}

OVERALL METRICS:
- Total commits: ${overallMetrics.totalCommits}
- Total issues: ${overallMetrics.totalIssues} (${overallMetrics.openIssuesCount} open)
- Total pull requests: ${overallMetrics.totalPRs}
- Active contributors: ${contributorBreakdown.length}

TOP CONTRIBUTORS:
${topContributors || 'No contributor data'}

BUS FACTOR ANALYSIS:
- Bus factor: ${busFactor.factor} (${busFactor.risk} risk)
- Top contributor "${busFactor.topContributor}" owns ${busFactor.topPercent}% of commits

VELOCITY TREND (last 7 days vs prior 7 days):
- Trend: ${velocity.trend} (${velocity.change > 0 ? '+' : ''}${velocity.change}% change)

RECENT ACTIVITY (last 7 days):
${recentActivity || 'No recent data'}

Write a structured insights report with these 4 sections (use these exact headings):
1. **Repository Health** — Overall status in 1-2 sentences
2. **Key Findings** — 3 bullet points of the most important observations
3. **Bus Factor Risk** — Assessment of contributor concentration risk
4. **Recommendations** — 2 actionable recommendations for the team

Keep the total response under 300 words. Be specific, data-driven, and direct.`

    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 512,
    })

    res.status(200).json({
      success: true,
      insights: completion.choices[0]?.message?.content || 'Unable to generate insights.',
      meta: { repoName: repo.repoName, busFactor, velocityTrend: velocity, generatedAt: new Date().toISOString() },
    })
  } catch (error) {
    console.error('AI Insights Error:', error.message)
    if (error.status === 401) return res.status(401).json({ success: false, message: 'Invalid Groq API key.' })
    if (error.status === 429) return res.status(429).json({ success: false, message: 'AI rate limit reached. Try again shortly.' })
    res.status(500).json({ success: false, message: 'AI service temporarily unavailable.' })
  }
}

/**
 * @route   POST /api/ai/support-reply
 * @desc    Generate an instant AI response for a support query
 * @access  Public
 */
export const getSupportReply = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY)
      return res.status(503).json({ success: false, message: 'AI service not configured.' })

    const { subject, message } = req.body
    if (!subject || !message)
      return res.status(400).json({ success: false, message: 'Subject and message are required.' })

    const prompt = `You are a helpful support assistant for GitPulse, a GitHub repository analytics platform.

User's query:
Subject: ${subject}
Message: ${message}

Provide a helpful, concise response (under 120 words). Be friendly and professional.

Common topics and how to handle them:
- Login/password issues → suggest using "Forgot Password" on the login page
- GitHub integration → PAT can be set in Settings → GitHub Integration
- Rate limits → 20-minute cache protects against API limits; upgrade to PAT for 5000/hr
- Analytics not loading → click "Sync Data" on the repository page
- How to add a repo → paste GitHub URL in the Dashboard input and click Initialize Monitoring
- AI Insights → click "Generate Insights" on any repository analytics page

Do NOT make up features. If unsure, say the support team will follow up within 24 hours.
Reply directly without greetings or sign-offs.
At the end of your response, add: "If you have further queries, please contact us at: agrathod0701@gmail.com"`

    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 200,
    })

    let reply = completion.choices[0]?.message?.content ||
      'Thank you for reaching out. Our support team will review your query and respond within 24 hours. If you have further queries, please contact us at: agrathod0701@gmail.com'
    
    if (!reply.includes('agrathod0701@gmail.com')) {
      reply += '\n\nIf you have further queries, please contact us at: agrathod0701@gmail.com'
    }

    res.status(200).json({ success: true, reply })
  } catch (error) {
    console.error('AI Support Reply Error:', error.message)
    res.status(500).json({ success: false, message: 'AI service temporarily unavailable.' })
  }
}
