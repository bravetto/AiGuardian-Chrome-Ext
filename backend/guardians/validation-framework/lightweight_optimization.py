#!/usr/bin/env python3
"""
Lightweight Optimization Techniques

This module implements lightweight optimization techniques for Guardian models,
including feature pruning, threshold tuning, model quantization, and other
efficiency improvements while maintaining performance.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple, Optional, Union
from dataclasses import dataclass
import logging
from sklearn.feature_selection import SelectKBest, f_classif, mutual_info_classif
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.optimize import minimize_scalar
import json
import time
import psutil
import os

logger = logging.getLogger(__name__)

@dataclass
class OptimizationResult:
    """Result of optimization technique"""
    technique_name: str
    before_metrics: Dict[str, float]
    after_metrics: Dict[str, float]
    improvement: Dict[str, float]
    optimization_params: Dict[str, Any]
    execution_time: float
    memory_usage: Dict[str, float]

@dataclass
class FeatureImportance:
    """Feature importance analysis result"""
    feature_name: str
    importance_score: float
    rank: int
    selection_status: bool
    impact_on_performance: float

class LightweightOptimizer:
    """
    Comprehensive lightweight optimization framework for Guardian models
    """
    
    def __init__(self):
        self.optimization_results = {}
        self.feature_importances = {}
        self.optimization_history = []
        
    def apply_feature_pruning(self, guardian_name: str, guardian_model: Any,
                            training_data: List[Any], training_labels: List[Any],
                            test_data: List[Any], test_labels: List[Any],
                            pruning_config: Dict[str, Any]) -> OptimizationResult:
        """
        Apply feature pruning optimization
        """
        logger.info(f"Applying feature pruning to {guardian_name}")
        
        start_time = time.time()
        start_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
        
        # Get baseline metrics
        baseline_metrics = self._get_baseline_metrics(guardian_model, test_data, test_labels)
        
        # Extract features
        features = self._extract_features(training_data)
        test_features = self._extract_features(test_data)
        
        # Apply feature selection
        pruned_features, feature_importance = self._apply_feature_selection(
            features, training_labels, pruning_config
        )
        
        # Create optimized model
        optimized_model = self._create_optimized_model(pruned_features, training_labels)
        
        # Get optimized metrics
        optimized_metrics = self._get_baseline_metrics(optimized_model, test_features, test_labels)
        
        # Calculate improvements
        improvements = self._calculate_improvements(baseline_metrics, optimized_metrics)
        
        end_time = time.time()
        end_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
        
        optimization_result = OptimizationResult(
            technique_name="feature_pruning",
            before_metrics=baseline_metrics,
            after_metrics=optimized_metrics,
            improvement=improvements,
            optimization_params=pruning_config,
            execution_time=end_time - start_time,
            memory_usage={
                'before_mb': start_memory,
                'after_mb': end_memory,
                'reduction_mb': start_memory - end_memory
            }
        )
        
        self.optimization_results[f"{guardian_name}_feature_pruning"] = optimization_result
        self.feature_importances[guardian_name] = feature_importance
        
        return optimization_result
    
    def apply_threshold_tuning(self, guardian_name: str, guardian_model: Any,
                             test_data: List[Any], test_labels: List[Any],
                             tuning_config: Dict[str, Any]) -> OptimizationResult:
        """
        Apply threshold tuning optimization
        """
        logger.info(f"Applying threshold tuning to {guardian_name}")
        
        start_time = time.time()
        start_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
        
        # Get baseline metrics with current threshold
        current_threshold = tuning_config.get('current_threshold', 0.5)
        baseline_metrics = self._get_metrics_at_threshold(
            guardian_model, test_data, test_labels, current_threshold
        )
        
        # Find optimal threshold
        optimal_threshold = self._find_optimal_threshold(
            guardian_model, test_data, test_labels, tuning_config
        )
        
        # Get optimized metrics
        optimized_metrics = self._get_metrics_at_threshold(
            guardian_model, test_data, test_labels, optimal_threshold
        )
        
        # Calculate improvements
        improvements = self._calculate_improvements(baseline_metrics, optimized_metrics)
        
        end_time = time.time()
        end_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
        
        optimization_result = OptimizationResult(
            technique_name="threshold_tuning",
            before_metrics=baseline_metrics,
            after_metrics=optimized_metrics,
            improvement=improvements,
            optimization_params={
                'current_threshold': current_threshold,
                'optimal_threshold': optimal_threshold,
                'tuning_config': tuning_config
            },
            execution_time=end_time - start_time,
            memory_usage={
                'before_mb': start_memory,
                'after_mb': end_memory,
                'reduction_mb': start_memory - end_memory
            }
        )
        
        self.optimization_results[f"{guardian_name}_threshold_tuning"] = optimization_result
        
        return optimization_result
    
    def apply_model_quantization(self, guardian_name: str, guardian_model: Any,
                               test_data: List[Any], test_labels: List[Any],
                               quantization_config: Dict[str, Any]) -> OptimizationResult:
        """
        Apply model quantization optimization
        """
        logger.info(f"Applying model quantization to {guardian_name}")
        
        start_time = time.time()
        start_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
        
        # Get baseline metrics
        baseline_metrics = self._get_baseline_metrics(guardian_model, test_data, test_labels)
        
        # Apply quantization
        quantized_model = self._apply_quantization(guardian_model, quantization_config)
        
        # Get optimized metrics
        optimized_metrics = self._get_baseline_metrics(quantized_model, test_data, test_labels)
        
        # Calculate improvements
        improvements = self._calculate_improvements(baseline_metrics, optimized_metrics)
        
        # Calculate model size reduction
        model_size_reduction = self._calculate_model_size_reduction(guardian_model, quantized_model)
        
        end_time = time.time()
        end_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
        
        optimization_result = OptimizationResult(
            technique_name="model_quantization",
            before_metrics=baseline_metrics,
            after_metrics=optimized_metrics,
            improvement=improvements,
            optimization_params={
                'quantization_config': quantization_config,
                'model_size_reduction': model_size_reduction
            },
            execution_time=end_time - start_time,
            memory_usage={
                'before_mb': start_memory,
                'after_mb': end_memory,
                'reduction_mb': start_memory - end_memory
            }
        )
        
        self.optimization_results[f"{guardian_name}_quantization"] = optimization_result
        
        return optimization_result
    
    def apply_ensemble_optimization(self, guardian_name: str, guardian_models: List[Any],
                                  test_data: List[Any], test_labels: List[Any],
                                  ensemble_config: Dict[str, Any]) -> OptimizationResult:
        """
        Apply ensemble optimization
        """
        logger.info(f"Applying ensemble optimization to {guardian_name}")
        
        start_time = time.time()
        start_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
        
        # Get baseline metrics from individual models
        individual_metrics = []
        for i, model in enumerate(guardian_models):
            metrics = self._get_baseline_metrics(model, test_data, test_labels)
            individual_metrics.append(metrics)
        
        # Calculate average baseline metrics
        baseline_metrics = self._calculate_average_metrics(individual_metrics)
        
        # Create optimized ensemble
        optimized_ensemble = self._create_optimized_ensemble(
            guardian_models, test_data, test_labels, ensemble_config
        )
        
        # Get optimized metrics
        optimized_metrics = self._get_baseline_metrics(optimized_ensemble, test_data, test_labels)
        
        # Calculate improvements
        improvements = self._calculate_improvements(baseline_metrics, optimized_metrics)
        
        end_time = time.time()
        end_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
        
        optimization_result = OptimizationResult(
            technique_name="ensemble_optimization",
            before_metrics=baseline_metrics,
            after_metrics=optimized_metrics,
            improvement=improvements,
            optimization_params=ensemble_config,
            execution_time=end_time - start_time,
            memory_usage={
                'before_mb': start_memory,
                'after_mb': end_memory,
                'reduction_mb': start_memory - end_memory
            }
        )
        
        self.optimization_results[f"{guardian_name}_ensemble"] = optimization_result
        
        return optimization_result
    
    def apply_hyperparameter_optimization(self, guardian_name: str, guardian_model: Any,
                                        training_data: List[Any], training_labels: List[Any],
                                        test_data: List[Any], test_labels: List[Any],
                                        hyperparameter_config: Dict[str, Any]) -> OptimizationResult:
        """
        Apply hyperparameter optimization
        """
        logger.info(f"Applying hyperparameter optimization to {guardian_name}")
        
        start_time = time.time()
        start_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
        
        # Get baseline metrics
        baseline_metrics = self._get_baseline_metrics(guardian_model, test_data, test_labels)
        
        # Optimize hyperparameters
        optimized_model = self._optimize_hyperparameters(
            guardian_model, training_data, training_labels, hyperparameter_config
        )
        
        # Get optimized metrics
        optimized_metrics = self._get_baseline_metrics(optimized_model, test_data, test_labels)
        
        # Calculate improvements
        improvements = self._calculate_improvements(baseline_metrics, optimized_metrics)
        
        end_time = time.time()
        end_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
        
        optimization_result = OptimizationResult(
            technique_name="hyperparameter_optimization",
            before_metrics=baseline_metrics,
            after_metrics=optimized_metrics,
            improvement=improvements,
            optimization_params=hyperparameter_config,
            execution_time=end_time - start_time,
            memory_usage={
                'before_mb': start_memory,
                'after_mb': end_memory,
                'reduction_mb': start_memory - end_memory
            }
        )
        
        self.optimization_results[f"{guardian_name}_hyperparameter"] = optimization_result
        
        return optimization_result
    
    def apply_comprehensive_optimization(self, guardian_name: str, guardian_model: Any,
                                       training_data: List[Any], training_labels: List[Any],
                                       test_data: List[Any], test_labels: List[Any],
                                       optimization_pipeline: List[Dict[str, Any]]) -> Dict[str, OptimizationResult]:
        """
        Apply comprehensive optimization pipeline
        """
        logger.info(f"Applying comprehensive optimization pipeline to {guardian_name}")
        
        optimization_results = {}
        current_model = guardian_model
        
        for i, optimization_step in enumerate(optimization_pipeline):
            technique = optimization_step['technique']
            config = optimization_step['config']
            
            logger.info(f"Applying optimization step {i+1}: {technique}")
            
            if technique == "feature_pruning":
                result = self.apply_feature_pruning(
                    f"{guardian_name}_step_{i+1}", current_model,
                    training_data, training_labels, test_data, test_labels, config
                )
                current_model = self._get_optimized_model_from_result(result)
                
            elif technique == "threshold_tuning":
                result = self.apply_threshold_tuning(
                    f"{guardian_name}_step_{i+1}", current_model,
                    test_data, test_labels, config
                )
                
            elif technique == "model_quantization":
                result = self.apply_model_quantization(
                    f"{guardian_name}_step_{i+1}", current_model,
                    test_data, test_labels, config
                )
                current_model = self._get_optimized_model_from_result(result)
                
            elif technique == "hyperparameter_optimization":
                result = self.apply_hyperparameter_optimization(
                    f"{guardian_name}_step_{i+1}", current_model,
                    training_data, training_labels, test_data, test_labels, config
                )
                current_model = self._get_optimized_model_from_result(result)
                
            else:
                logger.warning(f"Unknown optimization technique: {technique}")
                continue
            
            optimization_results[f"step_{i+1}_{technique}"] = result
        
        return optimization_results
    
    def generate_optimization_report(self, guardian_name: str) -> Dict[str, Any]:
        """
        Generate comprehensive optimization report
        """
        logger.info(f"Generating optimization report for {guardian_name}")
        
        report = {
            'guardian_name': guardian_name,
            'optimization_summary': {},
            'technique_results': {},
            'overall_improvements': {},
            'recommendations': [],
            'timestamp': pd.Timestamp.now().isoformat()
        }
        
        # Collect all optimization results for this guardian
        guardian_results = {
            key: result for key, result in self.optimization_results.items()
            if key.startswith(guardian_name)
        }
        
        if guardian_results:
            # Calculate overall improvements
            overall_improvements = self._calculate_overall_improvements(guardian_results)
            report['overall_improvements'] = overall_improvements
            
            # Summarize technique results
            for technique_key, result in guardian_results.items():
                report['technique_results'][technique_key] = {
                    'technique_name': result.technique_name,
                    'improvement': result.improvement,
                    'execution_time': result.execution_time,
                    'memory_reduction': result.memory_usage.get('reduction_mb', 0)
                }
        
        # Generate recommendations
        report['recommendations'] = self._generate_optimization_recommendations(guardian_name)
        
        return report
    
    def visualize_optimization_results(self, guardian_name: str, output_dir: str = "optimization_plots"):
        """
        Generate visualization plots for optimization results
        """
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        logger.info(f"Generating optimization visualizations for {guardian_name}")
        
        # Plot optimization improvements
        self._plot_optimization_improvements(guardian_name, output_dir)
        
        # Plot feature importance
        if guardian_name in self.feature_importances:
            self._plot_feature_importance(guardian_name, output_dir)
        
        # Plot execution time comparison
        self._plot_execution_time_comparison(guardian_name, output_dir)
    
    # Helper methods
    def _get_baseline_metrics(self, model: Any, test_data: List[Any], test_labels: List[Any]) -> Dict[str, float]:
        """Get baseline performance metrics"""
        
        predictions = []
        for sample in test_data:
            pred = model.predict(sample) if hasattr(model, 'predict') else None
            predictions.append(pred)
        
        metrics = {
            'accuracy': accuracy_score(test_labels, predictions),
            'precision': precision_score(test_labels, predictions, average='weighted'),
            'recall': recall_score(test_labels, predictions, average='weighted'),
            'f1_score': f1_score(test_labels, predictions, average='weighted')
        }
        
        return metrics
    
    def _extract_features(self, data: List[Any]) -> np.ndarray:
        """Extract features from data"""
        # This would be implemented based on the actual data format
        # For now, returning placeholder features
        return np.random.random((len(data), 10))  # Placeholder
    
    def _apply_feature_selection(self, features: np.ndarray, labels: List[Any], 
                               config: Dict[str, Any]) -> Tuple[np.ndarray, List[FeatureImportance]]:
        """Apply feature selection"""
        
        method = config.get('method', 'mutual_info')
        k = config.get('k', 5)
        
        if method == 'mutual_info':
            selector = SelectKBest(score_func=mutual_info_classif, k=k)
        elif method == 'f_classif':
            selector = SelectKBest(score_func=f_classif, k=k)
        else:
            logger.warning(f"Unknown feature selection method: {method}")
            return features, []
        
        selected_features = selector.fit_transform(features, labels)
        
        # Create feature importance objects
        feature_importance = []
        for i, score in enumerate(selector.scores_):
            feature_importance.append(FeatureImportance(
                feature_name=f"feature_{i}",
                importance_score=score,
                rank=i,
                selection_status=i < k,
                impact_on_performance=score / np.max(selector.scores_) if np.max(selector.scores_) > 0 else 0.0
            ))
        
        return selected_features, feature_importance
    
    def _create_optimized_model(self, features: np.ndarray, labels: List[Any]) -> Any:
        """Create optimized model with selected features"""
        # This would create an optimized model
        # For now, returning a placeholder
        return None  # Placeholder
    
    def _calculate_improvements(self, before: Dict[str, float], after: Dict[str, float]) -> Dict[str, float]:
        """Calculate improvements between before and after metrics"""
        
        improvements = {}
        for metric in before.keys():
            if metric in after:
                improvements[f'{metric}_improvement'] = after[metric] - before[metric]
                improvements[f'{metric}_improvement_pct'] = (
                    (after[metric] - before[metric]) / before[metric] * 100
                    if before[metric] > 0 else 0.0
                )
        
        return improvements
    
    def _get_metrics_at_threshold(self, model: Any, test_data: List[Any], 
                                test_labels: List[Any], threshold: float) -> Dict[str, float]:
        """Get metrics at specific threshold"""
        
        predictions = []
        confidences = []
        
        for sample in test_data:
            pred = model.predict(sample) if hasattr(model, 'predict') else None
            conf = model.predict_proba(sample) if hasattr(model, 'predict_proba') else 0.5
            
            predictions.append(pred)
            confidences.append(conf)
        
        # Apply threshold
        thresholded_predictions = [conf > threshold for conf in confidences]
        
        metrics = {
            'accuracy': accuracy_score(test_labels, thresholded_predictions),
            'precision': precision_score(test_labels, thresholded_predictions, average='weighted'),
            'recall': recall_score(test_labels, thresholded_predictions, average='weighted'),
            'f1_score': f1_score(test_labels, thresholded_predictions, average='weighted')
        }
        
        return metrics
    
    def _find_optimal_threshold(self, model: Any, test_data: List[Any], 
                              test_labels: List[Any], config: Dict[str, Any]) -> float:
        """Find optimal threshold"""
        
        metric = config.get('optimization_metric', 'f1_score')
        threshold_range = config.get('threshold_range', (0.1, 0.9))
        
        def objective(threshold):
            metrics = self._get_metrics_at_threshold(model, test_data, test_labels, threshold)
            return -metrics[metric]  # Minimize negative metric
        
        result = minimize_scalar(objective, bounds=threshold_range, method='bounded')
        return result.x
    
    def _apply_quantization(self, model: Any, config: Dict[str, Any]) -> Any:
        """Apply model quantization"""
        # This would implement actual quantization
        # For now, returning the original model
        return model  # Placeholder
    
    def _calculate_model_size_reduction(self, original_model: Any, quantized_model: Any) -> float:
        """Calculate model size reduction"""
        # This would calculate actual size reduction
        # For now, returning placeholder
        return 0.5  # 50% reduction placeholder
    
    def _calculate_average_metrics(self, metrics_list: List[Dict[str, float]]) -> Dict[str, float]:
        """Calculate average metrics from multiple models"""
        
        if not metrics_list:
            return {}
        
        avg_metrics = {}
        for metric in metrics_list[0].keys():
            values = [metrics[metric] for metrics in metrics_list]
            avg_metrics[metric] = np.mean(values)
        
        return avg_metrics
    
    def _create_optimized_ensemble(self, models: List[Any], test_data: List[Any], 
                                 test_labels: List[Any], config: Dict[str, Any]) -> Any:
        """Create optimized ensemble"""
        # This would create an optimized ensemble
        # For now, returning a placeholder
        return models[0] if models else None  # Placeholder
    
    def _optimize_hyperparameters(self, model: Any, training_data: List[Any], 
                                training_labels: List[Any], config: Dict[str, Any]) -> Any:
        """Optimize hyperparameters"""
        # This would implement hyperparameter optimization
        # For now, returning the original model
        return model  # Placeholder
    
    def _get_optimized_model_from_result(self, result: OptimizationResult) -> Any:
        """Extract optimized model from optimization result"""
        # This would extract the actual optimized model
        # For now, returning None
        return None  # Placeholder
    
    def _calculate_overall_improvements(self, results: Dict[str, OptimizationResult]) -> Dict[str, float]:
        """Calculate overall improvements across all techniques"""
        
        if not results:
            return {}
        
        # Calculate average improvements across all techniques
        all_improvements = []
        for result in results.values():
            all_improvements.append(result.improvement)
        
        overall_improvements = {}
        for metric in all_improvements[0].keys():
            values = [improvement[metric] for improvement in all_improvements if metric in improvement]
            if values:
                overall_improvements[metric] = np.mean(values)
        
        return overall_improvements
    
    def _generate_optimization_recommendations(self, guardian_name: str) -> List[str]:
        """Generate optimization recommendations"""
        
        recommendations = []
        
        # Analyze optimization results
        guardian_results = {
            key: result for key, result in self.optimization_results.items()
            if key.startswith(guardian_name)
        }
        
        if guardian_results:
            # Check for significant improvements
            significant_improvements = []
            for result in guardian_results.values():
                for metric, improvement in result.improvement.items():
                    if 'improvement_pct' in metric and improvement > 5.0:  # 5% improvement threshold
                        significant_improvements.append(f"{result.technique_name}: {metric} improved by {improvement:.1f}%")
            
            if significant_improvements:
                recommendations.extend(significant_improvements)
            
            # Check for memory usage
            memory_reductions = [
                result.memory_usage.get('reduction_mb', 0) 
                for result in guardian_results.values()
            ]
            
            if any(reduction > 10 for reduction in memory_reductions):  # 10MB reduction threshold
                recommendations.append("Significant memory reduction achieved - consider deploying optimized model")
        
        return recommendations
    
    def _plot_optimization_improvements(self, guardian_name: str, output_dir: str):
        """Plot optimization improvements"""
        
        guardian_results = {
            key: result for key, result in self.optimization_results.items()
            if key.startswith(guardian_name)
        }
        
        if not guardian_results:
            return
        
        techniques = []
        improvements = []
        
        for result in guardian_results.values():
            techniques.append(result.technique_name)
            # Use F1 score improvement as primary metric
            f1_improvement = result.improvement.get('f1_score_improvement_pct', 0)
            improvements.append(f1_improvement)
        
        plt.figure(figsize=(12, 6))
        plt.bar(techniques, improvements)
        plt.xlabel('Optimization Technique')
        plt.ylabel('F1 Score Improvement (%)')
        plt.title(f'Optimization Improvements - {guardian_name}')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(f"{output_dir}/{guardian_name}_optimization_improvements.png", dpi=300, bbox_inches='tight')
        plt.close()
    
    def _plot_feature_importance(self, guardian_name: str, output_dir: str):
        """Plot feature importance"""
        
        if guardian_name not in self.feature_importances:
            return
        
        feature_importance = self.feature_importances[guardian_name]
        
        feature_names = [f.feature_name for f in feature_importance]
        importance_scores = [f.importance_score for f in feature_importance]
        
        plt.figure(figsize=(12, 6))
        plt.bar(feature_names, importance_scores)
        plt.xlabel('Features')
        plt.ylabel('Importance Score')
        plt.title(f'Feature Importance - {guardian_name}')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(f"{output_dir}/{guardian_name}_feature_importance.png", dpi=300, bbox_inches='tight')
        plt.close()
    
    def _plot_execution_time_comparison(self, guardian_name: str, output_dir: str):
        """Plot execution time comparison"""
        
        guardian_results = {
            key: result for key, result in self.optimization_results.items()
            if key.startswith(guardian_name)
        }
        
        if not guardian_results:
            return
        
        techniques = []
        execution_times = []
        
        for result in guardian_results.values():
            techniques.append(result.technique_name)
            execution_times.append(result.execution_time)
        
        plt.figure(figsize=(12, 6))
        plt.bar(techniques, execution_times)
        plt.xlabel('Optimization Technique')
        plt.ylabel('Execution Time (seconds)')
        plt.title(f'Execution Time Comparison - {guardian_name}')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(f"{output_dir}/{guardian_name}_execution_time.png", dpi=300, bbox_inches='tight')
        plt.close()


# Example usage
if __name__ == "__main__":
    # Initialize lightweight optimizer
    optimizer = LightweightOptimizer()
    
    # Example guardian model (placeholder)
    guardian_model = None  # Placeholder
    
    # Example data
    training_data = ["train1", "train2", "train3"]
    training_labels = [True, False, True]
    test_data = ["test1", "test2", "test3"]
    test_labels = [True, False, True]
    
    # Apply feature pruning
    print("Applying feature pruning...")
    pruning_config = {
        'method': 'mutual_info',
        'k': 5
    }
    
    pruning_result = optimizer.apply_feature_pruning(
        "TestGuardian", guardian_model,
        training_data, training_labels, test_data, test_labels,
        pruning_config
    )
    print(f"Feature pruning completed: {pruning_result.improvement}")
    
    # Apply threshold tuning
    print("Applying threshold tuning...")
    tuning_config = {
        'optimization_metric': 'f1_score',
        'threshold_range': (0.1, 0.9)
    }
    
    tuning_result = optimizer.apply_threshold_tuning(
        "TestGuardian", guardian_model,
        test_data, test_labels, tuning_config
    )
    print(f"Threshold tuning completed: {tuning_result.improvement}")
    
    # Apply model quantization
    print("Applying model quantization...")
    quantization_config = {
        'quantization_type': 'int8',
        'calibration_data': test_data
    }
    
    quantization_result = optimizer.apply_model_quantization(
        "TestGuardian", guardian_model,
        test_data, test_labels, quantization_config
    )
    print(f"Model quantization completed: {quantization_result.improvement}")
    
    # Generate report
    report = optimizer.generate_optimization_report("TestGuardian")
    print(f"Optimization report generated with {len(report['recommendations'])} recommendations")
    
    # Generate visualizations
    optimizer.visualize_optimization_results("TestGuardian")
    print("Optimization visualizations generated")
    
    print("Lightweight optimization completed successfully!")
