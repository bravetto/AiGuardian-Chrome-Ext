#!/usr/bin/env python3
"""
Inference Timing and Accuracy Validation

This module implements comprehensive validation of inference timing and accuracy
for Guardian models, ensuring they meet performance targets and requirements.
"""

import time
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple, Optional
from dataclasses import dataclass
import logging
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import matplotlib.pyplot as plt
import seaborn as sns
import psutil
import threading
import queue
from concurrent.futures import ThreadPoolExecutor, as_completed
import statistics
import json

logger = logging.getLogger(__name__)

@dataclass
class TimingMetrics:
    """Metrics for timing validation"""
    average_inference_time_ms: float
    median_inference_time_ms: float
    p95_inference_time_ms: float
    p99_inference_time_ms: float
    min_inference_time_ms: float
    max_inference_time_ms: float
    timing_std_ms: float
    timing_variance: float

@dataclass
class AccuracyMetrics:
    """Metrics for accuracy validation"""
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confidence_mean: float
    confidence_std: float
    prediction_consistency: float

@dataclass
class ValidationTargets:
    """Performance targets for validation"""
    accuracy_target: float
    timing_target_ms: float
    confidence_target: float
    consistency_target: float
    throughput_target: float

class TimingAccuracyValidator:
    """
    Comprehensive timing and accuracy validation framework
    """
    
    def __init__(self):
        self.validation_results = {}
        self.performance_history = {}
        self.target_compliance = {}
        
    def validate_inference_timing(self, guardian_name: str, guardian_model: Any,
                                test_data: List[Any], iterations: int = 100) -> TimingMetrics:
        """
        Validate inference timing performance
        """
        logger.info(f"Validating inference timing for {guardian_name}")
        
        timing_results = []
        
        # Warm-up runs
        for _ in range(10):
            for sample in test_data[:5]:  # Use subset for warm-up
                self._run_inference(guardian_model, sample)
        
        # Actual timing measurements
        for iteration in range(iterations):
            iteration_times = []
            
            for sample in test_data:
                start_time = time.perf_counter()
                self._run_inference(guardian_model, sample)
                end_time = time.perf_counter()
                
                inference_time_ms = (end_time - start_time) * 1000
                iteration_times.append(inference_time_ms)
            
            avg_iteration_time = np.mean(iteration_times)
            timing_results.append(avg_iteration_time)
            
            if iteration % 20 == 0:
                logger.info(f"Completed timing iteration {iteration}/{iterations}")
        
        # Calculate timing metrics
        timing_metrics = TimingMetrics(
            average_inference_time_ms=np.mean(timing_results),
            median_inference_time_ms=np.median(timing_results),
            p95_inference_time_ms=np.percentile(timing_results, 95),
            p99_inference_time_ms=np.percentile(timing_results, 99),
            min_inference_time_ms=np.min(timing_results),
            max_inference_time_ms=np.max(timing_results),
            timing_std_ms=np.std(timing_results),
            timing_variance=np.var(timing_results)
        )
        
        self.validation_results[f"{guardian_name}_timing"] = timing_metrics
        return timing_metrics
    
    def validate_accuracy(self, guardian_name: str, guardian_model: Any,
                         test_data: List[Any], test_labels: List[Any]) -> AccuracyMetrics:
        """
        Validate accuracy performance
        """
        logger.info(f"Validating accuracy for {guardian_name}")
        
        predictions = []
        confidences = []
        
        for sample in test_data:
            pred, conf = self._run_inference_with_confidence(guardian_model, sample)
            predictions.append(pred)
            confidences.append(conf)
        
        # Calculate accuracy metrics
        accuracy = accuracy_score(test_labels, predictions)
        precision = precision_score(test_labels, predictions, average='weighted')
        recall = recall_score(test_labels, predictions, average='weighted')
        f1 = f1_score(test_labels, predictions, average='weighted')
        
        # Calculate confidence metrics
        confidence_mean = np.mean(confidences)
        confidence_std = np.std(confidences)
        
        # Calculate prediction consistency
        prediction_consistency = self._calculate_prediction_consistency(predictions, confidences)
        
        accuracy_metrics = AccuracyMetrics(
            accuracy=accuracy,
            precision=precision,
            recall=recall,
            f1_score=f1,
            confidence_mean=confidence_mean,
            confidence_std=confidence_std,
            prediction_consistency=prediction_consistency
        )
        
        self.validation_results[f"{guardian_name}_accuracy"] = accuracy_metrics
        return accuracy_metrics
    
    def validate_throughput(self, guardian_name: str, guardian_model: Any,
                          test_data: List[Any], duration_seconds: int = 60) -> Dict[str, float]:
        """
        Validate throughput performance
        """
        logger.info(f"Validating throughput for {guardian_name}")
        
        start_time = time.time()
        end_time = start_time + duration_seconds
        
        total_predictions = 0
        total_processing_time = 0
        
        while time.time() < end_time:
            batch_start = time.time()
            
            # Process batch of samples
            batch_size = min(10, len(test_data))
            batch_samples = test_data[:batch_size]
            
            for sample in batch_samples:
                self._run_inference(guardian_model, sample)
                total_predictions += 1
            
            batch_end = time.time()
            total_processing_time += (batch_end - batch_start)
        
        # Calculate throughput metrics
        actual_duration = time.time() - start_time
        throughput_per_second = total_predictions / actual_duration
        average_processing_time = total_processing_time / total_predictions if total_predictions > 0 else 0
        
        throughput_metrics = {
            'total_predictions': total_predictions,
            'duration_seconds': actual_duration,
            'throughput_per_second': throughput_per_second,
            'average_processing_time_ms': average_processing_time * 1000,
            'efficiency_score': throughput_per_second / (1 / average_processing_time) if average_processing_time > 0 else 0
        }
        
        self.validation_results[f"{guardian_name}_throughput"] = throughput_metrics
        return throughput_metrics
    
    def validate_concurrent_performance(self, guardian_name: str, guardian_model: Any,
                                      test_data: List[Any], num_threads: int = 4,
                                      requests_per_thread: int = 100) -> Dict[str, Any]:
        """
        Validate performance under concurrent load
        """
        logger.info(f"Validating concurrent performance for {guardian_name}")
        
        results_queue = queue.Queue()
        
        def worker_thread(thread_id: int, samples: List[Any]):
            """Worker thread for concurrent testing"""
            thread_results = {
                'thread_id': thread_id,
                'predictions': 0,
                'total_time': 0,
                'errors': 0,
                'timing_results': []
            }
            
            start_time = time.time()
            
            for sample in samples:
                try:
                    sample_start = time.perf_counter()
                    self._run_inference(guardian_model, sample)
                    sample_end = time.perf_counter()
                    
                    thread_results['predictions'] += 1
                    thread_results['timing_results'].append((sample_end - sample_start) * 1000)
                    
                except Exception as e:
                    logger.error(f"Error in thread {thread_id}: {e}")
                    thread_results['errors'] += 1
            
            thread_results['total_time'] = time.time() - start_time
            results_queue.put(thread_results)
        
        # Create and start threads
        threads = []
        samples_per_thread = len(test_data) // num_threads
        
        for i in range(num_threads):
            start_idx = i * samples_per_thread
            end_idx = start_idx + samples_per_thread if i < num_threads - 1 else len(test_data)
            thread_samples = test_data[start_idx:end_idx]
            
            thread = threading.Thread(target=worker_thread, args=(i, thread_samples))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Collect results
        thread_results = []
        while not results_queue.empty():
            thread_results.append(results_queue.get())
        
        # Calculate concurrent performance metrics
        total_predictions = sum(result['predictions'] for result in thread_results)
        total_errors = sum(result['errors'] for result in thread_results)
        total_time = max(result['total_time'] for result in thread_results)
        
        all_timing_results = []
        for result in thread_results:
            all_timing_results.extend(result['timing_results'])
        
        concurrent_metrics = {
            'num_threads': num_threads,
            'total_predictions': total_predictions,
            'total_errors': total_errors,
            'error_rate': total_errors / total_predictions if total_predictions > 0 else 0,
            'total_time_seconds': total_time,
            'throughput_per_second': total_predictions / total_time if total_time > 0 else 0,
            'average_response_time_ms': np.mean(all_timing_results) if all_timing_results else 0,
            'p95_response_time_ms': np.percentile(all_timing_results, 95) if all_timing_results else 0,
            'thread_efficiency': total_predictions / (num_threads * total_time) if total_time > 0 else 0
        }
        
        self.validation_results[f"{guardian_name}_concurrent"] = concurrent_metrics
        return concurrent_metrics
    
    def validate_memory_usage(self, guardian_name: str, guardian_model: Any,
                            test_data: List[Any]) -> Dict[str, float]:
        """
        Validate memory usage during inference
        """
        logger.info(f"Validating memory usage for {guardian_name}")
        
        # Get baseline memory usage
        process = psutil.Process()
        baseline_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        memory_usage_samples = []
        
        # Monitor memory during inference
        for i, sample in enumerate(test_data):
            current_memory = process.memory_info().rss / 1024 / 1024  # MB
            memory_usage_samples.append(current_memory)
            
            self._run_inference(guardian_model, sample)
            
            if i % 100 == 0:
                logger.info(f"Memory validation progress: {i}/{len(test_data)}")
        
        # Calculate memory metrics
        peak_memory = max(memory_usage_samples)
        average_memory = np.mean(memory_usage_samples)
        memory_increase = peak_memory - baseline_memory
        
        memory_metrics = {
            'baseline_memory_mb': baseline_memory,
            'peak_memory_mb': peak_memory,
            'average_memory_mb': average_memory,
            'memory_increase_mb': memory_increase,
            'memory_efficiency_score': baseline_memory / peak_memory if peak_memory > 0 else 1.0,
            'memory_stability': 1.0 - (np.std(memory_usage_samples) / average_memory) if average_memory > 0 else 1.0
        }
        
        self.validation_results[f"{guardian_name}_memory"] = memory_metrics
        return memory_metrics
    
    def validate_target_compliance(self, guardian_name: str, targets: ValidationTargets) -> Dict[str, bool]:
        """
        Validate compliance with performance targets
        """
        logger.info(f"Validating target compliance for {guardian_name}")
        
        compliance_results = {}
        
        # Check timing compliance
        if f"{guardian_name}_timing" in self.validation_results:
            timing_metrics = self.validation_results[f"{guardian_name}_timing"]
            compliance_results['timing_compliance'] = (
                timing_metrics.average_inference_time_ms <= targets.timing_target_ms
            )
            compliance_results['timing_p95_compliance'] = (
                timing_metrics.p95_inference_time_ms <= targets.timing_target_ms * 1.5
            )
        
        # Check accuracy compliance
        if f"{guardian_name}_accuracy" in self.validation_results:
            accuracy_metrics = self.validation_results[f"{guardian_name}_accuracy"]
            compliance_results['accuracy_compliance'] = (
                accuracy_metrics.accuracy >= targets.accuracy_target
            )
            compliance_results['precision_compliance'] = (
                accuracy_metrics.precision >= targets.accuracy_target
            )
            compliance_results['recall_compliance'] = (
                accuracy_metrics.recall >= targets.accuracy_target
            )
        
        # Check confidence compliance
        if f"{guardian_name}_accuracy" in self.validation_results:
            accuracy_metrics = self.validation_results[f"{guardian_name}_accuracy"]
            compliance_results['confidence_compliance'] = (
                accuracy_metrics.confidence_mean >= targets.confidence_target
            )
        
        # Check consistency compliance
        if f"{guardian_name}_accuracy" in self.validation_results:
            accuracy_metrics = self.validation_results[f"{guardian_name}_accuracy"]
            compliance_results['consistency_compliance'] = (
                accuracy_metrics.prediction_consistency >= targets.consistency_target
            )
        
        # Check throughput compliance
        if f"{guardian_name}_throughput" in self.validation_results:
            throughput_metrics = self.validation_results[f"{guardian_name}_throughput"]
            compliance_results['throughput_compliance'] = (
                throughput_metrics['throughput_per_second'] >= targets.throughput_target
            )
        
        # Calculate overall compliance
        compliance_values = list(compliance_results.values())
        overall_compliance = sum(compliance_values) / len(compliance_values) if compliance_values else 0.0
        
        compliance_results['overall_compliance'] = overall_compliance
        compliance_results['compliance_percentage'] = overall_compliance * 100
        
        self.target_compliance[guardian_name] = compliance_results
        return compliance_results
    
    def run_comprehensive_validation(self, guardian_name: str, guardian_model: Any,
                                    test_data: List[Any], test_labels: List[Any],
                                    targets: ValidationTargets) -> Dict[str, Any]:
        """
        Run comprehensive timing and accuracy validation
        """
        logger.info(f"Running comprehensive validation for {guardian_name}")
        
        validation_results = {
            'guardian_name': guardian_name,
            'validation_timestamp': pd.Timestamp.now().isoformat(),
            'targets': targets.__dict__,
            'results': {}
        }
        
        # Run all validation tests
        try:
            # Timing validation
            timing_metrics = self.validate_inference_timing(guardian_name, guardian_model, test_data)
            validation_results['results']['timing'] = timing_metrics.__dict__
            
            # Accuracy validation
            accuracy_metrics = self.validate_accuracy(guardian_name, guardian_model, test_data, test_labels)
            validation_results['results']['accuracy'] = accuracy_metrics.__dict__
            
            # Throughput validation
            throughput_metrics = self.validate_throughput(guardian_name, guardian_model, test_data)
            validation_results['results']['throughput'] = throughput_metrics
            
            # Concurrent performance validation
            concurrent_metrics = self.validate_concurrent_performance(guardian_name, guardian_model, test_data)
            validation_results['results']['concurrent'] = concurrent_metrics
            
            # Memory usage validation
            memory_metrics = self.validate_memory_usage(guardian_name, guardian_model, test_data)
            validation_results['results']['memory'] = memory_metrics
            
            # Target compliance validation
            compliance_results = self.validate_target_compliance(guardian_name, targets)
            validation_results['results']['compliance'] = compliance_results
            
            # Generate summary
            validation_results['summary'] = self._generate_validation_summary(
                timing_metrics, accuracy_metrics, throughput_metrics, compliance_results
            )
            
        except Exception as e:
            logger.error(f"Error during comprehensive validation: {e}")
            validation_results['error'] = str(e)
        
        return validation_results
    
    def generate_performance_report(self, guardian_name: str) -> Dict[str, Any]:
        """
        Generate comprehensive performance report
        """
        logger.info(f"Generating performance report for {guardian_name}")
        
        report = {
            'guardian_name': guardian_name,
            'performance_summary': {},
            'detailed_metrics': {},
            'target_compliance': {},
            'recommendations': [],
            'timestamp': pd.Timestamp.now().isoformat()
        }
        
        # Collect all validation results for this guardian
        guardian_results = {
            key: result for key, result in self.validation_results.items()
            if key.startswith(guardian_name)
        }
        
        if guardian_results:
            # Generate performance summary
            report['performance_summary'] = self._generate_performance_summary(guardian_results)
            
            # Include detailed metrics
            report['detailed_metrics'] = guardian_results
            
            # Include target compliance
            if guardian_name in self.target_compliance:
                report['target_compliance'] = self.target_compliance[guardian_name]
        
        # Generate recommendations
        report['recommendations'] = self._generate_performance_recommendations(guardian_name)
        
        return report
    
    def visualize_performance_results(self, guardian_name: str, output_dir: str = "performance_plots"):
        """
        Generate visualization plots for performance results
        """
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        logger.info(f"Generating performance visualizations for {guardian_name}")
        
        # Plot timing distribution
        if f"{guardian_name}_timing" in self.validation_results:
            self._plot_timing_distribution(guardian_name, output_dir)
        
        # Plot accuracy metrics
        if f"{guardian_name}_accuracy" in self.validation_results:
            self._plot_accuracy_metrics(guardian_name, output_dir)
        
        # Plot throughput analysis
        if f"{guardian_name}_throughput" in self.validation_results:
            self._plot_throughput_analysis(guardian_name, output_dir)
        
        # Plot target compliance
        if guardian_name in self.target_compliance:
            self._plot_target_compliance(guardian_name, output_dir)
    
    # Helper methods
    def _run_inference(self, model: Any, sample: Any) -> Any:
        """Run inference on a single sample"""
        # This would be implemented based on the actual model interface
        prediction = model.predict(sample) if hasattr(model, 'predict') else None
        return prediction
    
    def _run_inference_with_confidence(self, model: Any, sample: Any) -> Tuple[Any, float]:
        """Run inference with confidence score"""
        prediction = model.predict(sample) if hasattr(model, 'predict') else None
        confidence = model.predict_proba(sample) if hasattr(model, 'predict_proba') else 0.5
        return prediction, confidence
    
    def _calculate_prediction_consistency(self, predictions: List[Any], confidences: List[float]) -> float:
        """Calculate prediction consistency score"""
        
        if not predictions or not confidences:
            return 0.0
        
        # Consistency based on confidence alignment with prediction certainty
        consistency_scores = []
        
        for pred, conf in zip(predictions, confidences):
            # Higher confidence should correlate with more certain predictions
            if pred is not None:
                # Simple consistency metric: confidence should be high for clear predictions
                consistency_score = conf if pred else (1.0 - conf)
                consistency_scores.append(consistency_score)
        
        return np.mean(consistency_scores) if consistency_scores else 0.0
    
    def _generate_validation_summary(self, timing_metrics: TimingMetrics, accuracy_metrics: AccuracyMetrics,
                                   throughput_metrics: Dict[str, float], compliance_results: Dict[str, bool]) -> Dict[str, Any]:
        """Generate validation summary"""
        
        summary = {
            'timing_performance': {
                'average_ms': timing_metrics.average_inference_time_ms,
                'p95_ms': timing_metrics.p95_inference_time_ms,
                'stability': 1.0 - (timing_metrics.timing_std_ms / timing_metrics.average_inference_time_ms) if timing_metrics.average_inference_time_ms > 0 else 0.0
            },
            'accuracy_performance': {
                'accuracy': accuracy_metrics.accuracy,
                'f1_score': accuracy_metrics.f1_score,
                'confidence_mean': accuracy_metrics.confidence_mean,
                'consistency': accuracy_metrics.prediction_consistency
            },
            'throughput_performance': {
                'predictions_per_second': throughput_metrics.get('throughput_per_second', 0),
                'efficiency_score': throughput_metrics.get('efficiency_score', 0)
            },
            'compliance_summary': {
                'overall_compliance': compliance_results.get('overall_compliance', 0.0),
                'compliance_percentage': compliance_results.get('compliance_percentage', 0.0)
            }
        }
        
        return summary
    
    def _generate_performance_summary(self, guardian_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate performance summary from validation results"""
        
        summary = {
            'total_validations': len(guardian_results),
            'validation_types': list(guardian_results.keys()),
            'performance_score': 0.0,
            'recommendations_count': 0
        }
        
        # Calculate overall performance score
        performance_scores = []
        
        for result in guardian_results.values():
            if isinstance(result, TimingMetrics):
                # Timing performance score (lower is better)
                timing_score = max(0, 1.0 - (result.average_inference_time_ms / 1000))  # Normalize to 0-1
                performance_scores.append(timing_score)
            
            elif isinstance(result, AccuracyMetrics):
                # Accuracy performance score
                accuracy_score = result.accuracy
                performance_scores.append(accuracy_score)
            
            elif isinstance(result, dict):
                # Handle other metrics
                if 'throughput_per_second' in result:
                    throughput_score = min(1.0, result['throughput_per_second'] / 100)  # Normalize to 0-1
                    performance_scores.append(throughput_score)
        
        if performance_scores:
            summary['performance_score'] = np.mean(performance_scores)
        
        return summary
    
    def _generate_performance_recommendations(self, guardian_name: str) -> List[str]:
        """Generate performance recommendations"""
        
        recommendations = []
        
        # Analyze timing performance
        if f"{guardian_name}_timing" in self.validation_results:
            timing_metrics = self.validation_results[f"{guardian_name}_timing"]
            
            if timing_metrics.average_inference_time_ms > 100:
                recommendations.append("High inference time detected - consider model optimization")
            
            if timing_metrics.timing_std_ms > timing_metrics.average_inference_time_ms * 0.2:
                recommendations.append("High timing variance detected - investigate performance stability")
        
        # Analyze accuracy performance
        if f"{guardian_name}_accuracy" in self.validation_results:
            accuracy_metrics = self.validation_results[f"{guardian_name}_accuracy"]
            
            if accuracy_metrics.accuracy < 0.9:
                recommendations.append("Low accuracy detected - consider model retraining or calibration")
            
            if accuracy_metrics.confidence_std > 0.2:
                recommendations.append("High confidence variance detected - implement confidence calibration")
        
        # Analyze throughput performance
        if f"{guardian_name}_throughput" in self.validation_results:
            throughput_metrics = self.validation_results[f"{guardian_name}_throughput"]
            
            if throughput_metrics.get('throughput_per_second', 0) < 10:
                recommendations.append("Low throughput detected - consider batch processing optimization")
        
        # Analyze target compliance
        if guardian_name in self.target_compliance:
            compliance = self.target_compliance[guardian_name]
            
            if compliance.get('compliance_percentage', 0) < 80:
                recommendations.append("Low target compliance - review and optimize performance bottlenecks")
        
        return recommendations
    
    def _plot_timing_distribution(self, guardian_name: str, output_dir: str):
        """Plot timing distribution"""
        
        # This would plot actual timing distribution
        # For now, creating a placeholder plot
        
        plt.figure(figsize=(10, 6))
        
        # Generate sample timing data
        timing_data = np.random.normal(50, 10, 1000)  # Placeholder data
        
        plt.hist(timing_data, bins=30, alpha=0.7, edgecolor='black')
        plt.xlabel('Inference Time (ms)')
        plt.ylabel('Frequency')
        plt.title(f'Inference Timing Distribution - {guardian_name}')
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(f"{output_dir}/{guardian_name}_timing_distribution.png", dpi=300, bbox_inches='tight')
        plt.close()
    
    def _plot_accuracy_metrics(self, guardian_name: str, output_dir: str):
        """Plot accuracy metrics"""
        
        plt.figure(figsize=(10, 6))
        
        # Sample accuracy metrics
        metrics = ['Accuracy', 'Precision', 'Recall', 'F1-Score']
        values = [0.95, 0.92, 0.97, 0.94]  # Placeholder values
        
        plt.bar(metrics, values, color=['blue', 'green', 'orange', 'red'])
        plt.xlabel('Metrics')
        plt.ylabel('Score')
        plt.title(f'Accuracy Metrics - {guardian_name}')
        plt.ylim(0, 1)
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(f"{output_dir}/{guardian_name}_accuracy_metrics.png", dpi=300, bbox_inches='tight')
        plt.close()
    
    def _plot_throughput_analysis(self, guardian_name: str, output_dir: str):
        """Plot throughput analysis"""
        
        plt.figure(figsize=(10, 6))
        
        # Sample throughput data over time
        time_points = np.arange(0, 60, 1)
        throughput_data = 20 + 5 * np.sin(time_points * 0.1) + np.random.normal(0, 2, len(time_points))
        
        plt.plot(time_points, throughput_data, 'b-', linewidth=2)
        plt.xlabel('Time (seconds)')
        plt.ylabel('Throughput (predictions/second)')
        plt.title(f'Throughput Analysis - {guardian_name}')
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(f"{output_dir}/{guardian_name}_throughput_analysis.png", dpi=300, bbox_inches='tight')
        plt.close()
    
    def _plot_target_compliance(self, guardian_name: str, output_dir: str):
        """Plot target compliance"""
        
        if guardian_name not in self.target_compliance:
            return
        
        compliance = self.target_compliance[guardian_name]
        
        # Extract compliance metrics (excluding overall metrics)
        compliance_metrics = {k: v for k, v in compliance.items() 
                            if k not in ['overall_compliance', 'compliance_percentage'] and isinstance(v, bool)}
        
        if not compliance_metrics:
            return
        
        plt.figure(figsize=(12, 6))
        
        metrics = list(compliance_metrics.keys())
        values = [1 if v else 0 for v in compliance_metrics.values()]
        colors = ['green' if v else 'red' for v in compliance_metrics.values()]
        
        plt.bar(metrics, values, color=colors)
        plt.xlabel('Compliance Metrics')
        plt.ylabel('Compliance Status')
        plt.title(f'Target Compliance - {guardian_name}')
        plt.ylim(0, 1)
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(f"{output_dir}/{guardian_name}_target_compliance.png", dpi=300, bbox_inches='tight')
        plt.close()


# Example usage
if __name__ == "__main__":
    # Initialize timing and accuracy validator
    validator = TimingAccuracyValidator()
    
    # Example guardian model (placeholder)
    guardian_model = None  # Placeholder
    
    # Example test data and labels
    test_data = ["sample1", "sample2", "sample3", "sample4", "sample5"]
    test_labels = [True, False, True, False, True]
    
    # Define validation targets
    targets = ValidationTargets(
        accuracy_target=0.95,
        timing_target_ms=100.0,
        confidence_target=0.8,
        consistency_target=0.9,
        throughput_target=10.0
    )
    
    # Run comprehensive validation
    print("Running comprehensive timing and accuracy validation...")
    
    validation_results = validator.run_comprehensive_validation(
        "TestGuardian", guardian_model, test_data, test_labels, targets
    )
    
    print(f"Comprehensive validation completed")
    print(f"Overall compliance: {validation_results['summary']['compliance_summary']['compliance_percentage']:.1f}%")
    
    # Generate performance report
    report = validator.generate_performance_report("TestGuardian")
    print(f"Performance report generated with {len(report['recommendations'])} recommendations")
    
    # Generate visualizations
    validator.visualize_performance_results("TestGuardian")
    print("Performance visualizations generated")
    
    print("Timing and accuracy validation completed successfully!")
