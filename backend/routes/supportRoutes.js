import { Router } from 'express'
import { body } from 'express-validator'
import SupportQuery from '../models/SupportQuery.js'
import protect from '../middleware/authMiddleware.js'
import validate from '../middleware/validatorMiddleware.js'

const router = Router()

const supportValidators = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').trim().isEmail().withMessage('Please provide a valid email address.'),
  body('subject').trim().notEmpty().withMessage('Subject is required.'),
  body('message').trim().notEmpty().withMessage('Message details are required.'),
  validate,
]

const submitHandler = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body
    const query = await SupportQuery.create({
      userId: req.user?._id || null,
      name,
      email,
      subject,
      message,
    })
    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully. Support administrator Rathod Aarti will contact you shortly.',
      query,
    })
  } catch (error) {
    console.error('Support Query Submit Error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to submit support inquiry. Please try again later.',
    })
  }
}

/**
 * @route   POST /api/support
 * @desc    Submit a support ticket (authenticated users)
 * @access  Protected
 */
router.post('/', [protect, ...supportValidators], submitHandler)

/**
 * @route   POST /api/support/public
 * @desc    Submit a support ticket (public — landing page visitors)
 * @access  Public
 */
router.post('/public', supportValidators, submitHandler)

export default router
