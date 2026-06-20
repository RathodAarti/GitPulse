import { useState, useEffect } from 'react'
import api from '../services/api'
import { PeopleIcon, HelpIcon, AlertIcon, CheckIcon, TrashIcon, SyncIcon, RepoIcon } from '../components/Icons'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [queries, setQueries] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [queryFilter, setQueryFilter] = useState('all') // 'all' | 'open' | 'resolved'

  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingQueries, setLoadingQueries] = useState(true)
  const [submittingId, setSubmittingId] = useState(null)

  const [alert, setAlert] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const res = await api.get('/admin/users')
      if (res.data?.success) setUsers(res.data.users)
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.message || 'Failed to retrieve user directory.' })
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchQueries = async () => {
    setLoadingQueries(true)
    try {
      const res = await api.get('/admin/queries')
      if (res.data?.success) setQueries(res.data.queries)
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.message || 'Failed to retrieve support queries.' })
    } finally {
      setLoadingQueries(false)
    }
  }

  useEffect(() => { fetchUsers(); fetchQueries() }, [])

  // Derived stats
  const totalRepos = users.reduce((sum, u) => sum + (u.repoCount ?? 0), 0)
  const openTickets = queries.filter(q => q.status === 'open').length
  const resolvedTickets = queries.filter(q => q.status === 'resolved').length

  // Filtered lists
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  )
  const filteredQueries = queries.filter(q =>
    queryFilter === 'all' ? true : q.status === queryFilter
  )

  const handleEditClick = (user) => {
    setEditingUser(user); setEditName(user.name); setEditEmail(user.email)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editEmail.trim() || !editName.trim()) return
    setSubmittingId(editingUser._id); setAlert(null)
    try {
      const res = await api.put(`/admin/users/${editingUser._id}`, {
        name: editName.trim(), email: editEmail.toLowerCase().trim(),
      })
      if (res.data?.success) {
        setAlert({ type: 'success', text: res.data.message })
        setEditingUser(null); fetchUsers()
      }
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.message || 'Failed to update user details.' })
    } finally { setSubmittingId(null) }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('WARNING: This will permanently delete this user and all their repositories. Continue?')) return
    setSubmittingId(userId); setAlert(null)
    try {
      const res = await api.delete(`/admin/users/${userId}`)
      if (res.data?.success) { setAlert({ type: 'success', text: res.data.message }); fetchUsers() }
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.message || 'Failed to delete user.' })
    } finally { setSubmittingId(null) }
  }

  const handleResolveQuery = async (queryId, currentStatus) => {
    const nextStatus = currentStatus === 'open' ? 'resolved' : 'open'
    setSubmittingId(queryId); setAlert(null)
    try {
      const res = await api.put(`/admin/queries/${queryId}`, { status: nextStatus })
      if (res.data?.success) {
        setQueries(prev => prev.map(q => q._id === queryId ? { ...q, status: nextStatus } : q))
      }
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.message || 'Failed to update ticket.' })
    } finally { setSubmittingId(null) }
  }

  const handleDeleteQuery = async (queryId) => {
    if (!window.confirm('Remove this support ticket from the logs?')) return
    setSubmittingId(queryId); setAlert(null)
    try {
      const res = await api.delete(`/admin/queries/${queryId}`)
      if (res.data?.success) setQueries(prev => prev.filter(q => q._id !== queryId))
    } catch (err) {
      setAlert({ type: 'error', text: err.response?.data?.message || 'Failed to remove ticket.' })
    } finally { setSubmittingId(null) }
  }

  return (
    <div className="settings-page animate-slide-up" id="admin-panel-page">

      {/* Header */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Administrative Control Panel</h2>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => { fetchUsers(); fetchQueries() }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <SyncIcon size={14} /> Refresh Data
        </button>
      </div>

      {/* ── Stats Overview Cards ── */}
      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--primary)' }}>
            <PeopleIcon size={22} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{users.length}</span>
            <span className="admin-stat-label">Registered Users</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
            <RepoIcon size={22} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{totalRepos}</span>
            <span className="admin-stat-label">Tracked Repositories</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <HelpIcon size={22} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{openTickets}</span>
            <span className="admin-stat-label">Open Tickets</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--alert)' }}>
            <CheckIcon size={22} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-value">{resolvedTickets}</span>
            <span className="admin-stat-label">Resolved Tickets</span>
          </div>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`alert-banner alert-${alert.type}`} style={{ marginBottom: 24 }}>
          <span className="alert-icon">
            {alert.type === 'success' ? <CheckIcon size={18} /> : <AlertIcon size={18} />}
          </span>
          <span className="alert-text">{alert.text}</span>
          <button className="alert-dismiss" onClick={() => setAlert(null)} aria-label="Dismiss">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-container" style={{ marginBottom: 24 }}>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <PeopleIcon size={16} /> User Directory ({users.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'queries' ? 'active' : ''}`}
          onClick={() => setActiveTab('queries')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <HelpIcon size={16} /> Support Inbox
          {openTickets > 0 && <span className="admin-badge">{openTickets}</span>}
        </button>
      </div>

      {/* ── User Directory Tab ── */}
      {activeTab === 'users' && (
        <div className="card reveal-on-scroll">
          <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <PeopleIcon size={18} color="var(--accent)" />
              <h3>Registered User Accounts</h3>
            </div>
            {/* Search */}
            <input
              type="search"
              className="admin-search-input"
              placeholder="Search by name or email..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              aria-label="Search users by name or email"
            />
          </div>
          <div className="card-body">
            {loadingUsers ? (
              <div className="view-loading" style={{ padding: '40px 0' }}><div className="loader-spinner" /></div>
            ) : filteredUsers.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
                {userSearch ? 'No users match your search.' : 'No registered users found.'}
              </p>
            ) : (
              <div className="leaderboard-table-wrapper">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th className="text-center">Repos</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="staggered-row is-visible">
                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {u.name}
                          {u.email === 'agrathod0701@gmail.com' && (
                            <span className="top-contributor-badge" style={{ marginLeft: 8 }}>Primary Admin</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td className="text-center font-mono">{u.repoCount ?? 0}</td>
                        <td className="text-right">
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleEditClick(u)}
                              disabled={submittingId === u._id}
                            >
                              Edit
                            </button>
                            {u.email !== 'agrathod0701@gmail.com' && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteUser(u._id)}
                                disabled={submittingId === u._id}
                                aria-label={`Delete user ${u.name}`}
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                <TrashIcon size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Support Inbox Tab ── */}
      {activeTab === 'queries' && (
        <div className="card reveal-on-scroll">
          <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <HelpIcon size={18} color="var(--accent)" />
              <h3>Support Inbox</h3>
            </div>
            {/* Filter Tabs */}
            <div className="admin-filter-tabs">
              {['all', 'open', 'resolved'].map(f => (
                <button
                  key={f}
                  className={`admin-filter-tab ${queryFilter === f ? 'active' : ''}`}
                  onClick={() => setQueryFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === 'open' && openTickets > 0 && <span className="admin-badge admin-badge-sm">{openTickets}</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="card-body">
            {loadingQueries ? (
              <div className="view-loading" style={{ padding: '40px 0' }}><div className="loader-spinner" /></div>
            ) : filteredQueries.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
                {queryFilter === 'open' ? 'No open tickets. Inbox is clear!' :
                 queryFilter === 'resolved' ? 'No resolved tickets yet.' : 'Support inbox is empty.'}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {filteredQueries.map((q) => (
                  <div
                    key={q._id}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 20,
                      background: q.status === 'resolved' ? 'var(--bg-page)' : 'var(--bg-card)',
                      opacity: q.status === 'resolved' ? 0.75 : 1,
                      transition: 'all 0.3s ease',
                      borderLeft: q.status === 'open' ? '3px solid var(--primary)' : '3px solid var(--success)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                      <div>
                        <span className={`sync-status-tag ${q.status === 'resolved' ? 'fresh' : 'stale'}`} style={{ marginBottom: 8, display: 'inline-block' }}>
                          {q.status === 'resolved' ? 'Resolved' : 'Open'}
                        </span>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{q.subject}</h4>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <strong>{q.name}</strong> · {q.email} · {new Date(q.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className={`btn btn-sm ${q.status === 'resolved' ? 'btn-secondary' : 'btn-primary'}`}
                          onClick={() => handleResolveQuery(q._id, q.status)}
                          disabled={submittingId === q._id}
                        >
                          {q.status === 'resolved' ? 'Reopen' : 'Resolve'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteQuery(q._id)}
                          disabled={submittingId === q._id}
                          aria-label={`Delete ticket: ${q.subject}`}
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>
                    <div style={{
                      padding: '10px 14px',
                      background: 'var(--bg-input)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.88rem',
                      whiteSpace: 'pre-line',
                      lineHeight: 1.6,
                    }}>
                      {q.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div
          className="sidebar-overlay"
          onClick={() => setEditingUser(null)}
          style={{ display: 'block', zIndex: 1100, background: 'rgba(0,0,0,0.4)' }}
        >
          <div
            className="card settings-card animate-scale-in"
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%', maxWidth: 460, zIndex: 1200,
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div className="card-header">
              <PeopleIcon size={18} color="var(--accent)" />
              <h3>Edit Account Credentials</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSaveEdit}>
                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label>Name</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label>Email Address</label>
                  <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submittingId !== null}>
                    {submittingId === editingUser._id ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

