import { validationResult } from 'express-validator'

/**
 * Validator Middleware
 * Runs after express-validator check chains. If any validation
 * errors exist, returns a 400 with a structured error array.
 * Otherwise passes control to the next handler.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    })
  }

  next()
}

export default validate
