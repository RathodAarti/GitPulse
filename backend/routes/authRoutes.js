import { Router } from 'express'
import { body } from 'express-validator'
import { register, login, getProfile, updateProfile, checkGithubStatus } from '../controllers/authController.js'
import protect from '../middleware/authMiddleware.js'
import validate from '../middleware/validatorMiddleware.js'
import User from '../models/User.js'

const router = Router()

/**
 * @route   POST /api/auth/forgot-password/verify
 * @desc    Step 1 — check email exists, return security question
 * @access  Public
 */
router.post(
  '/forgot-password/verify',
  [body('email').trim().isEmail().withMessage('Valid email is required.'), validate],
  async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email.toLowerCase().trim() })
      if (!user) return res.status(404).json({ success: false, message: 'No account found with that email.' })
      if (!user.securityQuestion) return res.status(400).json({ success: false, message: 'This account has no security question set. Please contact support.' })
      res.json({ success: true, question: user.securityQuestion })
    } catch { res.status(500).json({ success: false, message: 'Server error.' }) }
  }
)

/**
 * @route   POST /api/auth/forgot-password/reset
 * @desc    Step 2 — verify answer then set new password
 * @access  Public
 */
router.post(
  '/forgot-password/reset',
  [
    body('email').trim().isEmail().withMessage('Valid email is required.'),
    body('answer').trim().notEmpty().withMessage('Security answer is required.'),
    body('newPassword').isLength({ min: 8 }).withMessage('Min 8 characters.')
      .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Must include A–Z, a–z, and 0–9.'),
    validate,
  ],
  async (req, res) => {
    try {
      const { email, answer, newPassword } = req.body
      const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+securityAnswer')
      if (!user) return res.status(404).json({ success: false, message: 'No account found with that email.' })
      const match = await user.compareSecurityAnswer(answer)
      if (!match) return res.status(401).json({ success: false, message: 'Incorrect security answer. Please try again.' })
      user.password = newPassword
      await user.save()
      res.json({ success: true, message: 'Password reset successfully. You can now sign in.' })
    } catch (err) {
      console.error('Reset error:', err.message)
      res.status(500).json({ success: false, message: 'Server error during password reset.' })
    }
  }
)

/**
 * @route   GET /api/auth/github-status
 * @desc    Test GitHub PAT connection and check rate limits
 * @access  Private
 */
router.get('/github-status', protect, checkGithubStatus)

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile details
 * @access  Private
 */
router.get('/profile', protect, getProfile)

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile settings (name, password, githubToken)
 * @access  Private
 */
router.put(
  '/profile',
  [
    protect,
    body('name').optional().trim().isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters.'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    body('securityQuestion').optional().trim(),
    body('securityAnswer').optional().trim(),
    validate,
  ],
  updateProfile
)

/**
 * @route   POST /api/auth/register
 * @desc    Create a new user account
 * @access  Public
 */
router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required.')
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters.'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters.')
      .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must include uppercase, lowercase, and number.'),
    body('securityQuestion').optional().trim(),
    body('securityAnswer').optional().trim(),
    validate,
  ],
  register
)

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user credentials and return JWT
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address.')
      .normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.'),
    validate,
  ],
  login
)

export default router
