import { GithubIcon, GoogleIcon, LinkedinIcon } from './Icons'

const SOCIAL_ACCOUNTS = {
  google: {
    label: 'Google',
    bg: 'linear-gradient(135deg, #EA4335 0%, #FBBC05 100%)',
    accounts: [
      { name: 'Alex Johnson', email: 'alex.johnson@gmail.com', avatar: 'AJ', avatarBg: '#EA4335' },
      { name: 'Sarah Chen', email: 'sarah.chen@gmail.com', avatar: 'SC', avatarBg: '#4285F4' },
    ],
  },
  github: {
    label: 'GitHub',
    bg: 'linear-gradient(135deg, #24292e 0%, #6e40c9 100%)',
    accounts: [
      { name: 'devuser42', email: 'devuser42@users.noreply.github.com', avatar: 'D4', avatarBg: '#6e40c9' },
      { name: 'codesmith', email: 'codesmith@users.noreply.github.com', avatar: 'CS', avatarBg: '#2ea44f' },
    ],
  },
  linkedin: {
    label: 'LinkedIn',
    bg: 'linear-gradient(135deg, #0A66C2 0%, #0077B5 100%)',
    accounts: [
      { name: 'Jordan Williams', email: 'j.williams@linkedin.com', avatar: 'JW', avatarBg: '#0A66C2' },
      { name: 'Priya Sharma', email: 'p.sharma@linkedin.com', avatar: 'PS', avatarBg: '#0077B5' },
    ],
  },
}

export default function SocialLoginModal({ provider, isRegister = false, onClose, onLogin }) {
  const config = SOCIAL_ACCOUNTS[provider]
  if (!config) return null

  const ProviderIcon =
    provider === 'google' ? GoogleIcon :
    provider === 'github' ? GithubIcon :
    LinkedinIcon

  return (
    <div className="social-modal-overlay" onClick={onClose}>
      <div className="social-modal" onClick={e => e.stopPropagation()}>

        {/* Branded header */}
        <div className="social-modal-header" style={{ background: config.bg }}>
          <ProviderIcon size={26} />
          <span>Sign {isRegister ? 'up' : 'in'} with {config.label}</span>
          <button className="social-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="social-modal-body">
          <p className="social-modal-prompt">
            Choose an account to continue to <strong>GitPulse</strong>
          </p>

          <div className="social-modal-accounts">
            {config.accounts.map(acc => (
              <button
                key={acc.email}
                className="social-account-row"
                onClick={() => onLogin(acc)}
              >
                <div className="social-account-avatar" style={{ background: acc.avatarBg }}>
                  {acc.avatar}
                </div>
                <div className="social-account-info">
                  <span className="social-account-name">{acc.name}</span>
                  <span className="social-account-email">{acc.email}</span>
                </div>
                <span className="social-account-arrow">→</span>
              </button>
            ))}
          </div>

          <button className="social-use-another" onClick={onClose}>
            Use another account
          </button>
        </div>

        <div className="social-modal-footer">
          To continue, {config.label} will share your name, email and profile picture with GitPulse.
        </div>
      </div>
    </div>
  )
}
