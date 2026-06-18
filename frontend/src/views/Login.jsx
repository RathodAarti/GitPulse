import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AlertIcon, EyeIcon, EyeOffIcon, ArrowLeftIcon } from '../components/Icons'
import Logo from '../components/Logo'
import SocialLoginModal from '../components/SocialLoginModal'

export default function Login() {
  const { login, register: authRegister } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [isSignUp, setIsSignUp] = useState(() => {
    return new URLSearchParams(location.search).get('tab') === 'signup'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [socialModal, setSocialModal] = useState(null)

  const validateField = (name, value) => {
    let error = ''
    if (name === 'email') {
      if (!value) error = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format'
    } else if (name === 'password') {
      if (!value) error = 'Password is required'
      else if (isSignUp) {
        if (value.length < 8) error = 'Min 8 characters'
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) error = 'Must include A–Z, a–z, and 0–9'
      }
    } else if (name === 'name' && isSignUp) {
      if (!value) error = 'Name is required'
    }
    return error
  }

  const switchMode = (toSignUp) => {
    setIsSignUp(toSignUp)
    setFormData({ name: '', email: '', password: '' })
    setErrors({})
    setShowPassword(false)
  }

  const handleSocialLogin = async (account) => {
    setSocialModal(null)
    setSubmitting(true)
    const result = await login(account.email, 'SocialAuth2026!')
    if (result.success) {
      navigate('/dashboard', { replace: true })
    } else {
      const regResult = await authRegister(account.name, account.email, 'SocialAuth2026!')
      if (regResult.success) {
        navigate('/dashboard', { replace: true })
      } else {
        setErrors({ form: `Could not sign in as ${account.name}. Try email & password instead.` })
      }
    }
    setSubmitting(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key])
      if (err) newErrors[key] = err
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)
    try {
      const result = isSignUp
        ? await authRegister(formData.name, formData.email, formData.password)
        : await login(formData.email, formData.password)

      if (result.success) {
        navigate('/dashboard', { replace: true })
      } else {
        setErrors({ form: result.message })
      }
    } catch {
      setErrors({ form: 'An unexpected error occurred.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="ref-auth-page">
      <Link to="/" className="ref-auth-back-to-home">
        <ArrowLeftIcon size={18} />
        <span>Back to Home</span>
      </Link>

      <div className={`ref-auth-container ${isSignUp ? 'ref-auth-is-signup' : ''}`}>
        {/* Left decorative panel */}
        <div className="ref-auth-left-panel">
          <div className="ref-auth-left-logo">
            <div className="ref-auth-logo-circle"></div>
            <span>WEBSITE</span>
          </div>

          <div className="ref-auth-left-title">
            {isSignUp ? 'Sign Up' : 'Sign In'}
            <span className="ref-auth-title-underline"></span>
          </div>
        </div>

        {/* Arrow between panels */}
        <div className="ref-auth-floating-arrow" onClick={() => switchMode(!isSignUp)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>

        {/* Right form panel */}
        <div className="ref-auth-right-panel">
          {/* Tabs */}
          <div className="ref-auth-tabs">
            <button
              className={`ref-auth-tab ${!isSignUp ? 'ref-auth-tab-active' : ''}`}
              onClick={() => switchMode(false)}
            >
              LOGIN
            </button>
            <button
              className={`ref-auth-tab ${isSignUp ? 'ref-auth-tab-active' : ''}`}
              onClick={() => switchMode(true)}
            >
              SIGN UP
            </button>
          </div>

          {/* Form */}
          <form className="ref-auth-form" onSubmit={handleSubmit} noValidate>
            {isSignUp && (
              <div className="ref-auth-input-group">
                <label>FULL NAME</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'ref-auth-input-error' : ''}
                />
                {errors.name && <span className="ref-auth-error-text">{errors.name}</span>}
              </div>
            )}

            <div className="ref-auth-input-group">
              <label>EMAIL</label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'ref-auth-input-error' : ''}
              />
              {errors.email && <span className="ref-auth-error-text">{errors.email}</span>}
            </div>

            <div className="ref-auth-input-group">
              <label>PASSWORD</label>
              <div className="ref-auth-password-wrapper">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'ref-auth-input-error' : ''}
                />
                <button
                  type="button"
                  className="ref-auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
              {errors.password && <span className="ref-auth-error-text">{errors.password}</span>}
            </div>

            {isSignUp && (
              <div className="ref-auth-terms-group">
                <input type="checkbox" id="terms" className="ref-auth-terms-checkbox" />
                <label htmlFor="terms">
                  I agree all statement in <span className="ref-auth-terms-link">terms of service</span>
                </label>
              </div>
            )}

            {errors.form && (
              <div className="ref-auth-form-error">
                <AlertIcon size={16} />
                {errors.form}
              </div>
            )}

            <button
              type="submit"
              className="ref-auth-submit-btn"
              disabled={submitting}
            >
              {submitting ? (isSignUp ? 'CREATING ACCOUNT...' : 'LOGGING IN...') : (isSignUp ? 'SIGN UP' : 'LOGIN')}
            </button>
          </form>
        </div>
      </div>

      {/* Background circles */}
      <div className="ref-auth-bg-circle ref-auth-bg-circle-1"></div>
      <div className="ref-auth-bg-circle ref-auth-bg-circle-2"></div>

      {socialModal && (
        <SocialLoginModal
          provider={socialModal}
          isRegister={isSignUp}
          onClose={() => setSocialModal(null)}
          onLogin={handleSocialLogin}
        />
      )}
    </div>
  )
}