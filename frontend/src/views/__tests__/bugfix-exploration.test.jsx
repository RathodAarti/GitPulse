/**
 * Bug Condition Exploration Tests
 *
 * These tests run against UNFIXED code to CONFIRM the bugs exist.
 *
 * Conditions A, B, C: Tests are EXPECTED TO FAIL on unfixed code
 *   — failure = success (bug confirmed).
 * Condition D: Assertion PASSES on unfixed code
 *   — the CSS is indeed missing the required overrides (bug confirmed).
 *
 * DO NOT fix source code based on these failures.
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.11, 1.15
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import AuthPortal from '../AuthPortal'
import Login from '../Login'

// Suppress jsdom HTMLCanvasElement.getContext errors from ParticleBurst
// The canvas animation fires after component unmount in jsdom and throws.
// This is a test-environment limitation, not a bug.
beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (type) {
    if (type === '2d') {
      return {
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        set shadowBlur(_) {},
        set shadowColor(_) {},
        set globalAlpha(_) {},
        set fillStyle(_) {},
      }
    }
    return null
  })
})

// ─── Shared mocks ───────────────────────────────────────────────────────────

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }) => <>{children}</>,
}))

vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
  ThemeProvider: ({ children }) => <>{children}</>,
}))

vi.mock('../../components/PublicNavbar', () => ({
  default: () => <nav data-testid="public-navbar" />,
}))

import { useAuth } from '../../context/AuthContext'

// ─── Condition A — Shared State Leak (AuthPortal.jsx) ────────────────────────

describe('Condition A — Shared State Leak (AuthPortal.jsx) [EXPECTED TO FAIL on unfixed code]', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      login: vi.fn(),
      register: vi.fn(),
      isAuthenticated: false,
      loading: false,
      user: null,
    })
  })

  it('A1 — login panel formData (email + password) should be CLEARED after switchPanel, but is NOT on unfixed code', async () => {
    /**
     * Bug Condition A: isSharedStateContamination
     * On unfixed code switchPanel() does NOT reset formData.
     * After typing into login inputs and clicking "Join the Pulse" (switchPanel(true)),
     * the register panel (sign-up-container) still shows the same typed values.
     * EXPECTED OUTCOME on unfixed code: test FAILS — inputs retain the typed values.
     *
     * Counterexample: formData retains { email: 'alice@example.com', password: 'Secret1!' }
     * after switchPanel(true) — state is shared, not scoped per panel.
     */
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <AuthPortal />
      </MemoryRouter>
    )

    // Both panels are rendered in the DOM simultaneously (they share formData state).
    // The sign-in-container and sign-up-container both bind to the same formData.
    // Find inputs by their container class using querySelector.
    const signInContainer = document.querySelector('.sign-in-container')
    expect(signInContainer).not.toBeNull()

    const loginEmailInput = signInContainer.querySelector('input[name="email"]')
    const loginPasswordInput = signInContainer.querySelector('input[name="password"]')

    // Type into the login panel inputs
    await user.type(loginEmailInput, 'alice@example.com')
    await user.type(loginPasswordInput, 'Secret1!')

    expect(loginEmailInput.value).toBe('alice@example.com')
    expect(loginPasswordInput.value).toBe('Secret1!')

    // Trigger switchPanel(true) — click "Join the Pulse" in the overlay
    const joinButton = screen.getByText('Join the Pulse')
    await user.click(joinButton)

    // After switchPanel, the register panel inputs should show empty values.
    // Since both panels share formData, the register form's inputs will also reflect the
    // same state. On UNFIXED code: they still hold 'alice@example.com' / 'Secret1!'.
    const signUpContainer = document.querySelector('.sign-up-container')
    expect(signUpContainer).not.toBeNull()

    const registerEmailInput = signUpContainer.querySelector('input[name="email"]')
    const registerPasswordInput = signUpContainer.querySelector('input[name="password"]')

    // On FIXED code: these should be empty strings.
    // On UNFIXED code: they still hold the login panel values → test FAILS.
    expect(registerEmailInput.value).toBe('')       // FAILS on unfixed code
    expect(registerPasswordInput.value).toBe('')    // FAILS on unfixed code
  })

  it('A2 — showPassword toggle should be RESET to false after switchPanel, but is NOT on unfixed code', async () => {
    /**
     * Bug Condition A: showPasswordNotReset
     * On unfixed code switchPanel() does NOT call setShowPassword(false).
     * EXPECTED OUTCOME on unfixed code: test FAILS — password inputs stay type="text".
     *
     * Counterexample: showPassword stays true across panel switch — password visible in new panel.
     */
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <AuthPortal />
      </MemoryRouter>
    )

    // Click the password-visibility toggle in the sign-in panel
    const signInContainer = document.querySelector('.sign-in-container')
    const loginPasswordInput = signInContainer.querySelector('input[name="password"]')
    const passwordToggle = signInContainer.querySelector('.password-toggle-refined')

    expect(loginPasswordInput.type).toBe('password')  // initially masked

    await user.click(passwordToggle)

    // Now showPassword should be true → password input is type="text"
    expect(loginPasswordInput.type).toBe('text')

    // Switch to register panel
    const joinButton = screen.getByText('Join the Pulse')
    await user.click(joinButton)

    // After switchPanel, showPassword should reset to false.
    // Both panels share showPassword state, so all password inputs reflect it.
    // On UNFIXED code: showPassword is still true → both password inputs are type="text".
    const allPasswordInputs = document.querySelectorAll('input[name="password"]')
    allPasswordInputs.forEach(input => {
      // On FIXED code: type should be "password" (reset to false).
      // On UNFIXED code: type is still "text" → test FAILS.
      expect(input.type).toBe('password')  // FAILS on unfixed code
    })
  })
})

