import jwt from 'jsonwebtoken'
import axios from 'axios'
import User from '../models/User.js'
import AccountActivity from '../models/AccountActivity.js'

// Helper function to log account activity
const logAccountActivity = async (userId, action, details = {}, req = null) => {
  try {
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || null
    const userAgent = req?.headers?.['user-agent'] || null
    await AccountActivity.create({
      userId,
      action,
      details,
      ipAddress,
      userAgent,
      deviceInfo: userAgent ? userAgent.substring(0, 500) : null
    })
  } catch (error) {
    console.error('Error logging account activity:', error)
  }
}

/**
 * Generate a signed JWT token for the given user ID.
 * Token expires in 24 hours.
 */
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  })
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.',
      })
    }

    if (password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be 8+ characters with A-z and 0-9.',
      })
    }

    // Check for existing user with same email
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      })
    }

    // Create user (password is auto-hashed via pre-save hook)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    })

    // Log account creation
    await logAccountActivity(user._id, 'PROFILE_UPDATE', { type: 'account_created' }, req)

    // Sign token and respond
    const token = signToken(user._id)

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        githubToken: null,
      },
    })
  } catch (error) {
    console.error('Register Error:', error.message)

    // Handle Mongoose duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      })
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.',
    })
  }
}

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT token
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      })
    }

    // Find user and explicitly select the password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      '+password'
    )

    if (!user) {
      // Log failed login
      await logAccountActivity(null, 'LOGIN_FAILURE', { email: email.toLowerCase(), reason: 'user_not_found' }, req)
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    // Check if account is scheduled for deletion
    if (user.isDeleting && user.deletionScheduledAt) {
      // Cancel deletion if user logs back in
      user.isDeleting = false
      user.deletionScheduledAt = null
      await user.save()
      await logAccountActivity(user._id, 'DELETION_CANCELLED', {}, req)
    }

    // Verify password against stored hash
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      await logAccountActivity(user._id, 'LOGIN_FAILURE', { reason: 'invalid_password' }, req)
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    // Log successful login
    await logAccountActivity(user._id, 'LOGIN_SUCCESS', {}, req)

    // Sign token and respond
    const token = signToken(user._id)

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        githubToken: user.githubToken,
        isDeleting: user.isDeleting,
        deletionScheduledAt: user.deletionScheduledAt
      },
    })
  } catch (error) {
    console.error('Login Error:', error.stack || error.message)
    res.status(500).json({
      success: false,
      message: 'Server error during authentication. Please try again.',
    })
  }
}

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile details
 * @access  Private
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      })
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        githubToken: user.githubToken,
        securityQuestion: user.securityQuestion || null,
      },
    })
  } catch (error) {
    console.error('Get Profile Error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Server error retrieving profile.',
    })
  }
}

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile settings
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      })
    }

    const { name, password, githubToken, securityQuestion, securityAnswer } = req.body

    if (name !== undefined) user.name = name
    if (githubToken !== undefined) user.githubToken = githubToken
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' })
      }
      user.password = password
    }
    if (securityQuestion !== undefined) user.securityQuestion = securityQuestion
    if (securityAnswer && securityAnswer.trim()) user.securityAnswer = securityAnswer

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        githubToken: user.githubToken,
      },
    })
  } catch (error) {
    console.error('Get Profile Error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Server error during profile update.',
    })
  }
}

/**
 * @route   GET /api/auth/github-status
 * @desc    Test GitHub PAT connection and return rate limit quota details
 * @access  Private
 */
