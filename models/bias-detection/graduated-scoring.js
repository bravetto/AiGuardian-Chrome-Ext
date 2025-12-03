/**
 * Graduated Scoring for Bias Detection
 *
 * Implements intelligent scoring based on pattern intensity,
 * context factors, and evidence quality
 */

// Import constants (with fallback for service worker context)
import { BIAS_DETECTION_CONSTANTS } from './constants.js';
const constants = BIAS_DETECTION_CONSTANTS || (typeof self !== 'undefined' && self.AiGuardianBiasDetection && self.AiGuardianBiasDetection.constants);

export class GraduatedScorer {
  constructor() {
    this.patternWeights = constants ? constants.PATTERN_WEIGHTS : {
      // Direct evidence (highest confidence)
      direct_bias: 0.4,       // "men are better than women at programming"
      explicit_comparison: 0.35, // "men vs women in tech"

      // Stereotype evidence (medium confidence)
      stereotype: 0.25,       // "women are naturally nurturing"
      role_assignment: 0.22,  // "women belong in the kitchen"
      trait_assignment: 0.20, // "emotional women, logical men"

      // Assumption evidence (lower confidence)
      assumption: 0.15,       // "girls like pink"
      preference_generalization: 0.12, // "women prefer shopping"

      // Coded/subtle evidence (lowest confidence)
      coded: 0.1,            // "urban youth culture"
      microaggression: 0.08,  // "articulate for a black person"
      systemic_hint: 0.06    // "legacy admissions"
    };

    this.contextBoosts = constants ? constants.CONTEXT_BOOSTS : {
      // Multiplicative bonuses for contextual factors
      multiple_biases: 1.3,      // Bonus when multiple bias types detected
      discriminatory_language: 1.25, // Words like "should/must + all/every"
      generalization: 1.2,       // "all/every/most + protected group"
      power_dynamic: 1.15,       // Authority figure making statement
      systemic_context: 1.1      // Policy, hiring, or institutional context
    };

    this.confidenceMultipliers = constants ? constants.CONFIDENCE_MULTIPLIERS : {
      // Pattern quality multipliers
      high: 1.0,     // Strong, clear pattern match
      medium: 0.8,   // Moderate pattern strength
      low: 0.6,     // Weak pattern match
      uncertain: 0.4 // Very weak or ambiguous match
    };
  }

  /**
   * Calculate graduated score based on pattern analysis
   */
  calculateGraduatedScore(patterns, text, biasTypes) {
    if (!patterns || patterns.length === 0) return 0.0;

    let totalScore = 0;
    let weightedPatterns = 0;

    // Score each pattern based on its type and quality
    patterns.forEach(pattern => {
      const patternType = this.classifyPatternType(pattern, text);
      const patternQuality = this.assessPatternQuality(pattern, text);
      const baseWeight = this.patternWeights[patternType] || 0.05;
      const qualityMultiplier = this.confidenceMultipliers[patternQuality] || 0.6;

      const patternScore = baseWeight * qualityMultiplier;
      totalScore += patternScore;
      weightedPatterns++;
    });

    // Apply context boosts
    let boostMultiplier = 1.0;

    // Multiple bias types boost
    if (biasTypes && biasTypes.length > 1) {
      boostMultiplier *= this.contextBoosts.multiple_biases;
    }

    // Discriminatory language boost
    if (/\b(should|must|always|never)\b.*\b(all|every)\b/i.test(text)) {
      boostMultiplier *= this.contextBoosts.discriminatory_language;
    }

    // Generalization boost
    if (/\b(all|every|most|many)\b.*\b(people|women|men|black|white)\b/i.test(text)) {
      boostMultiplier *= this.contextBoosts.generalization;
    }

    // Systemic context boost (policies, hiring, etc.)
    if (/\b(policy|policies|hiring|employment)\b/i.test(text)) {
      boostMultiplier *= this.contextBoosts.systemic_context;
    }

    // Power dynamic boost (authority figures)
    if (/\b(CEO|manager|supervisor|boss|leader|executive|official)\b/i.test(text)) {
      boostMultiplier *= this.contextBoosts.power_dynamic;
    }

    totalScore *= boostMultiplier;

    // Apply logarithmic scaling for very high scores to prevent over-detection
    if (totalScore > 0.8) {
      totalScore = 0.8 + Math.log(totalScore - 0.7) * 0.5;
    }

    return Math.min(1.0, Math.max(0.0, totalScore));
  }

  /**
   * Classify pattern type based on content analysis
   */
  classifyPatternType(pattern, text) {
    const matchedText = (pattern.matched_text || pattern.toString() || '').toLowerCase();

    // Direct bias patterns
    if (/\b(better|worse|more|less|superior|inferior)\b.*\b(than|compared\s+to|vs\.?)\b/i.test(matchedText)) {
      return 'direct_bias';
    }

    if (/\b(should|must|always|never)\b.*\b(be|become|do)\b/i.test(matchedText)) {
      return 'explicit_comparison';
    }

    // Stereotype patterns
    if (/\b(are|is|tend|typically|usually)\b.*\b(all|most|many|generally)\b/i.test(matchedText)) {
      return 'stereotype';
    }

    if (/\b(belong|should\s+be)\s+in\s+the\s+(kitchen|home|nursing)\b/i.test(matchedText)) {
      return 'role_assignment';
    }

    if (/\b(emotional|nurturing|weak|aggressive|logical|strong)\b.*\b(women|men|girls|boys)\b/i.test(matchedText)) {
      return 'trait_assignment';
    }

    // Assumption patterns
    if (/\b(like|love|prefer|enjoy)\b.*\b(pink|shopping|gossip|sports|cars)\b/i.test(matchedText)) {
      return 'preference_generalization';
    }

    if (/\b(are|is)\b.*\b(naturally|by\s+nature|instinctively)\b/i.test(matchedText)) {
      return 'assumption';
    }

    // Coded/subtle patterns
    if (/\b(for\s+(a|an)\s+)?(black|brown|person|woman)\b/i.test(matchedText)) {
      return 'coded';
    }

    if (/\b(articulate|well-spoken|professional|clean|presentable)\b/i.test(matchedText)) {
      return 'microaggression';
    }

    if (/\b(legacy|connections|network|old\s+boys|donor)\b/i.test(matchedText)) {
      return 'systemic_hint';
    }

    return 'coded'; // Default fallback
  }

