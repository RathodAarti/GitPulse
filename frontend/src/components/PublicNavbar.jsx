import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Logo from './Logo'
import { SunIcon, MoonIcon, MenuIcon, XIcon, ArrowLeftIcon } from './Icons'

export default function PublicNavbar({ showBackToHome = false }) {
  const { theme, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  
  // Touch/swipe state for PublicNavbar
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const MIN_SWIPE_DISTANCE = 50
  
  // Check if we're on signup tab
  const isSignup = new URLSearchParams(location.search).get('tab') === 'signup'

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false)
      }
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

  // Close menu when location changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname, location.search])

  // Swipe gesture handlers for PublicNavbar
  const handleTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    
    if (Math.abs(distance) > MIN_SWIPE_DISTANCE) {
      if (distance < 0) {
        // Swipe right - if menu is closed and near right edge
        if (!isMenuOpen && window.innerWidth - touchStart < 50) {
          setIsMenuOpen(true)
        }
      } else {
        // Swipe left - close menu
        if (isMenuOpen) {
          setIsMenuOpen(false)
        }
      }
    }
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
          {showBackToHome ? (
            <Link to="/" className="nav-back-btn">
              <ArrowLeftIcon size={20} />
              <span className="nav-back-text">Back to Home</span>
            </Link>
          ) : (
            <Link to="/" className="nav-logo">
              <Logo size={42} showText={true} />
            </Link>
          )}

          <button
            ref={buttonRef}
            className="nav-hamburger"
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-side-menu"
          >
            {isMenuOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
          </button>

          <div 
            ref={menuRef}
            id="mobile-side-menu"
            className={`nav-actions ${isMenuOpen ? 'nav-actions-open' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
            tabIndex={-1}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
              style={{
                alignSelf: 'flex-end',
                width: '40px',
                height: '40px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)'
              }}
            >
              <XIcon size={24} />
            </button>

            {/* Toggle Button */}
            <div 
              style={{
                display: 'flex',
                gap: '4px',
                background: 'var(--bg-surface)',
                padding: '4px',
                borderRadius: '999px',
                border: '1px solid var(--border)',
                cursor: 'pointer'
              }}
            >
              <Link 
                to="/login" 
                onClick={() => setIsMenuOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '999px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  background: !isSignup ? 'var(--primary)' : 'transparent',
                  color: !isSignup ? 'white' : 'var(--text-primary)',
                  transition: 'all 0.2s ease'
                }}
              >
                Log In
              </Link>
              <Link 
                to="/login?tab=signup" 
                onClick={() => setIsMenuOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '999px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  background: isSignup ? 'var(--primary)' : 'transparent',
                  color: isSignup ? 'white' : 'var(--text-primary)',
                  transition: 'all 0.2s ease'
                }}
              >
                Sign Up
              </Link>
            </div>

            <button 
              className="theme-toggle-pill" 
              onClick={toggleTheme} 
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              <div className={`pill-thumb ${theme === 'dark' ? 'is-dark' : ''}`}>
                {theme === 'dark' ? <MoonIcon size={14} /> : <SunIcon size={14} />}
              </div>
            </button>
          </div>
        </div>
      </nav>
      
      {/* Overlay */}
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
