/**
 * Enhanced Bias Detection Engine
 *
 * Next-generation bias detection combining ML model inference with
 * advanced pattern matching, contextual analysis, and graduated scoring
 */

import { ENHANCED_PATTERNS, BIAS_CATEGORIES, PATTERN_WEIGHTS } from './patterns.js';
import { ContextualScorer } from './contextual-scoring.js';
import { GraduatedScorer } from './graduated-scoring.js';
import { BIAS_DETECTION_CONSTANTS } from './constants.js';

export class EnhancedBiasDetectionEngine {
  /**
   * Creates an instance of EnhancedBiasDetectionEngine.
   *
   * This engine combines multiple detection strategies including pattern matching,
   * contextual analysis, and graduated scoring to identify various forms of bias
   * in text content.
   *
   * @param {Object} [options={}] - Configuration options for the detection engine
   * @param {number} [options.minConfidence=0.4] - Minimum confidence threshold (0.0-1.0)
   * @param {number} [options.maxPatterns=10] - Maximum number of patterns to process per analysis
   * @param {boolean} [options.enableML=true] - Whether to enable ML-based detection
   * @param {boolean} [options.enablePatterns=true] - Whether to enable pattern-based detection
   * @param {Object} [options.logger] - Optional logger instance for debugging and monitoring
   *
   * @throws {TypeError} If options is not an object or contains invalid values
   * @throws {Error} If required dependencies are missing or initialization fails
   *
   * @example
   * const detector = new EnhancedBiasDetectionEngine({
   *   minConfidence: 0.6,
   *   maxPatterns: 15,
   *   enableML: false
   * });
   */
  constructor(options = {}) {
    // Validate constructor options
    if (options !== null && typeof options !== 'object') {
      throw new TypeError('Options must be an object or null/undefined');
    }

    // Validate specific option values
    if (options.minConfidence !== undefined && (typeof options.minConfidence !== 'number' || options.minConfidence < 0 || options.minConfidence > 1)) {
      throw new TypeError('minConfidence must be a number between 0 and 1');
    }
    if (options.maxPatterns !== undefined && (!Number.isInteger(options.maxPatterns) || options.maxPatterns <= 0)) {
      throw new TypeError('maxPatterns must be a positive integer');
    }
    if (options.enableML !== undefined && typeof options.enableML !== 'boolean') {
      throw new TypeError('enableML must be a boolean');
    }
    if (options.enablePatterns !== undefined && typeof options.enablePatterns !== 'boolean') {
      throw new TypeError('enablePatterns must be a boolean');
    }

    // Use imported modules if available, otherwise use namespaced global fallbacks
    const globalDeps = typeof self !== 'undefined' ? self.AiGuardianBiasDetection : null;

    // Initialize tracking FIRST (before any operations that might fail)
    this.performanceStats = {
      totalAnalyses: 0,
      averageProcessingTime: 0,
      patternMatchCounts: {},
      errorCounts: {}
    };

    this.errorTracker = {
      initializationErrors: [],
      analysisErrors: [],
      patternErrors: [],
      lastError: null
    };

    this.constants = BIAS_DETECTION_CONSTANTS || (typeof self !== 'undefined' && self.AiGuardianBiasDetection && self.AiGuardianBiasDetection.constants);

    try {
      const patterns = ENHANCED_PATTERNS || (globalDeps && globalDeps.patterns);
      const ContextualScorerClass = ContextualScorer || (globalDeps && globalDeps.ContextualScorer);
      const GraduatedScorerClass = GraduatedScorer || (globalDeps && globalDeps.GraduatedScorer);

      // Validate all required dependencies are available
      const missingDeps = [];
      if (!patterns) missingDeps.push('ENHANCED_PATTERNS');
      if (!ContextualScorerClass) missingDeps.push('ContextualScorer');
      if (!GraduatedScorerClass) missingDeps.push('GraduatedScorer');

      if (missingDeps.length > 0) {
        const error = new Error(`Missing required bias detection dependencies: ${missingDeps.join(', ')}`);
        this.errorTracker.initializationErrors.push({
          type: 'dependency_validation',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      // Validate patterns structure
      const patternValidation = this._validatePatterns(patterns);
      if (!patternValidation.isValid) {
        const error = new Error(`Invalid patterns configuration: ${patternValidation.errors.join(', ')}`);
        this.errorTracker.initializationErrors.push({
          type: 'pattern_validation',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      this.patterns = patterns;

      // Initialize scorer instances with error handling
      try {
        this.contextualScorer = new ContextualScorerClass();
      } catch (error) {
        this.errorTracker.initializationErrors.push({
          type: 'contextual_scorer_initialization',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Failed to initialize ContextualScorer: ${error.message}`);
      }

      try {
        this.graduatedScorer = new GraduatedScorerClass();
      } catch (error) {
        this.errorTracker.initializationErrors.push({
          type: 'graduated_scorer_initialization',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Failed to initialize GraduatedScorer: ${error.message}`);
      }

      this.options = {
        minConfidence: options.minConfidence || BIAS_DETECTION_CONSTANTS.DEFAULT_MIN_CONFIDENCE,
        maxPatterns: options.maxPatterns || BIAS_DETECTION_CONSTANTS.DEFAULT_MAX_PATTERNS,
        enableML: options.enableML !== false,
        enablePatterns: options.enablePatterns !== false,
        ...options
      };

      // Store logger instance (can be undefined for backward compatibility)
      this.logger = options.logger;

      // Pre-compile and cache patterns for performance
      try {
        this.compiledPatterns = this._compilePatterns();
      } catch (error) {
        this.errorTracker.initializationErrors.push({
          type: 'pattern_compilation',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Failed to compile patterns: ${error.message}`);
      }

      // Initialize sub-systems
      try {
        this._initializeSystems();
      } catch (error) {
        this.errorTracker.initializationErrors.push({
          type: 'system_initialization',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Failed to initialize detection systems: ${error.message}`);
      }

    } catch (error) {
      // Update last error for easy access
      this.errorTracker.lastError = {
        type: 'initialization_failure',
        message: error.message,
        timestamp: new Date().toISOString(),
        stack: error.stack
      };
      throw error;
    }
  }

  /**
   * Validate input patterns object
   * @private
   */
  _validatePatterns(patterns) {
    const errors = [];

    if (!patterns || typeof patterns !== 'object') {
      errors.push('Patterns must be a valid object');
      return { isValid: false, errors };
    }

    Object.entries(patterns).forEach(([category, patternList]) => {
      if (!Array.isArray(patternList)) {
        errors.push(`Category '${category}' must be an array`);
        return;
      }

      if (patternList.length === 0) {
        errors.push(`Category '${category}' cannot be empty`);
        return;
      }

      patternList.forEach((pattern, index) => {
        if (!(pattern instanceof RegExp)) {
          errors.push(`Pattern at ${category}[${index}] must be a RegExp object`);
        }

        if (this.constants && pattern.source && pattern.source.length > this.constants.MAX_PATTERN_LENGTH) {
          errors.push(`Pattern at ${category}[${index}] exceeds maximum length (${this.constants.MAX_PATTERN_LENGTH})`);
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate analysis input parameters
   * @private
   */
  _validateAnalysisInput(text, metadata) {
    const errors = [];

    if (!text || typeof text !== 'string') {
      errors.push('Text must be a non-empty string');
    } else if (this.constants && text.length > this.constants.MAX_TEXT_LENGTH) {
      errors.push(`Text length (${text.length}) exceeds maximum allowed (${this.constants.MAX_TEXT_LENGTH})`);
    }

    if (metadata && typeof metadata !== 'object') {
      errors.push('Metadata must be an object if provided');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Pre-compile and cache regex patterns for performance
   * @private
   */
  _compilePatterns() {
    const compiled = {};

    Object.entries(this.patterns).forEach(([category, patternList]) => {
      compiled[category] = patternList.map((pattern, index) => {
        try {
          // Validate pattern before compiling
          if (typeof pattern !== 'object' || !pattern.source) {
            throw new Error(`Invalid pattern at ${category}[${index}]`);
          }

          return {
            original: pattern,
            compiled: new RegExp(pattern.source, pattern.flags),
            lastIndex: 0,
            category: category,
            index: index
          };
        } catch (error) {
          if (this.logger && this.logger.warn) {
            this.logger.warn(`[EnhancedBiasDetection] Failed to compile pattern ${category}[${index}]:`, error.message);
          }
          return null;
        }
      }).filter(Boolean); // Remove failed compilations
    });

    if (this.logger && this.logger.info) {
      const totalPatterns = Object.values(compiled).reduce((sum, patterns) => sum + patterns.length, 0);
      this.logger.info(`[EnhancedBiasDetection] Compiled ${totalPatterns} regex patterns`);
    }

    return compiled;
  }

  /**
   * Initialize all detection systems
   */
  _initializeSystems() {
    this.systems = {
      patternMatcher: this._initializePatternMatcher(),
      contextAnalyzer: this._initializeContextAnalyzer(),
      evidenceClassifier: this._initializeEvidenceClassifier(),
      scoreCalculator: this._initializeScoreCalculator()
    };
  }

  _initializePatternMatcher() {
    return {
      findAllPatternMatches: (text) => this.findAllPatternMatches(text),
      categorizeMatches: (matches) => this.identifyBiasTypes(matches),
      assessPatternQuality: (patterns, text) => this.assessPatternQualities(patterns, text)
    };
  }

  _initializeContextAnalyzer() {
    return {
      detectContext: (text, metadata) => this.contextualScorer.detectContext(text, metadata),
      classifyEvidence: (matches, text) => this.contextualScorer.classifyEvidenceStrength(matches, text),
      getContextDescription: (context) => this.contextualScorer.getContextDescription(context)
    };
  }

  _initializeEvidenceClassifier() {
    return {
      classifyEvidenceStrength: (matches, text) => this.contextualScorer.classifyEvidenceStrength(matches, text),
      assessReliability: (matches, context) => this._assessEvidenceReliability(matches, context)
    };
  }

  _initializeScoreCalculator() {
    return {
      calculateGraduatedScore: (patterns, text, biasTypes) =>
        this.graduatedScorer.calculateGraduatedScore(patterns, text, biasTypes),
      calculateContextualScore: (baseScore, context, evidenceType, biasTypes) =>
        this.contextualScorer.calculateContextualScore(baseScore, context, evidenceType, biasTypes),
      getScoringBreakdown: (patterns, text, biasTypes) =>
        this.graduatedScorer.getScoringBreakdown(patterns, text, biasTypes)
    };
  }

  /**
   * Analyzes text for various forms of bias using multi-layered detection strategies.
   *
   * This method performs comprehensive bias detection by combining pattern matching,
   * contextual analysis, and graduated scoring. It supports multiple bias categories
   * including racial, gender, age, socioeconomic, ability, and immigration bias.
   *
   * @param {string} text - The text content to analyze for bias
   * @param {Object} [metadata={}] - Additional context about the text (e.g., source, author)
   * @param {string} [metadata.source] - Source of the text (e.g., 'social_media', 'news_article')
   * @param {string} [metadata.author] - Author information if available
   * @param {string} [metadata.context] - Additional contextual information
   *
   * @returns {Promise<Object>} Analysis results with detailed bias assessment
   * @returns {boolean} results.success - Whether the analysis completed successfully
   * @returns {number} results.bias_score - Overall bias score (0.0-1.0)
   * @returns {string[]} results.bias_types - Array of detected bias categories
   * @returns {number} results.confidence - Confidence level in the analysis (0.0-1.0)
   * @returns {string} results.context - Contextual classification of the text
   * @returns {string} results.evidence_type - Type of evidence strength detected
   * @returns {number} results.pattern_matches - Number of pattern matches found
   * @returns {number} results.processing_time - Time taken for analysis (ms)
   * @returns {Object} results.transparency - Detailed analysis breakdown for transparency
   * @returns {Object} results.metadata - Additional metadata about the analysis
   * @returns {string} [results.error] - Error message if analysis failed
   *
   * @throws {Error} If input validation fails or analysis encounters critical errors
   *
   * @example
   * const result = await detector.detectBias(
   *   "Men are naturally better at programming than women",
   *   { source: 'social_media', context: 'tech_discussion' }
   * );
   *
   * if (result.success) {
   *   console.log(`Bias score: ${result.bias_score}`);
   *   console.log(`Confidence: ${result.confidence}`);
   *   console.log(`Detected types: ${result.bias_types.join(', ')}`);
   * }
   */
  async detectBias(text, metadata = {}) {
    const startTime = performance.now();

    try {
      // Validate input parameters
      const inputValidation = this._validateAnalysisInput(text, metadata);
      if (!inputValidation.isValid) {
        const error = new Error(`Invalid input: ${inputValidation.errors.join(', ')}`);
        this._trackAnalysisError('input_validation', error);
        throw error;
      }
      // Step 1: Context detection
      const context = this.systems.contextAnalyzer.detectContext(text, metadata);

      // Step 2: Pattern matching
      const allMatches = this.systems.patternMatcher.findAllPatternMatches(text);
      const biasTypes = this.systems.patternMatcher.categorizeMatches(allMatches);

      // Step 3: Evidence classification
      const evidenceType = this.systems.evidenceClassifier.classifyEvidenceStrength(allMatches, text);

      // Step 4: Pattern quality assessment
      const patternQualities = this.systems.patternMatcher.assessPatternQuality(allMatches, text);

      // Step 5: Graduated scoring
      const graduatedScore = this.systems.scoreCalculator.calculateGraduatedScore(
        allMatches, text, biasTypes
      );

      // Step 6: Contextual scoring
      const finalScore = this.systems.scoreCalculator.calculateContextualScore(
        graduatedScore, context, evidenceType, biasTypes
      );

      // Step 7: Confidence calculation
      const confidence = this._calculateOverallConfidence(finalScore, allMatches, context, evidenceType);

      // Step 8: Get detailed breakdown
      const scoringBreakdown = this.systems.scoreCalculator.getScoringBreakdown(
        allMatches, text, biasTypes
      );

      const processingTime = performance.now() - startTime;

      // Update performance statistics
      this._updatePerformanceStats(processingTime, allMatches.length, biasTypes.length);

      // Log analysis results
      this._logAnalysisResults({
        textLength: text.length,
        biasScore: finalScore,
        confidence: confidence,
        patternMatches: allMatches.length,
        biasTypes: biasTypes.length,
        processingTime: processingTime,
        context: context
      });

      return {
        success: true,
        bias_score: finalScore,
        bias_types: biasTypes,
        confidence: confidence,
        context: context,
        evidence_type: evidenceType,
        pattern_matches: allMatches.length,
        processing_time: processingTime,

        // Enhanced transparency data
        transparency: {
          context_description: this.systems.contextAnalyzer.getContextDescription(context),
          evidence_description: this.contextualScorer.getEvidenceDescription(evidenceType),
          scoring_breakdown: scoringBreakdown,
          pattern_analysis: this._getPatternAnalysis(allMatches, patternQualities),
          reliability_assessment: this.systems.evidenceClassifier.assessReliability(allMatches, context)
        },

        // Metadata
        metadata: {
          text_length: text.length,
          word_count: text.split(/\s+/).length,
          detected_categories: biasTypes.length,
          pattern_match_count: allMatches.length,
          context_sensitivity: this.contextualScorer.contextMultipliers[context] || 1.0
        }
      };

    } catch (error) {
      const processingTime = performance.now() - startTime;

      // Track the error
      this._trackAnalysisError('analysis_failure', error);

      if (this.logger && this.logger.error) {
        this.logger.error('[EnhancedBiasDetectionEngine] Analysis failed:', error);
      }

      return {
        success: false,
        bias_score: 0.0,
        bias_types: [],
        confidence: 0.0,
        error: error.message,
        processing_time: processingTime,
        error_type: error.name,
        error_stack: error.stack
      };
    }
  }

  /**
   * Find all pattern matches across all bias categories
   */
  findAllPatternMatches(text) {
    const textLower = text.toLowerCase();
    const allMatches = [];
    const maxMatches = this.constants ? this.constants.MAX_PATTERN_MATCHES : 50;

    // Search through all compiled bias categories
    Object.entries(this.compiledPatterns).forEach(([category, compiledPatterns]) => {
      compiledPatterns.forEach((compiledPattern) => {
        try {
          // Use compiled regex for better performance
          const regexResult = compiledPattern.compiled.exec(textLower);
          if (regexResult) {
            // Reset regex lastIndex for potential reuse
            compiledPattern.compiled.lastIndex = 0;

            allMatches.push({
              category: category,
              pattern: compiledPattern.original.toString(),
              matched_text: regexResult[0],
              index: regexResult.index,
              pattern_index: compiledPattern.index,
              type: this.graduatedScorer.classifyPatternType({ matched_text: regexResult[0] }, text)
            });
          }
        } catch (error) {
          // Skip invalid patterns
          if (this.logger && this.logger.warn) {
            this.logger.warn(`[EnhancedBiasDetectionEngine] Pattern execution failed for ${category}:`, error.message);
          }
        }
      });
    });

    // Sort by pattern type strength (direct bias first) and limit results
    return allMatches.sort((a, b) => {
      const weights = this.constants.PATTERN_WEIGHTS;
      const typeA = weights[a.type] || 0;
      const typeB = weights[b.type] || 0;
      return typeB - typeA; // Higher weights first
    }).slice(0, Math.min(this.options.maxPatterns, maxMatches));
  }

  /**
   * Identify unique bias types from matches
   */
  identifyBiasTypes(matches) {
    return [...new Set(matches.map(match => match.category))];
  }

  /**
   * Assess pattern qualities for confidence calculation
   */
  assessPatternQualities(matches, text) {
    return matches.map(match => ({
      ...match,
      quality: this.graduatedScorer.assessPatternQuality(match, text),
      confidence: (PATTERN_WEIGHTS[match.type] || 0.1) *
                  this.contextualScorer.evidenceStrength[match.type] || 0.5
    }));
  }

  /**
   * Calculate overall confidence score
   */
  _calculateOverallConfidence(score, matches, context, evidenceType) {
    if (score === 0) return 0.0;

    let confidence = Math.min(0.95, score + 0.3); // Base confidence

    // Pattern count bonus
    const patternBonus = Math.min(0.1, matches.length * 0.02);
    confidence += patternBonus;

    // Context reliability
    const contextMultiplier = this.contextualScorer.contextMultipliers[context] || 1.0;
    confidence *= Math.sqrt(contextMultiplier);

    // Evidence strength
    const evidenceMultiplier = this.contextualScorer.evidenceStrength[evidenceType] || 0.5;
    confidence *= evidenceMultiplier;

    return Math.min(0.99, Math.max(this.options.minConfidence, confidence));
  }


  /**
   * Get detailed pattern analysis for transparency
   */
  _getPatternAnalysis(matches, qualities) {
    const analysis = {
      total_patterns: matches.length,
      categories_found: this.identifyBiasTypes(matches).length,
      strongest_patterns: [],
      pattern_distribution: {}
    };

    // Pattern distribution by category
    matches.forEach(match => {
      analysis.pattern_distribution[match.category] =
        (analysis.pattern_distribution[match.category] || 0) + 1;
    });

    // Top 3 strongest patterns
    const sortedMatches = matches
      .filter((match, index) => qualities[index])
      .sort((a, b) => {
        const qualityA = qualities.find(q => q.pattern === a.pattern)?.confidence || 0;
        const qualityB = qualities.find(q => q.pattern === b.pattern)?.confidence || 0;
        return qualityB - qualityA;
      })
      .slice(0, 3);

    analysis.strongest_patterns = sortedMatches.map(match => ({
      category: match.category,
      type: match.type,
      matched_text: match.matched_text,
      confidence: qualities.find(q => q.pattern === match.pattern)?.confidence || 0
    }));

    return analysis;
  }

  /**
   * Assess evidence reliability
   */
  _assessEvidenceReliability(matches, context) {
    const reliability = {
      pattern_consistency: 0,
      context_relevance: 0,
      evidence_strength: 0,
      overall_reliability: 0
    };

    // Pattern consistency (multiple patterns in same category)
    const categories = {};
    matches.forEach(match => {
      categories[match.category] = (categories[match.category] || 0) + 1;
    });
    const maxPatternsInCategory = Math.max(...Object.values(categories), 0);
    reliability.pattern_consistency = Math.min(1.0, maxPatternsInCategory / 3);

    // Context relevance
    reliability.context_relevance = this.contextualScorer.contextMultipliers[context] || 1.0;

    // Evidence strength (average of pattern weights)
    const avgPatternWeight = matches.length > 0
      ? matches.reduce((sum, match) => sum + (PATTERN_WEIGHTS[match.type] || 0.1), 0) / matches.length
      : 0;
    reliability.evidence_strength = avgPatternWeight;

    // Overall reliability (weighted average)
    reliability.overall_reliability = (
      reliability.pattern_consistency * 0.3 +
      reliability.context_relevance * 0.3 +
      reliability.evidence_strength * 0.4
    );

    return reliability;
  }

  /**
   * Track analysis errors for debugging and monitoring
   * @private
   */
  _trackAnalysisError(type, error) {
    this.errorTracker.lastError = {
      type: type,
      message: error.message,
      timestamp: new Date().toISOString(),
      stack: error.stack
    };

    this.errorTracker.analysisErrors.push(this.errorTracker.lastError);

    // Keep only last N errors to prevent memory leaks
    if (this.errorTracker.analysisErrors.length > this.constants.MAX_ERROR_LOG_ENTRIES) {
      this.errorTracker.analysisErrors.shift();
    }

    // Update error counts
    this.performanceStats.errorCounts[type] = (this.performanceStats.errorCounts[type] || 0) + 1;
  }

  /**
   * Update performance statistics
   * @private
   */
  _updatePerformanceStats(processingTime, patternMatches, biasTypes) {
    this.performanceStats.totalAnalyses++;

    // Update average processing time
    const totalTime = this.performanceStats.averageProcessingTime * (this.performanceStats.totalAnalyses - 1) + processingTime;
    this.performanceStats.averageProcessingTime = totalTime / this.performanceStats.totalAnalyses;

    // Track pattern match distribution
    this.performanceStats.patternMatchCounts[patternMatches] = (this.performanceStats.patternMatchCounts[patternMatches] || 0) + 1;
  }

  /**
   * Log analysis results for debugging and monitoring
   * @private
   */
  _logAnalysisResults(stats) {
    if (this.logger && this.logger.info) {
      // Only log significant results or periodically for monitoring
      const shouldLog = stats.biasScore > this.constants.DEFAULT_MIN_CONFIDENCE ||
                       stats.processingTime > this.constants.LOGGING_PROCESSING_TIME_THRESHOLD_MS ||
                       this.performanceStats.totalAnalyses % this.constants.LOGGING_ANALYSIS_FREQUENCY === 0;

      if (shouldLog) {
        this.logger.info('[EnhancedBiasDetection] Analysis completed:', {
          score: stats.biasScore.toFixed(3),
          confidence: stats.confidence.toFixed(3),
          patterns: stats.patternMatches,
          types: stats.biasTypes,
          time: `${stats.processingTime.toFixed(2)}ms`,
          context: stats.context
        });
      }
    }
  }

  /**
   * Retrieves comprehensive status information about the bias detection engine.
   *
   * This method provides diagnostic and monitoring information including
   * initialization status, performance metrics, error tracking, and system health.
   *
   * @returns {Object} Status information object
   * @returns {boolean} results.initialized - Whether the engine is properly initialized
   * @returns {number} results.pattern_categories - Number of bias categories supported
   * @returns {boolean} results.context_sensitivity_enabled - Whether contextual analysis is active
   * @returns {boolean} results.graduated_scoring_enabled - Whether graduated scoring is active
   * @returns {boolean} results.ml_integration_ready - Whether ML integration is enabled
   * @returns {string} results.last_updated - ISO timestamp of last status check
   * @returns {Object} results.performance_stats - Performance metrics
   * @returns {number} results.performance_stats.total_analyses - Total analyses performed
   * @returns {string} results.performance_stats.avg_processing_time - Average processing time
   * @returns {number} results.performance_stats.compiled_patterns - Number of compiled patterns
   * @returns {Object} results.performance_stats.error_counts - Error counts by type
   * @returns {Object} results.error_tracking - Error tracking information
   * @returns {number} results.error_tracking.total_errors - Total analysis errors
   * @returns {Object} [results.error_tracking.last_error] - Last error that occurred
   * @returns {number} results.error_tracking.initialization_errors - Number of initialization errors
   *
   * @example
   * const status = detector.getStatus();
   * console.log(`Engine healthy: ${status.initialized}`);
   * console.log(`Total analyses: ${status.performance_stats.total_analyses}`);
   * if (status.error_tracking.last_error) {
   *   console.warn('Last error:', status.error_tracking.last_error);
   * }
   */
  getStatus() {
    return {
      initialized: true,
      pattern_categories: BIAS_CATEGORIES.length,
      context_sensitivity_enabled: true,
      graduated_scoring_enabled: true,
      ml_integration_ready: this.options.enableML,
      last_updated: new Date().toISOString(),
      performance_stats: {
        total_analyses: this.performanceStats.totalAnalyses,
        avg_processing_time: this.performanceStats.averageProcessingTime.toFixed(2) + 'ms',
        compiled_patterns: Object.values(this.compiledPatterns).reduce((sum, patterns) => sum + patterns.length, 0),
        error_counts: this.performanceStats.errorCounts
      },
      error_tracking: {
        total_errors: this.errorTracker.analysisErrors.length,
        last_error: this.errorTracker.lastError,
        initialization_errors: this.errorTracker.initializationErrors.length
      }
    };
  }
}

// Export for use in bias detection systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedBiasDetectionEngine;
}

// Make available globally for service worker context
if (typeof self !== 'undefined') {
  self.AiGuardianBiasDetection = self.AiGuardianBiasDetection || {};
  self.AiGuardianBiasDetection.EnhancedBiasDetectionEngine = EnhancedBiasDetectionEngine;
}
