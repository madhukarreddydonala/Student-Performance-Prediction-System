import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-4 py-3 text-sm">
      <p className="text-white font-medium">{label}</p>
      <p className="text-primary-400">
        Importance: {(payload[0].value * 100).toFixed(1)}%
      </p>
    </div>
  )
}

export default function FeatureImportance({ data }) {
  if (!data) return null

  const chartData = Object.entries(data).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    shortName: name.split('_').map(w => w[0].toUpperCase()).join(''),
    value: value,
  }))

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
        🔬 Feature Importance
      </h3>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            type="number"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={180}
            tick={{ fill: '#cbd5e1', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.1)' }} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend list */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {chartData.slice(0, 6).map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-surface-400 truncate">{item.name}</span>
            <span className="text-white font-medium ml-auto">{(item.value * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
