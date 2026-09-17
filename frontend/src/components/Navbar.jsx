import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/predict', label: 'Predict', icon: '🎯' },
  { path: '/history', label: 'History', icon: '📋' },
  { path: '/analytics', label: 'Analytics', icon: '📊' },
]

export default function Navbar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-950/70 backdrop-blur-2xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow duration-300">
              EP
            </div>
            <span className="font-display font-bold text-lg gradient-text">
              EduPredict
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-primary-500/15 text-primary-300 border border-primary-500/20'
                      : 'text-surface-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="mr-1.5">{link.icon}</span>
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-white/[0.05] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-5 h-5 relative">
              <span className={`block absolute h-0.5 w-5 bg-surface-300 transform transition duration-300 ${mobileOpen ? 'rotate-45 top-2' : 'top-0.5'}`} />
              <span className={`block absolute h-0.5 w-5 bg-surface-300 top-2 transition-opacity duration-300 ${mobileOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`block absolute h-0.5 w-5 bg-surface-300 transform transition duration-300 ${mobileOpen ? '-rotate-45 top-2' : 'top-3.5'}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-slide-down">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium mb-1 transition-all ${
                    isActive
                      ? 'bg-primary-500/15 text-primary-300'
                      : 'text-surface-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}
