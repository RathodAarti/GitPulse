import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api, { setAuthHeader } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('gp_token'))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Sync axios defaults and fetch user details on load
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const storedToken = localStorage.getItem('gp_token')
      if (storedToken) {
        setAuthHeader(storedToken)
        try {
          const res = await api.get('/auth/profile')
          if (isMounted) {
            if (res.data?.success) {
              setUser(res.data.user)
              setIsAuthenticated(true)
            } else {
              throw new Error('Profile fetch failed')
            }
          }
        } catch (err) {
          if (isMounted) {
            console.error('Failed to restore authentication session:', err.message)
            setToken(null)
            setUser(null)
            setIsAuthenticated(false)
            localStorage.removeItem('gp_token')
            setAuthHeader(null)
          }
        }
      } else {
        if (isMounted) {
          setIsAuthenticated(false)
          setUser(null)
        }
      }
      if (isMounted) setLoading(false)
    }

    initAuth()
    return () => { isMounted = false }
  }, [])

  const login = useCallback(async (email, password) => {
    console.log('🔍 [Auth] Login attempt with email:', email);
    try {
      console.log('🔍 [Auth] Making POST to /auth/login via api instance');
      const res = await api.post('/auth/login', { email, password })
      console.log('🔍 [Auth] Login response:', res.data);
      // res.data has { success: true, token: '...', user: { ... } }
      if (res.data?.success && res.data?.token) {
        const { token: newToken, user: userData } = res.data
        
        // Set headers immediately for subsequent calls
        setAuthHeader(newToken)
        localStorage.setItem('gp_token', newToken)
        
        setToken(newToken)
        setUser(userData)
        setIsAuthenticated(true)
        return { success: true }
      } else {
        return { success: false, message: res.data?.message || 'Login failed.' }
      }
    } catch (err) {
      console.error('❌ [Auth] Login error:', err);
      console.error('❌ [Auth] Error response:', err.response);
      const message = err.response?.data?.message || 'Login failed. Please try again.'
      return { success: false, message }
    }
  }, [])

  const register = useCallback(async (name, email, password) => {
    console.log('🔍 [Auth] Register attempt with name:', name, 'email:', email);
    try {
      console.log('🔍 [Auth] Making POST to /auth/register via api instance');
      const res = await api.post('/auth/register', { name, email, password })
      console.log('🔍 [Auth] Register response:', res.data);
      // res.data has { success: true, token: '...', user: { ... } }
      if (res.data?.success && res.data?.token) {
        const { token: newToken, user: userData } = res.data
        
        // Set headers immediately for subsequent calls
        setAuthHeader(newToken)
        localStorage.setItem('gp_token', newToken)
        
        setToken(newToken)
        setUser(userData)
        setIsAuthenticated(true)
        return { success: true }
      } else {
        return { success: false, message: res.data?.message || 'Registration failed.' }
      }
    } catch (err) {
      console.error('❌ [Auth] Register error:', err);
      console.error('❌ [Auth] Error response:', err.response);
      const message = err.response?.data?.message || 'Registration failed. Please try again.'
      return { success: false, message }
    }
  }, [])

  const updateProfile = useCallback(async (data) => {
    try {
      const res = await api.put('/auth/profile', data)
      if (res.data?.success) {
        setUser(prev => ({ ...prev, ...res.data.user }))
      }
      return { success: true, message: res.data?.message }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile.'
      return { success: false, message }
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('gp_token')
    setAuthHeader(null)
  }, [])

  const value = { user, token, isAuthenticated, loading, login, register, logout, updateProfile }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export default AuthContext
