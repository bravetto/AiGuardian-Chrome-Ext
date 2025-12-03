/**
 * Model Loader for AI Guardian Bias Detection
 *
 * Loads and manages TensorFlow.js models for offline bias detection
 */

class ModelLoader {
  constructor(options = {}) {
    this.modelPath = options.modelPath || 'models/bias-detection/model.json';
    this.cacheKey = 'ai_guardian_ml_model_cache';
    this.modelVersion = options.modelVersion || '1.0.0';
    this.model = null;
    this.loadingPromise = null;
    this.loadError = null;
  }

  /**
   * Load model with caching
   */
  async loadModel() {
    // Return cached model if available
    if (this.model) {
      return this.model;
    }

    // Return existing loading promise if already loading
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Start loading
    this.loadingPromise = this._loadModelInternal();

    try {
      this.model = await this.loadingPromise;
      this.loadError = null;
      return this.model;
    } catch (error) {
      this.loadError = error;
      this.loadingPromise = null;
      throw error;
    }
  }

  /**
   * Internal model loading logic
   */
  async _loadModelInternal() {
    if (typeof tf === 'undefined') {
      throw new Error('TensorFlow.js not loaded');
    }

    try {
      // For extension, use chrome.runtime.getURL to get extension-relative path
      const modelUrl = typeof chrome !== 'undefined' && chrome.runtime
        ? chrome.runtime.getURL(this.modelPath)
        : this.modelPath;

      const model = await tf.loadLayersModel(modelUrl);

      // Cache the model
      await this._saveToCache(model);

      if (typeof Logger !== 'undefined') {
        Logger.info('[ModelLoader] Model loaded successfully');
      }

      return model;
    } catch (error) {
      if (typeof Logger !== 'undefined') {
        Logger.error('[ModelLoader] Failed to load model:', error);
      }
      throw error;
    }
  }

  /**
   * Load model from Chrome storage cache
   */
  async _loadFromCache() {
    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        resolve(null);
        return;
      }

      chrome.storage.local.get([this.cacheKey], (data) => {
        if (chrome.runtime.lastError) {
          resolve(null);
          return;
        }

        const cached = data[this.cacheKey];
        if (!cached || cached.version !== this.modelVersion) {
          resolve(null);
          return;
        }

        // In a real implementation, we would reconstruct the model from cached data
        // For now, return null to force reload from file
        resolve(null);
      });
    });
  }

  /**
   * Save model to Chrome storage cache
   */
  async _saveToCache(model) {
    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        resolve();
        return;
      }

      // Store model metadata (not the full model due to size constraints)
      const metadata = {
        version: this.modelVersion,
        loadedAt: new Date().toISOString(),
        modelPath: this.modelPath
      };

      chrome.storage.local.set({ [this.cacheKey]: metadata }, () => {
        if (chrome.runtime.lastError) {
          if (typeof Logger !== 'undefined') {
            Logger.warn('[ModelLoader] Failed to cache model metadata:', chrome.runtime.lastError);
          }
        }
        resolve();
      });
    });
  }

  /**
   * Get model instance (returns null if not loaded)
   */
  getModel() {
    return this.model;
  }

  /**
   * Check if model is loaded
   */
  isLoaded() {
    return this.model !== null;
  }

  /**
   * Clear model cache
   */
  async clearCache() {
    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        resolve();
        return;
      }

      chrome.storage.local.remove([this.cacheKey], () => {
        this.model = null;
        this.loadingPromise = null;
        resolve();
      });
    });
  }

  /**
   * Get loading error if any
   */
  getLoadError() {
    return this.loadError;
  }
}

// Export for use in service worker
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModelLoader;
}
