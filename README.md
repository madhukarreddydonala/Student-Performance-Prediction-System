# 🎓 EduPredict — Student Performance Prediction System

A production-ready, full-stack Machine Learning web application that predicts student exam performance based on study habits, attendance, and academic history.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.11+-green)
![Node](https://img.shields.io/badge/node-18+-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS 3, Recharts |
| **Backend** | Flask 3, Flask-SQLAlchemy, Flask-Limiter |  
| **ML Model** | scikit-learn (Gradient Boosting Regressor) |
| **Database** | MySQL 8 (via PyMySQL) |
| **Deployment** | Docker, Docker Compose, Nginx, Waitress |
| **Testing** | pytest, pytest-flask |

## 📂 Project Structure

```
mlproject/
├── backend/
│   ├── app.py              # Flask API (validated, rate-limited, logged)
│   ├── config.py           # Production config with dotenv
│   ├── ml_model.py         # ML model training & prediction
│   ├── wsgi.py             # Production WSGI entry point
│   ├── seed_data.py        # Seed database with sample data
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Backend container
│   ├── .env.example        # Environment variable template
│   └── tests/
│       ├── test_api.py     # API endpoint tests
│       └── test_model.py   # ML model tests
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Root (ErrorBoundary + Toast + Router)
│   │   ├── main.jsx        # React entry point
│   │   ├── index.css       # Global styles & design system
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
│   ├── index.html          # SEO-optimized HTML
│   ├── nginx.conf          # Production Nginx config
│   ├── Dockerfile          # Frontend container
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── docker-compose.yml      # One-command deployment
├── .gitignore
├── .dockerignore
└── README.md
```

## 🛠️ Setup & Installation

### Option 1: Local Development

#### Prerequisites
- **Python 3.8+** (with pip)
- **Node.js 18+** (with npm)
- **MySQL Server** (running locally)

#### 1. Setup MySQL Database

```sql
CREATE DATABASE student_performance;
```

#### 2. Backend Setup

```bash
cd backend

# Create environment file
cp .env.example .env
# Edit .env with your MySQL password

# Install dependencies
pip install -r requirements.txt

# Train the ML model
python ml_model.py

# Run tests
pytest tests/ -v

# Start development server
python app.py
```

The backend will:
- Auto-train the ML model if no saved model exists
- Create database tables automatically
- Run on http://localhost:5000

#### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on http://localhost:3000 and proxies API calls to the Flask backend.

#### 4. (Optional) Seed Database

```bash
cd backend
python seed_data.py
```

---

### Option 2: Docker (Recommended for Production)

```bash
# Start all services (MySQL + Backend + Frontend)
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

**Access the app at:** http://localhost

**Stop services:**
```bash
docker-compose down
```

**Reset database:**
```bash
docker-compose down -v  # removes MySQL volume
docker-compose up --build
```

## 📋 API Endpoints

| Method | Endpoint | Rate Limit | Description |
|--------|----------|------------|-------------|
| `GET` | `/api/health` | — | Health check with DB status |
| `POST` | `/api/predict` | 30/min | Submit student data, get prediction |
| `GET` | `/api/predictions` | — | Fetch prediction history (paginated) |
| `GET` | `/api/model-info` | — | Get model metrics & feature importance |
| `GET` | `/api/analytics` | — | Get analytics data for charts |
| `POST` | `/api/retrain` | 3/hour | Retrain the ML model |
| `GET` | `/api/feature-info` | — | Get feature names and labels |

### Example: Make a Prediction

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

## 🎯 Features

| Feature | Description |
|---------|-------------|
| 🔮 **Smart Predictions** | Interactive sliders for 10 student features |
| 📊 **Analytics Dashboard** | Score distribution, grade breakdown, scatter plots |
| 📋 **Prediction History** | Paginated table with grade coloring |
| 🔬 **Feature Importance** | Visual chart of which factors matter most |
| 🔄 **Model Retraining** | One-click retrain with rate limiting |
| 🌙 **Dark Mode UI** | Premium glassmorphism design |
| 🔒 **Input Validation** | Server-side validation with range checks |
| ⚡ **Rate Limiting** | Protects prediction and retrain endpoints |
| 📝 **Structured Logging** | Production-ready logging with timestamps |
| 🐳 **Dockerized** | One-command deployment with docker-compose |
| 🧪 **Tested** | pytest tests for API and ML model |
| 🔔 **Toast Notifications** | User feedback for all actions |
| 💥 **Error Boundaries** | Graceful error handling in React |
| 🔍 **SEO Optimized** | Meta tags, OG tags, semantic HTML |

## 🧠 ML Model Details

- **Algorithm:** Gradient Boosting Regressor
- **Features:** 10 input features (study hours, attendance, etc.)
- **Training Data:** 1,500 synthetic samples with realistic correlations
- **Metrics:** R², MAE, RMSE with 5-fold cross-validation
- **Persistence:** Saved as `.pkl` files, auto-trains if missing

## 🔒 Security Features

- ✅ Environment-based secrets (no hardcoded keys)
- ✅ Input validation with range constraints
- ✅ Student name sanitization
- ✅ Rate limiting on sensitive endpoints
- ✅ CORS restricted to configured origins
- ✅ SQL injection prevention (via SQLAlchemy ORM)
- ✅ Production WSGI server (Waitress/Gunicorn)

## 🧪 Running Tests

```bash
cd backend
pytest tests/ -v

# With coverage
pytest tests/ -v --cov=. --cov-report=term-missing
```

## 📦 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | `dev-fallback...` | Flask secret key |
| `FLASK_ENV` | `development` | `development` or `production` |
| `MYSQL_USER` | `root` | MySQL username |
| `MYSQL_PASSWORD` | (empty) | MySQL password |
| `MYSQL_HOST` | `localhost` | MySQL host |
| `MYSQL_PORT` | `3306` | MySQL port |
| `MYSQL_DB` | `student_performance` | Database name |
| `CORS_ORIGINS` | `localhost:3000,...` | Allowed CORS origins |
| `RATE_LIMIT_PREDICT` | `30/minute` | Predict endpoint rate limit |
| `RATE_LIMIT_RETRAIN` | `3/hour` | Retrain endpoint rate limit |
| `LOG_LEVEL` | `INFO` | Python logging level |

---

Built with ❤️ using React, Flask, scikit-learn & MySQL
