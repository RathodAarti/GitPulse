import { useState, useEffect, useCallback, useRef } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AlertIcon, EyeIcon, EyeOffIcon, ShieldIcon, UserIcon, GithubIcon, GoogleIcon, LinkedinIcon } from '../components/Icons'
import Logo from '../components/Logo'
import PublicNavbar from '../components/PublicNavbar'
import SocialLoginModal from '../components/SocialLoginModal'
import ForgotPasswordModal from '../components/ForgotPasswordModal'

/* ─── Particle Burst Canvas ─────────────────────────────────────────── */
function ParticleBurst({ trigger, isRegister, cardRef, overlayRef }) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const frameRef = useRef(null)

  useEffect(() => {
    if (trigger === 0) return

    let spawning = true
    const timer = setTimeout(() => {
      spawning = false
    }, 600) // matches the 600ms transition time

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const card = cardRef.current
    if (!card) return

    // Set canvas size to match the card size
    const rect = card.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const colors = ['#8b5cf6', '#a78bfa', '#3b82f6', '#60a5fa', '#f472b6', '#ec4899']

    const animate = () => {
      const cardEl = cardRef.current
      const overlayEl = overlayRef.current

      if (cardEl && overlayEl) {
        const cardRect = cardEl.getBoundingClientRect()
        const overlayRect = overlayEl.getBoundingClientRect()

        // Find the seam of the sliding overlay container
        const leftSeam = overlayRect.left - cardRect.left
        const rightSeam = overlayRect.right - cardRect.left
        const targetSeam = isRegister ? leftSeam : rightSeam

        if (spawning) {
          // Spawn sparks along the moving seam boundary
          for (let i = 0; i < 2; i++) {
            particlesRef.current.push({
              x: targetSeam,
              y: Math.random() * canvas.height,
              vx: (isRegister ? 1 : -1) * (0.8 + Math.random() * 2.2), // shoot backward from motion
              vy: (Math.random() - 0.5) * 2.5,
              r: 1 + Math.random() * 2.5,
              color: colors[Math.floor(Math.random() * colors.length)],
              alpha: 1,
              decay: 0.015 + Math.random() * 0.015,
              sparkle: Math.random() > 0.4
            })
          }
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false

      particlesRef.current = particlesRef.current.filter(p => {
        if (p.alpha <= 0) return false
        alive = true
        p.x += p.vx
        p.y += p.vy
        p.alpha -= p.decay

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color

        // Sparkle shadow glow effect
        if (p.sparkle) {
          ctx.shadowBlur = 10
          ctx.shadowColor = p.color
        } else {
          ctx.shadowBlur = 0
        }

        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.fill()
        return true
      })

      ctx.shadowBlur = 0
      ctx.globalAlpha = 1

      if (alive || spawning) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => {
      clearTimeout(timer)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [trigger, isRegister, cardRef, overlayRef])

  return (
    <canvas
      ref={canvasRef}
      className="auth-particle-canvas"
      aria-hidden="true"
    />
  )
}

/* ─── Floating Orbs Background ──────────────────────────────────────── */
function FloatingOrbs() {
  return (
    <div className="auth-orbs" aria-hidden="true">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />
    </div>
  )
}

/* ─── Main AuthPortal ───────────────────────────────────────────────── */
export default function AuthPortal() {
  const { login, register: authRegister, isAuthenticated } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [animateError, setAnimateError] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [particleTrigger, setParticleTrigger] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [socialModal, setSocialModal] = useState(null)
  const [showForgotPw, setShowForgotPw] = useState(false) // 'google' | 'github' | 'linkedin' | null

  const cardRef = useRef(null)
  const overlayRef = useRef(null)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const triggerShake = () => {
    setAnimateError(true)
    setTimeout(() => setAnimateError(false), 500)
  }

  const validateField = (name, value) => {
    let error = ''
    if (name === 'email') {
      const emailValue = value.trim()
      if (!emailValue) error = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) error = 'Invalid email format'
    } else if (name === 'password') {
      if (!value) error = 'Password is required'
      else if (isRegister) {
        if (value.length < 8) error = 'Min 8 characters'
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) error = 'Must include A-z and 0-9'
      }
    } else if (name === 'name' && isRegister) {
      if (!value.trim()) error = 'Full name is required'
      else if (value.trim().length < 2) error = 'Name too short'
    }
    return error
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
      triggerShake()
      return
    }

    setSubmitting(true)
    try {
      const result = isRegister
        ? await authRegister(formData.name, formData.email, formData.password)
        : await login(formData.email, formData.password)

      if (!result.success) {
        setErrors({ form: result.message })
        triggerShake()
      } else {
        setShowSuccess(true)
      }
    } catch {
      setErrors({ form: 'An unexpected error occurred. Please try again.' })
      triggerShake()
    } finally {
      setSubmitting(false)
    }
  }

  const switchPanel = (toRegister) => {
    if (toRegister === isRegister) return
    setIsRegister(toRegister)
    setFormData({ name: '', email: '', password: '' })
    setErrors({})
    setShowPassword(false)
    setParticleTrigger(prev => prev + 1)
    setIsTransitioning(true)
    setTimeout(() => setIsTransitioning(false), 600)
  }

  const handleSocialLogin = async (account) => {
    setSocialModal(null)
    setSubmitting(true)
    // Use the account's email as the identifier; attempt login first, then register
    const result = await login(account.email, 'SocialAuth2026!')
    if (result.success) {
      setShowSuccess(true)
    } else {
      // Auto-register with the social account details
      const regResult = await authRegister(account.name, account.email, 'SocialAuth2026!')
      if (regResult.success) {
        setShowSuccess(true)
      } else {
        setErrors({ form: `Could not sign in with ${account.name}. Try email & password instead.` })
        triggerShake()
      }
    }
    setSubmitting(false)
  }

  return (
    <div className="auth-portal-page">
      <PublicNavbar />
      <FloatingOrbs />

      <main className="auth-container">
        <div 
          ref={cardRef}
          className={`auth-card-refined ${isRegister ? 'right-panel-active' : ''} ${isTransitioning ? 'is-transitioning' : ''} ${animateError ? 'animate-shake' : ''}`}
        >
          
          {/* Animated gradient border */}
          <div className="auth-card-glow" aria-hidden="true" />
          
          {/* Particle burst layer */}
          <ParticleBurst 
            trigger={particleTrigger} 
            isRegister={isRegister}
            cardRef={cardRef}
            overlayRef={overlayRef}
          />

          {/* Registration Form */}
          <div className="form-container sign-up-container">
            <form onSubmit={handleSubmit} noValidate className="auth-form-refined">
              <Logo size={50} className="auth-logo pulse-logo stagger-item" />
              <h2 className="auth-heading stagger-item">Establish Presence</h2>
              <p className="auth-subtext stagger-item">Initialize your engineering telemetry profile</p>
              
              <div className="input-group-refined stagger-item">
                <input
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'has-error' : ''}
                />
                <UserIcon size={18} className="input-icon-right" />
              </div>
              {errors.name && <span className="error-text-refined">{errors.name}</span>}

              <div className="input-group-refined stagger-item">
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'has-error' : ''}
                />
                <ShieldIcon size={18} className="input-icon-right" />
              </div>
              {errors.email && <span className="error-text-refined">{errors.email}</span>}

              <div className="input-group-refined stagger-item">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'has-error' : ''}
                />
                <button 
                  type="button" 
                  className="password-toggle-refined"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
              {errors.password && <span className="error-text-refined">{errors.password}</span>}

              {errors.form && isRegister && (
                <div className="form-error-refined animate-shake">
                  <AlertIcon size={14} />
                  <span>{errors.form}</span>
                </div>
              )}

              {showSuccess && isRegister && (
                <div className="form-success-refined animate-success-slide">
                  <ShieldIcon size={14} />
                  <span>Account created successfully!</span>
                </div>
              )}

              <button 
                type="submit" 
                className={`btn-auth-refined stagger-item ${submitting ? 'loading' : ''} ${showSuccess ? 'success' : ''}`}
                disabled={submitting || showSuccess}
              >
                <span className="btn-auth-text">
                  {submitting ? 'Creating...' : showSuccess ? 'Success' : 'Register Now'}
                </span>
              </button>

              <div className="social-container-refined stagger-item">
                <button type="button" className="social-btn-refined" aria-label="Register with Google" onClick={() => setSocialModal('google')}><GoogleIcon size={20} /></button>
                <button type="button" className="social-btn-refined" aria-label="Register with Github" onClick={() => setSocialModal('github')}><GithubIcon size={20} /></button>
                <button type="button" className="social-btn-refined" aria-label="Register with Linkedin" onClick={() => setSocialModal('linkedin')}><LinkedinIcon size={20} /></button>
              </div>
            </form>
          </div>

          {/* Login Form */}
          <div className="form-container sign-in-container">
            <form onSubmit={handleSubmit} noValidate className="auth-form-refined">
              <Logo size={50} className="auth-logo pulse-logo stagger-item" />
              <h2 className="auth-heading stagger-item">Resume Access</h2>
              <p className="auth-subtext stagger-item">Re-authenticate to synchronize your dashboard</p>

              <div className="input-group-refined stagger-item">
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'has-error' : ''}
                />
                <ShieldIcon size={18} className="input-icon-right" />
              </div>
              {errors.email && <span className="error-text-refined">{errors.email}</span>}

              <div className="input-group-refined stagger-item">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'has-error' : ''}
                />
                <button 
                  type="button" 
                  className="password-toggle-refined"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
              {errors.password && <span className="error-text-refined">{errors.password}</span>}

              <button
                type="button"
                className="forgot-pw-link"
                onClick={() => setShowForgotPw(true)}
              >
                Forgot password?
              </button>

              {errors.form && !isRegister && (
                <div className="form-error-refined animate-shake">
                  <AlertIcon size={14} />
                  <span>{errors.form}</span>
                </div>
              )}

              {showSuccess && !isRegister && (
                <div className="form-success-refined animate-success-slide">
                  <ShieldIcon size={14} />
                  <span>Authentication successful!</span>
                </div>
              )}

              <button 
                type="submit" 
                className={`btn-auth-refined stagger-item ${submitting ? 'loading' : ''} ${showSuccess ? 'success' : ''}`}
                disabled={submitting || showSuccess}
              >
                <span className="btn-auth-text">
                  {submitting ? 'Verifying...' : showSuccess ? 'Welcome' : 'Sign In'}
                </span>
              </button>

              <div className="social-container-refined stagger-item">
                <button type="button" className="social-btn-refined" aria-label="Sign in with Google" onClick={() => setSocialModal('google')}><GoogleIcon size={20} /></button>
                <button type="button" className="social-btn-refined" aria-label="Sign in with Github" onClick={() => setSocialModal('github')}><GithubIcon size={20} /></button>
                <button type="button" className="social-btn-refined" aria-label="Sign in with Linkedin" onClick={() => setSocialModal('linkedin')}><LinkedinIcon size={20} /></button>
              </div>
            </form>
          </div>

          {/* Sliding Overlay Container */}
          <div ref={overlayRef} className="overlay-container-refined">
            <div className="overlay-refined">
              {/* Overlay decorative elements */}
              <div className="overlay-grid-pattern" aria-hidden="true" />
              <div className="overlay-glow-sphere" aria-hidden="true" />
              <div className="overlay-bg-parallax-1" aria-hidden="true" />
              <div className="overlay-bg-parallax-2" aria-hidden="true" />
              <div className="overlay-bg-parallax-3" aria-hidden="true" />

              <div className="overlay-panel overlay-left">
                <div className="overlay-content-wrapper">
                  <h1>Returning?</h1>
                  <p>Maintain your engineering momentum by logging into your account</p>
                  <button 
                    className="btn-ghost-refined" 
                    onClick={() => switchPanel(false)}
                  >
                    Authorize Session
                  </button>
                </div>
              </div>
              <div className="overlay-panel overlay-right">
                <div className="overlay-content-wrapper">
                  <h1>New Observer?</h1>
                  <p>Initialize your profile to begin tracking high-fidelity repository signals</p>
                  <button 
                    className="btn-ghost-refined" 
                    onClick={() => switchPanel(true)}
                  >
                    Join the Pulse
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {socialModal && (
        <SocialLoginModal
          provider={socialModal}
          isRegister={isRegister}
          onClose={() => setSocialModal(null)}
          onLogin={handleSocialLogin}
        />
      )}

      {showForgotPw && (
        <ForgotPasswordModal onClose={() => setShowForgotPw(false)} />
      )}
    </div>
  )
}
