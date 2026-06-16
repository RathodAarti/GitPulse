import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PublicNavbar from '../components/PublicNavbar'
import { ZapIcon, ShieldIcon, TrophyIcon, RepoIcon } from '../components/Icons'
import Logo from '../components/Logo'

export default function LandingHome() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="landing-page">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="hero-workspace">
        <div className="hero-container">
          <div className="hero-text-content stagger-item delay-1">
            <div className="hero-badge">
              <span className="pulse-dot"></span>
              Real-time Analytics Active
            </div>
            <h1 className="hero-title animate-tagline">
              <span className="tagline-word">Git</span>
              <span className="tagline-word">Intelligence,</span>
              <span className="tagline-word highlight-pulse">Pulsing</span>
              <span className="tagline-word">in</span>
              <span className="tagline-word highlight-realtime">Real-Time.</span>
            </h1>
            <p>
              Elevate your engineering oversight with high-fidelity telemetry. 
              Unify cross-repository signals, visualize velocity trends, 
              and empower your lead contributors through data-driven recognition.
            </p>
            <div className="hero-cta-row stagger-item delay-2">
          <Link to="/login?tab=signup" className="btn btn-primary btn-large" aria-label="Get Started">
            Get Started <span className="arrow" aria-hidden="true">→</span>
          </Link>
        </div>
            <div className="hero-meta-text stagger-item delay-3">
              Standardized by elite engineering teams. No configuration required.
            </div>
          </div>
          
          <div className="hero-visual stagger-item delay-4">
            <div className="hero-stats-preview">
              <div className="hero-stat-item">
                <div className="hero-stat-icon"><RepoIcon size={20} /></div>
                <div className="hero-stat-info">
                  <span className="hero-stat-num">50+</span>
                  <span className="hero-stat-label">Repositories Tracked</span>
                </div>
              </div>
              <div className="hero-stat-item">
                <div className="hero-stat-icon"><ZapIcon size={20} /></div>
                <div className="hero-stat-info">
                  <span className="hero-stat-num">Real-time</span>
                  <span className="hero-stat-label">Commit Analytics</span>
                </div>
              </div>
              <div className="hero-stat-item">
                <div className="hero-stat-icon"><TrophyIcon size={20} /></div>
                <div className="hero-stat-info">
                  <span className="hero-stat-num">Top</span>
                  <span className="hero-stat-label">Contributor Leaderboard</span>
                </div>
              </div>
              <div className="hero-stat-item">
                <div className="hero-stat-icon"><ShieldIcon size={20} /></div>
                <div className="hero-stat-info">
                  <span className="hero-stat-num">Secure</span>
                  <span className="hero-stat-label">JWT Authentication</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Matrix */}
      <section className="features-matrix">
        <div className="section-header text-center stagger-item delay-5">
          <h2 className="section-title">Engineered for Precision</h2>
          <p className="section-subtitle">A high-performance observability layer designed for elite engineering workspaces.</p>
        </div>
        
        <div className="feature-grid">
          <div className="feature-card stagger-item delay-6" tabIndex="0">
            <div className="feature-icon-wrapper" aria-hidden="true">
              <ZapIcon size={24} />
            </div>
            <h3>Unified Signal Aggregator</h3>
            <p>
              Leverage simultaneous asynchronous telemetry extraction to maintain 
              zero-latency oversight across your entire repository portfolio.
            </p>
          </div>
          
          <div className="feature-card stagger-item delay-7" tabIndex="0">
            <div className="feature-icon-wrapper" aria-hidden="true">
              <ShieldIcon size={24} />
            </div>
            <h3>Secure Telemetry Cache</h3>
            <p>
              Our proprietary 20-minute validation engine ensures rapid-fire transitions 
              while eliminating redundant network overhead and API throttling.
            </p>
          </div>
          
          <div className="feature-card stagger-item delay-8" tabIndex="0">
            <div className="feature-icon-wrapper" aria-hidden="true">
              <TrophyIcon size={24} />
            </div>
            <h3>Velocity Recognition</h3>
            <p>
              Identify and reward peak engineering performance with ranked contribution 
              matrices and automated high-impact contributor badges.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-main">
            <Logo size={40} showText={true} />
            <h2>Experience the Heartbeat.</h2>
            <Link to="/login?tab=signup" className="btn btn-primary btn-large">
            Get Started →
          </Link>
          </div>
          
          <div className="footer-links">
            <div className="link-group">
              <a href="#">Engineering Docs</a>
              <a href="#">Source Intelligence</a>
              <a href="#">System Integrity</a>
              <a href="#">Compliance</a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2026 GitPulse Analytics. Professional-grade repository telemetry.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
