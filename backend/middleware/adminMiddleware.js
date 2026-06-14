/**
 * Admin Access Restriction Middleware
 * Verifies that the authenticated user's email matches the admin email.
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.email === 'agrathod0701@gmail.com') {
    next()
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Administrative privilege required.',
    })
  }
}

export default adminOnly
