import jwt from 'jsonwebtoken'
import User from '../models/User.js'

/**
 * JWT Authentication Middleware
 * Extracts the Bearer token from the Authorization header,
 * verifies the signature, and attaches the decoded user
 * document to `req.user` for downstream handlers.
 */
const protect = async (req, res, next) => {
  try {
    let token = null

    // Extract token from Authorization header
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      })
    }

    // Verify token signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach user to request (exclude password)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is invalid. User not found.',
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is malformed.',
      })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.',
      })
    }

    console.error('Auth Middleware Error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Internal authentication error.',
    })
  }
}

export default protect
