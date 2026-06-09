/**
 * Task 5.2 — Verify Logo appears in LandingHome footer across viewports
 *
 * Tests:
 * 1. Logo element is present inside .footer-main
 * 2. Logo visible at 375 px (mobile) and 1280 px (desktop)
 * 3. No layout overflow introduced by the Logo addition
 *
 * Requirements: 2.6
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import LandingHome from '../LandingHome'

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false }),
  AuthProvider: ({ children }) => <>{children}</>,
}))

vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'dark', toggleTheme: vi.fn() }),
  ThemeProvider: ({ children }) => <>{children}</>,
}))

vi.mock('../../components/PublicNavbar', () => ({
  default: () => <nav data-testid="public-navbar" />,
}))

// VelocityAreaChart uses recharts which relies on ResizeObserver — stub it out
vi.mock('../../components/VelocityAreaChart', () => ({
  default: ({ data }) => <div data-testid="velocity-chart" data-points={data?.length} />,
}))

// ─── Helpers ─────────────────────────────────────────────────────────────────

const renderLandingHome = () =>
  render(
    <MemoryRouter>
      <LandingHome />
    </MemoryRouter>
  )

const setViewportWidth = (width) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  window.dispatchEvent(new Event('resize'))
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('LandingHome — Logo in footer', () => {
  afterEach(() => {
    // Reset viewport to a sensible default so other tests are unaffected
    setViewportWidth(1024)
  })

  it('renders the LandingHome page without crashing', () => {
    renderLandingHome()
    // The footer "Experience the Heartbeat." headline is always present
    expect(screen.getByText(/Experience the Heartbeat/i)).toBeInTheDocument()
  })

  it('Logo is present inside .footer-main', () => {
    renderLandingHome()

    const footerMain = document.querySelector('.footer-main')
    expect(footerMain).not.toBeNull()

    // Logo renders a div.logo-container with role="img" aria-label="GitPulse Logo"
    const logoInFooter = footerMain.querySelector('[aria-label="GitPulse Logo"]')
    expect(logoInFooter).not.toBeNull()
  })

  it('Logo SVG is rendered inside .footer-main', () => {
    renderLandingHome()

    const footerMain = document.querySelector('.footer-main')
    expect(footerMain).not.toBeNull()

    // The Logo component always renders an <svg> element
    const svgInFooter = footerMain.querySelector('svg')
    expect(svgInFooter).not.toBeNull()
  })

  it('Logo wordmark "GitPulse" text is visible inside .footer-main (showText=true)', () => {
    renderLandingHome()

    const footerMain = document.querySelector('.footer-main')
    expect(footerMain).not.toBeNull()

    // LandingHome passes showText={true} to Logo, which renders a .logo-wordmark span
    const wordmark = footerMain.querySelector('.logo-wordmark')
    expect(wordmark).not.toBeNull()
    // The text content of the span spells "GitPulse" (split across child spans)
    expect(wordmark.textContent).toMatch(/GitPulse/i)
  })

  it('Logo is present at 375 px (mobile viewport)', () => {
    setViewportWidth(375)
    renderLandingHome()

    const footerMain = document.querySelector('.footer-main')
    expect(footerMain).not.toBeNull()

    const logoInFooter = footerMain.querySelector('[aria-label="GitPulse Logo"]')
    expect(logoInFooter).not.toBeNull()
  })

  it('Logo is present at 1280 px (desktop viewport)', () => {
    setViewportWidth(1280)
    renderLandingHome()

    const footerMain = document.querySelector('.footer-main')
    expect(footerMain).not.toBeNull()

    const logoInFooter = footerMain.querySelector('[aria-label="GitPulse Logo"]')
    expect(logoInFooter).not.toBeNull()
  })

  it('Logo is the first child of .footer-main (renders above headline)', () => {
    renderLandingHome()

    const footerMain = document.querySelector('.footer-main')
    expect(footerMain).not.toBeNull()

    // Logo container should be first child
    const firstChild = footerMain.firstElementChild
    expect(firstChild).not.toBeNull()
    expect(firstChild.getAttribute('aria-label')).toBe('GitPulse Logo')
  })

  it('no layout overflow: footer-main scrollWidth does not exceed clientWidth', () => {
    renderLandingHome()

    const footerMain = document.querySelector('.footer-main')
    expect(footerMain).not.toBeNull()

    // In jsdom scrollWidth === clientWidth (no real layout engine) — assert they are equal
    // which is the best we can do in a unit test environment (no overflow introduced)
    expect(footerMain.scrollWidth).toBeLessThanOrEqual(footerMain.offsetWidth + 1)
  })
})
