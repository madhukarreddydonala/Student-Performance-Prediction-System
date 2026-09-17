"""
Unit tests for the Flask API endpoints.
Run with: pytest backend/tests/ -v
"""

import pytest
import sys
import os

# Set environment to use SQLite BEFORE importing the app
os.environ['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))


@pytest.fixture
def client():
    """Create a test client with in-memory SQLite."""
    # Import here after env is set
    from app import app, db

    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'

    with app.app_context():
        db.create_all()

    with app.test_client() as client:
        with app.app_context():
            yield client


class TestHealthEndpoint:
    def test_health_returns_ok(self, client):
        response = client.get('/api/health')
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'ok'
        assert data['model_loaded'] is True

    def test_health_has_version(self, client):
        response = client.get('/api/health')
        data = response.get_json()
        assert 'version' in data


class TestPredictEndpoint:
    VALID_PAYLOAD = {
        'student_name': 'Test Student',
        'study_hours_per_week': 15,
        'attendance_percentage': 80,
        'previous_exam_score': 70,
        'assignments_completed': 12,
        'class_participation': 6,
        'sleep_hours': 7.5,
        'extracurricular_activities': 2,
        'parent_education_level': 3,
        'internet_access': 1,
        'tutoring_sessions': 2,
    }

    def test_predict_valid_data(self, client):
        response = client.post('/api/predict', json=self.VALID_PAYLOAD)
        assert response.status_code == 200
        data = response.get_json()
        assert 'predicted_score' in data
        assert 'grade' in data
        assert 0 <= data['predicted_score'] <= 100

    def test_predict_no_data(self, client):
        response = client.post('/api/predict', content_type='application/json')
        assert response.status_code == 400

    def test_predict_missing_feature(self, client):
        payload = self.VALID_PAYLOAD.copy()
        del payload['study_hours_per_week']
        response = client.post('/api/predict', json=payload)
        assert response.status_code == 400
        data = response.get_json()
        assert 'details' in data

    def test_predict_out_of_range(self, client):
        payload = self.VALID_PAYLOAD.copy()
        payload['attendance_percentage'] = 150  # Over max
        response = client.post('/api/predict', json=payload)
        assert response.status_code == 400

    def test_predict_invalid_type(self, client):
        payload = self.VALID_PAYLOAD.copy()
        payload['sleep_hours'] = 'abc'
        response = client.post('/api/predict', json=payload)
        assert response.status_code == 400

    def test_predict_default_name(self, client):
        payload = self.VALID_PAYLOAD.copy()
        del payload['student_name']
        response = client.post('/api/predict', json=payload)
        assert response.status_code == 200
        data = response.get_json()
        assert data['student_name'] == 'Anonymous'


class TestPredictionsEndpoint:
    def test_get_predictions_empty(self, client):
        response = client.get('/api/predictions')
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data['predictions'], list)

    def test_get_predictions_pagination(self, client):
        response = client.get('/api/predictions?page=1&per_page=5')
        assert response.status_code == 200
        data = response.get_json()
        assert data['per_page'] == 5


class TestModelInfoEndpoint:
    def test_model_info(self, client):
        response = client.get('/api/model-info')
        assert response.status_code == 200
        data = response.get_json()
        assert 'r2' in data
        assert 'mae' in data
        assert 'rmse' in data
        assert 'feature_importance' in data


class TestFeatureInfoEndpoint:
    def test_feature_info(self, client):
        response = client.get('/api/feature-info')
        assert response.status_code == 200
        data = response.get_json()
        assert 'features' in data
        assert 'labels' in data
        assert len(data['features']) == 10


class TestNotFound:
    def test_404(self, client):
        response = client.get('/api/nonexistent')
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
