import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Logo from './Logo'
import { SunIcon, MoonIcon, ArrowLeftIcon } from './Icons'

export default function PublicNavbar({ showBackToHome = false }) {
  const { theme, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  // Touch/swipe state
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const MIN_SWIPE_DISTANCE = 50

  // Check if we're on signup tab
  const isSignup = new URLSearchParams(location.search).get('tab') === 'signup'

  // Check if we're on the login page — hide the Log In desktop button
  const isOnLoginPage = location.pathname === '/login'

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMenuOpen) setIsMenuOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  // Focus management
  useEffect(() => {
    if (isMenuOpen && menuRef.current) {
      menuRef.current.focus()
    } else if (!isMenuOpen && buttonRef.current) {
      buttonRef.current.focus()
    }
  }, [isMenuOpen])

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname, location.search])

  // Swipe to close
  const handleTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX)
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > MIN_SWIPE_DISTANCE && isMenuOpen) setIsMenuOpen(false)
  }

  return (
    <>
      <nav
        className="public-navbar public-navbar-refined"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="navbar-content">
          {/* Left — back button or logo */}
          {showBackToHome ? (
            <Link to="/" className="nav-back-btn">
              <ArrowLeftIcon size={18} />
              <span className="nav-back-text">Back to Home</span>
            </Link>
          ) : (
            <Link to="/" className="nav-logo">
              <Logo size={42} showText={true} />
            </Link>
          )}

          {/* Desktop actions — hidden on login page */}
          <div className="nav-actions desktop-nav-actions">
            {!isOnLoginPage && (
              <Link to="/login" className="btn btn-primary btn-large nav-desktop-login">
                Log In
              </Link>
            )}
            <button
              className="theme-toggle-pill"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <div className={`pill-thumb ${theme === 'dark' ? 'is-dark' : ''}`}>
                {theme === 'dark' ? <MoonIcon size={14} /> : <SunIcon size={14} />}
              </div>
            </button>
          </div>

          {/* Animated hamburger — mobile only */}
          <button
            ref={buttonRef}
            className={`nav-hamburger ${isMenuOpen ? 'is-open' : ''}`}
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-side-menu"
          >
            <span className="nav-ham-bar bar-1" />
            <span className="nav-ham-bar bar-2" />
            <span className="nav-ham-bar bar-3" />
          </button>
        </div>
      </nav>

      {/* Slide-in drawer from RIGHT */}
      <div
        ref={menuRef}
        id="mobile-side-menu"
        className={`nav-drawer ${isMenuOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        tabIndex={-1}
      >
        {/* Drawer header */}
        <div className="nav-drawer-header">
          <Logo size={36} showText={true} />
        </div>

        <div className="nav-drawer-body">
          {/* Auth action button */}
          {!isOnLoginPage && (
            <Link
              to={isSignup ? '/login' : '/login?tab=signup'}
              onClick={() => setIsMenuOpen(false)}
              className="nav-drawer-cta"
            >
              {isSignup ? 'Log In' : 'Sign Up'}
            </Link>
          )}

          {/* Theme toggle row */}
          <div className="nav-drawer-theme">
            <div className="nav-drawer-theme-label">
              {theme === 'dark' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <button
              className={`nav-drawer-theme-switch ${theme === 'dark' ? 'is-dark' : ''}`}
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span className="nav-drawer-theme-thumb" />
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop overlay */}
      {isMenuOpen && (
        <div
          className="nav-overlay"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
