import { useState, useEffect, Suspense, lazy, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { DashboardIcon, SettingsIcon, HelpIcon, SunIcon, MoonIcon, MenuIcon, XIcon, LogoutIcon, ShieldIcon, EditIcon } from './components/Icons'
import Logo from './components/Logo'
import SplashScreen from './GitPulse/SplashScreen'
import SupportWidget from './components/SupportWidget'
import VersionCheck from './components/VersionCheck'

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
  const sidebarRef = useRef(null)

  // Sidebar Collapse State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false)
  
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

  // Close sidebar on route change for mobile
  useEffect(() => {
    setSidebarMobileOpen(false)
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
    return <Navigate to="/login" replace />
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
      {/* Sidebar Overlay for Mobile */}
      {sidebarMobileOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarMobileOpen ? 'mobile-open' : ''}`} 
        id="sidebar"
        role="navigation"
        aria-label="Main navigation"
        ref={sidebarRef}
      >
        {/* User Profile Section */}
        <div className="sidebar-profile stagger-item delay-1">
          <div className="sidebar-user">
            <div className="user-avatar">{initials}</div>
            {!sidebarCollapsed && (
              <div className="user-info">
                <div className="name">{user?.name || user?.email || 'Admin'}</div>
                <div className="role">{user?.email || 'Administrator'}</div>
              </div>
            )}
            <NavLink
              to="/dashboard/settings"
              className="edit-profile-btn"
              aria-label="Edit profile"
              title="Edit profile"
            >
              <EditIcon size={16} />
            </NavLink>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="sidebar-actions">
          <button 
            className="sidebar-theme-toggle" 
            onClick={toggleTheme} 
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="theme-indicator-dot"></span>
            {!sidebarCollapsed && <span className="theme-label">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="stagger-item delay-3">
            <NavLink to="/dashboard" end id="nav-dashboard">
              <span className="nav-icon"><DashboardIcon size={20} /></span>
              {!sidebarCollapsed && 'Dashboard'}
            </NavLink>
          </div>
          {user?.email === 'agrathod0701@gmail.com' && (
            <div className="stagger-item delay-4">
              <NavLink to="/dashboard/admin" id="nav-admin">
                <span className="nav-icon"><ShieldIcon size={20} /></span>
                {!sidebarCollapsed && 'Admin Panel'}
              </NavLink>
            </div>
          )}
          <div className="stagger-item delay-5">
            <NavLink to="/dashboard/settings" id="nav-settings">
              <span className="nav-icon"><SettingsIcon size={20} /></span>
              {!sidebarCollapsed && 'Dashboard Settings'}
            </NavLink>
          </div>
          <div className="stagger-item delay-6">
            <NavLink to="/dashboard/help" id="nav-help">
              <span className="nav-icon"><HelpIcon size={20} /></span>
              {!sidebarCollapsed && 'Help Center'}
            </NavLink>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="sidebar-footer stagger-item delay-7">
          <button className="logout-mini-btn" onClick={logout} title="Sign Out" aria-label="Sign Out">
            <LogoutIcon size={18} />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Sidebar Toggle Indicator */}
      <button
        className="sidebar-toggle-indicator"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? '→' : '←'}
      </button>

      {/* Main Content */}
      <main className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <header className="top-bar stagger-item delay-1" id="top-bar">
          <div className="top-bar-left">
            <button 
              className="mobile-hamburger-btn"
              onClick={() => setSidebarMobileOpen(!sidebarMobileOpen)}
              aria-label="Toggle mobile menu"
            >
              {sidebarMobileOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
            </button>
            <Logo size={40} showText={true} className="top-bar-logo" />
          </div>
          <div className="top-bar-actions">
            {/* Theme toggle moved to sidebar */}
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
    <VersionCheck>
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
    </VersionCheck>
  )
}
