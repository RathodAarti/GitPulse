import { Router } from 'express'
import { body } from 'express-validator'
import {
  getUsers,
  updateUser,
  deleteUser,
  getSupportQueries,
  resolveSupportQuery,
  deleteSupportQuery,
} from '../controllers/adminController.js'
import protect from '../middleware/authMiddleware.js'
import adminOnly from '../middleware/adminMiddleware.js'
import validate from '../middleware/validatorMiddleware.js'

const router = Router()

// Apply authentication and administrator safeguards globally to all routes below
router.use(protect)
router.use(adminOnly)

/**
 * @route   GET /api/admin/users
 * @desc    Get all users in the system
 * @access  Protected (Admin Only)
 */
router.get('/users', getUsers)

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Modify a user's account details
 * @access  Protected (Admin Only)
 */
router.put(
  '/users/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
    body('email').optional().trim().isEmail().withMessage('Please provide a valid email.'),
    validate,
  ],
  updateUser
)

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Remove a user account and wipe their synced caches/repos
 * @access  Protected (Admin Only)
 */
router.delete('/users/:id', deleteUser)

/**
 * @route   GET /api/admin/queries
 * @desc    View all customer support complaints and queries
 * @access  Protected (Admin Only)
 */
router.get('/queries', getSupportQueries)

/**
 * @route   PUT /api/admin/queries/:id
 * @desc    Update support query resolution status
 * @access  Protected (Admin Only)
 */
router.put(
  '/queries/:id',
  [
    body('status').trim().isIn(['open', 'resolved']).withMessage('Invalid query resolution status.'),
    validate,
  ],
  resolveSupportQuery
)

/**
 * @route   DELETE /api/admin/queries/:id
 * @desc    Delete/clear a support query ticket
 * @access  Protected (Admin Only)
 */
router.delete('/queries/:id', deleteSupportQuery)

export default router
