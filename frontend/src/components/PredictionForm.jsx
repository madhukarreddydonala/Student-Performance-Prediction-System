import React, { useState } from 'react'
import axios from 'axios'
import { useToast } from './Toast'

const formFields = [
  { name: 'study_hours_per_week', label: 'Study Hours / Week', min: 0, max: 40, step: 0.5, default: 15, icon: '📚' },
  { name: 'attendance_percentage', label: 'Attendance %', min: 0, max: 100, step: 1, default: 75, icon: '✅' },
  { name: 'previous_exam_score', label: 'Previous Exam Score', min: 0, max: 100, step: 1, default: 65, icon: '📝' },
  { name: 'assignments_completed', label: 'Assignments Completed', min: 0, max: 20, step: 1, default: 12, icon: '📎' },
  { name: 'class_participation', label: 'Class Participation', min: 1, max: 10, step: 1, default: 5, icon: '🙋' },
  { name: 'sleep_hours', label: 'Sleep Hours / Day', min: 4, max: 12, step: 0.5, default: 7, icon: '😴' },
  { name: 'extracurricular_activities', label: 'Extracurriculars', min: 0, max: 5, step: 1, default: 2, icon: '🏅' },
  { name: 'parent_education_level', label: 'Parent Education (1-5)', min: 1, max: 5, step: 1, default: 3, icon: '🎓' },
  { name: 'internet_access', label: 'Internet Access', min: 0, max: 1, step: 1, default: 1, icon: '🌐', isToggle: true },
  { name: 'tutoring_sessions', label: 'Tutoring Sessions / Week', min: 0, max: 5, step: 1, default: 1, icon: '👨‍🏫' },
]

function getGradeClass(grade) {
  const map = {
    'A+': 'grade-a-plus', 'A': 'grade-a', 'B': 'grade-b',
    'C': 'grade-c', 'D': 'grade-d', 'F': 'grade-f',
  }
  return map[grade] || ''
}

function getGradeBg(grade) {
  const map = {
    'A+': 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30',
    'A': 'from-emerald-500/15 to-emerald-600/5 border-emerald-500/25',
    'B': 'from-blue-500/15 to-blue-600/5 border-blue-500/25',
    'C': 'from-amber-500/15 to-amber-600/5 border-amber-500/25',
    'D': 'from-orange-500/15 to-orange-600/5 border-orange-500/25',
    'F': 'from-rose-500/15 to-rose-600/5 border-rose-500/25',
  }
  return map[grade] || ''
}

export default function PredictionForm() {
  const toast = useToast()
  const [studentName, setStudentName] = useState('')
  const [formData, setFormData] = useState(
    Object.fromEntries(formFields.map(f => [f.name, f.default]))
  )
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await axios.post('/api/predict', {
        student_name: studentName || 'Anonymous',
        ...formData,
      })
      setResult(response.data)
      toast.success(`Prediction complete! ${response.data.student_name} scored ${response.data.predicted_score}/100`)
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to get prediction. Make sure the backend is running.'
      const details = err.response?.data?.details
      setError(details ? details.join(', ') : errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStudentName('')
    setFormData(Object.fromEntries(formFields.map(f => [f.name, f.default])))
    setResult(null)
    setError(null)
    toast.info('Form reset to defaults')
  }

  return (
    <div className="max-w-6xl mx-auto">
      <form onSubmit={handleSubmit}>
        {/* Student Name */}
        <div className="glass-card p-6 mb-6">
          <label htmlFor="student-name" className="block text-sm font-medium text-surface-300 mb-2">
            👤 Student Name
          </label>
          <input
            id="student-name"
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Enter student name..."
            className="input-field"
            maxLength={100}
            autoComplete="name"
          />
        </div>

        {/* Feature Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {formFields.map((field) => (
            <div key={field.name} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <label
                  htmlFor={`field-${field.name}`}
                  className="text-sm font-medium text-surface-300 flex items-center gap-2"
                >
                  <span>{field.icon}</span>
                  {field.label}
                </label>
                <span className="text-lg font-bold text-white tabular-nums" aria-live="polite">
                  {field.isToggle ? (formData[field.name] === 1 ? 'Yes' : 'No') : formData[field.name]}
                </span>
              </div>

              {field.isToggle ? (
                <button
                  type="button"
                  id={`field-${field.name}`}
                  onClick={() => handleChange(field.name, formData[field.name] === 1 ? 0 : 1)}
                  className={`w-14 h-7 rounded-full transition-all duration-300 relative ${
                    formData[field.name] === 1
                      ? 'bg-primary-500'
                      : 'bg-surface-700'
                  }`}
                  role="switch"
                  aria-checked={formData[field.name] === 1}
                  aria-label={field.label}
                >
                  <div
                    className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                      formData[field.name] === 1 ? 'left-7' : 'left-0.5'
                    }`}
                  />
                </button>
              ) : (
                <div className="relative">
                  <input
                    id={`field-${field.name}`}
                    type="range"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={formData[field.name]}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    aria-label={field.label}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer
                               bg-surface-700 accent-primary-500
                               [&::-webkit-slider-thumb]:appearance-none
                               [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                               [&::-webkit-slider-thumb]:rounded-full
                               [&::-webkit-slider-thumb]:bg-primary-500
                               [&::-webkit-slider-thumb]:shadow-lg
                               [&::-webkit-slider-thumb]:shadow-primary-500/50
                               [&::-webkit-slider-thumb]:cursor-pointer
                               [&::-webkit-slider-thumb]:transition-all
                               [&::-webkit-slider-thumb]:hover:scale-110"
                  />
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-surface-600">{field.min}</span>
                    <span className="text-xs text-surface-600">{field.max}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
            id="predict-button"
          >
            {loading ? (
              <>
                <div className="spinner w-5 h-5 border-2" />
                Predicting...
              </>
            ) : (
              <>🎯 Predict Performance</>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary"
            id="reset-button"
          >
            ↺ Reset
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="glass-card p-6 mb-6 border-rose-500/30 bg-gradient-to-r from-rose-500/10 to-transparent animate-scale-in" role="alert">
          <p className="text-rose-400 font-medium">⚠️ {error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`glass-card p-8 bg-gradient-to-br ${getGradeBg(result.grade)} animate-scale-in`} role="status">
          <div className="text-center">
            <p className="text-surface-400 text-sm font-medium mb-2">Predicted Score for</p>
            <h3 className="text-2xl font-display font-bold text-white mb-6">
              {result.student_name}
            </h3>

            <div className="flex items-center justify-center gap-8 mb-6">
              <div>
                <p className="text-6xl font-display font-bold gradient-text mb-1">
                  {result.predicted_score}
                </p>
                <p className="text-surface-400 text-sm">out of 100</p>
              </div>
              <div className="w-px h-20 bg-white/10" />
              <div>
                <p className={`text-6xl font-display font-bold ${getGradeClass(result.grade)}`}>
                  {result.grade}
                </p>
                <p className="text-surface-400 text-sm">Grade</p>
              </div>
            </div>

            <p className="text-surface-300 text-sm">{result.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}