  /**
   * Assess pattern quality based on context and strength
   */
  assessPatternQuality(pattern, text) {
    const matchedText = pattern.matched_text || pattern.toString() || '';
    let qualityScore = 0;

    // Length and specificity boost
    if (matchedText.length > 20) qualityScore += 1; // Longer matches more specific
    if (/\b\d+\b/.test(matchedText)) qualityScore += 1; // Contains numbers (statistics)

    // Contextual relevance
    if (/\b(policy|policies|hiring|employment)\b/i.test(text)) qualityScore += 1;
    if (/\b(should|must|required|prohibited)\b/i.test(text)) qualityScore += 1;

    // Pattern strength indicators
    if (/\b(all|every|always|never)\b/i.test(matchedText)) qualityScore += 1;
    if (/\b(better|worse|more|less)\b/i.test(matchedText)) qualityScore += 1;

    // Convert to quality level
    if (qualityScore >= 3) return 'high';
    if (qualityScore >= 2) return 'medium';
    if (qualityScore >= 1) return 'low';
    return 'uncertain';
  }

  /**
   * Calculate confidence score based on evidence quality
   */
  calculateConfidence(score, patternCount, contextBoosts) {
    if (score === 0) return 0.0;

    let baseConfidence = Math.min(0.95, score + 0.3); // Base confidence from score

    // Pattern count bonus (more evidence = higher confidence)
    const patternBonus = Math.min(0.1, patternCount * 0.02);
    baseConfidence += patternBonus;

    // Context boost consideration
    if (contextBoosts > 1.0) {
      baseConfidence = Math.min(0.99, baseConfidence * Math.sqrt(contextBoosts));
    }

    return Math.max(0.1, baseConfidence); // Minimum confidence floor
  }

  /**
   * Get scoring breakdown for transparency
   */
  getScoringBreakdown(patterns, text, biasTypes) {
    const breakdown = {
      patternScores: [],
      contextBoosts: [],
      finalScore: 0,
      confidence: 0
    };

    patterns.forEach((pattern, index) => {
      const type = this.classifyPatternType(pattern, text);
      const quality = this.assessPatternQuality(pattern, text);
      const baseWeight = this.patternWeights[type] || 0.05;
      const qualityMultiplier = this.confidenceMultipliers[quality] || 0.6;

      breakdown.patternScores.push({
        index: index + 1,
        type: type,
        quality: quality,
        baseWeight: baseWeight,
        qualityMultiplier: qualityMultiplier,
        finalScore: baseWeight * qualityMultiplier
      });
    });

    // Calculate context boosts
    let boostMultiplier = 1.0;
    const boosts = [];

    if (biasTypes && biasTypes.length > 1) {
      boostMultiplier *= this.contextBoosts.multiple_biases;
      boosts.push({ type: 'multiple_biases', multiplier: this.contextBoosts.multiple_biases });
    }

    if (/\b(should|must|always|never)\b.*\b(all|every)\b/i.test(text)) {
      boostMultiplier *= this.contextBoosts.discriminatory_language;
      boosts.push({ type: 'discriminatory_language', multiplier: this.contextBoosts.discriminatory_language });
    }

    if (/\b(all|every|most|many)\b.*\b(people|women|men|black|white)\b/i.test(text)) {
      boostMultiplier *= this.contextBoosts.generalization;
      boosts.push({ type: 'generalization', multiplier: this.contextBoosts.generalization });
    }

    if (/\b(policy|policies|hiring|employment|admission|selection)\b/i.test(text)) {
      boostMultiplier *= this.contextBoosts.systemic_context;
      boosts.push({ type: 'systemic_context', multiplier: this.contextBoosts.systemic_context });
    }

    if (/\b(CEO|manager|supervisor|boss|leader|executive|official)\b/i.test(text)) {
      boostMultiplier *= this.contextBoosts.power_dynamic;
      boosts.push({ type: 'power_dynamic', multiplier: this.contextBoosts.power_dynamic });
    }

    breakdown.contextBoosts = boosts;
    breakdown.boostMultiplier = boostMultiplier;

    const baseScore = breakdown.patternScores.reduce((sum, p) => sum + p.finalScore, 0);
    breakdown.finalScore = Math.min(1.0, baseScore * boostMultiplier);
    breakdown.confidence = this.calculateConfidence(breakdown.finalScore, patterns.length, boostMultiplier);

    return breakdown;
  }
}

// Export for use in bias detection systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GraduatedScorer;
}

// Make available globally for service worker context
if (typeof self !== 'undefined') {
  self.AiGuardianBiasDetection = self.AiGuardianBiasDetection || {};
  self.AiGuardianBiasDetection.GraduatedScorer = GraduatedScorer;
}
