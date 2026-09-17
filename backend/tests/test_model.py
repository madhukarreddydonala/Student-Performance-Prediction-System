"""
Unit tests for the ML model module.
Run with: pytest backend/tests/ -v
"""

import pytest
import sys
import os
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from ml_model import (
    generate_training_data, train_model, load_model, predict,
    get_model_metrics, FEATURE_NAMES, FEATURE_LABELS
)


class TestTrainingDataGeneration:
    def test_generates_correct_number_of_samples(self):
        df = generate_training_data(100)
        assert len(df) == 100

    def test_has_all_feature_columns(self):
        df = generate_training_data(50)
        for name in FEATURE_NAMES:
            assert name in df.columns

    def test_has_target_column(self):
        df = generate_training_data(50)
        assert 'exam_score' in df.columns

    def test_scores_in_valid_range(self):
        df = generate_training_data(500)
        assert df['exam_score'].min() >= 0
        assert df['exam_score'].max() <= 100

    def test_deterministic_with_seed(self):
        df1 = generate_training_data(100)
        df2 = generate_training_data(100)
        assert df1.equals(df2)


class TestModelTraining:
    @pytest.fixture
    def trained_model(self, tmp_path):
        model_path = str(tmp_path / 'model.pkl')
        scaler_path = str(tmp_path / 'scaler.pkl')
        model, scaler, metrics = train_model(model_path, scaler_path)
        return model, scaler, metrics, model_path, scaler_path

    def test_model_trains_successfully(self, trained_model):
        model, scaler, metrics, _, _ = trained_model
        assert model is not None
        assert scaler is not None

    def test_metrics_contain_required_keys(self, trained_model):
        _, _, metrics, _, _ = trained_model
        assert 'r2' in metrics
        assert 'mae' in metrics
        assert 'rmse' in metrics
        assert 'feature_importance' in metrics

    def test_r2_is_reasonable(self, trained_model):
        _, _, metrics, _, _ = trained_model
        assert metrics['r2'] > 0.5  # Should be much better on synthetic data

    def test_model_saves_and_loads(self, trained_model):
        _, _, _, model_path, scaler_path = trained_model
        loaded_model, loaded_scaler = load_model(model_path, scaler_path)
        assert loaded_model is not None
        assert loaded_scaler is not None


class TestPrediction:
    @pytest.fixture
    def model_and_scaler(self, tmp_path):
        model_path = str(tmp_path / 'model.pkl')
        scaler_path = str(tmp_path / 'scaler.pkl')
        model, scaler, _ = train_model(model_path, scaler_path)
        return model, scaler

    def test_predict_returns_float(self, model_and_scaler):
        model, scaler = model_and_scaler
        features = {name: 5.0 for name in FEATURE_NAMES}
        result = predict(model, scaler, features)
        assert isinstance(result, float)

    def test_predict_in_valid_range(self, model_and_scaler):
        model, scaler = model_and_scaler
        features = {name: 5.0 for name in FEATURE_NAMES}
        result = predict(model, scaler, features)
        assert 0 <= result <= 100

    def test_higher_study_hours_higher_score(self, model_and_scaler):
        model, scaler = model_and_scaler
        base = {name: 5.0 for name in FEATURE_NAMES}

        base_low = base.copy()
        base_low['study_hours_per_week'] = 2
        score_low = predict(model, scaler, base_low)

        base_high = base.copy()
        base_high['study_hours_per_week'] = 35
        score_high = predict(model, scaler, base_high)

        assert score_high > score_low


class TestFeatureConfig:
    def test_feature_names_count(self):
        assert len(FEATURE_NAMES) == 10

    def test_feature_labels_match_names(self):
        for name in FEATURE_NAMES:
            assert name in FEATURE_LABELS

    def test_labels_are_human_readable(self):
        for label in FEATURE_LABELS.values():
            assert len(label) > 5  # Not just abbreviations
