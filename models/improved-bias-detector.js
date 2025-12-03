/**
 * Improved Bias Detection Model with Edge Case Handling
 * Addresses issues found in comprehensive edge case testing
 */

import * as tf from '@tensorflow/tfjs-node';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ImprovedBiasDetector {
  constructor() {
    this.model = null;
    this.isLoaded = false;
    this.config = {
      minWordsForBias: 3,      // Minimum words needed for reliable bias detection
      maxBiasScore: 1.0,       // Maximum allowed bias score
      minBiasScore: 0.0,       // Minimum allowed bias score
      categoryThresholds: {    // Minimum scores for category detection
        gender: 0.4,
        racial: 0.4,
        age: 0.4,
        socioeconomic: 0.4,
        ability: 0.4
      },
      confidenceThreshold: 0.6, // Minimum confidence for bias flagging
      lengthPenaltyFactor: 3,   // Word count for full scoring weight
      qualityIndicators: {      // Words that indicate bias potential
        biasWords: /\b(better|worse|superior|inferior|stupid|lazy|criminal|dumb|smart|strong|weak|good|bad|right|wrong)\b/i,
        contextWords: /\b(women|men|people|race|age|class|disability|gender|sex|ethnic|religion|poor|rich)\b/i
      }
    };
  }

  /**
   * Load the TensorFlow.js model
   */
  async loadModel() {
    try {
      console.log('📥 Loading improved bias detection model...');
      const modelPath = path.join(__dirname, 'models', 'bias-detection-model.json');
      this.model = await tf.loadLayersModel(`file://${modelPath}`);
      this.isLoaded = true;
      console.log('✅ Model loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load model:', error.message);
      throw error;
    }
  }

  /**
   * Enhanced tokenizer with better edge case handling
   */
  tokenize(text, vocabSize = 5000, maxLength = 256) {
    if (!text || typeof text !== 'string') {
      return new Array(maxLength).fill(0);
    }

    // Enhanced preprocessing
    const normalized = text
      .toLowerCase()
      // Remove URLs
      .replace(/https?:\/\/[^\s]+/g, ' ')
      // Remove emails
      .replace(/[^\s]+@[^\s]+\.[^\s]+/g, ' ')
      // Remove HTML tags
      .replace(/<[^>]*>/g, ' ')
      // Remove markdown
      .replace(/[*_`~]/g, ' ')
      // Normalize unicode
      .normalize('NFKD')
      .replace(/[^\w\s]/g, ' ')
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim();

    const words = normalized.split(/\s+/).filter(word => word.length > 0 && word.length < 50);

    // Enhanced hashing for better distribution
    const tokens = words.map(word => {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = ((hash << 5) - hash) + word.charCodeAt(i);
        hash = hash >>> 0; // Convert to unsigned 32-bit
      }
      return Math.abs(hash) % vocabSize;
    });

    // Pad or truncate
    while (tokens.length < maxLength) {
      tokens.push(0);
    }
    return tokens.slice(0, maxLength);
  }

  /**
   * Analyze text quality and context
   */
  analyzeTextQuality(text) {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;

    const hasBiasWords = this.config.qualityIndicators.biasWords.test(text);
    const hasContextWords = this.config.qualityIndicators.contextWords.test(text);

    let qualityScore = 1.0;

    // Length-based quality adjustment
    if (wordCount < this.config.minWordsForBias) {
      qualityScore *= Math.max(0.1, wordCount / this.config.minWordsForBias);
    }

    // Content-based quality adjustment
    if (!hasContextWords && wordCount < 10) {
      qualityScore *= 0.3; // Low confidence for short text without context
    }

    if (!hasBiasWords && wordCount < 15) {
      qualityScore *= 0.7; // Reduced confidence for non-bias-indicating text
    }

    return {
      wordCount,
      hasBiasWords,
      hasContextWords,
      qualityScore,
      isReliable: wordCount >= this.config.minWordsForBias && (hasContextWords || hasBiasWords)
    };
  }

  /**
   * Apply score normalization based on text characteristics
   */
  normalizeScore(rawScore, textQuality) {
    let normalizedScore = rawScore;

    // Apply length-based scaling
    const lengthMultiplier = Math.min(1, textQuality.wordCount / this.config.lengthPenaltyFactor);
    normalizedScore *= lengthMultiplier;

    // Apply quality-based scaling
    normalizedScore *= textQuality.qualityScore;

    // Clamp to valid range
    normalizedScore = Math.max(this.config.minBiasScore,
                              Math.min(this.config.maxBiasScore, normalizedScore));

    return normalizedScore;
  }

  /**
   * Apply category-specific thresholding
   */
  applyCategoryThresholds(categories) {
    const filtered = { ...categories };
    Object.keys(this.config.categoryThresholds).forEach(category => {
      const threshold = this.config.categoryThresholds[category];
      filtered[category] = filtered[category] < threshold ? 0 : filtered[category];
    });
    return filtered;
  }

  /**
   * Calculate overall confidence score
   */
  calculateConfidence(overallScore, categories, textQuality) {
    // Combine multiple factors for confidence
    let confidence = overallScore;

    // Boost confidence if multiple categories detected
    const activeCategories = Object.values(categories).filter(score => score > 0.1).length;
    if (activeCategories > 1) {
      confidence *= 1.2;
    }

    // Reduce confidence for unreliable text
    if (!textQuality.isReliable) {
      confidence *= 0.5;
    }

    // Quality-based adjustment
    confidence *= textQuality.qualityScore;

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Main detection function with comprehensive edge case handling
   */
  async detectBias(text) {
    if (!this.isLoaded) {
      await this.loadModel();
    }

    try {
      // Input validation
      if (!text || typeof text !== 'string') {
        return this.createNeutralResult('Invalid input: text must be a non-empty string');
      }

      const trimmedText = text.trim();
      if (trimmedText.length === 0) {
        return this.createNeutralResult('Empty text input');
      }

      // Analyze text quality
      const textQuality = this.analyzeTextQuality(trimmedText);

      // Early return for unreliable short text
      if (!textQuality.isReliable && textQuality.wordCount < 2) {
        return this.createNeutralResult('Text too short for reliable bias detection', textQuality);
      }

      // Tokenize input
      const tokens = this.tokenize(trimmedText);
      const input = tf.tensor2d([tokens], [1, 256]);

      // Run inference
      const prediction = this.model.predict(input);
      const rawResults = await prediction.data();

      // Extract results
      const rawOverallScore = rawResults[0];
      const rawCategories = {
        gender: rawResults[1],
        racial: rawResults[2],
        age: rawResults[3],
        socioeconomic: rawResults[4],
        ability: rawResults[5]
      };

      // Apply improvements
      const overallScore = this.normalizeScore(rawOverallScore, textQuality);
      const categories = this.applyCategoryThresholds(rawCategories);
      const confidence = this.calculateConfidence(overallScore, categories, textQuality);

      // Determine primary bias type
      const primaryCategory = Object.entries(categories)
        .filter(([_, score]) => score > 0)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || null;

      // Determine if bias is detected
      const biasDetected = overallScore > this.config.confidenceThreshold &&
                          confidence > 0.5 &&
                          primaryCategory !== null;

      // Clean up tensors
      input.dispose();
      prediction.dispose();

      return {
        success: true,
        bias_score: overallScore,
        bias_detected: biasDetected,
        confidence: confidence,
        primary_bias_type: primaryCategory,
        bias_categories: categories,
        text_analysis: {
          word_count: textQuality.wordCount,
          has_bias_indicators: textQuality.hasBiasWords,
          has_context_words: textQuality.hasContextWords,
          quality_score: textQuality.qualityScore,
          is_reliable: textQuality.isReliable
        },
        metadata: {
          model_version: 'improved-v1',
          processing_time: Date.now(),
          raw_scores: {
            overall: rawOverallScore,
            categories: rawCategories
          }
        }
      };

    } catch (error) {
      console.error('Bias detection error:', error);
      return {
        success: false,
        error: error.message,
        bias_score: 0,
        bias_detected: false,
        confidence: 0
      };
    }
  }

  /**
   * Create a neutral result for edge cases
   */
  createNeutralResult(reason, textQuality = null) {
    return {
      success: true,
      bias_score: 0,
      bias_detected: false,
      confidence: 1.0, // High confidence that this is neutral
      primary_bias_type: null,
      bias_categories: {
        gender: 0,
        racial: 0,
        age: 0,
        socioeconomic: 0,
        ability: 0
      },
      text_analysis: textQuality || {
        word_count: 0,
        has_bias_indicators: false,
        has_context_words: false,
        quality_score: 0,
        is_reliable: false
      },
      metadata: {
        model_version: 'improved-v1',
        processing_time: Date.now(),
        neutral_reason: reason
      }
    };
  }
}

// Export for use in other modules
export { ImprovedBiasDetector };

// Test the improved detector
async function testImprovedDetector() {
  console.log('🧪 Testing Improved Bias Detector...\n');

  const detector = new ImprovedBiasDetector();
  await detector.loadModel();

  const testCases = [
    { text: "", expected: "neutral (empty)" },
    { text: "Men", expected: "neutral (too short)" },
    { text: "Bad men", expected: "neutral (insufficient context)" },
    { text: "Women are better than men at programming", expected: "high gender bias" },
    { text: "White people are more intelligent", expected: "high racial bias" },
    { text: "Young people are lazy", expected: "high age bias" },
    { text: "This is neutral content with no bias", expected: "neutral" },
    { text: "Visit https://example.com for info", expected: "neutral (URL filtered)" },
    { text: "**Bold** and *italic* text", expected: "neutral (markdown filtered)" }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`Test ${i + 1}: "${testCase.text}"`);
    console.log(`Expected: ${testCase.expected}`);

    const result = await detector.detectBias(testCase.text);

    console.log(`Result: bias_score=${result.bias_score.toFixed(4)}, detected=${result.bias_detected}, confidence=${result.confidence.toFixed(4)}`);
    if (result.primary_bias_type) {
      console.log(`Primary type: ${result.primary_bias_type} (${result.bias_categories[result.primary_bias_type].toFixed(4)})`);
    }
    console.log(`Text quality: words=${result.text_analysis.word_count}, reliable=${result.text_analysis.is_reliable}`);
    console.log('─'.repeat(60));
  }

  console.log('✅ Improved detector testing complete!');
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testImprovedDetector().catch(console.error);
}
