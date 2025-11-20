/**
   * Validate and normalize API response data from the backend.
   * RESOLVED: Merges feature/clerk-auth-bridge (robust 0 checks) with dev (smart fallback calculations).
   */
  validateApiResponse(response, endpoint) {
    const errors = [];
    let transformedResponse = null;

    if (!response || typeof response !== 'object') {
      errors.push('Response is null, undefined, or not an object');
      return { isValid: false, errors, transformedResponse };
    }

    // Validate response structure based on endpoint
    if (endpoint === 'analyze') {
      // Check if response indicates an error BEFORE transformation
      if (
        response.success === false ||
        response.error ||
        (response.status && response.status >= 400) ||
        (response.detail && typeof response.detail === 'string')
      ) {
        return {
          isValid: false,
          errors: ['API error response'],
          transformedResponse: {
            success: false,
            error: response.error || response.detail || response.message || 'API request failed',
            status: response.status,
            raw: response,
          },
        };
      }

      // Expect backend envelope: { success, data, ... }
      if (typeof response.success !== 'boolean') {
        errors.push('Response missing success boolean');
      }
      if (!Object.prototype.hasOwnProperty.call(response, 'data')) {
        errors.push('Response missing data field');
      }

      const data = response.data || {};

      // Score validation and clamping utilities
      const ScoreUtils = {
        clampScore(score) {
          return Math.max(0, Math.min(1, score));
        },
        isValidScore(value) {
          return typeof value === 'number' &&
            !Number.isNaN(value) &&
            isFinite(value) &&
            value >= 0 &&
            value <= 1;
        },
        isZero(value) {
          return value === 0 || value === 0.0 || Object.is(value, -0) || Object.is(value, 0);
        },
        normalizeScore(value, source = 'unknown') {
          if (value === null || value === undefined) {
            return null;
          }
          // Handle string-to-number conversion
          if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed === '' || trimmed.toLowerCase() === 'na' || trimmed.toLowerCase() === 'n/a') {
              return null;
            }
            const parsed = parseFloat(trimmed);
            if (!Number.isNaN(parsed) && isFinite(parsed)) {
              return this.clampScore(parsed);
            }
            return null;
          }
          // Handle number type
          if (typeof value === 'number') {
            if (Number.isNaN(value) || !isFinite(value)) return null;
            return this.clampScore(value);
          }
          // Handle boolean
          if (typeof value === 'boolean') {
            return value ? 1.0 : 0.0;
          }
          return null;
        }
      };

      const extractScore = (value, source) => {
        return ScoreUtils.normalizeScore(value, source);
      };

      // Derive a generic score for the UI
      let score = null;
      let scoreSource = 'none';

      const serviceType = response.service_type || response.serviceType || 'unknown';

      let extractionPaths = [];

      if (serviceType === 'biasguard' || serviceType === 'bias_guard') {
        const rawResponseBiasScore = Array.isArray(data.raw_response) && data.raw_response.length > 0
          ? data.raw_response[0]?.bias_score : null;
        const rawResponseScore = Array.isArray(data.raw_response) && data.raw_response.length > 0
          ? data.raw_response[0]?.score : null;

        extractionPaths = [
          // Priority 1: Top-level bias_score (primary field - most reliable source)
          { value: data.bias_score, source: 'data.bias_score' },
          // Priority 2: popup_data.bias_score (backend always includes this for Chrome)
          { value: data.popup_data?.bias_score, source: 'data.popup_data.bias_score' },
          // Priority 3: raw_response[0].bias_score (fallback)
          { value: rawResponseBiasScore, source: 'raw_response[0].bias_score' },
          { value: data.result?.bias_score, source: 'data.result.bias_score' },
          { value: data.analysis?.bias_score, source: 'data.analysis.bias_score' },
          { value: response.bias_score, source: 'response.bias_score' },
          // Priority 4: popup_data.confidence (Zero is valid per Feature branch)
          { value: data.popup_data?.confidence, source: 'data.popup_data.confidence' },
          // Generic fallbacks
          { value: data.score, source: 'data.score' },
        ];
      } else if (serviceType === 'trustguard' || serviceType === 'trust_guard') {
        extractionPaths = [
          { value: data.trust_score, source: 'data.trust_score' },
          { value: data.result?.trust_score, source: 'data.result.trust_score' },
          { value: data.score, source: 'data.score' },
        ];
      } else {
        extractionPaths = [
          { value: data.bias_score, source: 'data.bias_score' },
          { value: data.trust_score, source: 'data.trust_score' },
          { value: data.score, source: 'data.score' },
          { value: data.confidence, source: 'data.confidence' },
        ];
      }

      // Try each extraction path
      for (const path of extractionPaths) {
        // MERGE DECISION: We use Feature branch logic here.
        // Zero is a valid score value. We do not skip it.
        const extracted = extractScore(path.value, path.source);
        if (extracted !== null) {
          score = extracted;
          scoreSource = path.source;
          break;
        }
      }

      // FALLBACK: For BiasGuard, only check if score is still null
      if (score === null && (serviceType === 'biasguard' || serviceType === 'bias_guard')) {
        const rawResponse = data.raw_response;
        if (Array.isArray(rawResponse) && rawResponse.length > 0) {
          const firstResult = rawResponse[0];

          // Check is_poisoned only if bias_score truly doesn't exist
          if (typeof firstResult.is_poisoned === 'boolean' && firstResult.bias_score === undefined) {
            Logger.warn('[Gateway] Using is_poisoned fallback (backward compatibility mode)');

            if (firstResult.is_poisoned === false) {
              // MERGE DECISION: We use Dev branch logic here.
              // It is smarter to calculate based on uncertainty than just force 0.0.
              const confidence = typeof firstResult.confidence === 'number' && !Number.isNaN(firstResult.confidence)
                ? firstResult.confidence
                : 1.0;

              // Scale uncertainty to a low bias range (0-0.3)
              // confidence=1.0 -> score=0.0
              // confidence=0.0 -> score=0.3
              const uncertainty = 1 - confidence;
              const calculatedScore = uncertainty * 0.3;
              score = ScoreUtils.clampScore(calculatedScore);
              scoreSource = 'derived from raw_response[0].confidence (is_poisoned=false fallback)';

              Logger.info('[Gateway] Calculated score from confidence (is_poisoned=false):', {
                confidence,
                calculatedScore: score
              });
            } else if (firstResult.is_poisoned === true) {
              const confidence = typeof firstResult.confidence === 'number' && !Number.isNaN(firstResult.confidence)
                ? firstResult.confidence
                : 0.5;
              score = ScoreUtils.clampScore(confidence);
              scoreSource = 'derived from raw_response[0].is_poisoned=true (fallback)';
            }
          }
        }
      }

      if (score === null) {
        scoreSource = 'not found';
      } else {
        // Final clamp
        score = ScoreUtils.clampScore(score);
      }

      Logger.info('[Gateway] 📊 Score Extraction Summary:', {
        finalScore: score,
        source: scoreSource,
        isZero: ScoreUtils.isZero(score),
        isMissing: score === null,
        diagnosticNote: ScoreUtils.isZero(score) && scoreSource.includes('is_poisoned=false')
          ? 'Score is 0 because backend returned is_poisoned=false.'
          : score === null
          ? 'No score field found in backend response.'
          : 'Score successfully extracted.',
      });

      transformedResponse = {
        success: !!response.success,
        score,
        analysis: {
          ...data,
          service_type: response.service_type,
          processing_time: response.processing_time,
          metadata: response.metadata,
        },
        raw: response,
      };
    }

    return {
      isValid: errors.length === 0,
      errors,
      transformedResponse,
    };
  }