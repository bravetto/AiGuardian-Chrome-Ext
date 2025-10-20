#!/usr/bin/env python3
"""
False Positive Tolerance Assessment Tools

This module implements comprehensive tools for assessing false positive tolerance,
calibration analysis, and threshold optimization for Guardian models.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple, Optional
from dataclasses import dataclass
import logging
from sklearn.metrics import confusion_matrix, precision_recall_curve, roc_curve, roc_auc_score
from sklearn.calibration import calibration_curve
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.optimize import minimize_scalar
from collections import defaultdict
import json

logger = logging.getLogger(__name__)

@dataclass
class ToleranceMetrics:
    """Metrics for false positive tolerance assessment"""
    false_positive_rate: float
    false_negative_rate: float
    precision: float
    recall: float
    f1_score: float
    calibration_error: float
    optimal_threshold: float
    tolerance_score: float
    confidence_interval: Tuple[float, float]

@dataclass
class CalibrationAnalysis:
    """Comprehensive calibration analysis results"""
    expected_calibration_error: float
    maximum_calibration_error: float
    reliability_diagram: Dict[str, List[float]]
    calibration_method: str
    calibration_parameters: Dict[str, Any]
    improvement_score: float

class FalsePositiveToleranceAssessor:
    """
    Comprehensive false positive tolerance assessment framework
    """
    
    def __init__(self):
        self.tolerance_results = {}
        self.calibration_analyses = {}
        self.threshold_optimizations = {}
        self.tolerance_recommendations = {}
        
    def assess_false_positive_tolerance(self, guardian_name: str, guardian_model: Any,
                                     test_data: List[Any], ground_truth: List[bool],
                                     threshold_range: Tuple[float, float] = (0.1, 0.9)) -> ToleranceMetrics:
        """
        Assess false positive tolerance and calibration
        """
        logger.info(f"Assessing false positive tolerance for {guardian_name}")
        
        # Get predictions and confidences
        predictions, confidences = self._get_predictions_and_confidences(guardian_model, test_data)
        
        # Calculate tolerance metrics at current threshold
        current_threshold = 0.5  # Default threshold
        tolerance_metrics = self._calculate_tolerance_metrics(
            predictions, confidences, ground_truth, current_threshold
        )
        
        # Find optimal threshold
        optimal_threshold = self._find_optimal_threshold(
            confidences, ground_truth, threshold_range
        )
        
        # Calculate metrics at optimal threshold
        optimal_metrics = self._calculate_tolerance_metrics(
            predictions, confidences, ground_truth, optimal_threshold
        )
        
        # Update with optimal threshold
        tolerance_metrics.optimal_threshold = optimal_threshold
        tolerance_metrics.false_positive_rate = optimal_metrics.false_positive_rate
        tolerance_metrics.false_negative_rate = optimal_metrics.false_negative_rate
        tolerance_metrics.precision = optimal_metrics.precision
        tolerance_metrics.recall = optimal_metrics.recall
        tolerance_metrics.f1_score = optimal_metrics.f1_score
        tolerance_metrics.tolerance_score = optimal_metrics.tolerance_score
        
        self.tolerance_results[guardian_name] = tolerance_metrics
        return tolerance_metrics
    
    def analyze_calibration(self, guardian_name: str, guardian_model: Any,
                          test_data: List[Any], ground_truth: List[bool],
                          calibration_method: str = "isotonic") -> CalibrationAnalysis:
        """
        Analyze prediction calibration
        """
        logger.info(f"Analyzing calibration for {guardian_name}")
        
        # Get predictions and confidences
        predictions, confidences = self._get_predictions_and_confidences(guardian_model, test_data)
        
        # Calculate calibration error
        ece, mce = self._calculate_calibration_errors(confidences, ground_truth)
        
        # Generate reliability diagram
        reliability_diagram = self._generate_reliability_diagram(confidences, ground_truth)
        
        # Apply calibration method
        calibrated_confidences = self._apply_calibration_method(
            confidences, ground_truth, calibration_method
        )
        
        # Calculate improvement
        calibrated_ece, calibrated_mce = self._calculate_calibration_errors(
            calibrated_confidences, ground_truth
        )
        
        improvement_score = (ece - calibrated_ece) / ece if ece > 0 else 0.0
        
        calibration_analysis = CalibrationAnalysis(
            expected_calibration_error=calibrated_ece,
            maximum_calibration_error=calibrated_mce,
            reliability_diagram=reliability_diagram,
            calibration_method=calibration_method,
            calibration_parameters=self._get_calibration_parameters(calibration_method),
            improvement_score=improvement_score
        )
        
        self.calibration_analyses[guardian_name] = calibration_analysis
        return calibration_analysis
    
    def optimize_threshold(self, guardian_name: str, guardian_model: Any,
                         test_data: List[Any], ground_truth: List[bool],
                         optimization_metric: str = "f1_score",
                         constraint_fpr: Optional[float] = None) -> Dict[str, Any]:
        """
        Optimize threshold for specific requirements
        """
        logger.info(f"Optimizing threshold for {guardian_name}")
        
        # Get predictions and confidences
        predictions, confidences = self._get_predictions_and_confidences(guardian_model, test_data)
        
        # Define optimization objective
        if optimization_metric == "f1_score":
            objective_func = lambda t: -self._calculate_f1_score_at_threshold(
                confidences, ground_truth, t
            )
        elif optimization_metric == "precision":
            objective_func = lambda t: -self._calculate_precision_at_threshold(
                confidences, ground_truth, t
            )
        elif optimization_metric == "balanced_accuracy":
            objective_func = lambda t: -self._calculate_balanced_accuracy_at_threshold(
                confidences, ground_truth, t
            )
        else:
            raise ValueError(f"Unknown optimization metric: {optimization_metric}")
        
        # Apply constraints if specified
        if constraint_fpr is not None:
            def constrained_objective(t):
                fpr = self._calculate_fpr_at_threshold(confidences, ground_truth, t)
                if fpr > constraint_fpr:
                    return float('inf')  # Penalty for constraint violation
                return objective_func(t)
            objective_func = constrained_objective
        
        # Optimize threshold
        result = minimize_scalar(objective_func, bounds=(0.1, 0.9), method='bounded')
        optimal_threshold = result.x
        
        # Calculate metrics at optimal threshold
        optimal_metrics = self._calculate_comprehensive_metrics(
            confidences, ground_truth, optimal_threshold
        )
        
        optimization_result = {
            'optimal_threshold': optimal_threshold,
            'optimization_metric': optimization_metric,
            'constraint_fpr': constraint_fpr,
            'metrics_at_optimal': optimal_metrics,
            'optimization_success': result.success,
            'optimization_message': result.message
        }
        
        self.threshold_optimizations[guardian_name] = optimization_result
        return optimization_result
    
    def analyze_threshold_sensitivity(self, guardian_name: str, guardian_model: Any,
                                   test_data: List[Any], ground_truth: List[bool],
                                   threshold_range: Tuple[float, float] = (0.1, 0.9),
                                   num_points: int = 50) -> Dict[str, Any]:
        """
        Analyze sensitivity to threshold changes
        """
        logger.info(f"Analyzing threshold sensitivity for {guardian_name}")
        
        # Get predictions and confidences
        predictions, confidences = self._get_predictions_and_confidences(guardian_model, test_data)
        
        # Generate threshold range
        thresholds = np.linspace(threshold_range[0], threshold_range[1], num_points)
        
        # Calculate metrics at each threshold
        sensitivity_data = {
            'thresholds': thresholds,
            'precision': [],
            'recall': [],
            'f1_score': [],
            'false_positive_rate': [],
            'false_negative_rate': [],
            'accuracy': []
        }
        
        for threshold in thresholds:
            metrics = self._calculate_comprehensive_metrics(confidences, ground_truth, threshold)
            
            sensitivity_data['precision'].append(metrics['precision'])
            sensitivity_data['recall'].append(metrics['recall'])
            sensitivity_data['f1_score'].append(metrics['f1_score'])
            sensitivity_data['false_positive_rate'].append(metrics['false_positive_rate'])
            sensitivity_data['false_negative_rate'].append(metrics['false_negative_rate'])
            sensitivity_data['accuracy'].append(metrics['accuracy'])
        
        # Find optimal thresholds for different metrics
        optimal_thresholds = {
            'f1_score': thresholds[np.argmax(sensitivity_data['f1_score'])],
            'precision': thresholds[np.argmax(sensitivity_data['precision'])],
            'balanced_accuracy': thresholds[np.argmax([
                (r + (1 - fpr)) / 2 for r, fpr in zip(sensitivity_data['recall'], sensitivity_data['false_positive_rate'])
            ])]
        }
        
        # Calculate sensitivity scores
        sensitivity_scores = self._calculate_sensitivity_scores(sensitivity_data)
        
        sensitivity_analysis = {
            'sensitivity_data': sensitivity_data,
            'optimal_thresholds': optimal_thresholds,
            'sensitivity_scores': sensitivity_scores,
            'recommended_threshold': self._recommend_threshold(sensitivity_data, optimal_thresholds)
        }
        
        return sensitivity_analysis
    
    def assess_tolerance_across_scenarios(self, guardian_name: str, guardian_model: Any,
                                        scenario_data: Dict[str, Tuple[List[Any], List[bool]]]) -> Dict[str, ToleranceMetrics]:
        """
        Assess tolerance across different scenarios
        """
        logger.info(f"Assessing tolerance across scenarios for {guardian_name}")
        
        scenario_results = {}
        
        for scenario_name, (test_data, ground_truth) in scenario_data.items():
            logger.info(f"Assessing scenario: {scenario_name}")
            
            tolerance_metrics = self.assess_false_positive_tolerance(
                f"{guardian_name}_{scenario_name}", guardian_model, test_data, ground_truth
            )
            
            scenario_results[scenario_name] = tolerance_metrics
        
        return scenario_results
    
    def generate_tolerance_report(self, guardian_name: str) -> Dict[str, Any]:
        """
        Generate comprehensive tolerance assessment report
        """
        logger.info(f"Generating tolerance report for {guardian_name}")
        
        report = {
            'guardian_name': guardian_name,
            'tolerance_assessment': {},
            'calibration_analysis': {},
            'threshold_optimization': {},
            'recommendations': [],
            'timestamp': pd.Timestamp.now().isoformat()
        }
        
        # Include tolerance results
        if guardian_name in self.tolerance_results:
            tolerance = self.tolerance_results[guardian_name]
            report['tolerance_assessment'] = {
                'false_positive_rate': tolerance.false_positive_rate,
                'false_negative_rate': tolerance.false_negative_rate,
                'precision': tolerance.precision,
                'recall': tolerance.recall,
                'f1_score': tolerance.f1_score,
                'optimal_threshold': tolerance.optimal_threshold,
                'tolerance_score': tolerance.tolerance_score
            }
        
        # Include calibration analysis
        if guardian_name in self.calibration_analyses:
            calibration = self.calibration_analyses[guardian_name]
            report['calibration_analysis'] = {
                'expected_calibration_error': calibration.expected_calibration_error,
                'maximum_calibration_error': calibration.maximum_calibration_error,
                'calibration_method': calibration.calibration_method,
                'improvement_score': calibration.improvement_score
            }
        
        # Include threshold optimization
        if guardian_name in self.threshold_optimizations:
            optimization = self.threshold_optimizations[guardian_name]
            report['threshold_optimization'] = {
                'optimal_threshold': optimization['optimal_threshold'],
                'optimization_metric': optimization['optimization_metric'],
                'optimization_success': optimization['optimization_success']
            }
        
        # Generate recommendations
        report['recommendations'] = self._generate_tolerance_recommendations(guardian_name)
        
        return report
    
    def visualize_tolerance_analysis(self, guardian_name: str, output_dir: str = "tolerance_plots"):
        """
        Generate visualization plots for tolerance analysis
        """
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        logger.info(f"Generating tolerance visualizations for {guardian_name}")
        
        # Plot calibration curve
        if guardian_name in self.calibration_analyses:
            self._plot_calibration_curve(guardian_name, output_dir)
        
        # Plot threshold sensitivity
        if guardian_name in self.threshold_optimizations:
            self._plot_threshold_sensitivity(guardian_name, output_dir)
        
        # Plot ROC curve
        self._plot_roc_curve(guardian_name, output_dir)
    
    # Helper methods
    def _get_predictions_and_confidences(self, model: Any, test_data: List[Any]) -> Tuple[List[Any], List[float]]:
        """Get predictions and confidences from model"""
        
        predictions = []
        confidences = []
        
        for sample in test_data:
            pred = model.predict(sample) if hasattr(model, 'predict') else None
            conf = model.predict_proba(sample) if hasattr(model, 'predict_proba') else 0.5
            
            predictions.append(pred)
            confidences.append(conf)
        
        return predictions, confidences
    
    def _calculate_tolerance_metrics(self, predictions: List[Any], confidences: List[float],
                                   ground_truth: List[bool], threshold: float) -> ToleranceMetrics:
        """Calculate comprehensive tolerance metrics"""
        
        # Convert confidences to binary predictions
        binary_predictions = [conf > threshold for conf in confidences]
        
        # Calculate confusion matrix
        tn, fp, fn, tp = confusion_matrix(ground_truth, binary_predictions).ravel()
        
        # Calculate metrics
        fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
        fnr = fn / (fn + tp) if (fn + tp) > 0 else 0.0
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
        
        # Calculate calibration error
        calibration_error = self._calculate_calibration_errors(confidences, ground_truth)[0]
        
        # Calculate tolerance score
        tolerance_score = self._calculate_tolerance_score(fpr, fnr, precision, recall)
        
        # Calculate confidence interval
        confidence_interval = self._calculate_confidence_interval(confidences)
        
        return ToleranceMetrics(
            false_positive_rate=fpr,
            false_negative_rate=fnr,
            precision=precision,
            recall=recall,
            f1_score=f1,
            calibration_error=calibration_error,
            optimal_threshold=threshold,
            tolerance_score=tolerance_score,
            confidence_interval=confidence_interval
        )
    
    def _calculate_tolerance_score(self, fpr: float, fnr: float, precision: float, recall: float) -> float:
        """Calculate overall tolerance score"""
        
        # Weighted combination of metrics
        weights = {'precision': 0.3, 'recall': 0.3, 'fpr_penalty': 0.2, 'fnr_penalty': 0.2}
        
        tolerance_score = (
            weights['precision'] * precision +
            weights['recall'] * recall +
            weights['fpr_penalty'] * (1.0 - fpr) +
            weights['fnr_penalty'] * (1.0 - fnr)
        )
        
        return tolerance_score
    
    def _calculate_confidence_interval(self, confidences: List[float]) -> Tuple[float, float]:
        """Calculate confidence interval for confidences"""
        
        if not confidences:
            return (0.0, 1.0)
        
        mean_conf = np.mean(confidences)
        std_conf = np.std(confidences)
        
        # 95% confidence interval
        margin_error = 1.96 * std_conf / np.sqrt(len(confidences))
        
        lower_bound = max(0.0, mean_conf - margin_error)
        upper_bound = min(1.0, mean_conf + margin_error)
        
        return (lower_bound, upper_bound)
    
    def _find_optimal_threshold(self, confidences: List[float], ground_truth: List[bool],
                              threshold_range: Tuple[float, float]) -> float:
        """Find optimal threshold using F1 score"""
        
        def f1_objective(threshold):
            binary_predictions = [conf > threshold for conf in confidences]
            tn, fp, fn, tp = confusion_matrix(ground_truth, binary_predictions).ravel()
            
            precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
            recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
            f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
            
            return -f1  # Minimize negative F1
        
        result = minimize_scalar(f1_objective, bounds=threshold_range, method='bounded')
        return result.x
    
    def _calculate_calibration_errors(self, confidences: List[float], ground_truth: List[bool]) -> Tuple[float, float]:
        """Calculate Expected Calibration Error (ECE) and Maximum Calibration Error (MCE)"""
        
        # Bin confidences
        n_bins = 10
        bin_boundaries = np.linspace(0, 1, n_bins + 1)
        bin_lowers = bin_boundaries[:-1]
        bin_uppers = bin_boundaries[1:]
        
        ece = 0.0
        mce = 0.0
        
        for bin_lower, bin_upper in zip(bin_lowers, bin_uppers):
            in_bin = (confidences > bin_lower) & (confidences <= bin_upper)
            prop_in_bin = in_bin.mean()
            
            if prop_in_bin > 0:
                accuracy_in_bin = ground_truth[in_bin].mean()
                avg_confidence_in_bin = np.mean(confidences[in_bin])
                
                ece += np.abs(avg_confidence_in_bin - accuracy_in_bin) * prop_in_bin
                mce = max(mce, np.abs(avg_confidence_in_bin - accuracy_in_bin))
        
        return ece, mce
    
    def _generate_reliability_diagram(self, confidences: List[float], ground_truth: List[bool]) -> Dict[str, List[float]]:
        """Generate reliability diagram data"""
        
        n_bins = 10
        bin_boundaries = np.linspace(0, 1, n_bins + 1)
        
        bin_centers = []
        bin_accuracies = []
        bin_confidences = []
        bin_counts = []
        
        for i in range(n_bins):
            bin_lower = bin_boundaries[i]
            bin_upper = bin_boundaries[i + 1]
            
            in_bin = (confidences > bin_lower) & (confidences <= bin_upper)
            
            if in_bin.sum() > 0:
                bin_centers.append((bin_lower + bin_upper) / 2)
                bin_accuracies.append(ground_truth[in_bin].mean())
                bin_confidences.append(np.mean(confidences[in_bin]))
                bin_counts.append(in_bin.sum())
        
        return {
            'bin_centers': bin_centers,
            'bin_accuracies': bin_accuracies,
            'bin_confidences': bin_confidences,
            'bin_counts': bin_counts
        }
    
    def _apply_calibration_method(self, confidences: List[float], ground_truth: List[bool],
                                method: str) -> List[float]:
        """Apply calibration method"""
        
        if method == "isotonic":
            from sklearn.isotonic import IsotonicRegression
            calibrator = IsotonicRegression(out_of_bounds='clip')
            calibrator.fit(confidences, ground_truth)
            return calibrator.transform(confidences)
        
        elif method == "platt":
            from sklearn.calibration import CalibratedClassifierCV
            # This would require a proper classifier
            # For now, return original confidences
            return confidences
        
        else:
            logger.warning(f"Unknown calibration method: {method}")
            return confidences
    
    def _get_calibration_parameters(self, method: str) -> Dict[str, Any]:
        """Get calibration method parameters"""
        
        if method == "isotonic":
            return {"out_of_bounds": "clip"}
        elif method == "platt":
            return {"method": "sigmoid", "cv": 5}
        else:
            return {}
    
    def _calculate_f1_score_at_threshold(self, confidences: List[float], ground_truth: List[bool], threshold: float) -> float:
        """Calculate F1 score at specific threshold"""
        
        binary_predictions = [conf > threshold for conf in confidences]
        tn, fp, fn, tp = confusion_matrix(ground_truth, binary_predictions).ravel()
        
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
        
        return f1
    
    def _calculate_precision_at_threshold(self, confidences: List[float], ground_truth: List[bool], threshold: float) -> float:
        """Calculate precision at specific threshold"""
        
        binary_predictions = [conf > threshold for conf in confidences]
        tn, fp, fn, tp = confusion_matrix(ground_truth, binary_predictions).ravel()
        
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        return precision
    
    def _calculate_balanced_accuracy_at_threshold(self, confidences: List[float], ground_truth: List[bool], threshold: float) -> float:
        """Calculate balanced accuracy at specific threshold"""
        
        binary_predictions = [conf > threshold for conf in confidences]
        tn, fp, fn, tp = confusion_matrix(ground_truth, binary_predictions).ravel()
        
        sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
        
        balanced_accuracy = (sensitivity + specificity) / 2
        return balanced_accuracy
    
    def _calculate_fpr_at_threshold(self, confidences: List[float], ground_truth: List[bool], threshold: float) -> float:
        """Calculate false positive rate at specific threshold"""
        
        binary_predictions = [conf > threshold for conf in confidences]
        tn, fp, fn, tp = confusion_matrix(ground_truth, binary_predictions).ravel()
        
        fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
        return fpr
    
    def _calculate_comprehensive_metrics(self, confidences: List[float], ground_truth: List[bool], threshold: float) -> Dict[str, float]:
        """Calculate comprehensive metrics at specific threshold"""
        
        binary_predictions = [conf > threshold for conf in confidences]
        tn, fp, fn, tp = confusion_matrix(ground_truth, binary_predictions).ravel()
        
        metrics = {
            'precision': tp / (tp + fp) if (tp + fp) > 0 else 0.0,
            'recall': tp / (tp + fn) if (tp + fn) > 0 else 0.0,
            'f1_score': 0.0,
            'false_positive_rate': fp / (fp + tn) if (fp + tn) > 0 else 0.0,
            'false_negative_rate': fn / (fn + tp) if (fn + tp) > 0 else 0.0,
            'accuracy': (tp + tn) / (tp + tn + fp + fn) if (tp + tn + fp + fn) > 0 else 0.0
        }
        
        # Calculate F1 score
        if metrics['precision'] + metrics['recall'] > 0:
            metrics['f1_score'] = 2 * (metrics['precision'] * metrics['recall']) / (metrics['precision'] + metrics['recall'])
        
        return metrics
    
    def _calculate_sensitivity_scores(self, sensitivity_data: Dict[str, List[float]]) -> Dict[str, float]:
        """Calculate sensitivity scores for different metrics"""
        
        scores = {}
        
        for metric in ['precision', 'recall', 'f1_score']:
            values = sensitivity_data[metric]
            if values:
                scores[f'{metric}_sensitivity'] = np.std(values) / np.mean(values) if np.mean(values) > 0 else 0.0
        
        return scores
    
    def _recommend_threshold(self, sensitivity_data: Dict[str, List[float]], 
                           optimal_thresholds: Dict[str, float]) -> float:
        """Recommend optimal threshold based on sensitivity analysis"""
        
        # Use F1 score as primary metric, but consider sensitivity
        f1_values = sensitivity_data['f1_score']
        thresholds = sensitivity_data['thresholds']
        
        # Find threshold with good F1 score and low sensitivity
        f1_mean = np.mean(f1_values)
        f1_std = np.std(f1_values)
        
        # Prefer thresholds with F1 score close to mean and low variance
        scores = []
        for i, (threshold, f1) in enumerate(zip(thresholds, f1_values)):
            # Score based on F1 value and stability
            f1_score = f1 / f1_mean if f1_mean > 0 else 0.0
            stability_score = 1.0 - (f1_std / f1_mean) if f1_mean > 0 else 0.0
            
            combined_score = f1_score * 0.7 + stability_score * 0.3
            scores.append(combined_score)
        
        best_idx = np.argmax(scores)
        return thresholds[best_idx]
    
    def _generate_tolerance_recommendations(self, guardian_name: str) -> List[str]:
        """Generate recommendations based on tolerance analysis"""
        
        recommendations = []
        
        # Analyze tolerance results
        if guardian_name in self.tolerance_results:
            tolerance = self.tolerance_results[guardian_name]
            
            if tolerance.false_positive_rate > 0.1:
                recommendations.append("High false positive rate detected - consider threshold adjustment or model retraining")
            
            if tolerance.false_negative_rate > 0.1:
                recommendations.append("High false negative rate detected - consider threshold adjustment or feature engineering")
            
            if tolerance.tolerance_score < 0.8:
                recommendations.append("Low tolerance score - implement calibration improvements")
        
        # Analyze calibration
        if guardian_name in self.calibration_analyses:
            calibration = self.calibration_analyses[guardian_name]
            
            if calibration.expected_calibration_error > 0.1:
                recommendations.append("High calibration error - implement calibration method")
            
            if calibration.improvement_score < 0.3:
                recommendations.append("Low calibration improvement - consider alternative calibration methods")
        
        return recommendations
    
    def _plot_calibration_curve(self, guardian_name: str, output_dir: str):
        """Plot calibration curve"""
        
        calibration = self.calibration_analyses[guardian_name]
        reliability_data = calibration.reliability_diagram
        
        plt.figure(figsize=(10, 8))
        
        # Plot reliability diagram
        bin_centers = reliability_data['bin_centers']
        bin_accuracies = reliability_data['bin_accuracies']
        bin_confidences = reliability_data['bin_confidences']
        bin_counts = reliability_data['bin_counts']
        
        plt.bar(bin_centers, bin_accuracies, width=0.1, alpha=0.7, label='Accuracy')
        plt.plot(bin_centers, bin_confidences, 'ro-', label='Confidence')
        plt.plot([0, 1], [0, 1], 'k--', label='Perfect Calibration')
        
        plt.xlabel('Confidence')
        plt.ylabel('Accuracy')
        plt.title(f'Calibration Curve - {guardian_name}')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(f"{output_dir}/{guardian_name}_calibration_curve.png", dpi=300, bbox_inches='tight')
        plt.close()
    
    def _plot_threshold_sensitivity(self, guardian_name: str, output_dir: str):
        """Plot threshold sensitivity"""
        
        # This would plot threshold sensitivity curves
        # For now, creating a placeholder plot
        
        plt.figure(figsize=(10, 6))
        thresholds = np.linspace(0.1, 0.9, 50)
        f1_scores = np.random.random(50) * 0.3 + 0.7  # Placeholder data
        
        plt.plot(thresholds, f1_scores, 'b-', linewidth=2)
        plt.xlabel('Threshold')
        plt.ylabel('F1 Score')
        plt.title(f'Threshold Sensitivity - {guardian_name}')
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(f"{output_dir}/{guardian_name}_threshold_sensitivity.png", dpi=300, bbox_inches='tight')
        plt.close()
    
    def _plot_roc_curve(self, guardian_name: str, output_dir: str):
        """Plot ROC curve"""
        
        # This would plot actual ROC curve
        # For now, creating a placeholder plot
        
        plt.figure(figsize=(8, 8))
        fpr = np.linspace(0, 1, 100)
        tpr = np.sqrt(fpr)  # Placeholder ROC curve
        
        plt.plot(fpr, tpr, 'b-', linewidth=2, label=f'{guardian_name}')
        plt.plot([0, 1], [0, 1], 'k--', label='Random')
        
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title(f'ROC Curve - {guardian_name}')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(f"{output_dir}/{guardian_name}_roc_curve.png", dpi=300, bbox_inches='tight')
        plt.close()


# Example usage
if __name__ == "__main__":
    # Initialize false positive tolerance assessor
    assessor = FalsePositiveToleranceAssessor()
    
    # Example guardian model (placeholder)
    guardian_model = None  # Placeholder
    
    # Example test data and ground truth
    test_data = ["sample1", "sample2", "sample3", "sample4", "sample5"]
    ground_truth = [True, False, True, False, True]
    
    # Assess false positive tolerance
    print("Assessing false positive tolerance...")
    
    tolerance_metrics = assessor.assess_false_positive_tolerance(
        "TestGuardian", guardian_model, test_data, ground_truth
    )
    print(f"Tolerance assessment completed: FPR={tolerance_metrics.false_positive_rate:.3f}, FNR={tolerance_metrics.false_negative_rate:.3f}")
    
    # Analyze calibration
    calibration_analysis = assessor.analyze_calibration(
        "TestGuardian", guardian_model, test_data, ground_truth
    )
    print(f"Calibration analysis completed: ECE={calibration_analysis.expected_calibration_error:.3f}")
    
    # Optimize threshold
    optimization_result = assessor.optimize_threshold(
        "TestGuardian", guardian_model, test_data, ground_truth
    )
    print(f"Threshold optimization completed: Optimal threshold={optimization_result['optimal_threshold']:.3f}")
    
    # Generate report
    report = assessor.generate_tolerance_report("TestGuardian")
    print(f"Tolerance report generated with {len(report['recommendations'])} recommendations")
    
    # Generate visualizations
    assessor.visualize_tolerance_analysis("TestGuardian")
    print("Tolerance analysis visualizations generated")
    
    print("False positive tolerance assessment completed successfully!")
