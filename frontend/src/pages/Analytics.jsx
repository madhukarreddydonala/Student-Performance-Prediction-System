import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '../components/Toast'
import StatsCard from '../components/StatsCard'
import FeatureImportance from '../components/FeatureImportance'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  ScatterChart, Scatter, ZAxis,
  AreaChart, Area,
  Legend,
} from 'recharts'

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e']
const GRADE_COLORS = {
  'A+': '#34d399', 'A': '#6ee7b7', 'B': '#60a5fa',
  'C': '#fbbf24', 'D': '#fb923c', 'F': '#f87171'
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-4 py-3 text-sm">
      {payload.map((p, i) => (
        <p key={i} className="text-surface-300">
          <span className="font-medium text-white">{p.name}: </span>
          {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const toast = useToast()
  const [analytics, setAnalytics] = useState(null)
  const [modelInfo, setModelInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [retraining, setRetraining] = useState(false)

  useEffect(() => {
    Promise.all([
      axios.get('/api/analytics').catch(() => ({ data: null })),
      axios.get('/api/model-info').catch(() => ({ data: null })),
    ]).then(([analyticsRes, modelRes]) => {
      setAnalytics(analyticsRes.data)
      setModelInfo(modelRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const handleRetrain = async () => {
    setRetraining(true)
    try {
      const res = await axios.post('/api/retrain')
      const modelRes = await axios.get('/api/model-info')
      setModelInfo(modelRes.data)
      toast.success(`Model retrained! R² = ${modelRes.data.r2}`)
    } catch (err) {
      const msg = err.response?.status === 429
        ? 'Rate limit exceeded. Please wait before retraining again.'
        : 'Retrain failed. Please try again.'
      toast.error(msg)
    } finally {
      setRetraining(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-12 animate-fade-in flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium mb-4">
            📊 Data Analytics
          </div>
          <h1 className="text-4xl font-display font-extrabold text-white">
            Analytics <span className="gradient-text">Dashboard</span>
          </h1>
        </div>
        <button
          onClick={handleRetrain}
          disabled={retraining}
          className="btn-secondary flex items-center gap-2"
          id="retrain-button"
        >
          {retraining ? (
            <><div className="spinner w-4 h-4 border-2" /> Retraining...</>
          ) : (
            <>🔄 Retrain Model</>
          )}
        </button>
      </div>

      {/* Model Stats */}
      {modelInfo && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
          <StatsCard icon="📈" label="R² Score" value={modelInfo.r2} color="primary" />
          <StatsCard icon="📉" label="MAE" value={modelInfo.mae} color="amber" />
          <StatsCard icon="📐" label="RMSE" value={modelInfo.rmse} color="rose" />
          <StatsCard
            icon="🎯"
            label="Total Predictions"
            value={analytics?.total_predictions || 0}
            color="green"
          />
        </div>
      )}

      {/* Summary Stats */}
      {analytics && analytics.total_predictions > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <StatsCard icon="⭐" label="Average Score" value={analytics.average_score} color="blue" />
          <StatsCard icon="🏆" label="Highest Score" value={analytics.highest_score} color="green" />
          <StatsCard icon="📝" label="Lowest Score" value={analytics.lowest_score} color="rose" />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Score Distribution */}
        {analytics?.score_distribution?.length > 0 && (
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
              📊 Score Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.score_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Students" radius={[8, 8, 0, 0]} barSize={40}>
                  {analytics.score_distribution.map((entry, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Grade Distribution (Pie) */}
        {analytics?.grade_distribution?.length > 0 && (
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
              🏅 Grade Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.grade_distribution.filter(g => g.count > 0)}
                  dataKey="count"
                  nameKey="grade"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  strokeWidth={0}
                  label={({ grade, count }) => `${grade}: ${count}`}
                >
                  {analytics.grade_distribution
                    .filter(g => g.count > 0)
                    .map((entry, index) => (
                      <Cell key={index} fill={GRADE_COLORS[entry.grade] || CHART_COLORS[index]} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Study Hours vs Score Scatter */}
        {analytics?.scatter_data?.length > 0 && (
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
              📚 Study Hours vs Score
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="study_hours" name="Study Hours" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis dataKey="score" name="Score" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <ZAxis range={[30, 30]} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter data={analytics.scatter_data} fill="#6366f1" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Attendance vs Score */}
        {analytics?.attendance_vs_score?.length > 0 && (
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <h3 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
              ✅ Attendance vs Score
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="attendance" name="Attendance %" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis dataKey="score" name="Score" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <ZAxis range={[30, 30]} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter data={analytics.attendance_vs_score} fill="#a855f7" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Feature Importance */}
      {modelInfo?.feature_importance && (
        <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <FeatureImportance data={modelInfo.feature_importance} />
        </div>
      )}

      {/* Empty State */}
      {(!analytics || analytics.total_predictions === 0) && (
        <div className="glass-card p-12 text-center mt-8">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-surface-400 text-lg">No prediction data available for analytics.</p>
          <p className="text-surface-500 text-sm mt-2">
            Make some predictions first, then come back here to see charts!
          </p>
        </div>
      )}
    </div>
  )
}
