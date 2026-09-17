import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center animate-fade-in">
        <div className="text-8xl font-display font-extrabold gradient-text mb-4">
          404
        </div>
        <h1 className="text-2xl font-display font-bold text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-surface-400 max-w-md mx-auto mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/" className="btn-primary">
            🏠 Go Home
          </Link>
          <Link to="/predict" className="btn-secondary">
            🎯 Make Prediction
          </Link>
        </div>
      </div>
    </div>
  )
}
