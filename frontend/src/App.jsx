import { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { DashboardIcon, SettingsIcon, HelpIcon, SunIcon, MoonIcon, MenuIcon, XIcon, LogoutIcon, ShieldIcon } from './components/Icons'
import Logo from './components/Logo'
import SplashScreen from './GitPulse/SplashScreen'
import SupportWidget from './components/SupportWidget'

import LandingHome from './views/LandingHome'
import AuthPortal from './views/AuthPortal'
import Home from './views/Home'
import RepositoryView from './views/RepositoryView'
import Settings from './views/Settings'
import Help from './views/Help'
import AdminPanel from './views/AdminPanel'

// Loading Placeholder for Suspense
const ViewLoader = () => (
  <div className="view-loading">
    <div className="loader-spinner"></div>
  </div>
)

// Custom Hook for Scroll-Triggered Animations
function useScrollReveal(trigger) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Observe initial elements
    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    // Watch for dynamic DOM additions to observe newly rendered scroll-reveal elements
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // ELEMENT_NODE
            if (node.classList.contains('reveal-on-scroll')) {
              observer.observe(node);
            }
            node.querySelectorAll('.reveal-on-scroll').forEach((el) => {
              observer.observe(el);
            });
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [trigger]);
}

function AppShell() {
  const { isAuthenticated, user, logout, loading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  useScrollReveal(location.pathname)

  // Mobile Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Track if cinematic intro has played in this session
  const [hasPlayedIntro, setHasPlayedIntro] = useState(() => {
    return sessionStorage.getItem('gitpulse_intro_played') === 'true'
  })

  useEffect(() => {
    if (!hasPlayedIntro) {
      const timer = setTimeout(() => {
        sessionStorage.setItem('gitpulse_intro_played', 'true')
        setHasPlayedIntro(true)
      }, 3400) // Sync with letter-by-letter brand name animation
      return () => clearTimeout(timer)
    }
  }, [hasPlayedIntro])

  // Automatically close sidebar when navigation occurs
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  if (loading) {
    return (
      <div className="loading-screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '20px' }}>
        <Logo size={80} className="animate-pulse" />
        <p>Verifying Project Scope...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'A'

  const pageTitle =
    location.pathname === '/dashboard'
      ? 'Overview'
      : location.pathname.startsWith('/dashboard/repo/')
        ? 'Analytics'
        : location.pathname === '/dashboard/admin'
          ? 'Admin Control'
          : location.pathname === '/dashboard/settings'
            ? 'Settings'
            : location.pathname === '/dashboard/help'
              ? 'Help Center'
              : 'GitPulse'

  return (
    <div className="app-shell">
      {/* Mobile Sidebar Dark Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} id="sidebar">
        {/* Mobile Sidebar Close Button */}
        <button 
          className="sidebar-close-btn" 
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <XIcon size={20} />
        </button>

        <div className="sidebar-brand stagger-item delay-1">
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }}>
            <Logo size={42} showText={true} isIntro={!hasPlayedIntro} />
          </Link>
          <div className="tagline">Cross-Repository Pulse</div>
        </div>

        <nav className="sidebar-nav">
          <div className="stagger-item delay-2">
            <NavLink to="/dashboard" end id="nav-dashboard">
              <span className="nav-icon"><DashboardIcon size={20} /></span>
              Overview
            </NavLink>
          </div>
          {user?.email === 'agrathod0701@gmail.com' && (
            <div className="stagger-item delay-3">
              <NavLink to="/dashboard/admin" id="nav-admin">
                <span className="nav-icon"><ShieldIcon size={20} /></span>
                Admin Panel
              </NavLink>
            </div>
          )}
          <div className="stagger-item delay-4">
            <NavLink to="/dashboard/settings" id="nav-settings">
              <span className="nav-icon"><SettingsIcon size={20} /></span>
              Settings
            </NavLink>
          </div>
          <div className="stagger-item delay-5">
            <NavLink to="/dashboard/help" id="nav-help">
              <span className="nav-icon"><HelpIcon size={20} /></span>
              Help Center
            </NavLink>
          </div>
        </nav>

        <div className="sidebar-footer stagger-item delay-5">
          <div className="sidebar-user">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="name">{user?.name || user?.email || 'Admin'}</div>
              <div className="role">Administrator</div>
            </div>
            <button className="logout-mini-btn" onClick={logout} title="Sign Out">
              <LogoutIcon size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar stagger-item delay-1" id="top-bar">
          <div className="top-bar-left">
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={sidebarOpen}
              aria-controls="sidebar"
            >
              <MenuIcon size={22} />
            </button>
            <Logo size={32} className="top-bar-logo" />
            <div className="page-title">{pageTitle}</div>
          </div>
          <div className="top-bar-actions">
            <button 
              className="theme-toggle-pill" 
              onClick={toggleTheme} 
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <div className={`pill-thumb ${theme === 'dark' ? 'is-dark' : ''}`}>
                {theme === 'dark' ? <MoonIcon size={14} /> : <SunIcon size={14} />}
              </div>
            </button>
          </div>
        </header>

        <div className="page-body">
          <Suspense fallback={<ViewLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/repo/:repoId" element={<RepositoryView />} />
              {user?.email === 'agrathod0701@gmail.com' && (
                <Route path="/admin" element={<AdminPanel />} />
              )}
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<Help />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  )
}

function AuthPage() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return (
    <Suspense fallback={<ViewLoader />}>
      <AuthPortal />
    </Suspense>
  )
}

export default function App() {
  const [isBooting, setIsBooting] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Phase 1: Wait for logo animation to complete (2s sequence)
    const animTimer = setTimeout(() => {
      setIsExiting(true)
    }, 2000)

    // Phase 2: Wait for splash screen fade-out to complete (0.8s)
    const exitTimer = setTimeout(() => {
      setIsBooting(false)
    }, 2800)

    return () => {
      clearTimeout(animTimer)
      clearTimeout(exitTimer)
    }
  }, [])

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {isBooting && <SplashScreen isExiting={isExiting} />}
          <div className={`app-main-orchestrator ${isExiting ? 'is-ready' : ''}`}>
            <Suspense fallback={<ViewLoader />}>
              <Routes>
                <Route path="/" element={<LandingHome />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/dashboard/*" element={<AppShell />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
          {/* Global floating support widget — visible on every page */}
          <SupportWidget />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