// ─── Condition B — Password Policy Inconsistency (Login.jsx) ────────────────

describe('Condition B — Password Policy Inconsistency (Login.jsx) [EXPECTED TO FAIL on unfixed code]', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      login: vi.fn(),
      register: vi.fn(),
      isAuthenticated: false,
      loading: false,
      user: null,
    })
  })

  it('B1 — weak password "abc123" (6 chars, no uppercase) should FAIL validation in register mode, but is ACCEPTED on unfixed code', async () => {
    /**
     * Bug Condition B: isPasswordPolicyInconsistency
     * Login.jsx validateField: `else if (value.length < 6) error = 'Min 6 characters'`
     * 'abc123' has length 6, so length < 6 is FALSE → no error returned.
     * EXPECTED OUTCOME on unfixed code: test FAILS — no validation error shown for 'abc123'.
     *
     * Counterexample: validateField('password', 'abc123') returns '' in Login.jsx register mode.
     */
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    // Switch to register mode
    const createAccountBtn = screen.getByText('Create one')
    await user.click(createAccountBtn)

    // The register slide is the second .login-slide
    const loginSlides = document.querySelectorAll('.login-slide')
    const registerSlide = loginSlides[loginSlides.length - 1]
    const registerPasswordInput = registerSlide.querySelector('input[name="password"]')

    await user.type(registerPasswordInput, 'abc123')
    // Tab away to trigger blur (onChange fires on each keystroke in this component)
    await user.tab()

    // On FIXED code: error 'Min 8 characters' must appear.
    // On UNFIXED code: no error → test FAILS.
    const errorElement = registerSlide.querySelector('.error-text')
    expect(errorElement).not.toBeNull()                             // FAILS on unfixed code
    expect(errorElement?.textContent).toMatch(/min 8/i)            // FAILS on unfixed code
  })

  it('B2 — password "Abc1234" (7 chars) should FAIL validation in register mode, but is ACCEPTED on unfixed code', async () => {
    /**
     * Bug Condition B: 7-char password — also under the correct 8-char minimum.
     * Login.jsx accepts it (7 >= 6, no complexity check).
     * EXPECTED OUTCOME on unfixed code: test FAILS — no validation error.
     *
     * Counterexample: validateField('password', 'Abc1234') returns '' in Login.jsx register mode.
     */
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    const createAccountBtn = screen.getByText('Create one')
    await user.click(createAccountBtn)

    const loginSlides = document.querySelectorAll('.login-slide')
    const registerSlide = loginSlides[loginSlides.length - 1]
    const registerPasswordInput = registerSlide.querySelector('input[name="password"]')

    await user.type(registerPasswordInput, 'Abc1234')
    await user.tab()

    // On FIXED code: error 'Min 8 characters' must appear.
    // On UNFIXED code: no error → test FAILS.
    const errorElement = registerSlide.querySelector('.error-text')
    expect(errorElement).not.toBeNull()                             // FAILS on unfixed code
    expect(errorElement?.textContent).toMatch(/min 8/i)            // FAILS on unfixed code
  })
})

// ─── Condition C — Missing Hamburger (App.jsx top-bar) ───────────────────────

/**
 * AppShell is not exported from App.jsx.
 * We test Condition C by directly inspecting App.jsx source code for the
 * aria-label="Open navigation menu" attribute, which is the observable output
 * that should be present in the top-bar after the fix.
 *
 * On unfixed code, the attribute is absent → test FAILS (confirms bug).
 */
