import { useState } from 'react'
import axios from 'axios'

/* ── Simple markdown-like renderer for the AI response ── */
function renderInsights(text) {
  if (!text) return null
  return text.split('\n').map((line, i) => {
    // Bold headings: **text**
    const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      return <li key={i} dangerouslySetInnerHTML={{ __html: boldLine.replace(/^[-•]\s*/, '') }} />
    }
    if (line.trim() === '') return <br key={i} />
    return <p key={i} dangerouslySetInnerHTML={{ __html: boldLine }} />
  })
}

const RISK_CONFIG = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Critical Risk' },
  high:     { color: '#f97316', bg: 'rgba(249,115,22,0.1)', label: 'High Risk' },
  medium:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Medium Risk' },
  low:      { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Low Risk' },
  unknown:  { color: 'var(--text-muted)', bg: 'var(--bg-input)', label: 'Unknown' },
}

const TREND_CONFIG = {
  accelerating: { color: '#10b981', icon: '↑', label: 'Accelerating' },
  stable:       { color: 'var(--primary)', icon: '→', label: 'Stable' },
  declining:    { color: '#ef4444', icon: '↓', label: 'Declining' },
  'new activity': { color: '#10b981', icon: '✦', label: 'New Activity' },
  'insufficient data': { color: 'var(--text-muted)', icon: '—', label: 'Not enough data' },
}

export default function AIInsightsPanel({ repoId }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [expanded, setExpanded] = useState(false)

  const fetchInsights = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`/api/ai/repo-insights/${repoId}`)
      if (res.data?.success) {
        setData(res.data)
        setExpanded(true)
      } else {
        setError(res.data?.message || 'Failed to generate insights.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'AI service unavailable. Check your GROQ_API_KEY.')
    } finally {
      setLoading(false)
    }
  }

  const busFactor = data?.meta?.busFactor
  const velocity = data?.meta?.velocityTrend
  const riskCfg = RISK_CONFIG[busFactor?.risk] || RISK_CONFIG.unknown
  const trendCfg = TREND_CONFIG[velocity?.trend] || TREND_CONFIG['insufficient data']

  return (
    <div className="ai-insights-panel">
      {/* Header */}
      <div className="ai-insights-header">
        <div className="ai-insights-header-left">
          <div className="ai-badge">
            <span className="ai-badge-dot" />
            AI
          </div>
          <div>
            <div className="ai-insights-title">Repository Intelligence</div>
            <div className="ai-insights-subtitle">
              Powered by LLaMA 3.1 · Groq
              {data?.meta?.generatedAt && (
                <span> · Generated {new Date(data.meta.generatedAt).toLocaleTimeString()}</span>
              )}
            </div>          </div>
        </div>
        <button
          className={`btn btn-sm ${loading ? 'btn-secondary' : 'btn-primary'}`}
          onClick={fetchInsights}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {loading ? (
            <>
              <span className="ai-spinner" />
              Analyzing...
            </>
          ) : data ? (
            '↺ Regenerate'
          ) : (
            '✦ Generate Insights'
          )}
        </button>
      </div>

      {/* Quick Stat Chips — always shown once data is loaded */}
      {data && (
        <div className="ai-chips-row">
          {/* Bus Factor chip */}
          <div className="ai-chip" style={{ background: riskCfg.bg, borderColor: riskCfg.color }}>
            <span style={{ color: riskCfg.color, fontWeight: 800 }}>⚠ Bus Factor</span>
            <span style={{ color: riskCfg.color }}>
              {busFactor?.factor ?? '?'} · {riskCfg.label}
              {busFactor?.topContributor && (
                <span style={{ opacity: 0.8 }}> · @{busFactor.topContributor} owns {busFactor.topPercent}%</span>
              )}
            </span>
          </div>

          {/* Velocity chip */}
          <div className="ai-chip" style={{ background: 'var(--bg-input)', borderColor: 'var(--border)' }}>
            <span style={{ color: trendCfg.color, fontWeight: 800 }}>
              {trendCfg.icon} Velocity
            </span>
            <span style={{ color: trendCfg.color }}>
              {trendCfg.label}
              {velocity?.change !== 0 && velocity?.change !== undefined && (
                <span> ({velocity.change > 0 ? '+' : ''}{velocity.change}%)</span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="ai-insights-error">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="ai-insights-body">
          <div className="ai-skeleton-line" style={{ width: '60%' }} />
          <div className="ai-skeleton-line" style={{ width: '90%' }} />
          <div className="ai-skeleton-line" style={{ width: '75%' }} />
          <div className="ai-skeleton-line" style={{ width: '85%' }} />
          <div className="ai-skeleton-line" style={{ width: '55%' }} />
        </div>
      )}

      {/* AI content */}
      {!loading && data?.insights && expanded && (
        <div className="ai-insights-body">
          <div className="ai-insights-content">
            {renderInsights(data.insights)}
          </div>
          <button
            className="ai-collapse-btn"
            onClick={() => setExpanded(false)}
          >
            ▲ Collapse
          </button>
        </div>
      )}

      {/* Collapsed state */}
      {!loading && data && !expanded && (
        <button className="ai-expand-btn" onClick={() => setExpanded(true)}>
          ▼ Show full AI report
        </button>
      )}

      {/* Empty state */}
      {!loading && !data && !error && (
        <div className="ai-insights-empty">
          Click <strong>Generate Insights</strong> to receive an AI-powered analysis of this repository — covering health status, contributor concentration risk, velocity trends, and actionable recommendations.
        </div>
      )}
    </div>
  )
}
