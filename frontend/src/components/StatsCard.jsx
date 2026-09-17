import React from 'react'

export default function StatsCard({ icon, label, value, subtext, color = 'primary' }) {
  const colorMap = {
    primary: 'from-primary-500/20 to-primary-600/5 border-primary-500/20',
    green: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20',
    rose: 'from-rose-500/20 to-rose-600/5 border-rose-500/20',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
  }

  const iconBgMap = {
    primary: 'bg-primary-500/20 text-primary-400',
    green: 'bg-emerald-500/20 text-emerald-400',
    purple: 'bg-purple-500/20 text-purple-400',
    amber: 'bg-amber-500/20 text-amber-400',
    rose: 'bg-rose-500/20 text-rose-400',
    blue: 'bg-blue-500/20 text-blue-400',
  }

  return (
    <div className={`glass-card-hover p-6 bg-gradient-to-br ${colorMap[color]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${iconBgMap[color]} flex items-center justify-center text-xl`}>
          {icon}
        </div>
      </div>
      <p className="text-surface-400 text-sm font-medium mb-1">{label}</p>
      <p className="text-3xl font-display font-bold text-white">{value}</p>
      {subtext && (
        <p className="text-surface-500 text-xs mt-2">{subtext}</p>
      )}
    </div>
  )
}
