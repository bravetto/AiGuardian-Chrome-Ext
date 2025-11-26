/**
 * ML-Based Bias Detection Engine
 * 
 * Uses TensorFlow.js for offline bias detection with embedded ML model.
 * Replaces regex-based detection with neural network inference.
 * 
 * Pattern: ML × BIAS × DETECTION × OFFLINE × ONE
 */

// Import dependencies (will be loaded via importScripts in service worker)
// TextPreprocessor and ModelLoader are expected to be available globally

class MLBiasDetection {
  constructor(options = {}) {
    this.modelLoader = null;
    this.preprocessor = null;
    this.model = null;
    this.initialized = false;
    this.initializationPromise = null;
    this.options = {
      modelPath: options.modelPath || 'models/bias-detection-model.json',
      fallbackToRegex: options.fallbackToRegex !== false, // Default true
      maxLength: options.maxLength || 256 // Default to 256 to match trained model
    };

    // Initialize preprocessor immediately (no async needed)
    if (typeof TextPreprocessor !== 'undefined') {
      this.preprocessor = new TextPreprocessor({
        maxLength: this.options.maxLength
      });
    }
  }

  /**
   * Initialize the ML model (lazy loading)
   */
  async initialize() {
    if (this.initialized && this.model) {
      return this.model;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initializeInternal();
    
    try {
      this.model = await this.initializationPromise;
      this.initialized = true;
      return this.model;
    } catch (error) {
      this.initializationPromise = null;
      if (typeof Logger !== 'undefined') {
        Logger.error('[MLBiasDetection] Initialization failed:', error);
      }
      throw error;
    }
  }

  /**
   * Internal initialization logic
   */
  async _initializeInternal() {
    // Check if TensorFlow.js is available
    if (typeof tf === 'undefined') {
      throw new Error('TensorFlow.js not loaded. Please ensure tfjs.min.js is loaded before this module.');
    }

    // Initialize model loader
    if (typeof ModelLoader !== 'undefined') {
      this.modelLoader = new ModelLoader({
        modelPath: this.options.modelPath,
        modelVersion: '1.0.0'
      });
    } else {
      throw new Error('ModelLoader not available');
    }

    // Load the model
    try {
      this.model = await this.modelLoader.loadModel();
      
      if (typeof Logger !== 'undefined') {
        Logger.info('[MLBiasDetection] Model loaded successfully');
      }

      return this.model;
    } catch (error) {
      if (typeof Logger !== 'undefined') {
        Logger.error('[MLBiasDetection] Failed to load model:', error);
      }
      throw error;
    }
  }

  /**
   * Detect bias in text using ML model
   * @param {string} text - Text to analyze
   * @param {Object} options - Analysis options
   * @returns {Object} Bias detection result (matches OnboardBiasDetection format)
   */
  async detectBias(text, options = {}) {
    const startTime = performance.now();

    try {
      // Validate input
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return this._createEmptyResult(performance.now() - startTime);
      }

      // Ensure model is initialized
      if (!this.initialized || !this.model) {
        try {
          await this.initialize();
        } catch (initError) {
          // Fallback to regex if ML model fails
          if (this.options.fallbackToRegex && typeof OnboardBiasDetection !== 'undefined') {
            if (typeof Logger !== 'undefined') {
              Logger.warn('[MLBiasDetection] Falling back to regex-based detection');
            }
            const regexDetector = new OnboardBiasDetection();
            return regexDetector.detectBias(text, options);
          }
          throw initError;
        }
      }

      // Preprocess text
      if (!this.preprocessor) {
        throw new Error('TextPreprocessor not available');
      }

      const preprocessed = this.preprocessor.preprocess(text);

      // Run inference
      const predictions = await this._runInference(preprocessed);

      // Postprocess results to match expected format
      const result = this._postprocessResults(predictions, text, preprocessed, startTime);

      return result;
    } catch (error) {
      // Fallback to regex if ML inference fails
      if (this.options.fallbackToRegex && typeof OnboardBiasDetection !== 'undefined') {
        if (typeof Logger !== 'undefined') {
          Logger.warn('[MLBiasDetection] ML inference failed, falling back to regex:', error);
        }
        try {
          const regexDetector = new OnboardBiasDetection();
          return regexDetector.detectBias(text, options);
        } catch (fallbackError) {
          if (typeof Logger !== 'undefined') {
            Logger.error('[MLBiasDetection] Both ML and regex detection failed:', fallbackError);
          }
        }
      }

      // Return error result
      return {
        success: false,
        bias_detected: false,
        bias_score: 0.0,
        bias_types: [],
        bias_details: {},
        mitigation_suggestions: ['Error in ML bias detection'],
        fairness_score: 0.5,
        confidence: 0.0,
        processing_time: performance.now() - startTime,
        error: error.message,
        source: 'onboard-ml'
      };
    }
  }

