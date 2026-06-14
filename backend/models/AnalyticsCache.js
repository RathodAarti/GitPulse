import mongoose from 'mongoose'

const contributorSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    avatarUrl: { type: String, default: '' },
    commitsCount: { type: Number, default: 0 },
    issuesOpened: { type: Number, default: 0 },
    prsMerged: { type: Number, default: 0 },
    linesChanged: { type: Number, default: 0 },
  },
  { _id: false }
)

const timelineEntrySchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    commits: { type: Number, default: 0 },
    issues: { type: Number, default: 0 },
    prs: { type: Number, default: 0 },
  },
  { _id: false }
)

const analyticsCacheSchema = new mongoose.Schema(
  {
    repoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: [true, 'Repository reference is required'],
      unique: true,
      index: true,
    },
    lastSyncedAt: {
      type: Date,
      required: [true, 'Last sync timestamp is required'],
    },
    overallMetrics: {
      totalCommits: { type: Number, default: 0 },
      totalIssues: { type: Number, default: 0 },
      totalPRs: { type: Number, default: 0 },
      openIssuesCount: { type: Number, default: 0 },
    },
    contributorBreakdown: {
      type: [contributorSchema],
      default: [],
    },
    timelineData: {
      type: [timelineEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
)

const AnalyticsCache = mongoose.model('AnalyticsCache', analyticsCacheSchema)
export default AnalyticsCache
