import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import StatsCard from '../components/StatsCard'
import FeatureImportance from '../components/FeatureImportance'

export default function Home() {
  const [modelInfo, setModelInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/model-info')
      .then(res => setModelInfo(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero Section */}
      <section className="text-center mb-20 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
          Powered by Machine Learning
        </div>

        <h1 className="text-5xl md:text-7xl font-display font-extrabold mb-6 leading-tight">
          Predict Student
          <br />
          <span className="gradient-text">Performance</span>
        </h1>

        <p className="text-surface-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Use advanced ML algorithms to forecast exam scores based on study habits,
          attendance, and academic history. Make data-driven decisions for better outcomes.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/predict" className="btn-primary text-lg px-8 py-4">
            🎯 Start Prediction
          </Link>
          <Link to="/analytics" className="btn-secondary text-lg px-8 py-4">
            📊 View Analytics
          </Link>
        </div>
      </section>

      {/* Stats Cards */}
      {modelInfo && (
        <section className="mb-16 animate-slide-up">
          <h2 className="text-2xl font-display font-bold text-white mb-8 text-center">
            Model Performance Metrics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              icon="📈"
              label="R² Score"
              value={modelInfo.r2}
              subtext="Variance explained by the model"
              color="primary"
            />
            <StatsCard
              icon="📉"
              label="MAE"
              value={modelInfo.mae}
              subtext="Mean Absolute Error"
              color="amber"
            />
            <StatsCard
              icon="📐"
              label="RMSE"
              value={modelInfo.rmse}
              subtext="Root Mean Squared Error"
              color="rose"
            />
            <StatsCard
              icon="🧪"
              label="Test Samples"
              value={modelInfo.samples_tested}
              subtext="Data points in test set"
              color="green"
            />
          </div>
        </section>
      )}

      {/* Feature Importance */}
      {modelInfo?.feature_importance && (
        <section className="mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <FeatureImportance data={modelInfo.feature_importance} />
        </section>
      )}

      {/* How it Works */}
      <section className="mb-16">
        <h2 className="text-2xl font-display font-bold text-white mb-8 text-center">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Input Data',
              desc: 'Enter student details like study hours, attendance, previous scores, and more.',
              icon: '📝',
              color: 'from-primary-500/20 to-primary-600/5 border-primary-500/20',
            },
            {
              step: '02',
              title: 'ML Prediction',
              desc: 'Our Gradient Boosting model analyzes patterns and generates an accurate prediction.',
              icon: '🤖',
              color: 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
            },
            {
              step: '03',
              title: 'Get Results',
              desc: 'Receive predicted exam score with grade, stored in the database for analytics.',
              icon: '🎯',
              color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20',
            },
          ].map((item) => (
            <div
              key={item.step}
              className={`glass-card-hover p-8 bg-gradient-to-br ${item.color} text-center`}
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <div className="text-sm font-bold text-primary-400 mb-2">STEP {item.step}</div>
              <h3 className="text-xl font-display font-bold text-white mb-3">{item.title}</h3>
              <p className="text-surface-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="glass-card p-8 text-center">
        <h2 className="text-xl font-display font-bold text-white mb-6">
          Built With
        </h2>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {[
            { name: 'React', icon: '⚛️' },
            { name: 'Tailwind CSS', icon: '🎨' },
            { name: 'Flask', icon: '🐍' },
            { name: 'scikit-learn', icon: '🧠' },
            { name: 'MySQL', icon: '🗄️' },
          ].map((tech) => (
            <div key={tech.name} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <span>{tech.icon}</span>
              <span className="text-surface-300 text-sm font-medium">{tech.name}</span>
            </div>
          ))}
        </div>
      </section>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      )}
    </div>
  )
}
