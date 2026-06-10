import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AlertIcon, EyeIcon, EyeOffIcon } from '../components/Icons'
import { GoogleIcon, GithubIcon, LinkedinIcon } from '../components/Icons'
import Logo from '../components/Logo'
import SocialLoginModal from '../components/SocialLoginModal'

export default function Login() {
  const { login, register: authRegister } = useAuth()
  const navigate = useNavigate()

  const [isRegister, setIsRegister] = useState(false)
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
      else if (isRegister) {
        if (value.length < 8) error = 'Min 8 characters'
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) error = 'Must include A–Z, a–z, and 0–9'
      }
    } else if (name === 'name' && isRegister) {
      if (!value) error = 'Name is required'
    }
    return error
  }

  const switchMode = (toRegister) => {
    setIsRegister(toRegister)
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
      const result = isRegister
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
    <div className="login-page animate-fade">
      {/* Mobile-friendly tab switcher at top */}
      <div className="login-slider-container stagger-container is-visible">
        <div className="login-tabs">
          <button
            className={`login-tab ${!isRegister ? 'active' : ''}`}
            onClick={() => switchMode(false)}
          >
            Sign In
          </button>
          <button
            className={`login-tab ${isRegister ? 'active' : ''}`}
            onClick={() => switchMode(true)}
          >
            Sign Up
          </button>
        </div>

        <div className={`login-slider-track ${isRegister ? 'is-register' : ''}`}>
          
          {/* Sign In Form */}
          <div className="login-slide stagger-item">
            <div className="login-card">
              <div className="login-header">
                <Logo size={80} showText={true} className="login-logo" />
                <p>Sign in to continue your pulse analytics</p>
              </div>
              
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'has-error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <div className="password-input-wrapper">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? 'has-error' : ''}
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                    </button>
                  </div>
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>

                {errors.form && <div className="form-error"><AlertIcon size={16} /> {errors.form}</div>}

                <button type="submit" className="btn btn-primary login-btn" disabled={submitting}>
                  {submitting ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>

              <div className="social-logins">
                <div className="divider">
                  <span>Or continue with</span>
                </div>
                <div className="social-buttons">
                  <button
                    type="button"
                    className="social-btn google"
                    aria-label="Sign in with Google"
                    onClick={() => setSocialModal('google')}
                  >
                    <GoogleIcon size={20} />
                    <span>Google</span>
                  </button>
                  <button
                    type="button"
                    className="social-btn github"
                    aria-label="Sign in with GitHub"
                    onClick={() => setSocialModal('github')}
                  >
                    <GithubIcon size={20} />
                    <span>GitHub</span>
                  </button>
                  <button
                    type="button"
                    className="social-btn linkedin"
                    aria-label="Sign in with LinkedIn"
                    onClick={() => setSocialModal('linkedin')}
                  >
                    <LinkedinIcon size={20} />
                    <span>LinkedIn</span>
                  </button>
                </div>
              </div>

              <div className="login-footer">
                Don't have an account? <button onClick={() => switchMode(true)} className="login-switch-link">Create one</button>
              </div>
            </div>
          </div>

          {/* Register Form */}
          <div className="login-slide">
            <div className="login-card">
              <div className="login-header">
                <Logo size={80} showText={true} className="login-logo" />
                <p>Create an account to start tracking</p>
              </div>
              
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? 'has-error' : ''}
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'has-error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <div className="password-input-wrapper">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? 'has-error' : ''}
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                    </button>
                  </div>
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>

                {errors.form && <div className="form-error"><AlertIcon size={16} /> {errors.form}</div>}

                <button type="submit" className="btn btn-primary login-btn" disabled={submitting}>
                  {submitting ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>

              <div className="login-footer">
                Already have an account? <button onClick={() => switchMode(false)} className="login-switch-link">Sign In</button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {socialModal && (
        <SocialLoginModal
          provider={socialModal}
          isRegister={isRegister}
          onClose={() => setSocialModal(null)}
          onLogin={handleSocialLogin}
        />
      )}
    </div>
  )
}

