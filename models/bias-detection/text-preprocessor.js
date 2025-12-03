/**
 * Text Preprocessor for AI Guardian Bias Detection
 *
 * Handles tokenization, normalization, and feature extraction for ML model input
 */

class TextPreprocessor {
  constructor(options = {}) {
    this.maxLength = options.maxLength || 256;
    this.vocabSize = options.vocabSize || 5000;
    this.tokenizer = this._buildTokenizer();
  }

  /**
   * Build a simple word-level tokenizer
   */
  _buildTokenizer() {
    // Simple word-based tokenizer with common bias-related terms
    const biasTerms = [
      'gender', 'race', 'ethnicity', 'age', 'religion', 'ability',
      'male', 'female', 'man', 'woman', 'boy', 'girl',
      'white', 'black', 'asian', 'hispanic', 'latino',
      'young', 'old', 'elderly', 'senior',
      'disabled', 'handicapped', 'able-bodied', 'privileged', 'underprivileged',
      'rich', 'poor', 'wealthy', 'poverty'
    ];

    return {
      encode: (text) => this._simpleEncode(text),
      decode: (tokens) => this._simpleDecode(tokens)
    };
  }

  /**
   * Simple tokenization: split by whitespace and punctuation
   */
  _simpleEncode(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    // Normalize text: lowercase, remove extra whitespace
    const normalized = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Split into words and map to vocabulary indices (simplified)
    const words = normalized.split(' ');
    const tokens = words.map(word => {
      // Simple hash function for vocabulary mapping (0-4999)
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = ((hash << 5) - hash) + word.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash) % this.vocabSize;
    });

    // Pad or truncate to maxLength
    if (tokens.length > this.maxLength) {
      return tokens.slice(0, this.maxLength);
    } else {
      return tokens.concat(new Array(this.maxLength - tokens.length).fill(0));
    }
  }

  /**
   * Simple decode (for debugging)
   */
  _simpleDecode(tokens) {
    // Simplified decode - just return token indices
    return tokens.join(' ');
  }

  /**
   * Preprocess text for model input
   */
  preprocess(text) {
    const tokens = this.tokenizer.encode(text);

    // Extract additional features
    const features = this._extractFeatures(text);

    return {
      tokens: tokens,
      features: features,
      originalLength: text.length,
      processedLength: tokens.length
    };
  }

  /**
   * Extract additional features beyond tokenization
   */
  _extractFeatures(text) {
    const lowerText = text.toLowerCase();

    return {
      wordCount: text.split(/\s+/).length,
      sentenceCount: (text.match(/[.!?]+/g) || []).length,
      averageWordLength: text.length / Math.max(1, text.split(/\s+/).length),

      // Demographic mentions
      demographicMentions: {
        gender: (lowerText.match(/\b(man|men|woman|women|boy|boys|girl|girls|male|female|he|him|his|she|her|hers|they|them|their)\b/g) || []).length,
        race: (lowerText.match(/\b(white|black|asian|hispanic|latino|native|indigenous)\b/g) || []).length,
        age: (lowerText.match(/\b(young|old|elderly|senior|junior|adult|child|teenager)\b/g) || []).length,
        religion: (lowerText.match(/\b(christian|muslim|jewish|hindu|buddhist|atheist|agnostic)\b/g) || []).length,
        ability: (lowerText.match(/\b(disabled|handicapped|able-bodied|neurotypical|neurodivergent)\b/g) || []).length
      },

      // Bias pattern matches
      biasPatternMatches: this._countBiasPatterns(lowerText),

      // Sentiment indicators (simplified)
      sentimentIndicators: {
        negative: (lowerText.match(/\b(bad|worst|terrible|awful|hate|dislike|wrong|incorrect)\b/g) || []).length,
        positive: (lowerText.match(/\b(good|best|great|excellent|love|like|right|correct)\b/g) || []).length,
        neutral: (lowerText.match(/\b(ok|okay|fine|average|normal|standard)\b/g) || []).length
      }
    };
  }

  /**
   * Count various bias-related patterns
   */
  _countBiasPatterns(text) {
    const patterns = [
      // Direct bias indicators
      /\b(should|must|always|never)\b.*\b(all|every|no)\b.*\b(people|women|men)\b/i,
      /\b(better|worse|more|less|superior|inferior)\b.*\b(because|since)\b.*\b(gender|race|age)\b/i,

      // Stereotype patterns
      /\b(women|girls)\b.*\b(are|is)\b.*\b(emotional|nurturing|weak)/i,
      /\b(men|boys)\b.*\b(are|is)\b.*\b(strong|aggressive|logical)/i,
      /\b(black|brown)\b.*\b(people|person)\b.*\b(athletic|musical|rhythmic)/i,
      /\b(asian|oriental)\b.*\b(people|person)\b.*\b(smart|math|science)/i,

      // Privilege indicators
      /\b(privileged|underprivileged|disadvantaged|advantaged)\b/i,
      /\b(legacy|connections|network|old\s+boys)\b/i,

      // Age discrimination
      /\b(too\s+(young|old)|overqualified|underqualified)\b/i,
      /\b(fresh|recent)\s+(graduate|graduates)\b/i
    ];

    return patterns.reduce((count, pattern) => {
      return count + (text.match(pattern) || []).length;
    }, 0);
  }
}

// Export for use in service worker and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextPreprocessor;
}

export { TextPreprocessor };
