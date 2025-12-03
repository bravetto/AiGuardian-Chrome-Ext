/**
 * Constants for Bias Detection System
 *
 * Centralized configuration and constants to avoid magic numbers
 * and improve maintainability
 */

export const BIAS_DETECTION_CONSTANTS = {
  // Detection thresholds
  DEFAULT_MIN_CONFIDENCE: 0.4,
  DEFAULT_MAX_PATTERNS: 10,
  MAX_PATTERN_LENGTH: 1000,

  // Scoring weights and multipliers
  PATTERN_WEIGHTS: {
    direct_bias: 0.4,
    explicit_comparison: 0.35,
    stereotype: 0.25,
    role_assignment: 0.22,
    trait_assignment: 0.20,
    assumption: 0.15,
    preference_generalization: 0.12,
    coded: 0.1,
    microaggression: 0.08,
    systemic_hint: 0.06
  },

  // Context multipliers
  CONTEXT_MULTIPLIERS: {
    job_posting: 1.5,
    policy_document: 1.3,
    news_article: 1.0,
    social_media: 0.8,
    academic_paper: 0.7,
    personal_email: 0.9,
    business_email: 1.2,
    advertisement: 1.1,
    legal_document: 1.4,
    educational: 0.8,
    entertainment: 0.7,
    general: 1.0
  },

  // Evidence strength multipliers
  EVIDENCE_STRENGTH: {
    direct_bias: 1.0,
    stereotype: 0.8,
    coded_language: 0.6,
    microaggression: 0.4,
    systemic_pattern: 0.7,
    anecdotal: 0.5
  },

  // Bias type severity weights
  BIAS_TYPE_MULTIPLIERS: {
    racial_bias: 1.0,
    gender_bias: 0.95,
    ability_bias: 1.1,
    age_bias: 0.85,
    socioeconomic_bias: 0.9,
    immigration_bias: 1.0,
    coded_bias: 0.8
  },

  // Context boosts
  CONTEXT_BOOSTS: {
    multiple_biases: 1.3,
    discriminatory_language: 1.25,
    generalization: 1.2,
    power_dynamic: 1.15,
    systemic_context: 1.1
  },

  // Confidence multipliers for pattern quality
  CONFIDENCE_MULTIPLIERS: {
    high: 1.0,
    medium: 0.8,
    low: 0.6,
    uncertain: 0.4
  },

  // Performance limits
  MAX_TEXT_LENGTH: 10000,
  MAX_PROCESSING_TIME: 5000, // ms
  MAX_PATTERN_MATCHES: 50,
  MAX_ERROR_LOG_ENTRIES: 10,
  LOGGING_PROCESSING_TIME_THRESHOLD_MS: 100,
  LOGGING_ANALYSIS_FREQUENCY: 100,

  // Validation thresholds
  MIN_PATTERN_LENGTH: 1,
  MAX_CATEGORY_LENGTH: 50,
  VALID_CONFIDENCE_RANGE: { min: 0.0, max: 1.0 },

  // Error messages
  ERRORS: {
    MISSING_DEPENDENCIES: 'Missing required bias detection dependencies',
    INVALID_PATTERNS: 'Invalid patterns object provided',
    INVALID_INPUT: 'Invalid input text provided',
    PROCESSING_TIMEOUT: 'Bias detection processing timeout',
    PATTERN_COMPILATION_FAILED: 'Failed to compile regex patterns'
  },

  // Namespaces
  GLOBAL_NAMESPACE: 'AiGuardianBiasDetection',

  // Logging levels
  LOG_LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  }
};

// Deep freeze function to make nested objects immutable
function deepFreeze(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // First freeze the object itself
  Object.freeze(obj);

  // Recursively freeze all properties that are objects
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Object.isFrozen(obj[key])) {
      deepFreeze(obj[key]);
    }
  });

  return obj;
}

// Make constants immutable
deepFreeze(BIAS_DETECTION_CONSTANTS);

// Make available globally for service worker context
if (typeof self !== 'undefined') {
  self.AiGuardianBiasDetection = self.AiGuardianBiasDetection || {};
  self.AiGuardianBiasDetection.constants = BIAS_DETECTION_CONSTANTS;
}
