import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

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
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
        try {
          const res = await axios.get('/api/auth/profile')
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
            delete axios.defaults.headers.common['Authorization']
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
    try {
      const res = await axios.post('/api/auth/login', { email, password })
      // res.data has { success: true, token: '...', user: { ... } }
      if (res.data?.success && res.data?.token) {
        const { token: newToken, user: userData } = res.data
        
        // Set headers immediately for subsequent calls
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        localStorage.setItem('gp_token', newToken)
        
        setToken(newToken)
        setUser(userData)
        setIsAuthenticated(true)
        return { success: true }
      } else {
        return { success: false, message: res.data?.message || 'Login failed.' }
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.'
      return { success: false, message }
    }
  }, [])

  const register = useCallback(async (name, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password })
      // res.data has { success: true, token: '...', user: { ... } }
      if (res.data?.success && res.data?.token) {
        const { token: newToken, user: userData } = res.data
        
        // Set headers immediately for subsequent calls
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        localStorage.setItem('gp_token', newToken)
        
        setToken(newToken)
        setUser(userData)
        setIsAuthenticated(true)
        return { success: true }
      } else {
        return { success: false, message: res.data?.message || 'Registration failed.' }
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.'
      return { success: false, message }
    }
  }, [])

  const updateProfile = useCallback(async (data) => {
    try {
      const res = await axios.put('/api/auth/profile', data)
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
    delete axios.defaults.headers.common['Authorization']
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
