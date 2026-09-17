# 🎓 EduPredict — Student Performance Prediction System

[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=20232A)](https://react.dev/)
[![Flask](https://img.shields.io/badge/Flask-3-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-yellow)](#license)

EduPredict is a full-stack machine-learning application that estimates student exam performance from study habits, attendance, academic history, and other learning-behavior indicators. It provides an interactive dashboard for creating predictions, exploring prediction history, viewing analytics, and inspecting model feature importance.

> **Important:** Predictions are estimates intended to support educational analysis. They should not be used as the sole basis for academic decisions.

## ✨ Highlights

- Interactive prediction form with server-side validation
- Gradient Boosting regression model with persisted artifacts
- Analytics dashboard with score and grade visualizations
- Paginated prediction history
- Feature-importance view for model interpretability
- Controlled model-retraining endpoint
- Flask API with rate limiting, CORS controls, structured logging, and health checks
- React frontend with responsive UI, dark mode, notifications, and error boundaries
- MySQL persistence through SQLAlchemy
- Docker Compose setup for the frontend, backend, and database
- Automated backend tests with pytest

## 🧱 Architecture

```text
React + Vite frontend  →  Flask REST API  →  scikit-learn model
                                  ↓
                              MySQL 8
```

The frontend communicates with the Flask API. The API validates requests, invokes the trained model, stores predictions in MySQL, and exposes analytics and model metadata. Docker Compose runs all three services together for a production-style local environment.

## 🛠️ Technology Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, Recharts, Tailwind CSS |
| Backend | Flask 3, Flask-SQLAlchemy, Flask-CORS, Flask-Limiter |
| Machine learning | scikit-learn Gradient Boosting Regressor, pandas, NumPy, joblib |
| Database | MySQL 8, PyMySQL |
| Deployment | Docker, Docker Compose, Nginx, Waitress |
| Testing | pytest, pytest-flask |

## 📁 Project Structure

```text
.
├── backend/
│   ├── app.py              # Flask API and application setup
│   ├── config.py           # Environment-based configuration
│   ├── ml_model.py         # Model training and prediction logic
│   ├── wsgi.py             # Production WSGI entry point
│   ├── seed_data.py        # Creates example prediction records
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Backend configuration template
│   └── tests/              # API and model tests
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Application shell and routes
│   │   ├── main.jsx        # React entry point
│   │   ├── components/     # Reusable UI components
│   │   └── pages/          # Home, prediction, history, and analytics views
│   ├── package.json        # Frontend scripts and dependencies
│   ├── Dockerfile          # Frontend image definition
│   └── nginx.conf          # Production web-server configuration
├── docker-compose.yml      # Full-stack orchestration
└── README.md
```

## 🚀 Quick Start with Docker

### Prerequisites

- Docker Engine with Docker Compose
- Git

### Run the application

```bash
git clone https://github.com/madhukarreddydonala/Student-Performance-Prediction-System.git
cd Student-Performance-Prediction-System

docker compose up --build
```

Open **http://localhost** in your browser. The API is available at **http://localhost:5000**.

To run in the background or stop the stack:

```bash
docker compose up --build -d
docker compose down
```

To remove the persisted database volume and start over:

```bash
docker compose down -v
docker compose up --build
```

> The Compose file provides development defaults. Set secure values for `SECRET_KEY` and `MYSQL_PASSWORD` before using the application outside local development.

## 💻 Local Development

### 1. Configure MySQL

Create the database before starting the backend:

```sql
CREATE DATABASE student_performance;
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
python -m venv .venv

# macOS/Linux
source .venv/bin/activate

# Windows PowerShell
# .venv\Scripts\Activate.ps1

pip install -r requirements.txt
python ml_model.py
python app.py
```

The API runs at **http://localhost:5000**. Update `backend/.env` if your MySQL credentials or host differ from the defaults.

### 3. Set up the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite development URL shown in the terminal, normally **http://localhost:5173**.

### 4. Add sample records (optional)

```bash
cd backend
python seed_data.py
```

## 🔌 API Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Checks API and database health |
| `POST` | `/api/predict` | Creates a student performance prediction |
| `GET` | `/api/predictions` | Returns paginated prediction history |
| `GET` | `/api/model-info` | Returns model metrics and feature importance |
| `GET` | `/api/analytics` | Returns dashboard analytics |
| `POST` | `/api/retrain` | Retrains the machine-learning model |
| `GET` | `/api/feature-info` | Returns supported input features |

### Example prediction request

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

The response contains the predicted score, grade information, and related prediction metadata. Use `/api/feature-info` to confirm the supported feature names and labels.

## 🤖 Machine-Learning Model

EduPredict trains a **Gradient Boosting Regressor** on 1,500 synthetic academic records. The model uses 10 input features, including study time, attendance, previous scores, assignments, participation, sleep, tutoring, and access indicators.

Training reports:

- R² score
- Mean absolute error (MAE)
- Root mean squared error (RMSE)
- 5-fold cross-validation results

The trained model is persisted locally and is regenerated when the required artifact is unavailable. Because the default dataset is synthetic, validate the model with representative real-world data before production use.

## 🧪 Testing

Run the backend tests with:

```bash
cd backend
pytest tests/ -v
```

Generate a coverage report with:

```bash
pytest tests/ -v --cov=. --cov-report=term-missing
```

Build the frontend to verify the production bundle:

```bash
cd frontend
npm run build
```

## ⚙️ Configuration

Copy `backend/.env.example` to `backend/.env` and configure values for your environment. Common settings include:

| Variable | Purpose |
| --- | --- |
| `SECRET_KEY` | Flask secret used by the application |
| `FLASK_ENV` | Runtime environment |
| `MYSQL_USER` | MySQL username |
| `MYSQL_PASSWORD` | MySQL password |
| `MYSQL_HOST` | MySQL hostname (`localhost` locally, `db` in Compose) |
| `MYSQL_PORT` | MySQL port, normally `3306` |
| `MYSQL_DB` | Database name |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `RATE_LIMIT_PREDICT` | Prediction endpoint limit |
| `RATE_LIMIT_RETRAIN` | Retraining endpoint limit |
| `LOG_LEVEL` | Application logging level |

Never commit real credentials or production secrets. Rotate any credentials that have previously been exposed in a tracked configuration file.

## 🔒 Security and Reliability

The application includes environment-based configuration, input validation, name sanitization, CORS configuration, rate limiting, SQLAlchemy ORM usage, structured logging, health checks, and production WSGI support through Waitress. Review and harden authentication, authorization, secrets management, and monitoring before deploying it to a public environment.

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-change`.
3. Make and test your changes.
4. Open a pull request with a clear description of the problem and solution.

## 📄 License

This project is distributed under the MIT License. Add a `LICENSE` file to the repository if you want GitHub to display the complete license text and terms.

---

Built with React, Flask, scikit-learn, MySQL, and Docker.
