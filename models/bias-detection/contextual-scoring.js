/**
 * Contextual Scoring for Bias Detection
 *
 * Applies context-aware scoring multipliers based on content domain,
 * evidence strength, and situational factors
 */

// Import constants (with fallback for service worker context)
import { BIAS_DETECTION_CONSTANTS } from './constants.js';
const constants = BIAS_DETECTION_CONSTANTS || (typeof self !== 'undefined' && self.AiGuardianBiasDetection && self.AiGuardianBiasDetection.constants);

export class ContextualScorer {
  constructor() {
    this.contextMultipliers = constants ? constants.CONTEXT_MULTIPLIERS : {
      // Content domains with different sensitivity levels
      job_posting: 1.5,      // Highest sensitivity for employment
      policy_document: 1.3,   // High for official policies
      news_article: 1.0,      // Standard weight
      social_media: 0.8,      // Lower for informal contexts
      academic_paper: 0.7,    // Lowest for formal writing
      personal_email: 0.9,    // Moderate for personal communication
      business_email: 1.2,    // Higher for business communication
      advertisement: 1.1,     // Moderate for marketing
      legal_document: 1.4,    // High for legal contexts
      educational: 0.8,       // Lower for educational content
      entertainment: 0.7,     // Lowest for entertainment
      general: 1.0           // Default
    };

    this.evidenceStrength = constants ? constants.EVIDENCE_STRENGTH : {
      // Evidence strength multipliers
      direct_bias: 1.0,       // "men are better than women at programming"
      stereotype: 0.8,        // "women are naturally nurturing"
      coded_language: 0.6,    // "articulate for a black person"
      microaggression: 0.4,   // Subtle discriminatory acts
      systemic_pattern: 0.7,  // Patterns across multiple instances
      anecdotal: 0.5         // Single instance, may be coincidental
    };

    this.biasTypeMultipliers = constants ? constants.BIAS_TYPE_MULTIPLIERS : {
      // Different bias types have different severity weights
      racial_bias: 1.0,       // Baseline
      gender_bias: 0.95,      // Slightly less severe in some contexts
      ability_bias: 1.1,      // More severe due to vulnerability
      age_bias: 0.85,         // Less severe in some professional contexts
      socioeconomic_bias: 0.9, // Moderate severity
      immigration_bias: 1.0,  // New immigration bias category
      coded_bias: 0.8         // Coded bias patterns
    };
  }

  /**
   * Calculate contextual score with all multipliers applied
   */
  calculateContextualScore(baseScore, context, evidenceType, biasTypes = []) {
    let score = baseScore;

    // Apply context multiplier
    const contextMultiplier = this.contextMultipliers[context] || 1.0;
    score *= contextMultiplier;

    // Apply evidence strength multiplier
    const evidenceMultiplier = this.evidenceStrength[evidenceType] || 0.5;
    score *= evidenceMultiplier;

    // Apply bias type severity adjustments
    if (biasTypes.length > 0) {
      const avgBiasMultiplier = biasTypes.reduce((sum, type) => {
        return sum + (this.biasTypeMultipliers[type] || 1.0);
      }, 0) / biasTypes.length;
      score *= avgBiasMultiplier;
    }

    // Apply ceiling and floor
    return Math.min(1.0, Math.max(0.0, score));
  }

