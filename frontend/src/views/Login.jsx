import { useState } from 'react'
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
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) error = 'Must include A-Z, a-z, and 0-9'
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
    <div className="animated-login-page">
      <Link to="/" className="animated-login-back">
        <ArrowLeftIcon size={18} />
        <span>Back to Home</span>
      </Link>

      <div className="animated-login-wrapper">
        {/* Animated Slider Container */}
        <div className="animated-login-container">
          {/* Forms Container */}
          <div className={`animated-login-forms-container ${isSignUp ? 'animated-login-is-signup' : ''}`}>
            {/* Login Form Side */}
            <div className="animated-login-form animated-login-form-login">
              <div className="animated-login-header">
                <Logo size={70} showText={true} />
                <p>Welcome back! Please login to your account.</p>
              </div>
              <form className="animated-login-form-inner" onSubmit={handleSubmit} noValidate>
                <div className="animated-login-input-group">
                  <label>Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'animated-login-input-error' : ''}
                  />
                  {errors.email && <span className="animated-login-error-text">{errors.email}</span>}
                </div>

                <div className="animated-login-input-group">
                  <label>Password</label>
                  <div className="animated-login-password-wrapper">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? 'animated-login-input-error' : ''}
                    />
                    <button
                      type="button"
                      className="animated-login-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                    </button>
                  </div>
                  {errors.password && <span className="animated-login-error-text">{errors.password}</span>}
                </div>

                {errors.form && (
                  <div className="animated-login-form-error">
                    <AlertIcon size={16} />
                    {errors.form}
                  </div>
                )}

                <button type="submit" className="animated-login-submit-btn" disabled={submitting}>
                  {submitting ? 'LOGGING IN...' : 'LOG IN'}
                </button>
              </form>

              <div className="animated-login-footer">
                Don't have an account?
                <button type="button" onClick={() => switchMode(true)}>
                  Sign Up
                </button>
              </div>
            </div>

            {/* Signup Form Side */}
            <div className="animated-login-form animated-login-form-signup">
              <div className="animated-login-header">
                <Logo size={70} showText={true} />
                <p>Create your account to start tracking!</p>
              </div>
              <form className="animated-login-form-inner" onSubmit={handleSubmit} noValidate>
                <div className="animated-login-input-group">
                  <label>Full Name</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? 'animated-login-input-error' : ''}
                  />
                  {errors.name && <span className="animated-login-error-text">{errors.name}</span>}
                </div>

                <div className="animated-login-input-group">
                  <label>Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'animated-login-input-error' : ''}
                  />
                  {errors.email && <span className="animated-login-error-text">{errors.email}</span>}
                </div>

                <div className="animated-login-input-group">
                  <label>Password</label>
                  <div className="animated-login-password-wrapper">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? 'animated-login-input-error' : ''}
                    />
                    <button
                      type="button"
                      className="animated-login-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                    </button>
                  </div>
                  {errors.password && <span className="animated-login-error-text">{errors.password}</span>}
                </div>

                {errors.form && (
                  <div className="animated-login-form-error">
                    <AlertIcon size={16} />
                    {errors.form}
                  </div>
                )}

                <button type="submit" className="animated-login-submit-btn" disabled={submitting}>
                  {submitting ? 'CREATING ACCOUNT...' : 'SIGN UP'}
                </button>
              </form>

              <div className="animated-login-footer">
                Already have an account?
                <button type="button" onClick={() => switchMode(false)}>
                  Log In
                </button>
              </div>
            </div>
          </div>

          {/* Overlay Panels for animation */}
          <div className={`animated-login-overlay-container ${isSignUp ? 'animated-login-is-signup' : ''}`}>
            <div className="animated-login-overlay">
              <div className="animated-login-overlay-panel animated-login-overlay-left">
                <h1 className="animated-login-overlay-title">Hello, Friend!</h1>
                <p className="animated-login-overlay-text">Enter your personal details and start your journey with us</p>
                <button type="button" className="animated-login-overlay-btn" onClick={() => switchMode(true)}>
                  SIGN UP
                </button>
              </div>
              <div className="animated-login-overlay-panel animated-login-overlay-right">
                <h1 className="animated-login-overlay-title">Welcome Back!</h1>
                <p className="animated-login-overlay-text">To keep connected with us please login with your personal info</p>
                <button type="button" className="animated-login-overlay-btn" onClick={() => switchMode(false)}>
                  LOG IN
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background */}
      <div className="animated-login-bg-circle animated-login-bg-circle-1"></div>
      <div className="animated-login-bg-circle animated-login-bg-circle-2"></div>

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
