import jwt from 'jsonwebtoken'
import axios from 'axios'
import User from '../models/User.js'

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
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    // Verify password against stored hash
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

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


