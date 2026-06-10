import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Logo from './Logo'
import { SunIcon, MoonIcon, MenuIcon, XIcon } from './Icons'

export default function PublicNavbar() {
  const { theme, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  // Close menu on route change
  useEffect(() => { setIsMenuOpen(false) }, [location.pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMenuOpen])

  return (
    <>
      <nav className="public-navbar public-navbar-refined">
        <div className="navbar-content">
          <Link to="/" className="nav-logo">
            <Logo size={40} showText={true} />
          </Link>

          {/* Desktop nav actions */}
          <div className="nav-actions">
            <button
              className="theme-toggle-pill"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <div className={`pill-thumb ${theme === 'dark' ? 'is-dark' : ''}`}>
                {theme === 'dark' ? <MoonIcon size={14} /> : <SunIcon size={14} />}
              </div>
            </button>
            <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
            <Link to="/login" className="btn btn-primary btn-sm">Get Started</Link>
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="nav-hamburger"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
          >
            <MenuIcon size={24} />
          </button>
        </div>
      </nav>

      {/* Full-screen mobile menu overlay */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)} />
      )}

      <div className={`mobile-menu-panel ${isMenuOpen ? 'is-open' : ''}`} role="dialog" aria-label="Navigation menu">
        {/* Header */}
        <div className="mobile-menu-header">
          <Logo size={36} showText={true} />
          <button
            className="mobile-menu-close"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            <XIcon size={22} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="mobile-menu-nav">
          <Link to="/" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link to="/login" className="mobile-menu-link" onClick={() => setIsMenuOpen(false)}>
            Sign In
          </Link>
          <Link to="/login" className="mobile-menu-link mobile-menu-link-accent" onClick={() => setIsMenuOpen(false)}>
            Get Started
          </Link>
        </nav>

        {/* Bottom — Theme Toggle */}
        <div className="mobile-menu-footer">
          <span className="mobile-menu-theme-label">Theme</span>
          <button
            className="theme-toggle-pill"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <div className={`pill-thumb ${theme === 'dark' ? 'is-dark' : ''}`}>
              {theme === 'dark' ? <MoonIcon size={14} /> : <SunIcon size={14} />}
            </div>
          </button>
        </div>
      </div>
    </>
  )
}
