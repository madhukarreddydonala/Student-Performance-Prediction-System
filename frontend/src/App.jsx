import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/Toast'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Predict from './pages/Predict'
import History from './pages/History'
import Analytics from './pages/Analytics'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          {/* Animated background glows */}
          <div className="bg-glow bg-glow-1" aria-hidden="true" />
          <div className="bg-glow bg-glow-2" aria-hidden="true" />
          <div className="bg-glow bg-glow-3" aria-hidden="true" />

          <div className="relative z-10 min-h-screen bg-grid">
            <Navbar />
            <main className="pt-20" role="main">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/predict" element={<Predict />} />
                <Route path="/history" element={<History />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="relative z-10 mt-20 border-t border-white/[0.06] py-8" role="contentinfo">
              <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-surface-500 text-sm">
                  © {new Date().getFullYear()} <span className="gradient-text font-semibold">EduPredict</span> — Built with React, Flask, scikit-learn & MySQL
                </p>
              </div>
            </footer>
          </div>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  )
}
