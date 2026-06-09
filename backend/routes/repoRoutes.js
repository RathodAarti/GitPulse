import { Router } from 'express'
import { body } from 'express-validator'
import {
  addRepository,
  getRepositories,
  deleteRepository,
} from '../controllers/repoController.js'
import protect from '../middleware/authMiddleware.js'
import validate from '../middleware/validatorMiddleware.js'

const router = Router()

// All repository routes are JWT-protected
router.use(protect)

/**
 * @route   GET /api/repos
 * @desc    List all tracked repositories for the current user
 * @access  Protected
 */
router.get('/', getRepositories)

/**
 * @route   POST /api/repos
 * @desc    Onboard a new GitHub repository for tracking
 * @access  Protected
 */
router.post(
  '/',
  [
    body('repoUrl')
      .trim()
      .notEmpty()
      .withMessage('Repository URL is required.')
      .isURL()
      .withMessage('Please provide a valid URL.'),
    validate,
  ],
  addRepository
)

/**
 * @route   DELETE /api/repos/:id
 * @desc    Remove a tracked repository and its cache
 * @access  Protected
 */
router.delete('/:id', deleteRepository)

export default router