  /**
   * Detect content context from text analysis
   */
  detectContext(text, metadata = {}) {
    const lowerText = text.toLowerCase();

    // Job posting indicators
    if (/\b(job|position|hire|employment|career|opening|vacancy)\b/i.test(lowerText) ||
        /\b(required|preferred|qualifications?|responsibilities)\b/i.test(lowerText)) {
      return 'job_posting';
    }

    // Policy document indicators
    if (/\b(policy|policies|procedure|guideline|regulation|compliance)\b/i.test(lowerText) ||
        /\b(shall|must|required|prohibited|permitted)\b/i.test(lowerText)) {
      return 'policy_document';
    }

    // Legal document indicators
    if (/\b(agreement|contract|terms|conditions|liability|rights)\b/i.test(lowerText) ||
        /\b(hereby|whereas|hereinafter|party|parties)\b/i.test(lowerText)) {
      return 'legal_document';
    }

    // News/article indicators
    if (/\b(according\s+to|reported|stated|announced|breaking)\b/i.test(lowerText) ||
        metadata.source === 'news' || metadata.publication) {
      return 'news_article';
    }

    // Academic indicators
    if (/\b(study|research|analysis|findings|conclusion|methodology)\b/i.test(lowerText) ||
        /\b(citation|reference|literature|peer-reviewed)\b/i.test(lowerText)) {
      return 'academic_paper';
    }

    // Social media indicators
    if (metadata.platform || /\b(tweet|post|share|like|follow|hashtag)\b/i.test(lowerText)) {
      return 'social_media';
    }

    // Email indicators
    if (metadata.isEmail || /\b(dear|regards|sincerely|best)\b/i.test(lowerText)) {
      return metadata.isBusiness ? 'business_email' : 'personal_email';
    }

    // Advertisement indicators
    if (/\b(buy|purchase|sale|discount|offer|limited\s+time)\b/i.test(lowerText) ||
        /\b(call\s+now|contact\s+us|visit\s+our)\b/i.test(lowerText)) {
      return 'advertisement';
    }

    // Educational content
    if (/\b(lesson|course|curriculum|learning|education)\b/i.test(lowerText)) {
      return 'educational';
    }

    // Entertainment content
    if (metadata.genre || /\b(movie|film|show|series|entertainment)\b/i.test(lowerText)) {
      return 'entertainment';
    }

    return 'general';
  }

  /**
   * Classify evidence strength based on pattern matches
   */
  classifyEvidenceStrength(matches, text) {
    if (!matches || matches.length === 0) return 'anecdotal';

    // Direct bias indicators
    const directMatches = matches.filter(m =>
      /\b(better|worse|more|less|superior|inferior)\b.*\b(than|compared\s+to)\b/i.test(m.matched_text || '')
    );

    if (directMatches.length > 0) return 'direct_bias';

    // Stereotype indicators
    const stereotypeMatches = matches.filter(m =>
      /\b(are|is|tend|typically|usually)\b.*\b(all|most|many)\b/i.test(m.matched_text || '')
    );

    if (stereotypeMatches.length > 0) return 'stereotype';

    // Coded language indicators
    const codedMatches = matches.filter(m =>
      /\b(for\s+(a|an)\s+)?(black|brown|person|woman)\b/i.test(m.matched_text || '') ||
      /\b(code|subtle|euphemism)\b/i.test(m.matched_text || '')
    );

    if (codedMatches.length > 0) return 'coded_language';

    // Systemic pattern indicators
    if (matches.length > 3) return 'systemic_pattern';

    return 'microaggression';
  }

  /**
   * Get context description for transparency
   */
  getContextDescription(context) {
    const descriptions = {
      job_posting: 'Employment-related content (highest bias sensitivity)',
      policy_document: 'Official policies and procedures',
      legal_document: 'Legal agreements and contracts',
      news_article: 'News reporting and journalism',
      academic_paper: 'Academic research and scholarship',
      social_media: 'Social media posts and interactions',
      business_email: 'Professional business communication',
      personal_email: 'Personal communication',
      advertisement: 'Marketing and advertising content',
      educational: 'Educational materials and courses',
      entertainment: 'Entertainment and media content',
      general: 'General content'
    };

    return descriptions[context] || 'General content';
  }

  /**
   * Get evidence strength description
   */
  getEvidenceDescription(evidenceType) {
    const descriptions = {
      direct_bias: 'Direct comparison or value judgment between groups',
      stereotype: 'Generalization about group characteristics',
      coded_language: 'Subtle or indirect discriminatory language',
      microaggression: 'Subtle discriminatory act or comment',
      systemic_pattern: 'Pattern observed across multiple instances',
      anecdotal: 'Single instance, may be coincidental'
    };

    return descriptions[evidenceType] || 'Unclassified evidence';
  }
}

// Export for use in bias detection systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContextualScorer;
}

// Make available globally for service worker context
if (typeof self !== 'undefined') {
  self.AiGuardianBiasDetection = self.AiGuardianBiasDetection || {};
  self.AiGuardianBiasDetection.ContextualScorer = ContextualScorer;
}
