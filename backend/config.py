"""
Application Configuration — Production-Ready.
Loads settings from environment variables with sensible defaults.
"""

import os
from dotenv import load_dotenv

# Load .env file if present (development convenience)
load_dotenv()


class Config:
    """Application configuration."""

    # Core
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-fallback-key-change-in-prod')
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'

    # MySQL Configuration
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_PORT = os.environ.get('MYSQL_PORT', '3306')
    MYSQL_DB = os.environ.get('MYSQL_DB', 'student_performance')

    # Allow override for testing (e.g. sqlite:///:memory:)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'SQLALCHEMY_DATABASE_URI',
        f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}"
        f"@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = (
        {}
        if os.environ.get('SQLALCHEMY_DATABASE_URI', '').startswith('sqlite')
        else {
            'pool_size': 10,
            'pool_recycle': 3600,
            'pool_pre_ping': True,
        }
    )

    # CORS
    CORS_ORIGINS = os.environ.get(
        'CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173'
    ).split(',')

    # Rate Limiting
    RATE_LIMIT_PREDICT = os.environ.get('RATE_LIMIT_PREDICT', '30/minute')
    RATE_LIMIT_RETRAIN = os.environ.get('RATE_LIMIT_RETRAIN', '3/hour')

    # ML Model paths
    MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')
    SCALER_PATH = os.path.join(os.path.dirname(__file__), 'scaler.pkl')

    # Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