export const checkGithubStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      })
    }

    const token = user.githubToken
    if (!token) {
      return res.status(200).json({
        success: true,
        connected: false,
        message: 'No GitHub Personal Access Token configured. Running in unauthenticated mode (60 requests/hour limit).',
        quota: null,
      })
    }

    try {
      const response = await axios.get('https://api.github.com/user', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'GitPulse-Server/1.0',
          Authorization: `token ${token}`,
        },
        timeout: 8000,
      })

      // Extract rate limits from GitHub headers
      const rateLimit = {
        limit: parseInt(response.headers['x-ratelimit-limit'] || '5000', 10),
        remaining: parseInt(response.headers['x-ratelimit-remaining'] || '5000', 10),
        reset: parseInt(response.headers['x-ratelimit-reset'] || '0', 10),
      }

      res.status(200).json({
        success: true,
        connected: true,
        username: response.data.login,
        avatarUrl: response.data.avatar_url,
        scopes: response.headers['x-oauth-scopes'] || 'none',
        quota: rateLimit,
      })
    } catch (ghError) {
      if (ghError.response?.status === 401) {
        return res.status(401).json({
          success: false,
          connected: false,
          message: 'Invalid or expired GitHub Personal Access Token.',
        })
      }
      throw ghError
    }
  } catch (error) {
    console.error('GitHub Status Check Error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to connect to the GitHub API. Please check your network connection.',
    })
  }
}

const GRACE_PERIOD_DAYS = 30

// Initiate account deletion
export const initiateDeletion = async (req, res) => {
  try {
    const { password } = req.body
    const user = await User.findById(req.user._id).select('+password')
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' })
    }

    // Verify password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password.' })
    }

    // Set deletion schedule
    const deletionDate = new Date()
    deletionDate.setDate(deletionDate.getDate() + GRACE_PERIOD_DAYS)
    user.isDeleting = true
    user.deletionScheduledAt = deletionDate
    await user.save()

    await logAccountActivity(user._id, 'DELETION_INITIATED', { gracePeriodEnds: deletionDate }, req)

    res.status(200).json({
      success: true,
      message: 'Account deletion initiated. You have 30 days to log back in to cancel.',
      deletionScheduledAt: deletionDate
    })
  } catch (error) {
    console.error('Initiate Deletion Error:', error)
    res.status(500).json({ success: false, message: 'Server error initiating account deletion.' })
  }
}

// Cancel account deletion
export const cancelDeletion = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' })
    }

    user.isDeleting = false
    user.deletionScheduledAt = null
    await user.save()

    await logAccountActivity(user._id, 'DELETION_CANCELLED', {}, req)

    res.status(200).json({ success: true, message: 'Account deletion cancelled.' })
  } catch (error) {
    console.error('Cancel Deletion Error:', error)
    res.status(500).json({ success: false, message: 'Server error cancelling deletion.' })
  }
}

// Get account activity history
export const getAccountActivity = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const activities = await AccountActivity.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))

    const total = await AccountActivity.countDocuments({ userId: req.user._id })

    res.status(200).json({ success: true, activities, total, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Get Activity Error:', error)
    res.status(500).json({ success: false, message: 'Server error retrieving activity history.' })
  }
}

// Export account activity
export const exportAccountActivity = async (req, res) => {
  try {
    const activities = await AccountActivity.find({ userId: req.user._id }).sort({ createdAt: -1 })
    const exportData = activities.map(activity => ({
      action: activity.action,
      details: activity.details,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent,
      timestamp: activity.createdAt.toISOString()
    }))

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', 'attachment; filename=account-activity.json')
    res.status(200).json(exportData)
  } catch (error) {
    console.error('Export Activity Error:', error)
    res.status(500).json({ success: false, message: 'Server error exporting activity history.' })
  }
}

// Admin: Permanently delete users whose grace period expired
export const permanentlyDeleteExpiredAccounts = async (req, res) => {
  try {
    const now = new Date()
    const usersToDelete = await User.find({ isDeleting: true, deletionScheduledAt: { $lte: now } })

    for (const user of usersToDelete) {
      await logAccountActivity(user._id, 'PERMANENT_DELETION', {}, null)
      await AccountActivity.deleteMany({ userId: user._id })
      await User.findByIdAndDelete(user._id)
      // TODO: Also delete any other user-related data (repositories, etc.)
    }

    res.status(200).json({ success: true, deletedCount: usersToDelete.length })
  } catch (error) {
    console.error('Permanent Deletion Error:', error)
    res.status(500).json({ success: false, message: 'Server error during permanent deletion.' })
  }
}


