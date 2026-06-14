import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Settings from '../Settings'
import { AuthProvider } from '../../context/AuthContext'
import { ThemeProvider } from '../../context/ThemeContext'

// Mock context functions
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      name: 'Aarti Rathod',
      email: 'agrathod0701@gmail.com',
      githubToken: 'ghp_testtoken12345',
    },
    updateProfile: vi.fn(),
  }),
  AuthProvider: ({ children }) => <div>{children}</div>,
}))

vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'dark',
    toggleTheme: vi.fn(),
  }),
  ThemeProvider: ({ children }) => <div>{children}</div>,
}))

describe('Settings Page View', () => {
  it('renders the user profile details and warning', () => {
    render(<Settings />)

    // Verify user name and email input fields
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Full Name/i).value).toBe('Aarti Rathod')

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email Address/i).value).toBe('agrathod0701@gmail.com')

    // Verify warning callout
    expect(screen.getByText(/Careful with your email, it cannot be changed/i)).toBeInTheDocument()
  })
})
