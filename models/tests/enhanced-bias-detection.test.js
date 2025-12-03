/**
 * Comprehensive Test Suite for Enhanced Bias Detection
 *
 * Tests the complete bias detection pipeline including patterns,
 * contextual scoring, graduated scoring, and ML integration
 */

import { EnhancedBiasDetectionEngine } from '../bias-detection/enhanced-bias-detection.js';

describe('Enhanced Bias Detection Engine', () => {
  let detector;

  beforeEach(() => {
    detector = new EnhancedBiasDetectionEngine({
      minConfidence: 0.3,
      maxPatterns: 15
    });
  });

  describe('Core Detection Pipeline', () => {
    test('should detect high-confidence gender bias', async () => {
      const result = await detector.detectBias(
        "Men are better than women at technical tasks and programming."
      );

      expect(result.success).toBe(true);
      expect(result.bias_score).toBeGreaterThan(0.7);
      expect(result.bias_types).toContain('gender_bias');
      expect(result.confidence).toBeGreaterThan(0.75);
      expect(result.evidence_type).toBe('direct_bias');
    });

    test('should detect racial bias with coded language', async () => {
      const result = await detector.detectBias(
        "The candidate was articulate and well-spoken for someone from an urban background."
      );

      expect(result.success).toBe(true);
      expect(result.bias_score).toBeGreaterThan(0.5);
      expect(result.bias_types).toContain('racial_bias');
      expect(result.bias_types).toContain('coded_bias');
      expect(result.evidence_type).toBe('coded_language');
    });

    test('should detect multiple bias types', async () => {
      const result = await detector.detectBias(
        "Young women from working-class backgrounds shouldn't work in finance."
      );

      expect(result.success).toBe(true);
      expect(result.bias_score).toBeGreaterThan(0.8);
      expect(result.bias_types).toContain('gender_bias');
      expect(result.bias_types).toContain('age_bias');
      expect(result.bias_types).toContain('socioeconomic_bias');
      expect(result.pattern_matches).toBeGreaterThan(2);
    });

    test('should handle neutral text appropriately', async () => {
      const result = await detector.detectBias(
        "The weather is nice today and the project deadline is approaching."
      );

      expect(result.success).toBe(true);
      expect(result.bias_score).toBeLessThan(0.1);
      expect(result.bias_types).toEqual([]);
      expect(result.confidence).toBeLessThan(0.2);
    });
  });

  describe('Contextual Analysis', () => {
    test('should apply higher sensitivity to job postings', async () => {
      const jobPosting = await detector.detectBias(
        "We prefer candidates with traditional family values",
        { source: 'job_posting' }
      );

      const generalText = await detector.detectBias(
        "People with traditional family values are reliable",
        { source: 'general' }
      );

      expect(jobPosting.bias_score).toBeGreaterThan(generalText.bias_score);
      expect(jobPosting.context).toBe('job_posting');
      expect(jobPosting.confidence).toBeGreaterThan(generalText.confidence);
    });

    test('should apply lower sensitivity to academic content', async () => {
      const academic = await detector.detectBias(
        "Research shows women prefer collaborative work environments",
        { source: 'academic_paper' }
      );

      const socialMedia = await detector.detectBias(
        "Research shows women prefer collaborative work environments",
        { source: 'social_media' }
      );

      expect(academic.bias_score).toBeLessThan(socialMedia.bias_score);
      expect(academic.context).toBe('academic_paper');
    });

    test('should detect policy document context', async () => {
      const result = await detector.detectBias(
        "All employees must maintain professional appearance standards",
        { isPolicy: true }
      );

      expect(result.context).toBe('policy_document');
      expect(result.transparency.context_description).toContain('policies');
    });
  });

  describe('Pattern Quality Assessment', () => {
    test('should distinguish direct vs indirect bias', async () => {
      const direct = await detector.detectBias("Men are superior to women");
      const indirect = await detector.detectBias("Women are naturally nurturing");

      expect(direct.evidence_type).toBe('direct_bias');
      expect(indirect.evidence_type).toBe('stereotype');
      expect(direct.bias_score).toBeGreaterThan(indirect.bias_score);
    });

    test('should detect microaggressions', async () => {
      const result = await detector.detectBias(
        "You're so articulate for someone in your position"
      );

      expect(result.evidence_type).toBe('microaggression');
      expect(result.bias_score).toBeGreaterThan(0.3);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('should identify systemic bias patterns', async () => {
      const result = await detector.detectBias(
        "Legacy admissions ensure the best candidates are selected"
      );

      expect(result.evidence_type).toBe('systemic_pattern');
      expect(result.bias_types).toContain('socioeconomic_bias');
    });
  });

  describe('Graduated Scoring', () => {
    test('should apply multiple bias type bonus', async () => {
      const singleBias = await detector.detectBias("Women are bad at math");
      const multipleBias = await detector.detectBias("Young women from poor backgrounds are bad at math");

      expect(multipleBias.bias_score).toBeGreaterThan(singleBias.bias_score);
      expect(multipleBias.pattern_matches).toBeGreaterThan(singleBias.pattern_matches);
    });

    test('should boost scores for discriminatory language', async () => {
      const withDiscrimination = await detector.detectBias("All women should stay home");
      const withoutDiscrimination = await detector.detectBias("Women often stay home");

      expect(withDiscrimination.bias_score).toBeGreaterThan(withoutDiscrimination.bias_score);
    });

    test('should boost scores for generalizations', async () => {
      const withGeneralization = await detector.detectBias("All immigrants are criminals");
      const withoutGeneralization = await detector.detectBias("Some immigrants commit crimes");

      expect(withGeneralization.bias_score).toBeGreaterThan(withoutGeneralization.bias_score);
    });
  });

  describe('Transparency and Explainability', () => {
    test('should provide detailed scoring breakdown', async () => {
      const result = await detector.detectBias("Men are better leaders than women");

      expect(result.transparency.scoring_breakdown).toBeDefined();
      expect(result.transparency.scoring_breakdown.patternScores).toBeDefined();
      expect(result.transparency.scoring_breakdown.finalScore).toBe(result.bias_score);
      expect(result.transparency.scoring_breakdown.confidence).toBeDefined();
    });

    test('should provide pattern analysis', async () => {
      const result = await detector.detectBias("White people are more intelligent");

      expect(result.transparency.pattern_analysis).toBeDefined();
      expect(result.transparency.pattern_analysis.total_patterns).toBeGreaterThan(0);
      expect(result.transparency.pattern_analysis.categories_found).toBeGreaterThan(0);
      expect(result.transparency.pattern_analysis.strongest_patterns).toBeDefined();
    });

    test('should provide reliability assessment', async () => {
      const result = await detector.detectBias("Women belong in the kitchen");

      expect(result.transparency.reliability_assessment).toBeDefined();
      expect(result.transparency.reliability_assessment.overall_reliability).toBeGreaterThan(0);
      expect(result.transparency.reliability_assessment.pattern_consistency).toBeDefined();
      expect(result.transparency.reliability_assessment.context_relevance).toBeDefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty text gracefully', async () => {
      const result = await detector.detectBias("");

      expect(result.success).toBe(true);
      expect(result.bias_score).toBe(0);
      expect(result.bias_types).toEqual([]);
    });

    test('should handle very long text', async () => {
      const longText = "The weather is nice. ".repeat(1000);
      const result = await detector.detectBias(longText);

      expect(result.success).toBe(true);
      expect(result.processing_time).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle special characters and unicode', async () => {
      const result = await detector.detectBias("Women naïve café résumé naïve");

      expect(result.success).toBe(true);
      expect(result.bias_score).toBeLessThan(0.1); // Should not detect bias in unicode text
    });
  });

  describe('Performance Benchmarks', () => {
    test('should process text quickly', async () => {
      const startTime = getPerformanceNow();

      const result = await detector.detectBias(
        "This is a sample text for performance testing with multiple sentences."
      );

      const endTime = getPerformanceNow();
      const processingTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(100); // Should complete within 100ms
      expect(result.processing_time).toBeLessThan(100);
    });

    test('should limit pattern matching for performance', async () => {
      // Create text that would match many patterns
      const repetitiveText = "men are better than women ".repeat(50);
      const result = await detector.detectBias(repetitiveText);

      expect(result.success).toBe(true);
      expect(result.pattern_matches).toBeLessThanOrEqual(15); // Limited by maxPatterns
    });
  });

  describe('Calibration Test Cases', () => {
    const calibrationCases = [
      {
        text: "Job applicants with ethnic-sounding names receive 50% fewer callbacks",
        expectedScore: 0.8,
        expectedTypes: ['racial_bias', 'coded_bias'],
        description: 'Racial bias in hiring (statistical discrimination)'
      },
      {
        text: "The tech company's leadership team is 90% male. CEO said men are better at coding",
        expectedScore: 0.85,
        expectedTypes: ['gender_bias'],
        description: 'Gender bias in tech with explanation'
      },
      {
        text: "Women are more nurturing and better suited for caregiving roles",
        expectedScore: 0.7,
        expectedTypes: ['gender_bias'],
        description: 'Gender stereotype with role assignment'
      },
      {
        text: "Black people are articulate for their background",
        expectedScore: 0.65,
        expectedTypes: ['racial_bias', 'coded_bias'],
        description: 'Racial microaggression (coded language)'
      },
      {
        text: "Poor people are lazy and unmotivated by nature",
        expectedScore: 0.75,
        expectedTypes: ['socioeconomic_bias'],
        description: 'Class-based stereotype'
      },
      {
        text: "Disabled people shouldn't work because they're a burden",
        expectedScore: 0.8,
        expectedTypes: ['ability_bias'],
        description: 'Disability discrimination'
      },
      {
        text: "People over 50 can't learn new technology",
        expectedScore: 0.7,
        expectedTypes: ['age_bias'],
        description: 'Age-based discrimination'
      }
    ];

    calibrationCases.forEach(testCase => {
      test(`calibrates correctly for: ${testCase.description}`, async () => {
        const result = await detector.detectBias(testCase.text);

        expect(result.success).toBe(true);
        expect(result.bias_score).toBeGreaterThan(testCase.expectedScore * 0.8);
        testCase.expectedTypes.forEach(type => {
          expect(result.bias_types).toContain(type);
        });
        expect(result.confidence).toBeGreaterThan(0.6);
      });
    });
  });

  describe('System Status', () => {
    test('should report correct system status', () => {
      const status = detector.getStatus();

      expect(status.initialized).toBe(true);
      expect(status.pattern_categories).toBeGreaterThan(5);
      expect(status.context_sensitivity_enabled).toBe(true);
      expect(status.graduated_scoring_enabled).toBe(true);
      expect(status.last_updated).toBeDefined();
    });
  });
});

// Helper function for performance testing
function getPerformanceNow() {
  if (typeof window !== 'undefined' && window.performance) {
    return window.performance.now();
  }
  // Fallback for Node.js
  const [seconds, nanoseconds] = process.hrtime();
  return seconds * 1000 + nanoseconds / 1000000;
}
