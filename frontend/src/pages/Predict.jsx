import React from 'react'
import PredictionForm from '../components/PredictionForm'

export default function Predict() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-4">
          🎯 Prediction Engine
        </div>
        <h1 className="text-4xl font-display font-extrabold text-white mb-3">
          Predict <span className="gradient-text">Exam Score</span>
        </h1>
        <p className="text-surface-400 max-w-lg mx-auto">
          Adjust the sliders below to input student data. Our ML model will
          predict the expected exam performance.
        </p>
      </div>

      {/* Form */}
      <div className="animate-slide-up">
        <PredictionForm />
      </div>
    </div>
  )
}
