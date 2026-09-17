"""
Seed the database with sample prediction records.
Run this after starting the Flask app to populate the history table.
"""

import sys
import os
import random

sys.path.insert(0, os.path.dirname(__file__))

from app import app, db, Prediction
from ml_model import load_model, predict, FEATURE_NAMES
from config import Config


FIRST_NAMES = [
    'Aarav', 'Aditi', 'Amit', 'Ananya', 'Arjun', 'Deepa', 'Divya',
    'Gaurav', 'Ishaan', 'Jaya', 'Kavya', 'Lakshmi', 'Madhav', 'Neha',
    'Priya', 'Rahul', 'Riya', 'Sanjay', 'Shreya', 'Vikram', 'Rohan',
    'Meera', 'Kiran', 'Aisha', 'Dev', 'Pooja', 'Siddharth', 'Tanvi',
    'Varun', 'Zara'
]

LAST_NAMES = [
    'Sharma', 'Patel', 'Reddy', 'Kumar', 'Singh', 'Gupta', 'Joshi',
    'Desai', 'Nair', 'Iyer', 'Rao', 'Verma', 'Chopra', 'Mehta',
    'Das', 'Pillai', 'Malhotra', 'Srinivasan', 'Kapoor', 'Bhat'
]


def seed_database(n=50):
    """Creates sample predictions in the database."""
    model, scaler = load_model(Config.MODEL_PATH, Config.SCALER_PATH)
    if model is None:
        print("No model found! Train the model first.")
        return

    with app.app_context():
        existing = Prediction.query.count()
        if existing > 0:
            print(f"Database already has {existing} records. Skipping seed.")
            return

        print(f"Seeding {n} sample predictions...")
        for i in range(n):
            name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
            features = {
                'study_hours_per_week': round(random.uniform(2, 35), 1),
                'attendance_percentage': round(random.uniform(40, 100), 1),
                'previous_exam_score': round(random.uniform(25, 95), 1),
                'assignments_completed': random.randint(3, 20),
                'class_participation': random.randint(1, 10),
                'sleep_hours': round(random.uniform(4.5, 10), 1),
                'extracurricular_activities': random.randint(0, 5),
                'parent_education_level': random.randint(1, 5),
                'internet_access': random.randint(0, 1),
                'tutoring_sessions': random.randint(0, 5),
            }

            predicted_score = predict(model, scaler, features)

            pred = Prediction(
                student_name=name,
                predicted_score=predicted_score,
                **features
            )
            db.session.add(pred)

        db.session.commit()
        print(f"Successfully seeded {n} predictions!")


if __name__ == '__main__':
    seed_database()
