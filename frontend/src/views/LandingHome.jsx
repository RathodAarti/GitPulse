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
      <div className="landing-bg-gradient">
        <div className="landing-bg-circle landing-bg-circle-1"></div>
        <div className="landing-bg-circle landing-bg-circle-2"></div>
        <div className="landing-bg-circle landing-bg-circle-3"></div>
      </div>
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
            <p className="hero-description">
              Elevate your engineering oversight with high-fidelity telemetry. 
              Unify cross-repository signals, visualize velocity trends, 
              and empower your lead contributors through data-driven recognition.
            </p>
            <div className="hero-cta-row stagger-item delay-2">
              <Link to="/login?tab=signup" className="btn btn-primary btn-large btn-hero" aria-label="Get Started">
                Get Started <span className="arrow" aria-hidden="true">→</span>
              </Link>
              <Link to="/login" className="btn btn-secondary btn-large btn-hero-outline" aria-label="Login">
                Login
              </Link>
            </div>
            <div className="hero-meta-text stagger-item delay-3">
              Standardized by elite engineering teams. No configuration required.
            </div>
          </div>
          
          <div className="hero-visual stagger-item delay-4">
            <div className="hero-visual-card">
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
              <div className="hero-visual-decoration">
                <div className="hero-decoration-dot hero-decoration-dot-1"></div>
                <div className="hero-decoration-dot hero-decoration-dot-2"></div>
                <div className="hero-decoration-dot hero-decoration-dot-3"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Variations Showcase */}
        <section className="logo-showcase">
          <div className="section-header text-center stagger-item">
            <h2 className="section-title">Brand Identity</h2>
            <p className="section-subtitle">Multiple logo variations for every use case</p>
          </div>
          <div className="logo-showcase-grid">
            <div className="logo-showcase-card">
              <h3 className="logo-showcase-title">Horizontal (Default)</h3>
              <div className="logo-showcase-content">
                <Logo size={56} showText={true} variation="horizontal" />
              </div>
            </div>
            <div className="logo-showcase-card">
              <h3 className="logo-showcase-title">Vertical</h3>
              <div className="logo-showcase-content">
                <Logo size={72} showText={true} variation="vertical" />
              </div>
            </div>
            <div className="logo-showcase-card">
              <h3 className="logo-showcase-title">Icon Only</h3>
              <div className="logo-showcase-content">
                <Logo size={80} showText={false} variation="icon-only" />
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
            <div className="feature-card stagger-item delay-6">
              <div className="feature-icon-wrapper" aria-hidden="true">
                <ZapIcon size={24} />
              </div>
              <h3>Unified Signal Aggregator</h3>
              <p>
                Leverage simultaneous asynchronous telemetry extraction to maintain
                zero-latency oversight across your entire repository portfolio.
              </p>
            </div>
            
            <div className="feature-card stagger-item delay-7">
              <div className="feature-icon-wrapper" aria-hidden="true">
                <ShieldIcon size={24} />
              </div>
              <h3>Secure Telemetry Cache</h3>
              <p>
                Our proprietary 20-minute validation engine ensures rapid-fire transitions
                while eliminating redundant network overhead and API throttling.
              </p>
            </div>
            
            <div className="feature-card stagger-item delay-8">
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
            <Link to="/login?tab=signup" className="btn btn-primary btn-large btn-hero">
              Get Started →
            </Link>
          </div>
          
          <div className="footer-links">
            <div className="link-group">
              <span className="footer-link-placeholder">Engineering Docs</span>
              <span className="footer-link-placeholder">Source Intelligence</span>
              <span className="footer-link-placeholder">System Integrity</span>
              <span className="footer-link-placeholder">Compliance</span>
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
