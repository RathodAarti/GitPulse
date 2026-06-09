import { Router } from 'express'
import protect from '../middleware/authMiddleware.js'
import { getRepoInsights, getSupportReply } from '../controllers/aiController.js'

const router = Router()

/**
 * @route   GET /api/ai/repo-insights/:repoId
 * @desc    Generate AI-powered insights for a repository
 * @access  Protected
 */
router.get('/repo-insights/:repoId', protect, getRepoInsights)

/**
 * @route   POST /api/ai/support-reply
 * @desc    Generate an instant AI response for a support query (public)
 * @access  Public
 */
router.post('/support-reply', getSupportReply)

export default router
