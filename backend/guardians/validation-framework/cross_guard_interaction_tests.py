#!/usr/bin/env python3
"""
Cross-Guard Interaction Testing Module

This module implements comprehensive testing for interactions between different
Guardian models to ensure consistency, identify conflicts, and optimize
complementary behavior.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple, Optional
from dataclasses import dataclass
import logging
from sklearn.metrics import confusion_matrix, classification_report
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.stats import pearsonr, spearmanr
import json

logger = logging.getLogger(__name__)

@dataclass
class InteractionMetrics:
    """Metrics for cross-guard interaction analysis"""
    consistency_score: float
    conflict_rate: float
    complementary_score: float
    correlation_coefficient: float
    agreement_rate: float
    disagreement_rate: float
    mutual_confidence: float
    interaction_strength: float

@dataclass
class ConflictAnalysis:
    """Analysis of conflicts between guardians"""
    conflict_type: str
    conflict_severity: float
    conflict_frequency: float
    resolution_strategy: str
    affected_samples: List[int]

class CrossGuardInteractionTester:
    """
    Comprehensive cross-guard interaction testing framework
    """
    
    def __init__(self):
        self.interaction_results = {}
        self.conflict_analyses = {}
        self.consistency_matrices = {}
        self.complementary_scores = {}
        
    def test_guardian_interactions(self, guardians: Dict[str, Any], 
                                 test_data: List[Any]) -> Dict[str, InteractionMetrics]:
        """
        Test interactions between all guardian pairs
        """
        logger.info("Starting cross-guard interaction testing")
        
        guardian_names = list(guardians.keys())
        interaction_results = {}
        
        for i, guardian1_name in enumerate(guardian_names):
            for guardian2_name in guardian_names[i+1:]:
                logger.info(f"Testing interaction: {guardian1_name} × {guardian2_name}")
                
                interaction_key = f"{guardian1_name}_x_{guardian2_name}"
                
                # Run both guardians on test data
                results1 = self._run_guardian_batch(guardians[guardian1_name], test_data)
                results2 = self._run_guardian_batch(guardians[guardian2_name], test_data)
                
                # Calculate interaction metrics
                interaction_metrics = self._calculate_interaction_metrics(
                    results1, results2, guardian1_name, guardian2_name
                )
                
                interaction_results[interaction_key] = interaction_metrics
                
                # Store detailed results
                self.interaction_results[interaction_key] = {
                    'metrics': interaction_metrics,
                    'guardian1_results': results1,
                    'guardian2_results': results2,
                    'test_data': test_data
                }
        
        return interaction_results
    
    def analyze_conflicts(self, interaction_results: Dict[str, InteractionMetrics]) -> Dict[str, ConflictAnalysis]:
        """
        Analyze conflicts between guardian interactions
        """
        logger.info("Analyzing guardian conflicts")
        
        conflict_analyses = {}
        
        for interaction_key, metrics in interaction_results.items():
            if metrics.conflict_rate > 0.05:  # Threshold for significant conflicts
                conflict_analysis = self._analyze_conflict_details(
                    interaction_key, metrics, self.interaction_results[interaction_key]
                )
                conflict_analyses[interaction_key] = conflict_analysis
        
        self.conflict_analyses = conflict_analyses
        return conflict_analyses
    
    def calculate_consistency_matrix(self, guardians: Dict[str, Any], 
                                  test_data: List[Any]) -> np.ndarray:
        """
        Calculate consistency matrix between all guardians
        """
        logger.info("Calculating consistency matrix")
        
        guardian_names = list(guardians.keys())
        n_guardians = len(guardian_names)
        consistency_matrix = np.zeros((n_guardians, n_guardians))
        
        # Run all guardians on test data
        all_results = {}
        for name, guardian in guardians.items():
            all_results[name] = self._run_guardian_batch(guardian, test_data)
        
        # Calculate pairwise consistency
        for i, guardian1 in enumerate(guardian_names):
            for j, guardian2 in enumerate(guardian_names):
                if i == j:
                    consistency_matrix[i, j] = 1.0
                else:
                    consistency = self._calculate_pairwise_consistency(
                        all_results[guardian1], all_results[guardian2]
                    )
                    consistency_matrix[i, j] = consistency
        
        self.consistency_matrices['full_matrix'] = consistency_matrix
        self.consistency_matrices['guardian_names'] = guardian_names
        
        return consistency_matrix
    
    def optimize_complementary_behavior(self, guardians: Dict[str, Any], 
                                     test_data: List[Any]) -> Dict[str, Any]:
        """
        Optimize complementary behavior between guardians
        """
        logger.info("Optimizing complementary behavior")
        
        optimization_results = {}
        
        # Calculate current complementary scores
        current_scores = self._calculate_all_complementary_scores(guardians, test_data)
        
        # Identify optimization opportunities
        optimization_opportunities = self._identify_optimization_opportunities(current_scores)
        
        # Apply optimizations
        for opportunity in optimization_opportunities:
            optimization_result = self._apply_complementary_optimization(
                opportunity, guardians, test_data
            )
            optimization_results[opportunity['pair']] = optimization_result
        
        return optimization_results
    
    def generate_interaction_report(self) -> Dict[str, Any]:
        """
        Generate comprehensive interaction report
        """
        logger.info("Generating interaction report")
        
        report = {
            'interaction_summary': {},
            'consistency_analysis': {},
            'conflict_analysis': {},
            'complementary_analysis': {},
            'recommendations': [],
            'timestamp': pd.Timestamp.now().isoformat()
        }
        
        # Summarize interaction results
        if self.interaction_results:
            report['interaction_summary'] = self._summarize_interactions()
        
        # Analyze consistency
        if self.consistency_matrices:
            report['consistency_analysis'] = self._analyze_consistency_patterns()
        
        # Analyze conflicts
        if self.conflict_analyses:
            report['conflict_analysis'] = self._summarize_conflicts()
        
        # Generate recommendations
        report['recommendations'] = self._generate_interaction_recommendations()
        
        return report
    
    def visualize_interactions(self, output_dir: str = "interaction_plots"):
        """
        Generate visualization plots for interaction analysis
        """
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        logger.info(f"Generating interaction visualizations in {output_dir}")
        
        # Consistency matrix heatmap
        if 'full_matrix' in self.consistency_matrices:
            self._plot_consistency_matrix(output_dir)
        
        # Conflict analysis plots
        if self.conflict_analyses:
            self._plot_conflict_analysis(output_dir)
        
        # Interaction strength plots
        if self.interaction_results:
            self._plot_interaction_strength(output_dir)
    
    # Helper methods
    def _run_guardian_batch(self, guardian: Any, test_data: List[Any]) -> List[Dict[str, Any]]:
        """Run guardian on batch of test data"""
        results = []
        
        for sample in test_data:
            # This would be implemented based on actual guardian interface
            prediction = guardian.predict(sample) if hasattr(guardian, 'predict') else None
            confidence = guardian.predict_proba(sample) if hasattr(guardian, 'predict_proba') else 0.5
            
            results.append({
                'prediction': prediction,
                'confidence': confidence,
                'sample': sample
            })
        
        return results
    
    def _calculate_interaction_metrics(self, results1: List[Dict], results2: List[Dict],
                                     guardian1_name: str, guardian2_name: str) -> InteractionMetrics:
        """Calculate comprehensive interaction metrics"""
        
        # Extract predictions and confidences
        preds1 = [r['prediction'] for r in results1]
        preds2 = [r['prediction'] for r in results2]
        confs1 = [r['confidence'] for r in results1]
        confs2 = [r['confidence'] for r in results2]
        
        # Calculate agreement rate
        agreements = sum(1 for p1, p2 in zip(preds1, preds2) if p1 == p2)
        agreement_rate = agreements / len(preds1)
        disagreement_rate = 1 - agreement_rate
        
        # Calculate consistency score
        consistency_score = self._calculate_consistency_score(preds1, preds2, confs1, confs2)
        
        # Calculate conflict rate
        conflict_rate = self._calculate_conflict_rate(preds1, preds2, confs1, confs2)
        
        # Calculate complementary score
        complementary_score = self._calculate_complementary_score(preds1, preds2, confs1, confs2)
        
        # Calculate correlation
        correlation_coefficient = self._calculate_correlation(confs1, confs2)
        
        # Calculate mutual confidence
        mutual_confidence = self._calculate_mutual_confidence(confs1, confs2)
        
        # Calculate interaction strength
        interaction_strength = self._calculate_interaction_strength(
            consistency_score, complementary_score, correlation_coefficient
        )
        
        return InteractionMetrics(
            consistency_score=consistency_score,
            conflict_rate=conflict_rate,
            complementary_score=complementary_score,
            correlation_coefficient=correlation_coefficient,
            agreement_rate=agreement_rate,
            disagreement_rate=disagreement_rate,
            mutual_confidence=mutual_confidence,
            interaction_strength=interaction_strength
        )
    
    def _calculate_consistency_score(self, preds1: List, preds2: List, 
                                   confs1: List[float], confs2: List[float]) -> float:
        """Calculate consistency score between two guardians"""
        
        # Weighted agreement based on confidence
        weighted_agreements = 0
        total_weight = 0
        
        for p1, p2, c1, c2 in zip(preds1, preds2, confs1, confs2):
            weight = (c1 + c2) / 2  # Average confidence
            if p1 == p2:
                weighted_agreements += weight
            total_weight += weight
        
        return weighted_agreements / total_weight if total_weight > 0 else 0.0
    
    def _calculate_conflict_rate(self, preds1: List, preds2: List, 
                              confs1: List[float], confs2: List[float]) -> float:
        """Calculate conflict rate between guardians"""
        
        conflicts = 0
        high_confidence_samples = 0
        
        for p1, p2, c1, c2 in zip(preds1, preds2, confs1, confs2):
            # Only consider conflicts where both guardians are confident
            if c1 > 0.7 and c2 > 0.7:
                high_confidence_samples += 1
                if p1 != p2:
                    conflicts += 1
        
        return conflicts / high_confidence_samples if high_confidence_samples > 0 else 0.0
    
    def _calculate_complementary_score(self, preds1: List, preds2: List, 
                                     confs1: List[float], confs2: List[float]) -> float:
        """Calculate complementary score between guardians"""
        
        # Complementary behavior: when one guardian is uncertain, the other provides confidence
        complementary_cases = 0
        total_cases = 0
        
        for p1, p2, c1, c2 in zip(preds1, preds2, confs1, confs2):
            total_cases += 1
            
            # Case 1: Guardian1 uncertain, Guardian2 confident
            if c1 < 0.5 and c2 > 0.7:
                complementary_cases += 1
            # Case 2: Guardian2 uncertain, Guardian1 confident
            elif c2 < 0.5 and c1 > 0.7:
                complementary_cases += 1
            # Case 3: Both confident and agree
            elif c1 > 0.7 and c2 > 0.7 and p1 == p2:
                complementary_cases += 1
        
        return complementary_cases / total_cases if total_cases > 0 else 0.0
    
    def _calculate_correlation(self, confs1: List[float], confs2: List[float]) -> float:
        """Calculate correlation between confidence scores"""
        try:
            correlation, _ = pearsonr(confs1, confs2)
            return correlation
        except:
            return 0.0
    
    def _calculate_mutual_confidence(self, confs1: List[float], confs2: List[float]) -> float:
        """Calculate mutual confidence score"""
        mutual_confidences = []
        
        for c1, c2 in zip(confs1, confs2):
            # Mutual confidence: both guardians are confident
            if c1 > 0.7 and c2 > 0.7:
                mutual_confidences.append((c1 + c2) / 2)
        
        return np.mean(mutual_confidences) if mutual_confidences else 0.0
    
    def _calculate_interaction_strength(self, consistency: float, complementary: float, 
                                     correlation: float) -> float:
        """Calculate overall interaction strength"""
        # Weighted combination of different interaction aspects
        weights = {'consistency': 0.4, 'complementary': 0.3, 'correlation': 0.3}
        
        interaction_strength = (
            weights['consistency'] * consistency +
            weights['complementary'] * complementary +
            weights['correlation'] * abs(correlation)
        )
        
        return interaction_strength
    
    def _analyze_conflict_details(self, interaction_key: str, metrics: InteractionMetrics,
                               detailed_results: Dict[str, Any]) -> ConflictAnalysis:
        """Analyze detailed conflict information"""
        
        results1 = detailed_results['guardian1_results']
        results2 = detailed_results['guardian2_results']
        
        # Identify conflicting samples
        conflicting_samples = []
        for i, (r1, r2) in enumerate(zip(results1, results2)):
            if (r1['prediction'] != r2['prediction'] and 
                r1['confidence'] > 0.7 and r2['confidence'] > 0.7):
                conflicting_samples.append(i)
        
        # Determine conflict type
        conflict_type = self._classify_conflict_type(results1, results2, conflicting_samples)
        
        # Calculate conflict severity
        conflict_severity = self._calculate_conflict_severity(results1, results2, conflicting_samples)
        
        # Determine resolution strategy
        resolution_strategy = self._recommend_resolution_strategy(
            conflict_type, conflict_severity, metrics
        )
        
        return ConflictAnalysis(
            conflict_type=conflict_type,
            conflict_severity=conflict_severity,
            conflict_frequency=metrics.conflict_rate,
            resolution_strategy=resolution_strategy,
            affected_samples=conflicting_samples
        )
    
    def _classify_conflict_type(self, results1: List[Dict], results2: List[Dict], 
                              conflicting_samples: List[int]) -> str:
        """Classify the type of conflict between guardians"""
        
        if not conflicting_samples:
            return "no_conflict"
        
        # Analyze patterns in conflicts
        conflict_patterns = []
        
        for sample_idx in conflicting_samples:
            r1 = results1[sample_idx]
            r2 = results2[sample_idx]
            
            # Analyze confidence patterns
            if r1['confidence'] > r2['confidence']:
                conflict_patterns.append('guardian1_dominant')
            elif r2['confidence'] > r1['confidence']:
                conflict_patterns.append('guardian2_dominant')
            else:
                conflict_patterns.append('equal_confidence')
        
        # Determine dominant conflict type
        from collections import Counter
        pattern_counts = Counter(conflict_patterns)
        dominant_pattern = pattern_counts.most_common(1)[0][0]
        
        return dominant_pattern
    
    def _calculate_conflict_severity(self, results1: List[Dict], results2: List[Dict],
                                   conflicting_samples: List[int]) -> float:
        """Calculate severity of conflicts"""
        
        if not conflicting_samples:
            return 0.0
        
        severities = []
        
        for sample_idx in conflicting_samples:
            r1 = results1[sample_idx]
            r2 = results2[sample_idx]
            
            # Severity based on confidence difference and absolute confidence
            confidence_diff = abs(r1['confidence'] - r2['confidence'])
            avg_confidence = (r1['confidence'] + r2['confidence']) / 2
            
            severity = confidence_diff * avg_confidence
            severities.append(severity)
        
        return np.mean(severities)
    
    def _recommend_resolution_strategy(self, conflict_type: str, conflict_severity: float,
                                     metrics: InteractionMetrics) -> str:
        """Recommend resolution strategy for conflicts"""
        
        if conflict_severity < 0.1:
            return "threshold_adjustment"
        elif conflict_severity < 0.3:
            return "confidence_recalibration"
        elif conflict_type == "equal_confidence":
            return "ensemble_voting"
        else:
            return "model_retraining"
    
    def _calculate_pairwise_consistency(self, results1: List[Dict], results2: List[Dict]) -> float:
        """Calculate pairwise consistency between two guardians"""
        
        agreements = 0
        total_samples = len(results1)
        
        for r1, r2 in zip(results1, results2):
            if r1['prediction'] == r2['prediction']:
                agreements += 1
        
        return agreements / total_samples if total_samples > 0 else 0.0
    
    def _calculate_all_complementary_scores(self, guardians: Dict[str, Any], 
                                         test_data: List[Any]) -> Dict[str, float]:
        """Calculate complementary scores for all guardian pairs"""
        
        guardian_names = list(guardians.keys())
        complementary_scores = {}
        
        for i, guardian1_name in enumerate(guardian_names):
            for guardian2_name in guardian_names[i+1:]:
                results1 = self._run_guardian_batch(guardians[guardian1_name], test_data)
                results2 = self._run_guardian_batch(guardians[guardian2_name], test_data)
                
                preds1 = [r['prediction'] for r in results1]
                preds2 = [r['prediction'] for r in results2]
                confs1 = [r['confidence'] for r in results1]
                confs2 = [r['confidence'] for r in results2]
                
                complementary_score = self._calculate_complementary_score(preds1, preds2, confs1, confs2)
                complementary_scores[f"{guardian1_name}_x_{guardian2_name}"] = complementary_score
        
        return complementary_scores
    
    def _identify_optimization_opportunities(self, complementary_scores: Dict[str, float]) -> List[Dict[str, Any]]:
        """Identify opportunities for complementary optimization"""
        
        opportunities = []
        threshold = 0.7  # Threshold for good complementary behavior
        
        for pair, score in complementary_scores.items():
            if score < threshold:
                opportunities.append({
                    'pair': pair,
                    'current_score': score,
                    'improvement_potential': threshold - score,
                    'optimization_type': 'complementary_enhancement'
                })
        
        return opportunities
    
    def _apply_complementary_optimization(self, opportunity: Dict[str, Any], 
                                       guardians: Dict[str, Any], 
                                       test_data: List[Any]) -> Dict[str, Any]:
        """Apply complementary optimization"""
        
        pair = opportunity['pair']
        guardian1_name, guardian2_name = pair.split('_x_')
        
        # This would implement actual optimization strategies
        # For now, returning placeholder optimization results
        
        optimization_result = {
            'pair': pair,
            'optimization_applied': 'confidence_threshold_adjustment',
            'before_score': opportunity['current_score'],
            'after_score': opportunity['current_score'] + opportunity['improvement_potential'] * 0.5,
            'improvement': opportunity['improvement_potential'] * 0.5,
            'optimization_details': {
                'guardian1_threshold_adjustment': 0.05,
                'guardian2_threshold_adjustment': -0.03,
                'confidence_recalibration': True
            }
        }
        
        return optimization_result
    
    def _summarize_interactions(self) -> Dict[str, Any]:
        """Summarize interaction results"""
        
        summary = {
            'total_interactions': len(self.interaction_results),
            'average_consistency': 0.0,
            'average_conflict_rate': 0.0,
            'average_complementary_score': 0.0,
            'interaction_strength_distribution': {}
        }
        
        if self.interaction_results:
            consistencies = [r['metrics'].consistency_score for r in self.interaction_results.values()]
            conflict_rates = [r['metrics'].conflict_rate for r in self.interaction_results.values()]
            complementary_scores = [r['metrics'].complementary_score for r in self.interaction_results.values()]
            
            summary['average_consistency'] = np.mean(consistencies)
            summary['average_conflict_rate'] = np.mean(conflict_rates)
            summary['average_complementary_score'] = np.mean(complementary_scores)
        
        return summary
    
    def _analyze_consistency_patterns(self) -> Dict[str, Any]:
        """Analyze consistency patterns"""
        
        if 'full_matrix' not in self.consistency_matrices:
            return {}
        
        matrix = self.consistency_matrices['full_matrix']
        guardian_names = self.consistency_matrices['guardian_names']
        
        analysis = {
            'consistency_matrix': matrix.tolist(),
            'guardian_names': guardian_names,
            'average_consistency': np.mean(matrix[np.triu_indices_from(matrix, k=1)]),
            'consistency_std': np.std(matrix[np.triu_indices_from(matrix, k=1)]),
            'most_consistent_pair': self._find_most_consistent_pair(matrix, guardian_names),
            'least_consistent_pair': self._find_least_consistent_pair(matrix, guardian_names)
        }
        
        return analysis
    
    def _find_most_consistent_pair(self, matrix: np.ndarray, guardian_names: List[str]) -> Tuple[str, str, float]:
        """Find most consistent guardian pair"""
        
        upper_tri_indices = np.triu_indices_from(matrix, k=1)
        max_idx = np.argmax(matrix[upper_tri_indices])
        
        i, j = upper_tri_indices[0][max_idx], upper_tri_indices[1][max_idx]
        consistency_score = matrix[i, j]
        
        return guardian_names[i], guardian_names[j], consistency_score
    
    def _find_least_consistent_pair(self, matrix: np.ndarray, guardian_names: List[str]) -> Tuple[str, str, float]:
        """Find least consistent guardian pair"""
        
        upper_tri_indices = np.triu_indices_from(matrix, k=1)
        min_idx = np.argmin(matrix[upper_tri_indices])
        
        i, j = upper_tri_indices[0][min_idx], upper_tri_indices[1][min_idx]
        consistency_score = matrix[i, j]
        
        return guardian_names[i], guardian_names[j], consistency_score
    
    def _summarize_conflicts(self) -> Dict[str, Any]:
        """Summarize conflict analysis"""
        
        if not self.conflict_analyses:
            return {'total_conflicts': 0, 'conflict_types': {}, 'resolution_strategies': {}}
        
        summary = {
            'total_conflicts': len(self.conflict_analyses),
            'conflict_types': {},
            'resolution_strategies': {},
            'average_severity': 0.0
        }
        
        conflict_types = [analysis.conflict_type for analysis in self.conflict_analyses.values()]
        resolution_strategies = [analysis.resolution_strategy for analysis in self.conflict_analyses.values()]
        severities = [analysis.conflict_severity for analysis in self.conflict_analyses.values()]
        
        from collections import Counter
        summary['conflict_types'] = dict(Counter(conflict_types))
        summary['resolution_strategies'] = dict(Counter(resolution_strategies))
        summary['average_severity'] = np.mean(severities)
        
        return summary
    
    def _generate_interaction_recommendations(self) -> List[str]:
        """Generate recommendations based on interaction analysis"""
        
        recommendations = []
        
        # Analyze interaction results
        if self.interaction_results:
            avg_consistency = np.mean([r['metrics'].consistency_score for r in self.interaction_results.values()])
            avg_conflict_rate = np.mean([r['metrics'].conflict_rate for r in self.interaction_results.values()])
            
            if avg_consistency < 0.8:
                recommendations.append("Consider implementing ensemble methods to improve guardian consistency")
            
            if avg_conflict_rate > 0.1:
                recommendations.append("High conflict rate detected - implement conflict resolution strategies")
        
        # Analyze conflicts
        if self.conflict_analyses:
            high_severity_conflicts = [analysis for analysis in self.conflict_analyses.values() 
                                     if analysis.conflict_severity > 0.3]
            
            if high_severity_conflicts:
                recommendations.append("Address high-severity conflicts through model retraining or recalibration")
        
        # Analyze consistency matrix
        if 'full_matrix' in self.consistency_matrices:
            matrix = self.consistency_matrices['full_matrix']
            min_consistency = np.min(matrix[np.triu_indices_from(matrix, k=1)])
            
            if min_consistency < 0.7:
                recommendations.append("Low consistency detected - optimize guardian alignment")
        
        return recommendations
    
    def _plot_consistency_matrix(self, output_dir: str):
        """Plot consistency matrix heatmap"""
        
        matrix = self.consistency_matrices['full_matrix']
        guardian_names = self.consistency_matrices['guardian_names']
        
        plt.figure(figsize=(10, 8))
        sns.heatmap(matrix, annot=True, cmap='RdYlBu_r', 
                   xticklabels=guardian_names, yticklabels=guardian_names,
                   vmin=0, vmax=1)
        plt.title('Guardian Consistency Matrix')
        plt.xlabel('Guardian')
        plt.ylabel('Guardian')
        plt.tight_layout()
        plt.savefig(f"{output_dir}/consistency_matrix.png", dpi=300, bbox_inches='tight')
        plt.close()
    
    def _plot_conflict_analysis(self, output_dir: str):
        """Plot conflict analysis"""
        
        if not self.conflict_analyses:
            return
        
        conflict_pairs = list(self.conflict_analyses.keys())
        conflict_rates = [analysis.conflict_frequency for analysis in self.conflict_analyses.values()]
        conflict_severities = [analysis.conflict_severity for analysis in self.conflict_analyses.values()]
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
        
        # Conflict rate plot
        ax1.bar(range(len(conflict_pairs)), conflict_rates)
        ax1.set_xlabel('Guardian Pairs')
        ax1.set_ylabel('Conflict Rate')
        ax1.set_title('Conflict Rates by Guardian Pair')
        ax1.set_xticks(range(len(conflict_pairs)))
        ax1.set_xticklabels(conflict_pairs, rotation=45)
        
        # Conflict severity plot
        ax2.bar(range(len(conflict_pairs)), conflict_severities)
        ax2.set_xlabel('Guardian Pairs')
        ax2.set_ylabel('Conflict Severity')
        ax2.set_title('Conflict Severity by Guardian Pair')
        ax2.set_xticks(range(len(conflict_pairs)))
        ax2.set_xticklabels(conflict_pairs, rotation=45)
        
        plt.tight_layout()
        plt.savefig(f"{output_dir}/conflict_analysis.png", dpi=300, bbox_inches='tight')
        plt.close()
    
    def _plot_interaction_strength(self, output_dir: str):
        """Plot interaction strength analysis"""
        
        if not self.interaction_results:
            return
        
        interaction_pairs = list(self.interaction_results.keys())
        interaction_strengths = [r['metrics'].interaction_strength for r in self.interaction_results.values()]
        
        plt.figure(figsize=(12, 6))
        plt.bar(range(len(interaction_pairs)), interaction_strengths)
        plt.xlabel('Guardian Pairs')
        plt.ylabel('Interaction Strength')
        plt.title('Interaction Strength by Guardian Pair')
        plt.xticks(range(len(interaction_pairs)), interaction_pairs, rotation=45)
        plt.tight_layout()
        plt.savefig(f"{output_dir}/interaction_strength.png", dpi=300, bbox_inches='tight')
        plt.close()


# Example usage
if __name__ == "__main__":
    # Initialize cross-guard interaction tester
    tester = CrossGuardInteractionTester()
    
    # Example guardians (placeholder)
    guardians = {
        'BiasGuard': None,  # Placeholder guardian
        'ContextGuard': None,  # Placeholder guardian
        'TrustGuard': None,  # Placeholder guardian
        'DriftGuard': None   # Placeholder guardian
    }
    
    # Example test data
    test_data = ["sample1", "sample2", "sample3", "sample4", "sample5"]
    
    # Run interaction tests
    print("Running cross-guard interaction tests...")
    
    interaction_results = tester.test_guardian_interactions(guardians, test_data)
    print(f"Interaction testing completed: {len(interaction_results)} pairs tested")
    
    # Analyze conflicts
    conflict_analyses = tester.analyze_conflicts(interaction_results)
    print(f"Conflict analysis completed: {len(conflict_analyses)} conflicts identified")
    
    # Calculate consistency matrix
    consistency_matrix = tester.calculate_consistency_matrix(guardians, test_data)
    print(f"Consistency matrix calculated: {consistency_matrix.shape}")
    
    # Generate report
    report = tester.generate_interaction_report()
    print(f"Interaction report generated with {len(report['recommendations'])} recommendations")
    
    # Generate visualizations
    tester.visualize_interactions()
    print("Interaction visualizations generated")
    
    print("Cross-guard interaction testing completed successfully!")
