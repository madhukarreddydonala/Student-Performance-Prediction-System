"""
Machine Learning Model for Student Performance Prediction.
Uses Random Forest Regressor to predict student exam scores.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os


# Feature names used by the model
FEATURE_NAMES = [
    'study_hours_per_week',
    'attendance_percentage',
    'previous_exam_score',
    'assignments_completed',
    'class_participation',
    'sleep_hours',
    'extracurricular_activities',
    'parent_education_level',
    'internet_access',
    'tutoring_sessions'
]

FEATURE_LABELS = {
    'study_hours_per_week': 'Study Hours/Week (0-40)',
    'attendance_percentage': 'Attendance % (0-100)',
    'previous_exam_score': 'Previous Exam Score (0-100)',
    'assignments_completed': 'Assignments Completed (0-20)',
    'class_participation': 'Class Participation (1-10)',
    'sleep_hours': 'Sleep Hours/Day (4-12)',
    'extracurricular_activities': 'Extracurricular Activities (0-5)',
    'parent_education_level': 'Parent Education Level (1-5)',
    'internet_access': 'Internet Access (0=No, 1=Yes)',
    'tutoring_sessions': 'Tutoring Sessions/Week (0-5)'
}


def generate_training_data(n_samples=1000):
    """Generate synthetic training data for student performance prediction."""
    np.random.seed(42)

    data = {
        'study_hours_per_week': np.random.uniform(0, 40, n_samples),
        'attendance_percentage': np.random.uniform(30, 100, n_samples),
        'previous_exam_score': np.random.uniform(20, 100, n_samples),
        'assignments_completed': np.random.randint(0, 21, n_samples).astype(float),
        'class_participation': np.random.randint(1, 11, n_samples).astype(float),
        'sleep_hours': np.random.uniform(4, 12, n_samples),
        'extracurricular_activities': np.random.randint(0, 6, n_samples).astype(float),
        'parent_education_level': np.random.randint(1, 6, n_samples).astype(float),
        'internet_access': np.random.randint(0, 2, n_samples).astype(float),
        'tutoring_sessions': np.random.randint(0, 6, n_samples).astype(float),
    }

    # Create target variable with realistic relationships
    score = (
        data['study_hours_per_week'] * 0.8 +
        data['attendance_percentage'] * 0.25 +
        data['previous_exam_score'] * 0.3 +
        data['assignments_completed'] * 1.2 +
        data['class_participation'] * 1.5 +
        data['sleep_hours'] * 0.8 +
        data['extracurricular_activities'] * 0.5 +
        data['parent_education_level'] * 1.0 +
        data['internet_access'] * 3.0 +
        data['tutoring_sessions'] * 1.5 +
        np.random.normal(0, 5, n_samples)  # noise
    )

    # Normalize to 0-100 range
    score = np.clip((score - score.min()) / (score.max() - score.min()) * 100, 0, 100)
    data['exam_score'] = np.round(score, 1)

    return pd.DataFrame(data)


def train_model(model_path, scaler_path):
    """Train the ML model and save it to disk."""
    print("Generating training data...")
    df = generate_training_data(1500)

    X = df[FEATURE_NAMES]
    y = df['exam_score']

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train model (Random Forest)
    print("Training Random Forest model...")
    model = GradientBoostingRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        random_state=42
    )
    model.fit(X_train_scaled, y_train)

    # Evaluate
    y_pred = model.predict(X_test_scaled)
    metrics = {
        'mae': round(mean_absolute_error(y_test, y_pred), 2),
        'rmse': round(np.sqrt(mean_squared_error(y_test, y_pred)), 2),
        'r2': round(r2_score(y_test, y_pred), 4),
        'samples_trained': len(X_train),
        'samples_tested': len(X_test),
    }

    # Cross validation
    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='r2')
    metrics['cv_r2_mean'] = round(cv_scores.mean(), 4)
    metrics['cv_r2_std'] = round(cv_scores.std(), 4)

    # Feature importance
    importance = model.feature_importances_
    feature_importance = {
        name: round(float(imp), 4)
        for name, imp in sorted(
            zip(FEATURE_NAMES, importance),
            key=lambda x: x[1],
            reverse=True
        )
    }
    metrics['feature_importance'] = feature_importance

    print(f"Model trained! R² = {metrics['r2']}, MAE = {metrics['mae']}")

    # Save model and scaler
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    print(f"Model saved to {model_path}")

    return model, scaler, metrics


def load_model(model_path, scaler_path):
    """Load the trained model and scaler from disk."""
    if not os.path.exists(model_path) or not os.path.exists(scaler_path):
        return None, None
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    return model, scaler


def predict(model, scaler, input_data):
    """Make a prediction using the trained model."""
    features = np.array([[input_data.get(name, 0) for name in FEATURE_NAMES]])
    features_scaled = scaler.transform(features)
    prediction = model.predict(features_scaled)[0]
    prediction = np.clip(prediction, 0, 100)
    return round(float(prediction), 1)


def get_model_metrics(model, scaler):
    """Get model performance metrics."""
    df = generate_training_data(1500)
    X = df[FEATURE_NAMES]
    y = df['exam_score']

    _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    X_test_scaled = scaler.transform(X_test)
    y_pred = model.predict(X_test_scaled)

    importance = model.feature_importances_
    feature_importance = {
        name: round(float(imp), 4)
        for name, imp in sorted(
            zip(FEATURE_NAMES, importance),
            key=lambda x: x[1],
            reverse=True
        )
    }

    return {
        'mae': round(mean_absolute_error(y_test, y_pred), 2),
        'rmse': round(np.sqrt(mean_squared_error(y_test, y_pred)), 2),
        'r2': round(r2_score(y_test, y_pred), 4),
        'samples_tested': len(X_test),
        'feature_importance': feature_importance,
        'feature_names': FEATURE_NAMES,
        'feature_labels': FEATURE_LABELS,
    }


if __name__ == '__main__':
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    scaler_path = os.path.join(os.path.dirname(__file__), 'scaler.pkl')
    train_model(model_path, scaler_path)
