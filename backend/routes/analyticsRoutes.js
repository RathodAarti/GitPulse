import { Router } from 'express'
import { getAnalytics } from '../controllers/analyticsController.js'
import protect from '../middleware/authMiddleware.js'

const router = Router()

// All analytics routes are JWT-protected
router.use(protect)

/**
 * @route   GET /api/analytics/:repoId
 * @desc    Sync (if stale) and return compiled analytics for a repository
 * @access  Protected
 */
router.get('/:repoId', getAnalytics)

export default router
