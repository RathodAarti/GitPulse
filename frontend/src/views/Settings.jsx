import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { UserIcon, PlugIcon, CheckIcon, AlertIcon, LinkIcon, BoltIcon, LockIcon } from '../components/Icons'
import { SECURITY_QUESTIONS } from '../components/ForgotPasswordModal'

export default function Settings() {
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('account')

  // Profile State
  const [name, setName] = useState(user?.name || '')
  const [username, setUsername] = useState(user?.name?.split(' ').join('').toLowerCase() || '')
  const [email, setEmail] = useState(user?.email || '')
  const [gender, setGender] = useState('')
  const [birthdayDay, setBirthdayDay] = useState('')
  const [birthdayMonth, setBirthdayMonth] = useState('')
  const [birthdayYear, setBirthdayYear] = useState('')
  const [job, setJob] = useState('')
  const [language, setLanguage] = useState('English')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f09?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80')

  // Password & Security
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Social Links
  const [facebookLink, setFacebookLink] = useState('')
  const [twitterLink, setTwitterLink] = useState('')

  // Toggles
  const [emailNotification, setEmailNotification] = useState(false)
  const [videoAutoplay, setVideoAutoplay] = useState(true)
  const [sensitiveContent, setSensitiveContent] = useState(true)

  const [githubToken, setGithubToken] = useState(user?.githubToken || '')
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

  // PAT Management State
  const [patName, setPatName] = useState('')
  const [patExpiry, setPatExpiry] = useState('30')
  const [patPermissions, setPatPermissions] = useState('read')
  const [userPats, setUserPats] = useState([
    { id: '1', name: 'GitPulse App Token', expires: '2026-07-18', permissions: 'read', active: true },
    { id: '2', name: 'Automation Script', expires: '2026-09-18', permissions: 'write', active: true }
  ])
  const [showPatModal, setShowPatModal] = useState(false)
  const [patSuccess, setPatSuccess] = useState(null)
  const [patError, setPatError] = useState(null)

  // Security Reset State
  const [resetStep, setResetStep] = useState(1)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetError, setResetError] = useState(null)
  const [showResetConfirmation, setShowResetConfirmation] = useState(false)

  // Profile Photo Upload Handlers
  const handleProfilePhotoClick = () => {
    document.getElementById('profile-photo-input')?.click()
  }

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file format
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setProfileMessage({ type: 'error', text: 'Only JPG, PNG, and WebP formats are supported' })
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      setProfileMessage({ type: 'error', text: 'File size must be less than 5MB' })
      return
    }

    // Preview the image
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result
      setProfilePhoto(result)
      setProfileMessage({ type: 'success', text: 'Profile photo updated successfully! Click save to apply changes' })
    }
    reader.readAsDataURL(file)
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December']
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i)

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
      setCurrentPassword('')
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

  // PAT Management Handlers
  const handleCreatePat = () => {
    if (!patName.trim()) {
      setPatError('Please enter a token name.')
      return
    }
    const newPat = {
      id: Date.now().toString(),
      name: patName,
      expires: new Date(Date.now() + parseInt(patExpiry) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      permissions: patPermissions,
      active: true
    }
    setUserPats([...userPats, newPat])
    setPatName('')
    setPatExpiry('30')
    setPatPermissions('read')
    setShowPatModal(false)
    setPatSuccess('Personal Access Token created successfully!')
    setPatError(null)
  }

  const handleRevokePat = (patId) => {
    setUserPats(userPats.map(pat => 
      pat.id === patId ? { ...pat, active: false } : pat
    ))
    setPatSuccess('Token revoked successfully!')
  }

  // Security Reset Handlers
  const handleSecurityReset = () => {
    if (resetStep === 1 && confirmPassword !== currentPassword) {
      setResetError('Password does not match. Please re-enter your current password to confirm.')
      return
    }
    if (resetStep === 1) {
      setResetStep(2)
      setShowResetConfirmation(true)
    } else {
      // Reset logic
      setResetStep(1)
      setShowResetConfirmation(false)
      setResetError(null)
      alert('Security reset completed. Please log in again.')
    }
  }

  const cancelReset = () => {
    setResetStep(1)
    setShowResetConfirmation(false)
    setResetError(null)
    setConfirmPassword('')
  }

  const navItems = [
    { id: 'account', label: 'Account' },
    { id: 'security', label: 'Security & privacy' },
    { id: 'pat-management', label: 'PAT Management' },
    { id: 'security-reset', label: 'Security Reset' },
    { id: 'mobile', label: 'Mobile' },
    { id: 'friends', label: 'Find friends' },
    { id: 'history', label: 'History' },
  ]

  return (
    <div className="new-settings-page">
      <h1 className="new-settings-header">Settings</h1>
      
      <div className="new-settings-container">
        {/* Left Sidebar */}
        <div className="new-settings-sidebar">
          <div className="new-settings-profile-section">
            <input 
              type="file" 
              id="profile-photo-input" 
              accept="image/jpeg,image/png,image/webp" 
              style={{ display: 'none' }} 
              onChange={handleProfilePhotoChange} 
            />
            <div className="new-settings-avatar-wrapper" onClick={handleProfilePhotoClick}>
              <img 
                src={profilePhoto}
                alt="User Avatar" 
                className="new-settings-avatar"
              />
              <div className="new-settings-avatar-overlay">
                <div className="new-settings-avatar-overlay-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#cc2b5e' }}>
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                </div>
              </div>
            </div>
            <h3 className="new-settings-username">{name || "Your Name"}</h3>
            <p className="new-settings-avatar-hint" onClick={handleProfilePhotoClick}>(Click to change your photo)</p>
            <div className="new-settings-divider"></div>
          </div>
          
          <nav className="new-settings-nav">
            {navItems.map((item) => (
              <button 
                key={item.id}
                className={`new-settings-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Middle Content Column - Conditional */}
        <div className="new-settings-middle-column">
          {activeTab === 'account' && (
            <>
              <h2 className="new-settings-section-title">Account settings</h2>
              
              {profileMessage && (
                <div className={`new-settings-alert alert-${profileMessage.type}`}>
                  <AlertIcon size={16} />
                  {profileMessage.text}
                </div>
              )}

              <div className="new-settings-form">
                <div className="new-settings-form-group">
                  <label>Username</label>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="Your username"
                  />
                </div>

                <div className="new-settings-form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    value={email} 
                    readOnly
                    className="read-only-input"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="new-settings-form-group">
                  <label>Gender</label>
                  <select 
                    value={gender} 
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="new-settings-form-group new-settings-birthday-group">
                  <label>Birthday</label>
                  <div className="new-settings-birthday-selects">
                    <select 
                      value={birthdayDay} 
                      onChange={(e) => setBirthdayDay(e.target.value)}
                    >
                      <option value="">Day</option>
                      {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select 
                      value={birthdayMonth} 
                      onChange={(e) => setBirthdayMonth(e.target.value)}
                    >
                      <option value="">Month</option>
                      {months.map((m, i) => <option key={i} value={m}>{m}</option>)}
                    </select>
                    <select 
                      value={birthdayYear} 
                      onChange={(e) => setBirthdayYear(e.target.value)}
                    >
                      <option value="">Year</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                <div className="new-settings-form-group">
                  <label>Job</label>
                  <input 
                    type="text" 
                    value={job} 
                    onChange={(e) => setJob(e.target.value)} 
                    placeholder="Your job title"
                  />
                </div>

                <div className="new-settings-form-group">
                  <label>Language</label>
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>

                <div className="new-settings-form-group">
                  <label>Country</label>
                  <select 
                    value={country} 
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="">Select country</option>
                    <option value="us">United States</option>
                    <option value="ca">Canada</option>
                    <option value="uk">United Kingdom</option>
                    <option value="au">Australia</option>
                  </select>
                </div>

                <div className="new-settings-form-group">
                  <label>City</label>
                  <select 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)}
                  >
                    <option value="">Select city</option>
                    <option value="boston">Boston</option>
                    <option value="newyork">New York</option>
                    <option value="chicago">Chicago</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <>
              <h2 className="new-settings-section-title">Security & privacy</h2>
              {securityMessage && (
                <div className={`new-settings-alert alert-${securityMessage.type}`}>
                  <AlertIcon size={16} />
                  {securityMessage.text}
                </div>
              )}
              {!hasSecurityQuestion && (
                <div className="new-settings-alert alert-error" style={{ marginBottom: '20px' }}>
                  <AlertIcon size={16} />
                  No security question set. You won't be able to recover your password without one.
                </div>
              )}
              <div className="new-settings-form">
                <div className="new-settings-form-group">
                  <label>Security Question</label>
                  <select 
                    value={securityQuestion} 
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                  >
                    <option value="">Select a security question</option>
                    {SECURITY_QUESTIONS.map((q, idx) => (
                      <option key={idx} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
                <div className="new-settings-form-group">
                  <label>Your Answer</label>
                  <input 
                    type="text" 
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder="Enter your answer"
                  />
                </div>
                <button 
                  className="new-settings-save-btn" 
                  onClick={handleSaveSecurity}
                  disabled={submittingSecurity}
                  style={{ marginTop: '10px', width: '100%' }}
                >
                  Save Security Question
                </button>
              </div>
            </>
          )}

          {activeTab === 'pat-management' && (
            <>
              <h2 className="new-settings-section-title">PAT Management</h2>
              {patSuccess && (
                <div className="new-settings-alert alert-success">
                  <CheckIcon size={16} />
                  {patSuccess}
                </div>
              )}
              {patError && (
                <div className="new-settings-alert alert-error">
                  <AlertIcon size={16} />
                  {patError}
                </div>
              )}

              <button 
                className="new-settings-save-btn" 
                onClick={() => setShowPatModal(true)}
                style={{ width: '100%', marginBottom: '20px' }}
              >
                Create New Token
              </button>

              <div className="new-settings-form">
                {userPats.map(pat => (
                  <div 
                    key={pat.id} 
                    style={{ 
                      border: '1px solid rgba(204,43,94,0.2)', 
                      borderRadius: '12px', 
                      padding: '16px', 
                      marginBottom: '12px',
                      opacity: pat.active ? '1' : '0.6'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pat.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Expires: {pat.expires}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        background: 'rgba(204,43,94,0.15)', 
                        fontSize: '0.8rem', 
                        color: '#cc2b5e' 
                      }}>
                        {pat.permissions}
                      </span>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        background: pat.active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', 
                        fontSize: '0.8rem', 
                        color: pat.active ? '#10b981' : '#ef4444' 
                      }}>
                        {pat.active ? 'Active' : 'Revoked'}
                      </span>
                    </div>
                    {pat.active && (
                      <button 
                        onClick={() => handleRevokePat(pat.id)} 
                        style={{ 
                          marginTop: '10px', 
                          background: 'transparent', 
                          border: '1px solid #ef4444', 
                          color: '#ef4444',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          cursor: 'pointer'
                        }}
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {showPatModal && (
                <div style={{ 
                  position: 'fixed', 
                  top: 0, left: 0, right: 0, bottom: 0, 
                  background: 'rgba(0,0,0,0.5)', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  zIndex: 1000 
                }} onClick={() => setShowPatModal(false)}>
                  <div style={{ 
                    background: 'var(--bg-card)', 
                    padding: '24px', 
                    borderRadius: '16px', 
                    width: '100%', 
                    maxWidth: '400px',
                    border: '1px solid rgba(204,43,94,0.2)'
                  }} onClick={(e) => e.stopPropagation()}>
                    <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Create Personal Access Token</h3>
                    <div className="new-settings-form">
                      <div className="new-settings-form-group">
                        <label>Token Name</label>
                        <input 
                          type="text" 
                          value={patName}
                          onChange={(e) => setPatName(e.target.value)}
                          placeholder="e.g., CI/CD Pipeline"
                        />
                      </div>
                      <div className="new-settings-form-group">
                        <label>Expiration (Days)</label>
                        <select 
                          value={patExpiry}
                          onChange={(e) => setPatExpiry(e.target.value)}
                        >
                          <option value="7">7 Days</option>
                          <option value="30">30 Days</option>
                          <option value="90">90 Days</option>
                          <option value="365">1 Year</option>
                        </select>
                      </div>
                      <div className="new-settings-form-group">
                        <label>Permissions</label>
                        <select 
                          value={patPermissions}
                          onChange={(e) => setPatPermissions(e.target.value)}
                        >
                          <option value="read">Read Only</option>
                          <option value="write">Read & Write</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button 
                          onClick={() => setShowPatModal(false)} 
                          style={{ 
                            flex: 1, 
                            padding: '10px', 
                            border: '1px solid var(--border)', 
                            borderRadius: '8px', 
                            cursor: 'pointer', 
                            background: 'transparent'
                          }}
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleCreatePat} 
                          className="new-settings-save-btn"
                          style={{ flex: 1 }}
                        >
                          Create
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'security-reset' && (
            <>
              <h2 className="new-settings-section-title">Security Reset</h2>
              {resetError && (
                <div className="new-settings-alert alert-error">
                  <AlertIcon size={16} />
                  {resetError}
                </div>
              )}

              <div className="new-settings-form">
                {resetStep === 1 && !showResetConfirmation && (
                  <>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      This will reset all security settings and log you out of all active sessions.
                    </p>
                    <div className="new-settings-form-group">
                      <label>Confirm Current Password</label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    <button 
                      className="new-settings-save-btn" 
                      onClick={handleSecurityReset}
                      style={{ width: '100%' }}
                    >
                      Continue
                    </button>
                  </>
                )}

                {showResetConfirmation && (
                  <>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      Are you sure? This action cannot be undone!
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={cancelReset} 
                        style={{ 
                          flex: 1, 
                          padding: '12px', 
                          border: '1px solid var(--border)', 
                          borderRadius: '8px', 
                          cursor: 'pointer', 
                          background: 'transparent'
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSecurityReset} 
                        style={{ 
                          flex: 1, 
                          padding: '12px 24px', 
                          border: 'none', 
                          borderRadius: '8px', 
                          background: '#dc2626', 
                          color: 'white', 
                          cursor: 'pointer' 
                        }}
                      >
                        Confirm Reset
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Column - Conditional */}
        <div className="new-settings-right-column">
          {activeTab === 'account' && (
            <div className="new-settings-form">
              <div className="new-settings-form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                  placeholder="••••••••"
                />
              </div>

              <div className="new-settings-form-group">
                <label>New password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="(4-32 alphabets or numerics)"
                />
              </div>

              <div className="new-settings-form-group">
                <label>Confirm password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="••••••••"
                />
              </div>

              <div className="new-settings-divider"></div>

              <div className="new-settings-form-group">
                <label>Facebook link</label>
                <input 
                  type="text" 
                  value={facebookLink} 
                  onChange={(e) => setFacebookLink(e.target.value)} 
                  placeholder="https://facebook.com/yourprofile"
                />
              </div>

              <div className="new-settings-form-group">
                <label>Twitter link</label>
                <input 
                  type="text" 
                  value={twitterLink} 
                  onChange={(e) => setTwitterLink(e.target.value)} 
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>

              <div className="new-settings-divider"></div>

              <div className="new-settings-toggle-group">
                <label>Email notification</label>
                <div 
                  className={`new-settings-toggle ${emailNotification ? 'active' : ''}`}
                  onClick={() => setEmailNotification(!emailNotification)}
                >
                  <div className="new-settings-toggle-handle"></div>
                </div>
              </div>

              <div className="new-settings-toggle-group">
                <label>Video autoplay</label>
                <div 
                  className={`new-settings-toggle ${videoAutoplay ? 'active' : ''}`}
                  onClick={() => setVideoAutoplay(!videoAutoplay)}
                >
                  <div className="new-settings-toggle-handle"></div>
                </div>
              </div>

              <div className="new-settings-toggle-group">
                <label>Inform me before showing media that may be sensitive</label>
                <div 
                  className={`new-settings-toggle ${sensitiveContent ? 'active' : ''}`}
                  onClick={() => setSensitiveContent(!sensitiveContent)}
                >
                  <div className="new-settings-toggle-handle"></div>
                </div>
              </div>

              <div className="new-settings-save-section">
                <button 
                  className="new-settings-save-btn" 
                  onClick={handleUpdateProfile}
                  disabled={submittingProfile}
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="new-settings-form">
              <div className="new-settings-form-group">
                <label>GitHub Personal Access Token</label>
                <input 
                  type="password" 
                  value={githubToken} 
                  onChange={(e) => setGithubToken(e.target.value)} 
                  placeholder="ghp_xxxxxx"
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button 
                  className="new-settings-save-btn" 
                  onClick={handleUpdateToken}
                  disabled={submittingToken}
                  style={{ flex: 1 }}
                >
                  Update
                </button>
                <button 
                  onClick={verifyConnection}
                  disabled={testingConnection}
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    border: '1px solid rgba(204,43,94,0.3)', 
                    borderRadius: '8px', 
                    background: 'transparent', 
                    color: '#cc2b5e',
                    cursor: 'pointer'
                  }}
                >
                  {testingConnection ? 'Checking...' : 'Test Connection'}
                </button>
              </div>
              {tokenMessage && (
                <div className={`new-settings-alert alert-${tokenMessage.type}`}>
                  {tokenMessage.type === 'success' ? <CheckIcon size={16} /> : <AlertIcon size={16} />}
                  {tokenMessage.text}
                </div>
              )}
            </div>
          )}

          {(activeTab === 'pat-management' || activeTab === 'security-reset') && (
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Information
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {activeTab === 'pat-management' 
                  ? 'Personal Access Tokens allow applications to access your GitPulse data securely.' 
                  : 'Only perform a security reset if you believe your account has been compromised.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
