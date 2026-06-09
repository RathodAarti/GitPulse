import React from 'react';

export default function SplashScreen({ isExiting = false }) {
  return (
    <div className={`splash-screen-overlay is-intro ${isExiting ? 'splash-exit-active' : ''}`}>
      <div className="splash-content">
        <svg
          viewBox="0 0 200 200"
          width="240"
          height="240"
          className="gitpulse-vector-engine"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Brand-matched gradient for the heartbeat pulse */}
            <linearGradient id="splashPulseGrad" x1="20" y1="105" x2="180" y2="105" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="40%" stopColor="#a855f7" />
              <stop offset="70%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            {/* Purple-to-white gradient for the monogram */}
            <linearGradient id="gpTextGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>

          {/* Layer 1: The Upgraded Geometric Hex-Shield */}
          <polygon
            points="100,10 180,55 180,145 100,190 20,145 20,55"
            className="hex-shield-frame"
          />

          {/* Phase 1: The Static Initial Monogram (GP) */}
          <g className="monogram-letters">
            <text
              x="100"
              y="118"
              textAnchor="middle"
              className="gp-monogram-text"
              style={{
                fontFamily: '"Inter", "system-ui", sans-serif',
                fontWeight: 800,
                fontSize: '60px',
                fill: 'url(#gpTextGrad)',
                letterSpacing: '-2px'
              }}
            >
              GP
            </text>
          </g>

          {/* Phase 2: The Glowing Telemetry Ignition — brand purple palette */}
          <path
            d="M20,105 L70,105 L80,85 L90,125 L100,45 L110,165 L120,105 L130,105 L140,95 L150,115 L160,105 L180,105"
            className="neon-telemetry-pulse"
          />
        </svg>

        {/* Phase 3: Animated brand name — GP first, then letter-by-letter GitPulse */}
        <div className="splash-brand-name" aria-label="GitPulse">
          <span className="splash-letter splash-l1">G</span>
          <span className="splash-letter splash-l2">i</span>
          <span className="splash-letter splash-l3">t</span>
          <span className="splash-letter splash-l4">P</span>
          <span className="splash-letter splash-l5">u</span>
          <span className="splash-letter splash-l6">l</span>
          <span className="splash-letter splash-l7">s</span>
          <span className="splash-letter splash-l8">e</span>
        </div>
      </div>
    </div>
  );
}
