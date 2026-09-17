import React, { useState, useEffect } from 'react'
import axios from 'axios'

function getGradeFromScore(score) {
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

function getGradeClass(grade) {
  const map = {
    'A+': 'grade-a-plus', 'A': 'grade-a', 'B': 'grade-b',
    'C': 'grade-c', 'D': 'grade-d', 'F': 'grade-f',
  }
  return map[grade] || ''
}

export default function History() {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchPredictions = (p) => {
    setLoading(true)
    axios.get(`/api/predictions?page=${p}&per_page=15`)
      .then(res => {
        setPredictions(res.data.predictions || [])
        setTotalPages(res.data.total_pages || 1)
        setTotal(res.data.total || 0)
      })
      .catch(() => setPredictions([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPredictions(page)
  }, [page])

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-4">
          📋 Prediction Records
        </div>
        <h1 className="text-4xl font-display font-extrabold text-white mb-3">
          Prediction <span className="gradient-text">History</span>
        </h1>
        <p className="text-surface-400">
          {total > 0 ? `${total} predictions stored in database` : 'No predictions yet'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="spinner" />
        </div>
      ) : predictions.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-surface-400 text-lg">No predictions found.</p>
          <p className="text-surface-500 text-sm mt-2">
            Go to the Predict page to make your first prediction!
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="glass-card overflow-hidden animate-slide-up">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-6 py-4 text-surface-400 font-medium">#</th>
                    <th className="text-left px-6 py-4 text-surface-400 font-medium">Student</th>
                    <th className="text-center px-6 py-4 text-surface-400 font-medium">Study Hrs</th>
                    <th className="text-center px-6 py-4 text-surface-400 font-medium">Attendance</th>
                    <th className="text-center px-6 py-4 text-surface-400 font-medium">Prev Score</th>
                    <th className="text-center px-6 py-4 text-surface-400 font-medium">Predicted</th>
                    <th className="text-center px-6 py-4 text-surface-400 font-medium">Grade</th>
                    <th className="text-left px-6 py-4 text-surface-400 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((p, i) => {
                    const grade = getGradeFromScore(p.predicted_score)
                    return (
                      <tr
                        key={p.id || i}
                        className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-6 py-4 text-surface-500">{(page - 1) * 15 + i + 1}</td>
                        <td className="px-6 py-4 text-white font-medium">{p.student_name}</td>
                        <td className="px-6 py-4 text-center text-surface-300">{p.study_hours_per_week}</td>
                        <td className="px-6 py-4 text-center text-surface-300">{p.attendance_percentage}%</td>
                        <td className="px-6 py-4 text-center text-surface-300">{p.previous_exam_score}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-white">{p.predicted_score}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-bold text-lg ${getGradeClass(grade)}`}>
                            {grade}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-surface-500 text-xs">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-30"
              >
                ← Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = i + 1
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        page === p
                          ? 'bg-primary-500 text-white'
                          : 'text-surface-400 hover:bg-white/[0.05]'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
