
import { useState, useEffect } from 'react'
import currentVersionData from '../../public/version.json'

export default function VersionCheck({ children }) {
  const [needsUpdate, setNeedsUpdate] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkVersion = async () => {
      try {
        // Cache busting: add timestamp to ensure latest version.json is fetched
        const response = await fetch(`/version.json?t=${Date.now()}`)
        if (!response.ok) throw new Error('Failed to fetch version')
        const latestData = await response.json()
        
        if (
          latestData.version !== currentVersionData.version ||
          latestData.timestamp !== currentVersionData.timestamp
        ) {
          setNeedsUpdate(true)
        }
      } catch (error) {
        console.error('Version check failed:', error)
        // If version check fails, default to letting user proceed
      } finally {
        setLoading(false)
      }
    }

    checkVersion()
  }, [])

  const handleRefresh = () => {
    window.location.reload(true) // Force reload from server
  }

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        zIndex: 9999
      }}>
        <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Checking for updates...</div>
      </div>
    )
  }

  if (needsUpdate) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        zIndex: 9999
      }}>
        <div style={{
          background: 'var(--bg-card)',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Update Available</h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            A new version of GitPulse is available! Please refresh to get the latest features and fixes.
          </p>
          <button 
            onClick={handleRefresh}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
          >
            Refresh Now
          </button>
        </div>
      </div>
    )
  }

  return children
}

