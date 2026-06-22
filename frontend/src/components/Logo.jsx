import React from 'react'

/**
 * GitPulse Logo — professional, polished with project theme colors!
 * Variations: 'horizontal' (default), 'vertical', 'icon-only'
 */
export const Logo = ({
  size = 48,
  className = '',
  showText = true,
  isIntro = false,
  variation = 'horizontal', // 'horizontal' | 'vertical' | 'icon-only'
}) => {
  const uid = React.useId?.() || 'gp'
  const gradId = `gpGrad${uid}`
  const pulseGradId = `gpPulse${uid}`
  const glowGradId = `gpGlow${uid}`

  const isIconOnly = variation === 'icon-only'
  const isVertical = variation === 'vertical'

  return (
    <div
      className={`logo-container ${isIntro ? 'logo-cinematic' : ''} logo-variation-${variation} ${className}`}
      role="img"
      aria-label="GitPulse Logo"
    >
      <div className="logo-mark-wrapper">
        <div className="logo-glow-effect"></div>
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="logo-mark-svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6d28d9" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id={pulseGradId} x1="16" y1="32" x2="48" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f0abfc" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
            <radialGradient id={`${gradId}shine`} cx="35%" cy="25%" r="60%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            <filter id={glowGradId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id={`${glowGradId}badge`} x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#7c3aed" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Animated pulse rings */}
          <circle cx="32" cy="32" r="26" stroke={`url(#${pulseGradId})`} strokeWidth="1.5" fill="none" opacity="0.4" className="logo-pulse-ring-1" />
          <circle cx="32" cy="32" r="30" stroke={`url(#${pulseGradId})`} strokeWidth="1" fill="none" opacity="0.2" className="logo-pulse-ring-2" />

          {/* Badge background with shadow */}
          <rect x="3" y="3" width="58" height="58" rx="17" fill={`url(#${gradId})`} filter={`url(#${glowGradId}badge)`} className="logo-badge" />
          
          {/* Gloss highlight */}
          <rect x="3" y="3" width="58" height="30" rx="17" fill={`url(#${gradId}shine)`} />

          {/* Stylised G monogram */}
          <path
            d="M41 21.5C38.3 17.6 33.8 15.5 29 15.5C20.8 15.5 14.2 22.1 14.2 30.3C14.2 38.5 20.8 45.1 29 45.1C34.8 45.1 39.7 41.5 41.9 36.2"
            stroke="rgba(255,255,255,0.92)" strokeWidth="4.5" strokeLinecap="round" fill="none" className="logo-g-path"
          />
          
          {/* Pulse waveform crossbar (animated) */}
          <path
            d="M26 32 L31 32 L33.5 23 L36.5 41 L39 27 L41.5 35 L46 32"
            stroke={`url(#${pulseGradId})`} strokeWidth="3.5"
            strokeLinecap="round" strokeLinejoin="round" fill="none"
            filter={`url(#${glowGradId})`}
            className="logo-pulse-path"
          />
          
          {/* Git node dot */}
          <circle cx="42" cy="36" r="3.5" fill="white" opacity="0.95" className="logo-git-dot" />
        </svg>
      </div>

      {!isIconOnly && (
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
