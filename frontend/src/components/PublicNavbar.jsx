import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Logo from './Logo'
import { SunIcon, MoonIcon, MenuIcon, XIcon } from './Icons'

export default function PublicNavbar() {
  const { theme, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
          <Link to="/login" className="btn btn-secondary btn-sm" onClick={() => setIsMenuOpen(false)}>Log In</Link>
          <Link to="/login?tab=signup" className="btn btn-primary btn-sm" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
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
