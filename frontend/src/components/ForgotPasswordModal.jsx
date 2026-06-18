import { useState } from 'react'
import api from '../services/api'
import { XIcon, EyeIcon, EyeOffIcon, CheckIcon, AlertIcon } from './Icons'

const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What was the name of your first school?",
  "What is your favourite childhood movie?",
  "What city were you born in?",
  "What is your oldest sibling's middle name?",
  "What was the make of your first car?",
  "What is the name of the street you grew up on?",
]

const STEPS = { EMAIL: 'email', ANSWER: 'answer', RESET: 'reset', DONE: 'done' }

export default function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(STEPS.EMAIL)
  const [email, setEmail] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerifyEmail = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/forgot-password/verify', { email })
      setQuestion(res.data.question)
      setStep(STEPS.ANSWER)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.')
    } finally { setLoading(false) }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setError('Must include uppercase, lowercase, and a number.'); return
    }
    setLoading(true)
    try {
      await api.post('/auth/forgot-password/reset', { email, answer, newPassword })
      setStep(STEPS.DONE)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.')
    } finally { setLoading(false) }
  }

  return (
    <div className="social-modal-overlay" onClick={onClose} role="presentation">
      <div 
        className="social-modal forgot-pw-modal" 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Reset Password"
      >

        {/* Header */}
        <div className="social-modal-header" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, var(--primary) 100%)' }}>
          <span style={{ fontSize: '1.1rem' }}>🔐</span>
          <span>Reset Password</span>
          <button className="social-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Step indicator */}
        {step !== STEPS.DONE && (
          <div className="forgot-pw-steps">
            {[STEPS.EMAIL, STEPS.ANSWER, STEPS.RESET].map((s, i) => (
              <div key={s} className={`forgot-pw-step ${step === s ? 'active' : [STEPS.ANSWER, STEPS.RESET, STEPS.DONE].indexOf(step) > i ? 'done' : ''}`}>
                <div className="forgot-pw-step-dot">{[STEPS.ANSWER, STEPS.RESET, STEPS.DONE].indexOf(step) > i ? '✓' : i + 1}</div>
                <span>{['Email', 'Security', 'New Password'][i]}</span>
              </div>
            ))}
          </div>
        )}

        <div className="social-modal-body">

          {/* Error */}
          {error && (
            <div className="support-widget-alert support-widget-alert-error" style={{ marginBottom: 16 }}>
              <AlertIcon size={15} /> <span>{error}</span>
            </div>
          )}

          {/* Step 1 — Email */}
          {step === STEPS.EMAIL && (
            <form onSubmit={handleVerifyEmail}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
                Enter your registered email address and we'll ask you your security question.
              </p>
              <div className="support-widget-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
              <button type="submit" className="support-widget-submit" disabled={loading}>
                {loading ? 'Checking...' : 'Continue →'}
              </button>
            </form>
          )}

          {/* Step 2 — Security Answer */}
          {step === STEPS.ANSWER && (
            <form onSubmit={e => { e.preventDefault(); if (!answer.trim()) { setError('Please enter your answer.'); return } setError(''); setStep(STEPS.RESET) }}>
              <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 16, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Security Question</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{question}</div>
              </div>
              <div className="support-widget-field">
                <label>Your Answer</label>
                <input
                  type="text"
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Enter your answer..."
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="support-widget-submit" style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} onClick={() => { setStep(STEPS.EMAIL); setError('') }}>
                  ← Back
                </button>
                <button type="submit" className="support-widget-submit" disabled={loading}>
                  Verify Answer →
                </button>
              </div>
            </form>
          )}

          {/* Step 3 — New Password */}
          {step === STEPS.RESET && (
            <form onSubmit={handleResetPassword}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
                Answer verified ✓ — Now set your new password.
              </p>
              <div className="support-widget-field">
                <label>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 8 chars, A-Z, a-z, 0-9"
                    required
                    style={{ paddingRight: 40 }}
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPw ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
              </div>
              <div className="support-widget-field">
                <label>Confirm Password</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                />
              </div>
              <button type="submit" className="support-widget-submit" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* Done */}
          {step === STEPS.DONE && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Password Reset!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24 }}>
                Your password has been updated. You can now sign in with your new password.
              </p>
              <button className="support-widget-submit" onClick={onClose}>
                Back to Sign In
              </button>
            </div>
          )}
        </div>

        <div className="social-modal-footer">
          Tip: After signing in, update your security question in Settings for easier recovery.
        </div>
      </div>
    </div>
  )
}

/* ── Exported question list for use in Settings ── */
export { SECURITY_QUESTIONS }
