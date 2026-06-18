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
      const result = event.target?.result as string
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

  const navItems = [
    { id: 'account', label: 'Account' },
    { id: 'security', label: 'Security & privacy' },
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

        {/* Middle Content Column */}
        <div className="new-settings-middle-column">
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
        </div>

        {/* Right Column - Security & Preferences */}
        <div className="new-settings-right-column">
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
        </div>
      </div>
    </div>
  )
}
