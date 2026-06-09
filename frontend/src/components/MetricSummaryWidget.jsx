import { DashboardIcon } from './Icons'

function formatNumber(num) {
  if (num == null) return '—'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export default function MetricSummaryWidget({ label, value, change, icon }) {
  const isPositive = change > 0
  const isNegative = change < 0
  const trendClass = isPositive ? 'up' : isNegative ? 'down' : 'neutral'
  const trendLabel = isPositive ? 'increased by' : isNegative ? 'decreased by' : 'no change'

  return (
    <div className="metric-widget animate-fade" tabIndex="0">
      <div className="metric-icon" aria-hidden="true">{icon || <DashboardIcon size={20} />}</div>
      <div className="metric-details">
        <div className="metric-label">{label}</div>
        <div className="metric-main">
          <div className="metric-value">{formatNumber(value)}</div>
          {change !== undefined && (
            <div 
              className={`metric-trend-badge ${trendClass}`}
              aria-label={`${trendLabel} ${Math.abs(change)}%`}
            >
              <span className="trend-icon" aria-hidden="true">
                {isPositive ? '↗' : isNegative ? '↘' : '→'}
              </span>
              <span className="trend-value">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
