/**
 * Task 7.2 — Verify hamburger menu behavior in PublicNavbar
 *
 * Validates that the isMenuOpen state, nav-hamburger toggle button, and
 * nav-actions-open class toggle introduced in task 7.1 work correctly.
 *
 * Test cases:
 *  1. nav-hamburger button is present in DOM after render
 *  2. First click adds 'nav-actions-open' class to .nav-actions
 *  3. Second click removes 'nav-actions-open' class from .nav-actions
 *  4. Clicking a nav link while menu is open closes the menu (resets isMenuOpen to false)
 *
 * Validates: Requirements 2.11, 2.16 (Property 5 — Mobile Navigation Is Accessible)
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import PublicNavbar from '../PublicNavbar'

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
  ThemeProvider: ({ children }) => <>{children}</>,
}))

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Render PublicNavbar wrapped in a MemoryRouter (required for <Link>).
 */
function renderNavbar() {
  return render(
    <MemoryRouter>
      <PublicNavbar />
    </MemoryRouter>
  )
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('PublicNavbar — hamburger menu behavior (task 7.2)', () => {
  it('7.2-1 — nav-hamburger button is present in the DOM after render', () => {
    /**
     * Task 7.1 added a <button className="nav-hamburger"> to PublicNavbar.
     * Verify it is in the DOM after a standard render.
     */
    renderNavbar()

    const hamburger = document.querySelector('.nav-hamburger')
    expect(hamburger).not.toBeNull()
    expect(hamburger).toBeInTheDocument()
  })

  it('7.2-2 — clicking hamburger once adds nav-actions-open class to .nav-actions', async () => {
    /**
     * Initial state: isMenuOpen = false → nav-actions does NOT have nav-actions-open.
     * After one click: isMenuOpen = true → nav-actions DOES have nav-actions-open.
     */
    const user = userEvent.setup()
    renderNavbar()

    const navActions = document.querySelector('.nav-actions')
    expect(navActions).not.toBeNull()

    // Before click: class absent
    expect(navActions).not.toHaveClass('nav-actions-open')

    const hamburger = document.querySelector('.nav-hamburger')
    await user.click(hamburger)

    // After first click: class present
    expect(navActions).toHaveClass('nav-actions-open')
  })

  it('7.2-3 — clicking hamburger a second time removes nav-actions-open class', async () => {
    /**
     * After two clicks the toggle returns to closed state.
     * isMenuOpen: false → true → false
     */
    const user = userEvent.setup()
    renderNavbar()

    const hamburger = document.querySelector('.nav-hamburger')
    const navActions = document.querySelector('.nav-actions')

    // Open menu
    await user.click(hamburger)
    expect(navActions).toHaveClass('nav-actions-open')

    // Close menu
    await user.click(hamburger)
    expect(navActions).not.toHaveClass('nav-actions-open')
  })

  it('7.2-4 — clicking the nav link while menu is open closes the menu', async () => {
    /**
     * PublicNavbar has a single nav link that shows either "Sign Up" (default) or "Log In"
     * (when on signup tab). onClick={() => setIsMenuOpen(false)} closes the menu.
     * After opening the menu and clicking "Sign Up", isMenuOpen must reset to false.
     */
    const user = userEvent.setup()
    renderNavbar()

    const hamburger = document.querySelector('.nav-hamburger')
    const navActions = document.querySelector('.nav-actions')

    // Open the menu first
    await user.click(hamburger)
    expect(navActions).toHaveClass('nav-actions-open')

    // Click the "Sign Up" nav link (default state, not on signup tab)
    const navLink = screen.getByText('Sign Up')
    await user.click(navLink)

    // Menu should now be closed
    expect(navActions).not.toHaveClass('nav-actions-open')
  })

  it('7.2-5 — nav link label switches between Sign Up and Log In based on current tab', () => {
    /**
     * When on the signup tab (?tab=signup), the nav link shows "Log In".
     * When on any other page, it shows "Sign Up".
     * This verifies the ternary is correct after the bug fix.
     */
    const { unmount } = render(
      <MemoryRouter initialEntries={['/login?tab=signup']}>
        <PublicNavbar />
      </MemoryRouter>
    )

    // On signup tab: should show "Log In"
    const logInLink = screen.queryByText('Log In')
    expect(logInLink).not.toBeNull()

    unmount()

    // On default (no signup tab): should show "Sign Up"
    render(
      <MemoryRouter initialEntries={['/login']}>
        <PublicNavbar />
      </MemoryRouter>
    )
    const signUpLink = screen.queryByText('Sign Up')
    expect(signUpLink).not.toBeNull()
  })

  it('7.2-6 — hamburger button aria-label reflects open/closed state', async () => {
    /**
     * The button has aria-label="Open menu" when closed and "Close menu" when open.
     * Verify the aria-label toggles correctly with each click.
     */
    const user = userEvent.setup()
    renderNavbar()

    // Initially closed
    const hamburger = document.querySelector('.nav-hamburger')
    expect(hamburger).toHaveAttribute('aria-label', 'Open menu')
    expect(hamburger).toHaveAttribute('aria-expanded', 'false')

    // After opening
    await user.click(hamburger)
    expect(hamburger).toHaveAttribute('aria-label', 'Close menu')
    expect(hamburger).toHaveAttribute('aria-expanded', 'true')

    // After closing
    await user.click(hamburger)
    expect(hamburger).toHaveAttribute('aria-label', 'Open menu')
    expect(hamburger).toHaveAttribute('aria-expanded', 'false')
  })
})
