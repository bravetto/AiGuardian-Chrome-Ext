#!/usr/bin/env python3
"""
Input Variance Analysis System

This module implements comprehensive analysis of how Guardian models respond
to input variations, including sensitivity analysis, robustness testing,
and variance impact assessment.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple, Optional, Callable
from dataclasses import dataclass
import logging
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from scipy.spatial.distance import cosine, euclidean
import matplotlib.pyplot as plt
import seaborn as sns
from collections import defaultdict
import json

logger = logging.getLogger(__name__)

@dataclass
class VarianceMetrics:
    """Metrics for input variance analysis"""
    base_prediction: Any
    base_confidence: float
    variance_type: str
    variance_magnitude: float
    prediction_change: Any
    confidence_change: float
    sensitivity_score: float
    robustness_score: float
    stability_score: float

@dataclass
class SensitivityAnalysis:
    """Comprehensive sensitivity analysis results"""
    overall_sensitivity: float
    feature_sensitivity: Dict[str, float]
    variance_thresholds: Dict[str, float]
    critical_features: List[str]
    robustness_recommendations: List[str]

class InputVarianceAnalyzer:
    """
    Comprehensive input variance analysis framework
    """
    
    def __init__(self):
        self.variance_results = {}
        self.sensitivity_analyses = {}
        self.robustness_scores = {}
        self.variance_thresholds = {}
        
    def analyze_input_variance(self, guardian_name: str, guardian_model: Any,
                             base_input: Any, variance_config: Dict[str, Any]) -> Dict[str, VarianceMetrics]:
        """
        Analyze how Guardian responds to input variations
        """
        logger.info(f"Analyzing input variance for {guardian_name}")
        
        variance_results = {}
        
        # Get base prediction
        base_pred, base_conf = self._run_inference(guardian_model, base_input)
        
        # Test different types of variance
        for variance_type, params in variance_config.items():
            logger.info(f"Testing variance type: {variance_type}")
            
            # Generate variance inputs
            variance_inputs = self._generate_variance_inputs(base_input, variance_type, params)
            
            # Test each variance input
            variance_metrics = []
            for variance_input in variance_inputs:
                metrics = self._analyze_single_variance(
                    guardian_model, base_input, variance_input, 
                    base_pred, base_conf, variance_type
                )
                variance_metrics.append(metrics)
            
            variance_results[variance_type] = variance_metrics
        
        self.variance_results[guardian_name] = variance_results
        return variance_results
    
    def conduct_sensitivity_analysis(self, guardian_name: str, guardian_model: Any,
                                  test_data: List[Any], feature_names: List[str]) -> SensitivityAnalysis:
        """
        Conduct comprehensive sensitivity analysis
        """
        logger.info(f"Conducting sensitivity analysis for {guardian_name}")
        
        # Analyze sensitivity to each feature
        feature_sensitivity = {}
        for feature_name in feature_names:
            sensitivity_score = self._calculate_feature_sensitivity(
                guardian_model, test_data, feature_name
            )
            feature_sensitivity[feature_name] = sensitivity_score
        
        # Calculate overall sensitivity
        overall_sensitivity = np.mean(list(feature_sensitivity.values()))
        
        # Identify critical features
        critical_features = self._identify_critical_features(feature_sensitivity)
        
        # Calculate variance thresholds
        variance_thresholds = self._calculate_variance_thresholds(
            guardian_model, test_data, feature_sensitivity
        )
        
        # Generate robustness recommendations
        robustness_recommendations = self._generate_robustness_recommendations(
            feature_sensitivity, critical_features
        )
        
        sensitivity_analysis = SensitivityAnalysis(
            overall_sensitivity=overall_sensitivity,
            feature_sensitivity=feature_sensitivity,
            variance_thresholds=variance_thresholds,
            critical_features=critical_features,
            robustness_recommendations=robustness_recommendations
        )
        
        self.sensitivity_analyses[guardian_name] = sensitivity_analysis
        return sensitivity_analysis
    
    def test_robustness(self, guardian_name: str, guardian_model: Any,
                       test_data: List[Any], noise_levels: List[float]) -> Dict[str, float]:
        """
        Test robustness to noise and perturbations
        """
        logger.info(f"Testing robustness for {guardian_name}")
        
        robustness_scores = {}
        
        for noise_level in noise_levels:
            logger.info(f"Testing robustness at noise level: {noise_level}")
            
            # Add noise to test data
            noisy_data = self._add_noise_to_data(test_data, noise_level)
            
            # Calculate robustness score
            robustness_score = self._calculate_robustness_score(
                guardian_model, test_data, noisy_data
            )
            
            robustness_scores[f"noise_level_{noise_level}"] = robustness_score
        
        self.robustness_scores[guardian_name] = robustness_scores
        return robustness_scores
    
    def analyze_adversarial_robustness(self, guardian_name: str, guardian_model: Any,
                                     test_data: List[Any], attack_methods: List[str]) -> Dict[str, Dict[str, float]]:
        """
        Analyze robustness to adversarial attacks
        """
        logger.info(f"Analyzing adversarial robustness for {guardian_name}")
        
        adversarial_results = {}
        
        for attack_method in attack_methods:
            logger.info(f"Testing adversarial robustness against: {attack_method}")
            
            # Generate adversarial examples
            adversarial_data = self._generate_adversarial_examples(
                guardian_model, test_data, attack_method
            )
            
            # Calculate adversarial robustness
            robustness_metrics = self._calculate_adversarial_robustness(
                guardian_model, test_data, adversarial_data
            )
            
            adversarial_results[attack_method] = robustness_metrics
        
        return adversarial_results
    
    def analyze_input_distribution_shift(self, guardian_name: str, guardian_model: Any,
                                       training_data: List[Any], test_data: List[Any]) -> Dict[str, float]:
        """
        Analyze performance under input distribution shift
        """
        logger.info(f"Analyzing input distribution shift for {guardian_name}")
        
        # Calculate distribution shift metrics
        shift_metrics = self._calculate_distribution_shift(training_data, test_data)
        
        # Test performance under shift
        performance_metrics = self._test_performance_under_shift(
            guardian_model, training_data, test_data
        )
        
        # Combine metrics
        distribution_shift_analysis = {
            'distribution_shift_magnitude': shift_metrics['shift_magnitude'],
            'performance_degradation': performance_metrics['performance_degradation'],
            'confidence_degradation': performance_metrics['confidence_degradation'],
            'adaptation_score': performance_metrics['adaptation_score']
        }
        
        return distribution_shift_analysis
    
    def generate_variance_report(self, guardian_name: str) -> Dict[str, Any]:
        """
        Generate comprehensive variance analysis report
        """
        logger.info(f"Generating variance report for {guardian_name}")
        
        report = {
            'guardian_name': guardian_name,
            'variance_analysis': {},
            'sensitivity_analysis': {},
            'robustness_analysis': {},
            'recommendations': [],
            'timestamp': pd.Timestamp.now().isoformat()
        }
        
        # Include variance results
        if guardian_name in self.variance_results:
            report['variance_analysis'] = self._summarize_variance_results(
                self.variance_results[guardian_name]
            )
        
        # Include sensitivity analysis
        if guardian_name in self.sensitivity_analyses:
            sensitivity = self.sensitivity_analyses[guardian_name]
            report['sensitivity_analysis'] = {
                'overall_sensitivity': sensitivity.overall_sensitivity,
                'critical_features': sensitivity.critical_features,
                'variance_thresholds': sensitivity.variance_thresholds
            }
        
        # Include robustness analysis
        if guardian_name in self.robustness_scores:
            report['robustness_analysis'] = self.robustness_scores[guardian_name]
        
        # Generate recommendations
        report['recommendations'] = self._generate_variance_recommendations(guardian_name)
        
        return report
    
    def visualize_variance_analysis(self, guardian_name: str, output_dir: str = "variance_plots"):
        """
        Generate visualization plots for variance analysis
        """
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        logger.info(f"Generating variance visualizations for {guardian_name}")
        
        # Plot sensitivity analysis
        if guardian_name in self.sensitivity_analyses:
            self._plot_sensitivity_analysis(guardian_name, output_dir)
        
        # Plot robustness analysis
        if guardian_name in self.robustness_scores:
            self._plot_robustness_analysis(guardian_name, output_dir)
        
        # Plot variance impact
        if guardian_name in self.variance_results:
            self._plot_variance_impact(guardian_name, output_dir)
    
    # Helper methods
    def _run_inference(self, model: Any, input_data: Any) -> Tuple[Any, float]:
        """Run inference on a single sample"""
        # This would be implemented based on the actual model interface
        prediction = model.predict(input_data) if hasattr(model, 'predict') else None
        confidence = model.predict_proba(input_data) if hasattr(model, 'predict_proba') else 0.5
        return prediction, confidence
    
    def _generate_variance_inputs(self, base_input: Any, variance_type: str, 
                                params: Dict[str, Any]) -> List[Any]:
        """Generate input variations for testing"""
        
        variance_inputs = []
        
        if variance_type == "text_perturbation":
            variance_inputs = self._generate_text_perturbations(base_input, params)
        elif variance_type == "semantic_variation":
            variance_inputs = self._generate_semantic_variations(base_input, params)
        elif variance_type == "context_variation":
            variance_inputs = self._generate_context_variations(base_input, params)
        elif variance_type == "noise_injection":
            variance_inputs = self._generate_noise_variations(base_input, params)
        elif variance_type == "feature_perturbation":
            variance_inputs = self._generate_feature_perturbations(base_input, params)
        else:
            logger.warning(f"Unknown variance type: {variance_type}")
            variance_inputs = [base_input]
        
        return variance_inputs
    
    def _generate_text_perturbations(self, base_input: Any, params: Dict[str, Any]) -> List[Any]:
        """Generate text perturbations"""
        perturbations = []
        
        # Character-level perturbations
        if params.get('char_level', False):
            char_perturbations = self._apply_character_perturbations(base_input, params)
            perturbations.extend(char_perturbations)
        
        # Word-level perturbations
        if params.get('word_level', False):
            word_perturbations = self._apply_word_perturbations(base_input, params)
            perturbations.extend(word_perturbations)
        
        # Sentence-level perturbations
        if params.get('sentence_level', False):
            sentence_perturbations = self._apply_sentence_perturbations(base_input, params)
            perturbations.extend(sentence_perturbations)
        
        return perturbations
    
    def _generate_semantic_variations(self, base_input: Any, params: Dict[str, Any]) -> List[Any]:
        """Generate semantic variations"""
        variations = []
        
        # Synonym replacement
        if params.get('synonym_replacement', False):
            synonym_variations = self._apply_synonym_replacement(base_input, params)
            variations.extend(synonym_variations)
        
        # Paraphrasing
        if params.get('paraphrasing', False):
            paraphrase_variations = self._apply_paraphrasing(base_input, params)
            variations.extend(paraphrase_variations)
        
        # Semantic augmentation
        if params.get('semantic_augmentation', False):
            semantic_variations = self._apply_semantic_augmentation(base_input, params)
            variations.extend(semantic_variations)
        
        return variations
    
    def _generate_context_variations(self, base_input: Any, params: Dict[str, Any]) -> List[Any]:
        """Generate context variations"""
        variations = []
        
        # Context addition
        if params.get('context_addition', False):
            context_additions = self._apply_context_addition(base_input, params)
            variations.extend(context_additions)
        
        # Context removal
        if params.get('context_removal', False):
            context_removals = self._apply_context_removal(base_input, params)
            variations.extend(context_removals)
        
        # Context modification
        if params.get('context_modification', False):
            context_modifications = self._apply_context_modification(base_input, params)
            variations.extend(context_modifications)
        
        return variations
    
    def _generate_noise_variations(self, base_input: Any, params: Dict[str, Any]) -> List[Any]:
        """Generate noise variations"""
        variations = []
        
        noise_levels = params.get('noise_levels', [0.01, 0.05, 0.1, 0.2])
        
        for noise_level in noise_levels:
            noisy_input = self._add_noise_to_input(base_input, noise_level)
            variations.append(noisy_input)
        
        return variations
    
    def _generate_feature_perturbations(self, base_input: Any, params: Dict[str, Any]) -> List[Any]:
        """Generate feature perturbations"""
        perturbations = []
        
        feature_names = params.get('feature_names', [])
        perturbation_magnitudes = params.get('perturbation_magnitudes', [0.1, 0.2, 0.5])
        
        for feature_name in feature_names:
            for magnitude in perturbation_magnitudes:
                perturbed_input = self._perturb_feature(base_input, feature_name, magnitude)
                perturbations.append(perturbed_input)
        
        return perturbations
    
    def _analyze_single_variance(self, model: Any, base_input: Any, variance_input: Any,
                              base_pred: Any, base_conf: float, variance_type: str) -> VarianceMetrics:
        """Analyze single variance case"""
        
        # Run inference on variance input
        var_pred, var_conf = self._run_inference(model, variance_input)
        
        # Calculate variance magnitude
        variance_magnitude = self._calculate_input_variance(base_input, variance_input)
        
        # Calculate prediction change
        prediction_change = self._calculate_prediction_change(base_pred, var_pred)
        
        # Calculate confidence change
        confidence_change = var_conf - base_conf
        
        # Calculate sensitivity score
        sensitivity_score = self._calculate_sensitivity_score(
            prediction_change, confidence_change, variance_magnitude
        )
        
        # Calculate robustness score
        robustness_score = self._calculate_robustness_score_single(
            base_pred, var_pred, base_conf, var_conf
        )
        
        # Calculate stability score
        stability_score = self._calculate_stability_score(
            prediction_change, confidence_change
        )
        
        return VarianceMetrics(
            base_prediction=base_pred,
            base_confidence=base_conf,
            variance_type=variance_type,
            variance_magnitude=variance_magnitude,
            prediction_change=prediction_change,
            confidence_change=confidence_change,
            sensitivity_score=sensitivity_score,
            robustness_score=robustness_score,
            stability_score=stability_score
        )
    
    def _calculate_input_variance(self, base_input: Any, variance_input: Any) -> float:
        """Calculate variance between inputs"""
        
        # This would be implemented based on input type
        # For text inputs, could use edit distance, semantic similarity, etc.
        # For numerical inputs, could use Euclidean distance, etc.
        
        if isinstance(base_input, str) and isinstance(variance_input, str):
            # Text similarity using simple character-level distance
            return self._calculate_text_distance(base_input, variance_input)
        elif isinstance(base_input, (list, np.ndarray)) and isinstance(variance_input, (list, np.ndarray)):
            # Numerical distance
            return euclidean(base_input, variance_input)
        else:
            # Default: simple equality check
            return 0.0 if base_input == variance_input else 1.0
    
    def _calculate_text_distance(self, text1: str, text2: str) -> float:
        """Calculate distance between two text inputs"""
        # Simple Levenshtein distance normalized by max length
        max_len = max(len(text1), len(text2))
        if max_len == 0:
            return 0.0
        
        # Simplified edit distance calculation
        distance = abs(len(text1) - len(text2))
        for i in range(min(len(text1), len(text2))):
            if text1[i] != text2[i]:
                distance += 1
        
        return distance / max_len
    
    def _calculate_prediction_change(self, base_pred: Any, var_pred: Any) -> Any:
        """Calculate prediction change"""
        if base_pred == var_pred:
            return "no_change"
        else:
            return f"changed_from_{base_pred}_to_{var_pred}"
    
    def _calculate_sensitivity_score(self, prediction_change: Any, 
                                   confidence_change: float, variance_magnitude: float) -> float:
        """Calculate sensitivity score"""
        
        # Sensitivity increases with prediction change and confidence change
        prediction_change_score = 1.0 if prediction_change != "no_change" else 0.0
        confidence_change_score = abs(confidence_change)
        
        # Normalize by variance magnitude
        if variance_magnitude > 0:
            sensitivity_score = (prediction_change_score + confidence_change_score) / variance_magnitude
        else:
            sensitivity_score = prediction_change_score + confidence_change_score
        
        return min(sensitivity_score, 1.0)  # Cap at 1.0
    
    def _calculate_robustness_score_single(self, base_pred: Any, var_pred: Any,
                                        base_conf: float, var_conf: float) -> float:
        """Calculate robustness score for single variance"""
        
        # Robustness decreases with prediction change
        prediction_robustness = 1.0 if base_pred == var_pred else 0.0
        
        # Robustness decreases with confidence change
        confidence_robustness = 1.0 - abs(var_conf - base_conf)
        
        # Combined robustness score
        robustness_score = (prediction_robustness + confidence_robustness) / 2
        
        return max(robustness_score, 0.0)  # Ensure non-negative
    
    def _calculate_stability_score(self, prediction_change: Any, confidence_change: float) -> float:
        """Calculate stability score"""
        
        # Stability decreases with changes
        prediction_stability = 1.0 if prediction_change == "no_change" else 0.0
        confidence_stability = 1.0 - abs(confidence_change)
        
        # Combined stability score
        stability_score = (prediction_stability + confidence_stability) / 2
        
        return max(stability_score, 0.0)  # Ensure non-negative
    
    def _calculate_feature_sensitivity(self, model: Any, test_data: List[Any], 
                                    feature_name: str) -> float:
        """Calculate sensitivity to a specific feature"""
        
        sensitivities = []
        
        for sample in test_data:
            # Create variations of the feature
            feature_variations = self._create_feature_variations(sample, feature_name)
            
            # Test sensitivity
            base_pred, base_conf = self._run_inference(model, sample)
            
            for variation in feature_variations:
                var_pred, var_conf = self._run_inference(model, variation)
                
                # Calculate sensitivity for this variation
                sensitivity = self._calculate_single_feature_sensitivity(
                    base_pred, var_pred, base_conf, var_conf
                )
                sensitivities.append(sensitivity)
        
        return np.mean(sensitivities) if sensitivities else 0.0
    
    def _create_feature_variations(self, sample: Any, feature_name: str) -> List[Any]:
        """Create variations of a specific feature"""
        # This would be implemented based on the feature type and sample structure
        # For now, returning placeholder variations
        return [sample]  # Placeholder
    
    def _calculate_single_feature_sensitivity(self, base_pred: Any, var_pred: Any,
                                           base_conf: float, var_conf: float) -> float:
        """Calculate sensitivity for a single feature variation"""
        
        prediction_change = 1.0 if base_pred != var_pred else 0.0
        confidence_change = abs(var_conf - base_conf)
        
        sensitivity = prediction_change + confidence_change
        return min(sensitivity, 1.0)
    
    def _identify_critical_features(self, feature_sensitivity: Dict[str, float]) -> List[str]:
        """Identify critical features based on sensitivity"""
        
        # Features with sensitivity above threshold are considered critical
        threshold = np.mean(list(feature_sensitivity.values())) + np.std(list(feature_sensitivity.values()))
        
        critical_features = [
            feature for feature, sensitivity in feature_sensitivity.items()
            if sensitivity > threshold
        ]
        
        return critical_features
    
    def _calculate_variance_thresholds(self, model: Any, test_data: List[Any],
                                    feature_sensitivity: Dict[str, float]) -> Dict[str, float]:
        """Calculate variance thresholds for features"""
        
        thresholds = {}
        
        for feature_name, sensitivity in feature_sensitivity.items():
            # Threshold based on sensitivity level
            if sensitivity > 0.8:
                thresholds[feature_name] = 0.1  # Very sensitive, low threshold
            elif sensitivity > 0.5:
                thresholds[feature_name] = 0.3  # Moderately sensitive
            else:
                thresholds[feature_name] = 0.5  # Less sensitive, higher threshold
        
        return thresholds
    
    def _generate_robustness_recommendations(self, feature_sensitivity: Dict[str, float],
                                         critical_features: List[str]) -> List[str]:
        """Generate robustness recommendations"""
        
        recommendations = []
        
        if critical_features:
            recommendations.append(f"Focus robustness improvements on critical features: {', '.join(critical_features)}")
        
        high_sensitivity_features = [
            feature for feature, sensitivity in feature_sensitivity.items()
            if sensitivity > 0.7
        ]
        
        if high_sensitivity_features:
            recommendations.append(f"Consider feature engineering for high-sensitivity features: {', '.join(high_sensitivity_features)}")
        
        avg_sensitivity = np.mean(list(feature_sensitivity.values()))
        if avg_sensitivity > 0.6:
            recommendations.append("Overall high sensitivity detected - consider ensemble methods for improved robustness")
        
        return recommendations
    
    def _add_noise_to_data(self, test_data: List[Any], noise_level: float) -> List[Any]:
        """Add noise to test data"""
        
        noisy_data = []
        
        for sample in test_data:
            if isinstance(sample, (list, np.ndarray)):
                # Add Gaussian noise to numerical data
                noise = np.random.normal(0, noise_level, len(sample))
                noisy_sample = np.array(sample) + noise
                noisy_data.append(noisy_sample.tolist())
            else:
                # For non-numerical data, return original
                noisy_data.append(sample)
        
        return noisy_data
    
    def _calculate_robustness_score(self, model: Any, original_data: List[Any], 
                                 noisy_data: List[Any]) -> float:
        """Calculate robustness score against noise"""
        
        original_predictions = []
        noisy_predictions = []
        
        for orig_sample, noisy_sample in zip(original_data, noisy_data):
            orig_pred, _ = self._run_inference(model, orig_sample)
            noisy_pred, _ = self._run_inference(model, noisy_sample)
            
            original_predictions.append(orig_pred)
            noisy_predictions.append(noisy_pred)
        
        # Calculate agreement rate
        agreements = sum(1 for orig, noisy in zip(original_predictions, noisy_predictions) 
                        if orig == noisy)
        
        robustness_score = agreements / len(original_predictions)
        return robustness_score
    
    def _generate_adversarial_examples(self, model: Any, test_data: List[Any], 
                                     attack_method: str) -> List[Any]:
        """Generate adversarial examples"""
        
        adversarial_examples = []
        
        for sample in test_data:
            if attack_method == "fgsm":
                adversarial_example = self._apply_fgsm_attack(model, sample)
            elif attack_method == "pgd":
                adversarial_example = self._apply_pgd_attack(model, sample)
            elif attack_method == "carlini_wagner":
                adversarial_example = self._apply_cw_attack(model, sample)
            else:
                logger.warning(f"Unknown attack method: {attack_method}")
                adversarial_example = sample
            
            adversarial_examples.append(adversarial_example)
        
        return adversarial_examples
    
    def _apply_fgsm_attack(self, model: Any, sample: Any) -> Any:
        """Apply Fast Gradient Sign Method attack"""
        # Placeholder implementation
        return sample
    
    def _apply_pgd_attack(self, model: Any, sample: Any) -> Any:
        """Apply Projected Gradient Descent attack"""
        # Placeholder implementation
        return sample
    
    def _apply_cw_attack(self, model: Any, sample: Any) -> Any:
        """Apply Carlini-Wagner attack"""
        # Placeholder implementation
        return sample
    
    def _calculate_adversarial_robustness(self, model: Any, original_data: List[Any],
                                       adversarial_data: List[Any]) -> Dict[str, float]:
        """Calculate adversarial robustness metrics"""
        
        original_predictions = []
        adversarial_predictions = []
        
        for orig_sample, adv_sample in zip(original_data, adversarial_data):
            orig_pred, orig_conf = self._run_inference(model, orig_sample)
            adv_pred, adv_conf = self._run_inference(model, adv_sample)
            
            original_predictions.append((orig_pred, orig_conf))
            adversarial_predictions.append((adv_pred, adv_conf))
        
        # Calculate robustness metrics
        success_rate = sum(1 for orig, adv in zip(original_predictions, adversarial_predictions)
                          if orig[0] == adv[0]) / len(original_predictions)
        
        confidence_drop = np.mean([orig[1] - adv[1] for orig, adv in 
                                 zip(original_predictions, adversarial_predictions)])
        
        return {
            'success_rate': success_rate,
            'confidence_drop': confidence_drop,
            'robustness_score': success_rate - abs(confidence_drop)
        }
    
    def _calculate_distribution_shift(self, training_data: List[Any], test_data: List[Any]) -> Dict[str, float]:
        """Calculate distribution shift between training and test data"""
        
        # This would implement actual distribution shift calculation
        # For now, returning placeholder metrics
        
        return {
            'shift_magnitude': 0.15,  # Placeholder
            'shift_type': 'covariate_shift',
            'affected_features': ['feature1', 'feature2']
        }
    
    def _test_performance_under_shift(self, model: Any, training_data: List[Any], 
                                    test_data: List[Any]) -> Dict[str, float]:
        """Test performance under distribution shift"""
        
        # Calculate performance on training data
        train_predictions = []
        for sample in training_data:
            pred, conf = self._run_inference(model, sample)
            train_predictions.append((pred, conf))
        
        # Calculate performance on test data
        test_predictions = []
        for sample in test_data:
            pred, conf = self._run_inference(model, sample)
            test_predictions.append((pred, conf))
        
        # Calculate performance degradation
        train_confidence = np.mean([pred[1] for pred in train_predictions])
        test_confidence = np.mean([pred[1] for pred in test_predictions])
        
        performance_degradation = train_confidence - test_confidence
        confidence_degradation = abs(performance_degradation)
        
        # Calculate adaptation score
        adaptation_score = 1.0 - confidence_degradation
        
        return {
            'performance_degradation': performance_degradation,
            'confidence_degradation': confidence_degradation,
            'adaptation_score': adaptation_score
        }
    
    def _summarize_variance_results(self, variance_results: Dict[str, List[VarianceMetrics]]) -> Dict[str, Any]:
        """Summarize variance analysis results"""
        
        summary = {}
        
        for variance_type, metrics_list in variance_results.items():
            if metrics_list:
                summary[variance_type] = {
                    'average_sensitivity': np.mean([m.sensitivity_score for m in metrics_list]),
                    'average_robustness': np.mean([m.robustness_score for m in metrics_list]),
                    'average_stability': np.mean([m.stability_score for m in metrics_list]),
                    'prediction_changes': sum(1 for m in metrics_list if m.prediction_change != "no_change"),
                    'total_variations': len(metrics_list)
                }
        
        return summary
    
    def _generate_variance_recommendations(self, guardian_name: str) -> List[str]:
        """Generate recommendations based on variance analysis"""
        
        recommendations = []
        
        # Analyze sensitivity
        if guardian_name in self.sensitivity_analyses:
            sensitivity = self.sensitivity_analyses[guardian_name]
            
            if sensitivity.overall_sensitivity > 0.7:
                recommendations.append("High sensitivity detected - implement robustness improvements")
            
            if sensitivity.critical_features:
                recommendations.append(f"Focus on critical features: {', '.join(sensitivity.critical_features)}")
        
        # Analyze robustness
        if guardian_name in self.robustness_scores:
            robustness_scores = self.robustness_scores[guardian_name]
            avg_robustness = np.mean(list(robustness_scores.values()))
            
            if avg_robustness < 0.8:
                recommendations.append("Low robustness detected - consider adversarial training")
        
        return recommendations
    
    def _plot_sensitivity_analysis(self, guardian_name: str, output_dir: str):
        """Plot sensitivity analysis"""
        
        sensitivity = self.sensitivity_analyses[guardian_name]
        
        # Plot feature sensitivity
        features = list(sensitivity.feature_sensitivity.keys())
        sensitivities = list(sensitivity.feature_sensitivity.values())
        
        plt.figure(figsize=(12, 6))
        plt.bar(features, sensitivities)
        plt.xlabel('Features')
        plt.ylabel('Sensitivity Score')
        plt.title(f'Sensitivity Analysis - {guardian_name}')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(f"{output_dir}/{guardian_name}_sensitivity_analysis.png", dpi=300, bbox_inches='tight')
        plt.close()
    
    def _plot_robustness_analysis(self, guardian_name: str, output_dir: str):
        """Plot robustness analysis"""
        
        robustness_scores = self.robustness_scores[guardian_name]
        
        noise_levels = [float(k.split('_')[-1]) for k in robustness_scores.keys()]
        scores = list(robustness_scores.values())
        
        plt.figure(figsize=(10, 6))
        plt.plot(noise_levels, scores, marker='o')
        plt.xlabel('Noise Level')
        plt.ylabel('Robustness Score')
        plt.title(f'Robustness Analysis - {guardian_name}')
        plt.grid(True)
        plt.tight_layout()
        plt.savefig(f"{output_dir}/{guardian_name}_robustness_analysis.png", dpi=300, bbox_inches='tight')
        plt.close()
    
    def _plot_variance_impact(self, guardian_name: str, output_dir: str):
        """Plot variance impact analysis"""
        
        variance_results = self.variance_results[guardian_name]
        
        variance_types = list(variance_results.keys())
        avg_sensitivities = []
        
        for variance_type, metrics_list in variance_results.items():
            if metrics_list:
                avg_sensitivity = np.mean([m.sensitivity_score for m in metrics_list])
                avg_sensitivities.append(avg_sensitivity)
            else:
                avg_sensitivities.append(0.0)
        
        plt.figure(figsize=(10, 6))
        plt.bar(variance_types, avg_sensitivities)
        plt.xlabel('Variance Type')
        plt.ylabel('Average Sensitivity Score')
        plt.title(f'Variance Impact Analysis - {guardian_name}')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(f"{output_dir}/{guardian_name}_variance_impact.png", dpi=300, bbox_inches='tight')
        plt.close()


# Example usage
if __name__ == "__main__":
    # Initialize input variance analyzer
    analyzer = InputVarianceAnalyzer()
    
    # Example guardian model (placeholder)
    guardian_model = None  # Placeholder
    
    # Example test data
    test_data = ["sample1", "sample2", "sample3"]
    base_input = "This is a test input for variance analysis"
    
    # Example variance configuration
    variance_config = {
        "text_perturbation": {
            "char_level": True,
            "word_level": True,
            "sentence_level": False
        },
        "semantic_variation": {
            "synonym_replacement": True,
            "paraphrasing": False
        },
        "noise_injection": {
            "noise_levels": [0.01, 0.05, 0.1]
        }
    }
    
    # Run variance analysis
    print("Running input variance analysis...")
    
    variance_results = analyzer.analyze_input_variance(
        "TestGuardian", guardian_model, base_input, variance_config
    )
    print(f"Variance analysis completed: {len(variance_results)} variance types tested")
    
    # Conduct sensitivity analysis
    feature_names = ["feature1", "feature2", "feature3"]
    sensitivity_analysis = analyzer.conduct_sensitivity_analysis(
        "TestGuardian", guardian_model, test_data, feature_names
    )
    print(f"Sensitivity analysis completed: {len(sensitivity_analysis.critical_features)} critical features identified")
    
    # Test robustness
    noise_levels = [0.01, 0.05, 0.1, 0.2]
    robustness_scores = analyzer.test_robustness(
        "TestGuardian", guardian_model, test_data, noise_levels
    )
    print(f"Robustness testing completed: {len(robustness_scores)} noise levels tested")
    
    # Generate report
    report = analyzer.generate_variance_report("TestGuardian")
    print(f"Variance report generated with {len(report['recommendations'])} recommendations")
    
    # Generate visualizations
    analyzer.visualize_variance_analysis("TestGuardian")
    print("Variance analysis visualizations generated")
    
    print("Input variance analysis completed successfully!")
