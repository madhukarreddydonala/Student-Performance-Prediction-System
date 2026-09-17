import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="glass-card p-12 text-center max-w-md">
            <div className="text-6xl mb-6">💥</div>
            <h1 className="text-2xl font-display font-bold text-white mb-3">
              Something went wrong
            </h1>
            <p className="text-surface-400 mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              ↻ Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
