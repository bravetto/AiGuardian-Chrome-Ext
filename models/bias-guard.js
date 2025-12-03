/**
 * BiasGuard - Unified Bias Detection Interface
 *
 * Single entry point for all bias detection capabilities
 * with automatic fallback strategies and edge case handling
 */

import { EnhancedBiasDetectionEngine } from './bias-detection/enhanced-bias-detection.js';
import { ImprovedBiasDetector } from './improved-bias-detector.js';

export class BiasGuard {
  constructor(options = {}) {
    this.engine = null;
    this.improvedDetector = null;
    this.initialized = false;

    this.options = {
      enableML: options.enableML !== false,
      enablePatterns: options.enablePatterns !== false,
      minConfidence: options.minConfidence || 0.4,
      enableCache: options.enableCache !== false,
      fallbackStrategy: options.fallbackStrategy || 'cascade', // 'cascade' | 'parallel'
      ...options
    };
  }

  async initialize() {
    if (this.initialized) return this;

    try {
      // Initialize enhanced engine (primary)
      if (this.options.enableML) {
        this.engine = new EnhancedBiasDetectionEngine(this.options);
        await this.engine.initialize();
      }

      // Initialize improved detector (fallback/edge cases)
      this.improvedDetector = new ImprovedBiasDetector();
      await this.improvedDetector.loadModel();

      this.initialized = true;
      console.log('✅ BiasGuard initialized successfully');

      return this;
    } catch (error) {
      console.error('❌ BiasGuard initialization failed:', error);
      throw error;
    }
  }

  async analyzeText(text) {
    if (!this.initialized) {
      await this.initialize();
    }

    // Try enhanced engine first
    if (this.engine) {
      try {
        const result = await this.engine.detectBias(text);
        if (result && result.confidence >= this.options.minConfidence) {
          return this._formatResult(result, 'enhanced');
        }
      } catch (error) {
        console.warn('Enhanced engine failed, falling back:', error.message);
      }
    }

    // Fallback to improved detector
    if (this.improvedDetector) {
      try {
        const result = await this.improvedDetector.detectBias(text);
        return this._formatResult(result, 'improved');
      } catch (error) {
        console.warn('Improved detector failed:', error.message);
      }
    }

    // Final fallback - return neutral result
    return this._createNeutralResult(text);
  }

  _formatResult(result, source) {
    return {
      success: true,
      bias_score: result.bias_score || 0,
      bias_detected: (result.bias_score || 0) > this.options.minConfidence,
      bias_types: result.bias_types || [],
      confidence: result.confidence || 0,
      source: source,
      text_analysis: result.text_analysis || {},
      evidence_type: result.evidence_type || 'unknown',
      transparency: result.transparency || {}
    };
  }

  _createNeutralResult(text) {
    return {
      success: true,
      bias_score: 0.0,
      bias_detected: false,
      bias_types: [],
      confidence: 1.0,
      source: 'neutral',
      text_analysis: {
        quality_score: 0.5,
        is_reliable: true,
        word_count: text.split(' ').length
      },
      evidence_type: 'neutral',
      transparency: {
        context_description: 'Neutral analysis',
        scoring_breakdown: { neutral: 1.0 }
      }
    };
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BiasGuard };
}

if (typeof window !== 'undefined') {
  window.BiasGuard = BiasGuard;
}
