import React from 'react'

/**
 * GitPulse Logo — rounded-square badge with pulse waveform + wordmark
 */
export const Logo = ({
  size = 48,
  className = '',
  showText = false,
  isIntro = false,
}) => {
  const uid = React.useId?.() || 'gp'
  const gradId = `gpGrad${uid}`
  const pulseGradId = `gpPulse${uid}`

  return (
    <div
      className={`logo-container ${isIntro ? 'logo-cinematic' : ''} ${className}`}
      role="img"
      aria-label="GitPulse Logo"
    >
      <div className="logo-mark-wrapper">
        <svg
          width={size}
          height={size}
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="logo-mark-svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id={pulseGradId} x1="12" y1="28" x2="44" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>

          {/* Badge background */}
          <rect x="2" y="2" width="52" height="52" rx="14" fill={`url(#${gradId})`} />
          {/* Gloss highlight */}
          <rect x="2" y="2" width="52" height="26" rx="14" fill="white" opacity="0.08" />
          {/* Stylised G */}
          <path
            d="M36 18.5C33.8 15.3 30.1 13.5 26 13.5C19.4 13.5 14 18.9 14 25.5C14 32.1 19.4 37.5 26 37.5C31 37.5 35.2 34.5 37 30.2"
            stroke="white" strokeWidth="3.8" strokeLinecap="round" fill="none"
          />
          {/* Pulse waveform crossbar */}
          <path
            d="M24 28 L29 28 L31 21 L33 35 L35 25 L37 30 L40 28"
            stroke={`url(#${pulseGradId})`} strokeWidth="2.8"
            strokeLinecap="round" strokeLinejoin="round" fill="none"
          />
          {/* Git node dot */}
          <circle cx="37" cy="30.2" r="2.6" fill="white" />
        </svg>
      </div>

      {showText && (
        <span className="logo-wordmark">
          <span className="logo-ltr logo-ltr-accent logo-ltr-1">G</span>
          <span className="logo-ltr logo-ltr-2">i</span>
          <span className="logo-ltr logo-ltr-3">t</span>
          <span className="logo-ltr logo-ltr-accent logo-ltr-4">P</span>
          <span className="logo-ltr logo-ltr-5">u</span>
          <span className="logo-ltr logo-ltr-6">l</span>
          <span className="logo-ltr logo-ltr-7">s</span>
          <span className="logo-ltr logo-ltr-8">e</span>
        </span>
      )}
    </div>
  )
}

export default Logo
