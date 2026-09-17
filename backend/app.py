"""
Flask Application — Student Performance Prediction API.
Production-ready with validation, error handling, logging, and rate limiting.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from datetime import datetime, timezone
from functools import wraps
import logging
import os
import sys

from config import Config
from ml_model import (
    train_model, load_model, predict, get_model_metrics,
    FEATURE_NAMES, FEATURE_LABELS
)

# ---------------------------------------------------------------------------
# Logging Setup
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL, logging.INFO),
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
    ]
)
logger = logging.getLogger('edupredict')

# ---------------------------------------------------------------------------
# App Setup
# ---------------------------------------------------------------------------
app = Flask(__name__)
app.config.from_object(Config)

CORS(app, origins=Config.CORS_ORIGINS)

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200/minute"],
    storage_uri="memory://",
)

db = SQLAlchemy(app)


# ---------------------------------------------------------------------------
# Database Models
# ---------------------------------------------------------------------------

class Prediction(db.Model):
    __tablename__ = 'predictions'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_name = db.Column(db.String(100), nullable=False)
    study_hours_per_week = db.Column(db.Float, nullable=False)
    attendance_percentage = db.Column(db.Float, nullable=False)
    previous_exam_score = db.Column(db.Float, nullable=False)
    assignments_completed = db.Column(db.Float, nullable=False)
    class_participation = db.Column(db.Float, nullable=False)
    sleep_hours = db.Column(db.Float, nullable=False)
    extracurricular_activities = db.Column(db.Float, nullable=False)
    parent_education_level = db.Column(db.Float, nullable=False)
    internet_access = db.Column(db.Float, nullable=False)
    tutoring_sessions = db.Column(db.Float, nullable=False)
    predicted_score = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'student_name': self.student_name,
            'study_hours_per_week': self.study_hours_per_week,
            'attendance_percentage': self.attendance_percentage,
            'previous_exam_score': self.previous_exam_score,
            'assignments_completed': self.assignments_completed,
            'class_participation': self.class_participation,
            'sleep_hours': self.sleep_hours,
            'extracurricular_activities': self.extracurricular_activities,
            'parent_education_level': self.parent_education_level,
            'internet_access': self.internet_access,
            'tutoring_sessions': self.tutoring_sessions,
            'predicted_score': self.predicted_score,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


# ---------------------------------------------------------------------------
# Input Validation
# ---------------------------------------------------------------------------

# Feature value constraints — {name: (min, max)}
FEATURE_RANGES = {
    'study_hours_per_week': (0, 50),
    'attendance_percentage': (0, 100),
    'previous_exam_score': (0, 100),
    'assignments_completed': (0, 30),
    'class_participation': (1, 10),
    'sleep_hours': (0, 24),
    'extracurricular_activities': (0, 10),
    'parent_education_level': (1, 5),
    'internet_access': (0, 1),
    'tutoring_sessions': (0, 10),
}


def validate_features(data):
    """Validate and sanitize feature inputs. Returns (features_dict, error_msg)."""
    features = {}
    errors = []

    for name in FEATURE_NAMES:
        val = data.get(name)
        if val is None:
            errors.append(f'Missing required feature: {name}')
            continue
        try:
            val = float(val)
        except (ValueError, TypeError):
            errors.append(f'Invalid value for {name}: must be a number')
            continue

        lo, hi = FEATURE_RANGES.get(name, (0, 100))
        if val < lo or val > hi:
            errors.append(f'{name} must be between {lo} and {hi}, got {val}')
            continue

        features[name] = val

    if errors:
        return None, errors
    return features, None


def validate_student_name(name):
    """Sanitize student name input."""
    if not name or not isinstance(name, str):
        return 'Anonymous'
    # Strip whitespace, limit length
    name = name.strip()[:100]
    # Remove any potentially dangerous characters
    return ''.join(c for c in name if c.isalnum() or c in ' .-\'')


# ---------------------------------------------------------------------------
# Error Handlers
# ---------------------------------------------------------------------------

@app.errorhandler(400)
def bad_request(e):
    return jsonify({'error': 'Bad request', 'message': str(e)}), 400


@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found', 'message': 'The requested endpoint does not exist.'}), 404


@app.errorhandler(429)
def rate_limit_exceeded(e):
    return jsonify({
        'error': 'Rate limit exceeded',
        'message': 'Too many requests. Please slow down.',
    }), 429


@app.errorhandler(500)
def internal_error(e):
    logger.error(f'Internal server error: {e}')
    return jsonify({'error': 'Internal server error', 'message': 'Something went wrong.'}), 500


# ---------------------------------------------------------------------------
# Load / Train Model
# ---------------------------------------------------------------------------
model, scaler = load_model(Config.MODEL_PATH, Config.SCALER_PATH)
if model is None:
    logger.info("No existing model found. Training new model...")
    model, scaler, _ = train_model(Config.MODEL_PATH, Config.SCALER_PATH)
    logger.info("Model trained and saved.")
else:
    logger.info("Loaded existing ML model.")


# ---------------------------------------------------------------------------
# API Routes
# ---------------------------------------------------------------------------

@app.route('/api/health', methods=['GET'])
def health():
    """Health check with database connectivity status."""
    db_status = 'unknown'
    try:
        db.session.execute(db.text('SELECT 1'))
        db_status = 'connected'
    except Exception:
        db_status = 'disconnected'

    return jsonify({
        'status': 'ok',
        'service': 'EduPredict API',
        'version': '1.0.0',
        'database': db_status,
        'model_loaded': model is not None,
    })


@app.route('/api/predict', methods=['POST'])
@limiter.limit(Config.RATE_LIMIT_PREDICT)
def make_prediction():
    """Accept student data and return predicted exam score."""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400

    # Validate student name
    student_name = validate_student_name(data.get('student_name', ''))

    # Validate features
    input_features, errors = validate_features(data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400

    # Predict
    predicted_score = predict(model, scaler, input_features)

    # Determine grade
    grade = get_grade(predicted_score)

    # Save to database
    try:
        prediction = Prediction(
            student_name=student_name,
            predicted_score=predicted_score,
            **input_features
        )
        db.session.add(prediction)
        db.session.commit()
        logger.info(f"Prediction saved: {student_name} → {predicted_score} ({grade})")
    except Exception as e:
        db.session.rollback()
        logger.warning(f"DB save error (prediction still returned): {e}")

    return jsonify({
        'predicted_score': predicted_score,
        'grade': grade,
        'student_name': student_name,
        'message': f'{student_name} is predicted to score {predicted_score}/100 ({grade})'
    })


@app.route('/api/predictions', methods=['GET'])
def get_predictions():
    """Get prediction history with pagination."""
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)  # Cap at 100

    try:
        query = Prediction.query.order_by(Prediction.created_at.desc())
        total = query.count()
        predictions = query.offset((page - 1) * per_page).limit(per_page).all()

        return jsonify({
            'predictions': [p.to_dict() for p in predictions],
            'total': total,
            'page': page,
            'per_page': per_page,
            'total_pages': (total + per_page - 1) // per_page,
        })
    except Exception as e:
        logger.error(f"Failed to fetch predictions: {e}")
        return jsonify({
            'predictions': [],
            'total': 0,
            'page': 1,
            'per_page': per_page,
            'total_pages': 0,
            'note': 'Database not available — predictions not persisted.',
        })


@app.route('/api/model-info', methods=['GET'])
def model_info():
    """Get model performance metrics and feature importance."""
    metrics = get_model_metrics(model, scaler)
    return jsonify(metrics)


@app.route('/api/analytics', methods=['GET'])
def analytics():
    """Get analytics data for dashboard charts."""
    try:
        predictions = Prediction.query.all()
        if not predictions:
            return jsonify(_empty_analytics())

        scores = [p.predicted_score for p in predictions]
        study_hours = [p.study_hours_per_week for p in predictions]
        attendance = [p.attendance_percentage for p in predictions]

        # Score distribution buckets
        buckets = {'0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0}
        for s in scores:
            if s <= 20:
                buckets['0-20'] += 1
            elif s <= 40:
                buckets['21-40'] += 1
            elif s <= 60:
                buckets['41-60'] += 1
            elif s <= 80:
                buckets['61-80'] += 1
            else:
                buckets['81-100'] += 1

        # Grade distribution
        grades = {'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0}
        for s in scores:
            g = get_grade(s)
            grades[g] = grades.get(g, 0) + 1

        return jsonify({
            'total_predictions': len(predictions),
            'average_score': round(sum(scores) / len(scores), 1),
            'highest_score': round(max(scores), 1),
            'lowest_score': round(min(scores), 1),
            'score_distribution': [
                {'range': k, 'count': v} for k, v in buckets.items()
            ],
            'grade_distribution': [
                {'grade': k, 'count': v} for k, v in grades.items()
            ],
            'scatter_data': [
                {'study_hours': round(sh, 1), 'score': round(sc, 1)}
                for sh, sc in zip(study_hours, scores)
            ][:100],
            'attendance_vs_score': [
                {'attendance': round(a, 1), 'score': round(sc, 1)}
                for a, sc in zip(attendance, scores)
            ][:100],
        })
    except Exception as e:
        logger.error(f"Analytics error: {e}")
        return jsonify(_empty_analytics())


@app.route('/api/retrain', methods=['POST'])
@limiter.limit(Config.RATE_LIMIT_RETRAIN)
def retrain():
    """Retrain the ML model."""
    global model, scaler
    logger.info("Model retrain requested...")
    model, scaler, metrics = train_model(Config.MODEL_PATH, Config.SCALER_PATH)
    logger.info(f"Model retrained. R²={metrics['r2']}, MAE={metrics['mae']}")
    return jsonify({
        'message': 'Model retrained successfully',
        'metrics': metrics
    })


@app.route('/api/feature-info', methods=['GET'])
def feature_info():
    """Get feature names and labels for the prediction form."""
    return jsonify({
        'features': FEATURE_NAMES,
        'labels': FEATURE_LABELS,
    })


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def get_grade(score):
    if score >= 90:
        return 'A+'
    elif score >= 80:
        return 'A'
    elif score >= 70:
        return 'B'
    elif score >= 60:
        return 'C'
    elif score >= 50:
        return 'D'
    else:
        return 'F'


def _empty_analytics():
    return {
        'total_predictions': 0,
        'average_score': 0,
        'highest_score': 0,
        'lowest_score': 0,
        'score_distribution': [],
        'grade_distribution': [],
        'scatter_data': [],
        'attendance_vs_score': [],
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    with app.app_context():
        try:
            db.create_all()
            logger.info("Database tables created successfully!")
        except Exception as e:
            logger.warning(f"Could not connect to MySQL: {e}")
            logger.warning("The API will still work, but predictions won't be persisted.")

    app.run(debug=Config.DEBUG, port=5000)
