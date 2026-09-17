import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} setToasts={setToasts} />
    </ToastContext.Provider>
  )
}

const ICONS = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
}

const BG_CLASSES = {
  success: 'border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 to-transparent',
  error: 'border-rose-500/30 bg-gradient-to-r from-rose-500/15 to-transparent',
  info: 'border-primary-500/30 bg-gradient-to-r from-primary-500/15 to-transparent',
  warning: 'border-amber-500/30 bg-gradient-to-r from-amber-500/15 to-transparent',
}

function ToastContainer({ toasts, setToasts }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-20 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`glass-card px-5 py-4 animate-slide-down pointer-events-auto cursor-pointer ${BG_CLASSES[toast.type]}`}
          onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          role="alert"
        >
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0 mt-0.5">{ICONS[toast.type]}</span>
            <p className="text-sm text-surface-200 leading-relaxed">{toast.message}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
