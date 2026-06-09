import mongoose from 'mongoose'

const repositorySchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner reference is required'],
      index: true,
    },
    repoName: {
      type: String,
      required: [true, 'Repository name is required'],
      trim: true,
    },
    repoUrl: {
      type: String,
      required: [true, 'Repository URL is required'],
      trim: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

/**
 * Compound unique index on ownerId + repoName prevents a single
 * user from onboarding the same repository twice.
 */
repositorySchema.index({ ownerId: 1, repoName: 1 }, { unique: true })

const Repository = mongoose.model('Repository', repositorySchema)
export default Repository