describe('Condition C — Missing Hamburger Button [EXPECTED TO FAIL on unfixed code]', () => {
  it('C1 — App.jsx top-bar should contain aria-label="Open navigation menu" button, but it is ABSENT on unfixed code', () => {
    /**
     * Bug Condition C: isMissingHamburger (authenticated shell)
     * App.jsx top-bar renders only page-title and top-bar-actions (theme toggle).
     * There is NO element/button with aria-label="Open navigation menu" in the JSX.
     * EXPECTED OUTCOME on unfixed code: test FAILS — the attribute is absent from the source.
     *
     * Counterexample: no aria-label="Open navigation menu" exists in App.jsx top-bar section.
     */
    const appJsxPath = resolve(fileURLToPath(import.meta.url), '../../../App.jsx')
    const appJsxContent = readFileSync(appJsxPath, 'utf-8')

    // The fix adds a button with aria-label="Open navigation menu" to the top-bar.
    // On UNFIXED code: this string is absent → assertion FAILS.
    expect(appJsxContent).toContain('aria-label="Open navigation menu"')  // FAILS on unfixed code
  })

  it('C2 — App.jsx top-bar should call setSidebarOpen(true) from a hamburger button, but does NOT on unfixed code', () => {
    /**
     * The fix adds: onClick={() => setSidebarOpen(true)} to the hamburger button.
     * On unfixed code: no call to setSidebarOpen(true) exists in the top-bar JSX.
     * EXPECTED OUTCOME on unfixed code: test FAILS.
     *
     * Counterexample: top-bar section of App.jsx has no setSidebarOpen trigger.
     */
    const appJsxPath = resolve(fileURLToPath(import.meta.url), '../../../App.jsx')
    const appJsxContent = readFileSync(appJsxPath, 'utf-8')

    // Extract the top-bar section between <header className="top-bar"> and </header>
    const topBarStart = appJsxContent.indexOf('<header className="top-bar')
    const topBarEnd = appJsxContent.indexOf('</header>', topBarStart)
    expect(topBarStart).toBeGreaterThan(0)
    expect(topBarEnd).toBeGreaterThan(topBarStart)

    const topBarSection = appJsxContent.substring(topBarStart, topBarEnd + '</header>'.length)

    // On FIXED code: the hamburger button calls setSidebarOpen(true).
    // On UNFIXED code: no such call in the top-bar → test FAILS.
    expect(topBarSection).toContain('setSidebarOpen(true)')  // FAILS on unfixed code
  })
})

// ─── Condition D — Incomplete CSS Rule (App.css) ─────────────────────────────

describe('Condition D — CSS Overrides in App.css [PASS confirms fix is applied — task 8.6]', () => {
  const cssPath = resolve(fileURLToPath(import.meta.url), '../../../App.css')

  it('D1 — App.css @media (max-width: 768px) .form-container NOW HAS height/visibility/pointer-events overrides', () => {
    /**
     * Bug Condition D fix (task 8.1 / 8.6): isMobileLayoutBroken (cssRuleTruncated)
     * The design requires .form-container inside @media (max-width: 768px) to have:
     *   height: auto !important, visibility: visible !important, pointer-events: all !important
     *
     * These were absent on unfixed code (confirmed as counterexample in task 1).
     * After task 8.1 the truncated rule is completed — these overrides are now present.
     *
     * EXPECTED OUTCOME (fixed code): assertions PASS — the fix is confirmed.
     * Validates: Requirements 2.10 (Property 4 — Mobile Layout Renders Single Column)
     */
    const cssContent = readFileSync(cssPath, 'utf-8')

    // Fix confirmed: the required overrides are now present in App.css
    expect(cssContent).toContain('height: auto !important')
    expect(cssContent).toContain('visibility: visible !important')
    expect(cssContent).toContain('pointer-events: all !important')
  })

  it('D2 — App.css @media (max-width: 768px) .form-container NOW HAS top/left positional resets', () => {
    /**
     * The design fix (task 8.1) also adds:
     *   top: auto !important, left: auto !important
     * to .form-container inside the 768px media query.
     *
     * These were absent on unfixed code (confirmed counterexample in task 1).
     * After task 8.1 the truncated rule is completed — these resets are now present.
     *
     * EXPECTED OUTCOME (fixed code): assertions PASS — fix confirmed.
     * Validates: Requirements 2.10 (Property 4 — Mobile Layout Renders Single Column)
     */
    const cssContent = readFileSync(cssPath, 'utf-8')

    // Fix confirmed: the required positional resets are now present in App.css
    expect(cssContent).toContain('top: auto !important')
    expect(cssContent).toContain('left: auto !important')
    // Also verify the width override that proves .form-container columns go full-width
    expect(cssContent).toContain('width: 100% !important')
  })
})
