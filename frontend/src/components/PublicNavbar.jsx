import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Logo from './Logo'
import { SunIcon, MoonIcon, MenuIcon, XIcon } from './Icons'

export default function PublicNavbar() {
  const { theme, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  
  // Check if we're on signup tab
  const isSignup = new URLSearchParams(location.search).get('tab') === 'signup'

  return (
    <nav className="public-navbar public-navbar-refined">
      <div className="navbar-content">
        <Link to="/" className="nav-logo">
          <Logo size={42} showText={true} />
        </Link>

        <button
          className="nav-hamburger"
          onClick={() => setIsMenuOpen(prev => !prev)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
        </button>

        <div className={`nav-actions ${isMenuOpen ? 'nav-actions-open' : ''}`}>
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
  )
}
