import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function VelocityAreaChart({ data }) {
  // Normalize data to ensure it has a consistent key for the X-axis
  const normalizedData = (data && data.length > 0) ? data.map(item => ({
    ...item,
    xAxisLabel: item.date || item.name || ''
  })) : [
    { xAxisLabel: 'Mon', commits: 45, prs: 12 },
    { xAxisLabel: 'Tue', commits: 52, prs: 18 },
    { xAxisLabel: 'Wed', commits: 38, prs: 15 },
    { xAxisLabel: 'Thu', commits: 65, prs: 22 },
    { xAxisLabel: 'Fri', commits: 48, prs: 20 },
    { xAxisLabel: 'Sat', commits: 24, prs: 8 },
    { xAxisLabel: 'Sun', commits: 32, prs: 10 },
  ];

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Velocity Trends & Commitment Pulse</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: 'var(--primary)' }}></span>
            Commits
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: 'var(--secondary)' }}></span>
            Pull Requests
          </div>
        </div>
      </div>
      
      <div className="chart-canvas-wrapper" style={{ height: 300, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={normalizedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradCommits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPRs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--secondary)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="var(--secondary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="xAxisLabel"
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--tooltip-bg)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: 'var(--tooltip-text)',
                fontSize: '0.8rem',
                boxShadow: 'var(--shadow-xl)',
                padding: '12px',
              }}
              itemStyle={{ color: 'var(--tooltip-text)', padding: '2px 0' }}
              labelStyle={{ color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, fontSize: '0.75rem' }}
              cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="commits"
              stroke="var(--primary)"
              strokeWidth={4}
              fill="url(#gradCommits)"
              dot={false}
              activeDot={{ r: 6, fill: 'var(--primary)', stroke: '#fff', strokeWidth: 3 }}
            />
            <Area
              type="monotone"
              dataKey="prs"
              stroke="var(--secondary)"
              strokeWidth={3}
              strokeDasharray="5 5"
              fill="url(#gradPRs)"
              dot={false}
              activeDot={{ r: 5, fill: 'var(--secondary)', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
