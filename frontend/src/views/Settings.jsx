import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { UserIcon, PlugIcon, CheckIcon, AlertIcon, LinkIcon, BoltIcon, LockIcon } from '../components/Icons'
import { SECURITY_QUESTIONS } from '../components/ForgotPasswordModal'

export default function Settings() {
  const { user, updateProfile } = useAuth()

  const [name, setName] = useState(user?.name || '')
  const [githubToken, setGithubToken] = useState(user?.githubToken || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Security question state
  const [securityQuestion, setSecurityQuestion] = useState(user?.securityQuestion || '')
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [submittingSecurity, setSubmittingSecurity] = useState(false)
  const [securityMessage, setSecurityMessage] = useState(null)
  const [hasSecurityQuestion, setHasSecurityQuestion] = useState(!!user?.securityQuestion)

  const [submittingProfile, setSubmittingProfile] = useState(false)
  const [submittingToken, setSubmittingToken] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  
  const [profileMessage, setProfileMessage] = useState(null)
  const [tokenMessage, setTokenMessage] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState(null)

  const verifyConnection = async () => {
    setTestingConnection(true)
    setTokenMessage(null)
    try {
      const res = await api.get('/auth/github-status')
      setConnectionStatus(res.data)
      if (res.data.connected) {
        setTokenMessage({ type: 'success', text: `GitHub connection is active as @${res.data.username}.` })
      } else {
        setTokenMessage({ type: 'error', text: res.data.message })
      }
    } catch (err) {
      setConnectionStatus({ success: false, connected: false })
      setTokenMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to verify token connection.' 
      })
    } finally {
      setTestingConnection(false)
    }
  }

  // Load connection status on mount if token is saved
  useEffect(() => {
    if (user?.githubToken) {
      verifyConnection()
    }
  }, [user?.githubToken])

  const handleSaveSecurity = async (e) => {
    e.preventDefault()
    setSecurityMessage(null)
    if (!securityQuestion) return setSecurityMessage({ type: 'error', text: 'Please select a security question.' })
    if (!securityAnswer.trim()) return setSecurityMessage({ type: 'error', text: 'Please enter your answer.' })
    setSubmittingSecurity(true)
    const res = await updateProfile({ securityQuestion, securityAnswer: securityAnswer.trim() })
    setSubmittingSecurity(false)
    if (res.success) {
      setSecurityMessage({ type: 'success', text: 'Security question saved successfully.' })
      setSecurityAnswer('')
      setHasSecurityQuestion(true)
    } else {
      setSecurityMessage({ type: 'error', text: res.message })
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setProfileMessage(null)

    if (!name.trim()) {
      return setProfileMessage({ type: 'error', text: 'Name is required.' })
    }

    if (password) {
      if (password.length < 6) {
        return setProfileMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
      }
      if (password !== confirmPassword) {
        return setProfileMessage({ type: 'error', text: 'Passwords do not match.' })
      }
    }

    setSubmittingProfile(true)
    const data = { name }
    if (password) data.password = password

    const res = await updateProfile(data)
    setSubmittingProfile(false)

    if (res.success) {
      setProfileMessage({ type: 'success', text: 'Profile updated successfully.' })
      setPassword('')
      setConfirmPassword('')
    } else {
      setProfileMessage({ type: 'error', text: res.message })
    }
  }

  const handleUpdateToken = async (e) => {
    e.preventDefault()
    setTokenMessage(null)

    setSubmittingToken(true)
    const res = await updateProfile({ githubToken: githubToken.trim() })
    setSubmittingToken(false)

    if (res.success) {
      setTokenMessage({ type: 'success', text: 'GitHub Token updated successfully.' })
      verifyConnection()
    } else {
      setTokenMessage({ type: 'error', text: res.message })
    }
  }

  return (
    <div className="settings-page animate-slide-up" id="settings-page">
      <div className="section-header">
        <h2>Account Settings</h2>
      </div>

      <div className="settings-grid">
        {/* Profile Card */}
        <div className="card settings-card reveal-on-scroll" id="profile-settings-card">
          <div className="card-header">
            <UserIcon size={18} color="var(--accent)" />
            <h3>User Profile</h3>
          </div>
          <div className="card-body">
            {profileMessage && (
              <div className={`alert-banner alert-${profileMessage.type}`} id="profile-alert">
                <span className="alert-icon">
                  {profileMessage.type === 'success' ? <CheckIcon size={18} /> : <AlertIcon size={18} />}
                </span>
                <span className="alert-text">{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} id="profile-form">
              <div className="form-group">
                <label htmlFor="settings-name">Full Name</label>
                <input
                  id="settings-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  disabled={submittingProfile}
                />
              </div>

              <div className="form-group">
                <label htmlFor="settings-email">Email Address</label>
                <input
                  id="settings-email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="disabled-input"
                />
                <div className="email-warning-box">
                  <span className="warning-icon">⚠️</span>
                  <p><strong>Warning:</strong> Careful with your email, it cannot be changed. If you absolutely need to modify it, please contact support or request changes through the administrator panel.</p>
                </div>
              </div>

              <div className="divider-line" />

              <div className="form-group">
                <label htmlFor="settings-password">New Password</label>
                <input
                  id="settings-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={submittingProfile}
                />
                <span className="form-help-text">Leave blank to keep your current password.</span>
              </div>

              <div className="form-group">
                <label htmlFor="settings-confirm-password">Confirm New Password</label>
                <input
                  id="settings-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={submittingProfile}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submittingProfile}
                id="save-profile-btn"
              >
                {submittingProfile ? 'Saving...' : 'Save Profile Details'}
              </button>
            </form>
          </div>
        </div>

        {/* Integration Card */}
        <div className="card settings-card reveal-on-scroll" id="integration-settings-card">
          <div className="card-header">
            <PlugIcon size={18} color="var(--accent)" />
            <h3>GitHub Integration</h3>
          </div>
          <div className="card-body">
            {tokenMessage && (
              <div className={`alert-banner alert-${tokenMessage.type}`} id="token-alert">
                <span className="alert-icon">
                  {tokenMessage.type === 'success' ? <CheckIcon size={18} /> : <AlertIcon size={18} />}
                </span>
                <span className="alert-text">{tokenMessage.text}</span>
              </div>
            )}

            <div className="token-instructions">
              <p>
                By default, GitPulse queries public data. However, unauthenticated requests are limited to <strong>60 requests/hour</strong> by the GitHub API.
              </p>
              <p>
                To track larger projects, enable access to <strong>private repositories</strong>, and boost your rate limits to <strong>5000 requests/hour</strong>, configure your own GitHub Personal Access Token (PAT) below.
              </p>
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="token-link"
              >
                <LinkIcon size={14} /> Generate a GitHub PAT (Classic)
              </a>
              <span className="token-help-scopes">
                Required Scopes: `repo` (for private repositories) or no scopes (for public repositories only).
              </span>
            </div>

            <form onSubmit={handleUpdateToken} id="token-form">
              <div className="form-group">
                <label htmlFor="settings-token">GitHub Personal Access Token</label>
                <input
                  id="settings-token"
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  disabled={submittingToken || testingConnection}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingToken || testingConnection}
                  id="save-token-btn"
                >
                  {submittingToken ? 'Saving...' : 'Update Integration Token'}
                </button>
                {user?.githubToken && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={verifyConnection}
                    disabled={submittingToken || testingConnection}
                    style={{ borderColor: 'var(--accent)', color: 'var(--accent)', background: 'transparent', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    id="test-connection-btn"
                  >
                    {testingConnection ? 'Testing...' : (
                      <>
                        <BoltIcon size={14} />
                        Test Connection
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>

            {/* GitHub API Connection & Quota Dashboard */}
            {connectionStatus && connectionStatus.connected && (
              <div className="connection-status-panel">
                <div className="status-header">
                  {connectionStatus.avatarUrl ? (
                    <img 
                      src={connectionStatus.avatarUrl} 
                      alt={connectionStatus.username} 
                    />
                  ) : (
                    <div className="contributor-avatar-placeholder">
                      <UserIcon size={18} />
                    </div>
                  )}
                  <div>
                    <h4>Linked Profile: @{connectionStatus.username}</h4>
                    <span>Authorized Scopes: <code>{connectionStatus.scopes}</code></span>
                  </div>
                </div>

                {connectionStatus.quota && (
                  <div className="quota-bar-container">
                    <div className="quota-labels">
                      <span style={{ color: 'var(--text-secondary)' }}>
                        API Quota: <strong style={{ color: 'var(--text-primary)' }}>{connectionStatus.quota.remaining}</strong> / {connectionStatus.quota.limit}
                      </span>
                      <span style={{ color: connectionStatus.quota.remaining < 500 ? 'var(--alert)' : 'var(--success)' }}>
                        {Math.round((connectionStatus.quota.remaining / connectionStatus.quota.limit) * 100)}% remaining
                      </span>
                    </div>
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill" 
                        style={{ 
                          width: `${(connectionStatus.quota.remaining / connectionStatus.quota.limit) * 100}%`,
                          background: connectionStatus.quota.remaining < 500 ? 'var(--alert)' : 'linear-gradient(90deg, var(--primary) 0%, var(--success) 100%)',
                        }} 
                      />
                    </div>
                    <span className="quota-reset-text">
                      Reset Scheduled: {new Date(connectionStatus.quota.reset * 1000).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security Question Card — full width below the grid */}
      <div className="card settings-card reveal-on-scroll" style={{ marginTop: 24 }}>
        <div className="card-header">
          <LockIcon size={18} color="var(--accent)" />
          <h3>Password Recovery — Security Question</h3>
        </div>
        <div className="card-body">
          {!hasSecurityQuestion && (
            <div className="alert-banner alert-error" style={{ marginBottom: 16 }}>
              <span className="alert-icon"><AlertIcon size={18} /></span>
              <span className="alert-text">No security question set. You won't be able to recover your password without one.</span>
            </div>
          )}
          {securityMessage && (
            <div className={`alert-banner alert-${securityMessage.type}`} style={{ marginBottom: 16 }}>
              <span className="alert-icon">{securityMessage.type === 'success' ? <CheckIcon size={18} /> : <AlertIcon size={18} />}</span>
              <span className="alert-text">{securityMessage.text}</span>
            </div>
          )}
          <form onSubmit={handleSaveSecurity}>
            <div className="settings-grid" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label>Security Question</label>
                <select
                  value={securityQuestion}
                  onChange={e => setSecurityQuestion(e.target.value)}
                  disabled={submittingSecurity}
                  style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.95rem', width: '100%', outline: 'none' }}
                >
                  <option value="">— Select a question —</option>
                  {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
                {hasSecurityQuestion && (
                  <span className="form-help-text">Current: <em>{securityQuestion}</em></span>
                )}
              </div>
              <div className="form-group">
                <label>Your Answer</label>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={e => setSecurityAnswer(e.target.value)}
                  placeholder="Enter your answer (case-insensitive)"
                  disabled={submittingSecurity}
                />
                <span className="form-help-text">Answers are stored encrypted and are case-insensitive.</span>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submittingSecurity} style={{ marginTop: 16 }}>
              {submittingSecurity ? 'Saving...' : hasSecurityQuestion ? 'Update Security Question' : 'Set Security Question'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
