# 🎓 EduPredict — Student Performance Prediction System

EduPredict is a production-ready full-stack machine learning application for predicting student exam performance using study habits, attendance, academic history, and learning behavior indicators.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.11+-green)
![Node](https://img.shields.io/badge/node-18+-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

## Overview

EduPredict helps educators, academic teams, and learning platforms estimate student outcomes before final assessments. The platform combines a predictive machine learning model, a Flask REST API,React frontend, and a MySQL-backed data layer in a container-friendly architecture.

The solution is designed for:

- Predicting student exam performance from structured academic and behavioral inputs
- Visualizing training and model performance data
- Reviewing prediction history and feature importance
- Supporting retraining workflows in production environments

## Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React 19, Vite, Tailwind CSS 3, Recharts |
| Backend | Flask 3, Flask-SQLAlchemy, Flask-Limiter |
| ML Model | scikit-learn Gradient Boosting Regressor |
| Database | MySQL 8 via PyMySQL |
| Deployment | Docker, Docker Compose, Nginx, Waitress |
| Testing | pytest, pytest-flask |

## Architecture

The application uses a layered architecture:

1. Frontend UI built with Vite and React for prediction, history, analytics, and dashboard views.
2. Backend API built with Flask that manages validation, rate limiting, authentication-neutral endpoints, and model interaction.
3. Machine learning component trained on synthetic academic data and persisted locally for inference.
4. MySQL database for prediction storage and analytics data.
5. Docker Compose orchestration for multi-service local or production deployment.

## Project Structure

```text
mlproject/
├── backend/
│   ├── app.py              # Flask API with validation, rate limiting, and logging
│   ├── config.py           # Production configuration and environment settings
│   ├── ml_model.py         # Model training and prediction workflow
│   ├── wsgi.py              # Production WSGI entry point
│   ├── seed_data.py         # Seed database with example records
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile           # Backend container definition
│   ├── .env.example         # Environment variable template
│   └── tests/
│       ├── test_api.py      # API endpoint tests
│       └── test_model.py   # ML model tests
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Root application and routing
│   │   ├── main.jsx         # React application entry point
│   │   ├── index.css        # Global styling and design system
│   │   ├── components/
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PredictionForm.jsx
│   │   │   ├── FeatureImportance.jsx
│   │   │   └── StatsCard.jsx
│   │   └── pages/
│   │       ├── Home.jsx
│   │       ├── Predict.jsx
│   │       ├── History.jsx
│   │       ├── Analytics.jsx
│   │       └── NotFound.jsx
│   ├── index.html           # SEO-ready HTML template
│   ├── nginx.conf           # Production Nginx configuration
│   ├── Dockerfile            # Frontend container configuration
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── docker-compose.yml         # Full-stack deployment orchestration
├── .gitignore
├── .dockerignore
└── README.md
```

## Getting Started

### Prerequisites

Before starting the project, ensure that the following tools are installed:

- Python 3.11+
- Node.js 18+
- npm
- MySQL Server

### Local Development Setup

#### 1. Create the database

```sql
CREATE DATABASE student_performance;
```

#### 2. Configure the backend

```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
python ml_model.py
pytest tests/ -v
python app.py
```

The backend runs locally at:

http://localhost:5000

It automatically creates database tables and trains the model when a model artifact is missing.

#### 3. Configure the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend is available at:

http://localhost:3000

It communicates with the Flask API through the development proxy configuration.

#### 4. Seed data

```bash
cd backend
python seed_data.py
```

### Docker Deployment

For a production-style local deployment, run the full stack using Docker Compose:

```bash
docker-compose up --build
```

Or run it in detached mode:

```bash
docker-compose up --build -d
```

Application URL:

http://localhost

To stop the environment:

```bash
docker-compose down
```

To reset the database volume:

```bash
docker-compose down -v
docker-compose up --build
```

## API Reference

| Method | Endpoint | Rate Limit | Description |
|--------|----------|------------|-------------|
| GET | /api/health | — | Returns service and database health information |
| POST | /api/predict | 30/min | Creates a student performance prediction |
| GET | /api/predictions | — | Returns prediction history in paginated format |
| GET | /api/model-info | — | Returns model metrics and feature importance |
| GET | /api/analytics | — | Returns analytics data for dashboards and charts |
| POST | /api/retrain | 3/hour | Retrains the ML model |
| GET | /api/feature-info | — | Returns feature names and labels |

Example prediction request:

```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "student_name": "Aarav Sharma",
    "study_hours_per_week": 20,
    "attendance_percentage": 85,
    "previous_exam_score": 75,
    "assignments_completed": 15,
    "class_participation": 7,
    "sleep_hours": 7.5,
    "extracurricular_activities": 2,
    "parent_education_level": 4,
    "internet_access": 1,
    "tutoring_sessions": 2
  }'
```

## Features

| Feature | Description |
|---------|-------------|
| Smart Predictions | Interactive student input form for 10 predictive features |
| Analytics Dashboard | Grade distribution, score distribution, and chart-based analysis |
| Prediction History | Paginated prediction tracking with grade visualization |
| Feature Importance | Explainable model view showing feature impact |
| Model Retraining | Controlled model retraining workflow |
| Dark Mode UI | Modern glassmorphism and responsive user experience |
| Input Validation | Server-side range and schema validation |
| Rate Limiting | Protection for prediction and retraining endpoints |
| Structured Logging | Timestamped logging for production observability |
| Dockerized Deployment | Consistent environment setup via Docker Compose |
| Automated Testing | pytest coverage for API and ML model workflows |
| Toast Notifications | User feedback across form and history interactions |
| Error Boundaries | Protected frontend error handling |
| SEO Optimization | Optimized HTML structure and metadata |

## ML Model Details

The prediction engine uses a Gradient Boosting Regressor trained on synthetic academic data featuring realistic correlations between student behavior and performance.

- Algorithm: Gradient Boosting Regressor
- Input Features: 10 features including study hours, attendance, assignments, participation, sleep, internet access, tutoring, and academic history
- Training Data: 1,500 synthetic records
- Metrics: R², MAE, RMSE, and 5-fold cross-validation output
- Persistence: Model artifacts are stored locally and retrained automatically when needed

## Security and Reliability

The platform includes security-oriented and production-ready patterns:

- Environment-based configuration and secrets
- Input validation and boundary checks
- Student name sanitization
- Rate limiting on sensitive endpoints
- CORS configuration for trusted origins
- SQLAlchemy ORM protections against SQL injection
- Production WSGI deployment support using Waitress or Gunicorn

## Testing

Run the backend test suite:

```bash
cd backend
pytest tests/ -v
```

Generate coverage:

```bash
pytest tests/ -v --cov=. --cov-report=term-missing
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| SECRET_KEY | dev-fallback... | Flask secret key |
| FLASK_ENV | development | Runtime environment |
| MYSQL_USER | root | Database username |
| MYSQL_PASSWORD | empty | Database password |
| MYSQL_HOST | localhost | MySQL host |
| MYSQL_PORT | 3306 | MySQL port |
| MYSQL_DB | student_performance | Database name |
| CORS_ORIGINS | localhost:3000,... | Allowed frontend origins |
| RATE_LIMIT_PREDICT | 30/minute | Rate limit for prediction endpoint |
| RATE_LIMIT_RETRAIN | 3/hour | Rate limit for retraining endpoint |
| LOG_LEVEL | INFO | Logging level |

---

Built with React, Flask, scikit-learn, MySQL, and Docker.