  /**
   * Run model inference
   * @param {Object} preprocessed - Preprocessed text data
   * @returns {Promise<Object>} Model predictions
   */
  async _runInference(preprocessed) {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    // Convert tokens to tensor
    const inputTensor = tf.tensor2d([preprocessed.tokens], [1, preprocessed.tokens.length]);

    try {
      // Run prediction
      const prediction = this.model.predict(inputTensor);
      
      // Get prediction values
      const predictionData = await prediction.data();
      
      // Clean up tensors
      inputTensor.dispose();
      prediction.dispose();

      // Model output format:
      // [bias_score, gender_bias, racial_bias, age_bias, socioeconomic_bias, ability_bias]
      // Or single bias_score if model is simpler
      return {
        bias_score: predictionData[0] || 0.0,
        category_scores: predictionData.length > 1 ? {
          gender_bias: predictionData[1] || 0.0,
          racial_bias: predictionData[2] || 0.0,
          age_bias: predictionData[3] || 0.0,
          socioeconomic_bias: predictionData[4] || 0.0,
          ability_bias: predictionData[5] || 0.0
        } : null
      };
    } catch (error) {
      inputTensor.dispose();
      throw error;
    }
  }

  /**
   * Postprocess model predictions to match expected format
   * @param {Object} predictions - Raw model predictions
   * @param {string} text - Original text
   * @param {Object} preprocessed - Preprocessed data
   * @param {number} startTime - Start time for processing
   * @returns {Object} Formatted result
   */
  _postprocessResults(predictions, text, preprocessed, startTime) {
    const biasScore = Math.max(0, Math.min(1, predictions.bias_score || 0.0));
    const biasDetected = biasScore > 0.05;

    // Determine bias types from category scores or overall score
    const biasTypes = [];
    const biasDetails = {};

    if (predictions.category_scores) {
      const threshold = 0.3;
      const categories = ['gender_bias', 'racial_bias', 'age_bias', 'socioeconomic_bias', 'ability_bias'];
      
      for (const category of categories) {
        const score = predictions.category_scores[category] || 0.0;
        if (score > threshold) {
          biasTypes.push(category);
          biasDetails[category] = score;
        }
      }
    } else {
      // If no category scores, use overall score to infer types
      if (biasScore > 0.3) {
        // Use feature extraction to determine likely bias types
        const features = preprocessed.features || {};
        if (features.demographicMentions) {
          const mentions = features.demographicMentions;
          if (mentions.gender > 0) biasTypes.push('gender_bias');
          if (mentions.race > 0) biasTypes.push('racial_bias');
          if (mentions.age > 0) biasTypes.push('age_bias');
          if (mentions.ability > 0) biasTypes.push('ability_bias');
          if (mentions.socioeconomic > 0) biasTypes.push('socioeconomic_bias');
        }
      }
    }

    // Calculate fairness score (inverse of bias score)
    const fairnessScore = Math.max(0, Math.min(1, 1.0 - biasScore * 0.8));

    // Generate mitigation suggestions
    const suggestions = this._generateMitigationSuggestions(biasTypes);

    // Calculate confidence based on model certainty
    const confidence = Math.min(0.99, Math.max(0.5, biasScore + 0.2));

    const processingTime = performance.now() - startTime;

    return {
      success: true,
      bias_detected: biasDetected,
      bias_score: biasScore,
      bias_types: biasTypes,
      bias_details: biasDetails,
      mitigation_suggestions: suggestions,
      fairness_score: fairnessScore,
      confidence: confidence,
      processing_time: processingTime,
      source: 'onboard-ml',
      transcendent: true,
      transparency: {
        model_version: '1.0.0',
        preprocessing_time: preprocessed.processingTime,
        inference_time: processingTime - preprocessed.processingTime,
        text_length: text.length,
        token_count: preprocessed.tokenCount,
        features: preprocessed.features
      }
    };
  }

  /**
   * Generate mitigation suggestions based on detected bias types
   */
  _generateMitigationSuggestions(biasTypes) {
    const suggestions = [];

    if (biasTypes.includes('gender_bias')) {
      suggestions.push('Use gender-neutral language (they/them instead of he/she)');
      suggestions.push('Include diverse gender examples');
    }

    if (biasTypes.includes('racial_bias')) {
      suggestions.push('Avoid racial stereotypes and generalizations');
      suggestions.push('Use inclusive language that respects all ethnicities');
    }

    if (biasTypes.includes('age_bias')) {
      suggestions.push('Avoid age-based assumptions or stereotypes');
      suggestions.push('Use inclusive language for all age groups');
    }

    if (biasTypes.includes('socioeconomic_bias')) {
      suggestions.push('Avoid assumptions about economic status');
      suggestions.push('Use inclusive language that doesn\'t assume privilege');
    }

    if (biasTypes.includes('ability_bias')) {
      suggestions.push('Use person-first language (person with disability)');
      suggestions.push('Avoid ableist language and assumptions');
    }

    if (suggestions.length === 0) {
      suggestions.push('Text appears to be relatively unbiased');
    }

    return suggestions;
  }

  /**
   * Create empty result for invalid input
   */
  _createEmptyResult(processingTime) {
    return {
      success: true,
      bias_detected: false,
      bias_score: 0.0,
      bias_types: [],
      bias_details: {},
      mitigation_suggestions: ['No text provided for analysis'],
      fairness_score: 1.0,
      confidence: 0.5,
      processing_time: processingTime,
      source: 'onboard-ml'
    };
  }

  /**
   * Check if model is ready
   */
  isReady() {
    return this.initialized && this.model !== null;
  }

  /**
   * Get model status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      modelLoaded: this.model !== null,
      preprocessorReady: this.preprocessor !== null,
      modelLoaderReady: this.modelLoader !== null
    };
  }
}

// Export for use in service worker
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MLBiasDetection;
}

