/**
 * Unit Tests for Gateway Score Extraction Optimization
 * Tests the optimized score extraction order, ScoreUtils functions, and edge cases
 */

import { testRunner } from './test-runner.js';

const { test, assertEqual, assertTrue, assertFalse } = testRunner;

/**
 * Test optimized extraction order - data.bias_score prioritized (primary source)
 */
test('Should prioritize data.bias_score over popup_data.bias_score', () => {
  const gateway = new window.AiGuardianGateway();
  
  const response = {
    success: true,
    service_type: 'biasguard',
    data: {
      bias_score: 0.5,
      popup_data: { bias_score: 0.75 },
      raw_response: [{ bias_score: 0.6 }]
    }
  };
  
  const result = gateway.validateApiResponse(response, 'analyze');
  
  assertTrue(result.isValid, 'Response should be valid');
  assertEqual(result.transformedResponse.score, 0.5, 'Should use data.bias_score (0.5) as primary source');
  // Note: data.bias_score is now prioritized over popup_data.bias_score to prevent issues with zero-defaulted popup data
});

/**
 * Test string score handling
 */
test('Should parse valid string scores correctly', () => {
  const gateway = new window.AiGuardianGateway();
  
  const testCases = [
    { input: { data: { bias_score: '0.75' } }, expected: 0.75 },
    { input: { data: { bias_score: '0' } }, expected: 0 },
    { input: { data: { bias_score: '1' } }, expected: 1 },
    { input: { data: { bias_score: '0.5' } }, expected: 0.5 },
  ];
  
  testCases.forEach(({ input, expected }) => {
    const response = {
      success: true,
      service_type: 'biasguard',
      ...input
    };
    
    const result = gateway.validateApiResponse(response, 'analyze');
    assertTrue(result.isValid, 'Response should be valid');
    assertEqual(result.transformedResponse.score, expected, `String "${input.data.bias_score}" should parse to ${expected}`);
  });
});

/**
 * Test invalid string scores
 */
test('Should handle invalid string scores', () => {
  const gateway = new window.AiGuardianGateway();
  
  const invalidCases = [
    { data: { bias_score: 'N/A' } },
    { data: { bias_score: '' } },
    { data: { bias_score: 'invalid' } },
    { data: { bias_score: 'n/a' } },
  ];
  
  invalidCases.forEach((input) => {
    const response = {
      success: true,
      service_type: 'biasguard',
      ...input
    };
    
    const result = gateway.validateApiResponse(response, 'analyze');
    // Invalid strings should result in null score
    assertEqual(result.transformedResponse.score, null, `Invalid string "${input.data.bias_score}" should result in null score`);
  });
});

/**
 * Test score clamping for out-of-range values
 */
test('Should clamp out-of-range scores to [0, 1]', () => {
  const gateway = new window.AiGuardianGateway();
  
  const testCases = [
    { input: { data: { bias_score: 1.5 } }, expected: 1 },
    { input: { data: { bias_score: -0.5 } }, expected: 0 },
    { input: { data: { bias_score: 2.0 } }, expected: 1 },
    { input: { data: { bias_score: -1.0 } }, expected: 0 },
    { input: { data: { bias_score: '1.5' } }, expected: 1 },
    { input: { data: { bias_score: '-0.5' } }, expected: 0 },
  ];
  
  testCases.forEach(({ input, expected }) => {
    const response = {
      success: true,
      service_type: 'biasguard',
      ...input
    };
    
    const result = gateway.validateApiResponse(response, 'analyze');
    assertTrue(result.isValid, 'Response should be valid');
    assertEqual(result.transformedResponse.score, expected, `Score ${input.data.bias_score} should be clamped to ${expected}`);
  });
});

/**
 * Test edge cases: NaN, Infinity, boolean
 */
test('Should handle edge cases correctly', () => {
  const gateway = new window.AiGuardianGateway();
  
  // NaN should result in null
  const nanResponse = {
    success: true,
    service_type: 'biasguard',
    data: { bias_score: NaN }
  };
  const nanResult = gateway.validateApiResponse(nanResponse, 'analyze');
  assertEqual(nanResult.transformedResponse.score, null, 'NaN should result in null score');
  
  // Infinity should result in null
  const infResponse = {
    success: true,
    service_type: 'biasguard',
    data: { bias_score: Infinity }
  };
  const infResult = gateway.validateApiResponse(infResponse, 'analyze');
  assertEqual(infResult.transformedResponse.score, null, 'Infinity should result in null score');
  
  // Boolean true should convert to 1.0
  const trueResponse = {
    success: true,
    service_type: 'biasguard',
    data: { bias_score: true }
  };
  const trueResult = gateway.validateApiResponse(trueResponse, 'analyze');
  assertEqual(trueResult.transformedResponse.score, 1.0, 'Boolean true should convert to 1.0');
  
  // Boolean false should convert to 0.0
  const falseResponse = {
    success: true,
    service_type: 'biasguard',
    data: { bias_score: false }
  };
  const falseResult = gateway.validateApiResponse(falseResponse, 'analyze');
  assertEqual(falseResult.transformedResponse.score, 0.0, 'Boolean false should convert to 0.0');
});

/**
 * Test extraction order fallback
 */
test('Should fallback to data.bias_score when popup_data.bias_score is missing', () => {
  const gateway = new window.AiGuardianGateway();
  
  const response = {
    success: true,
    service_type: 'biasguard',
    data: {
      bias_score: 0.6,
      // No popup_data
    }
  };
  
  const result = gateway.validateApiResponse(response, 'analyze');
  assertTrue(result.isValid, 'Response should be valid');
  assertEqual(result.transformedResponse.score, 0.6, 'Should fallback to data.bias_score');
});

/**
 * Test missing score handling
 */
test('Should return null score when no score fields are present', () => {
  const gateway = new window.AiGuardianGateway();
  
  const response = {
    success: true,
    service_type: 'biasguard',
    data: {
      // No score fields
      bias_type: 'gender'
    }
  };
  
  const result = gateway.validateApiResponse(response, 'analyze');
  assertTrue(result.isValid, 'Response should be valid');
  assertEqual(result.transformedResponse.score, null, 'Should return null when no score fields present');
});

/**
 * Test valid zero score
 */
test('Should handle valid zero score correctly', () => {
  const gateway = new window.AiGuardianGateway();
  
  const response = {
    success: true,
    service_type: 'biasguard',
    data: {
      bias_score: 0,
      bias_type: 'none'
    }
  };
  
  const result = gateway.validateApiResponse(response, 'analyze');
  assertTrue(result.isValid, 'Response should be valid');
  assertEqual(result.transformedResponse.score, 0, 'Zero score should be preserved (not null)');
});

/**
 * Test extraction from raw_response fallback
 */
test('Should extract score from raw_response when primary fields missing', () => {
  const gateway = new window.AiGuardianGateway();
  
  const response = {
    success: true,
    service_type: 'biasguard',
    data: {
      raw_response: [{ bias_score: 0.8 }]
      // No popup_data or top-level bias_score
    }
  };
  
  const result = gateway.validateApiResponse(response, 'analyze');
  assertTrue(result.isValid, 'Response should be valid');
  assertEqual(result.transformedResponse.score, 0.8, 'Should extract from raw_response[0].bias_score');
});

/**
 * Test is_poisoned=false fallback - should assign low score regardless of confidence
 * This verifies the fix for the issue where confidence was incorrectly inverting the score
 */
test('Should assign score 0.0 when is_poisoned=false regardless of confidence', () => {
  const gateway = new window.AiGuardianGateway();
  
  // Test case 1: is_poisoned=false with high confidence (1.0)
  // Expected: score = 0.0 (backend says "not biased" with high confidence)
  const highConfidenceResponse = {
    success: true,
    service_type: 'biasguard',
    data: {
      raw_response: [{ 
        is_poisoned: false, 
        confidence: 1.0 
      }]
      // No bias_score field
    }
  };
  
  const highConfResult = gateway.validateApiResponse(highConfidenceResponse, 'analyze');
  assertTrue(highConfResult.isValid, 'Response should be valid');
  assertEqual(highConfResult.transformedResponse.score, 0.0, 
    'is_poisoned=false with confidence=1.0 should result in score 0.0');
  
  // Test case 2: is_poisoned=false with low confidence (0.0)
  // Expected: score = 0.0 (backend says "not biased" even with low confidence)
  const lowConfidenceResponse = {
    success: true,
    service_type: 'biasguard',
    data: {
      raw_response: [{ 
        is_poisoned: false, 
        confidence: 0.0 
      }]
      // No bias_score field
    }
  };
  
  const lowConfResult = gateway.validateApiResponse(lowConfidenceResponse, 'analyze');
  assertTrue(lowConfResult.isValid, 'Response should be valid');
  assertEqual(lowConfResult.transformedResponse.score, 0.0, 
    'is_poisoned=false with confidence=0.0 should result in score 0.0 (not 0.3)');
  
  // Test case 3: is_poisoned=false with medium confidence (0.5)
  // Expected: score = 0.0 (backend says "not biased" regardless of confidence)
  const mediumConfidenceResponse = {
    success: true,
    service_type: 'biasguard',
    data: {
      raw_response: [{ 
        is_poisoned: false, 
        confidence: 0.5 
      }]
      // No bias_score field
    }
  };
  
  const mediumConfResult = gateway.validateApiResponse(mediumConfidenceResponse, 'analyze');
  assertTrue(mediumConfResult.isValid, 'Response should be valid');
  assertEqual(mediumConfResult.transformedResponse.score, 0.0, 
    'is_poisoned=false with confidence=0.5 should result in score 0.0 (not 0.15)');
  
  // Test case 4: is_poisoned=false without confidence field
  // Expected: score = 0.0 (default behavior when confidence is missing)
  const noConfidenceResponse = {
    success: true,
    service_type: 'biasguard',
    data: {
      raw_response: [{ 
        is_poisoned: false
        // No confidence, no bias_score
      }]
    }
  };
  
  const noConfResult = gateway.validateApiResponse(noConfidenceResponse, 'analyze');
  assertTrue(noConfResult.isValid, 'Response should be valid');
  assertEqual(noConfResult.transformedResponse.score, 0.0, 
    'is_poisoned=false without confidence should result in score 0.0');
});

/**
 * Test that is_poisoned=false does NOT invert confidence meaning
 * This verifies the fix prevents the bug where high confidence produced low scores
 */
test('Should not invert confidence meaning when is_poisoned=false', () => {
  const gateway = new window.AiGuardianGateway();
  
  // The bug: confidence=1.0 should NOT produce score=0.0 via uncertainty calculation
  // The fix: is_poisoned=false always produces score=0.0 regardless of confidence
  
  const testCases = [
    { confidence: 1.0, expectedScore: 0.0, description: 'High confidence in "not biased" should give low score' },
    { confidence: 0.8, expectedScore: 0.0, description: 'High confidence should give low score' },
    { confidence: 0.5, expectedScore: 0.0, description: 'Medium confidence should give low score' },
    { confidence: 0.2, expectedScore: 0.0, description: 'Low confidence should give low score' },
    { confidence: 0.0, expectedScore: 0.0, description: 'Very low confidence should give low score (not 0.3)' },
  ];
  
  testCases.forEach(({ confidence, expectedScore, description }) => {
    const response = {
      success: true,
      service_type: 'biasguard',
      data: {
        raw_response: [{ 
          is_poisoned: false, 
          confidence: confidence 
        }]
      }
    };
    
    const result = gateway.validateApiResponse(response, 'analyze');
    assertTrue(result.isValid, 'Response should be valid');
    assertEqual(result.transformedResponse.score, expectedScore, 
      `${description} (confidence=${confidence})`);
  });
});

/**
 * Test that is_poisoned=true still works correctly with confidence
 */
test('Should use confidence as score when is_poisoned=true', () => {
  const gateway = new window.AiGuardianGateway();
  
  const testCases = [
    { confidence: 0.9, expectedScore: 0.9 },
    { confidence: 0.7, expectedScore: 0.7 },
    { confidence: 0.5, expectedScore: 0.5 },
    { confidence: 0.3, expectedScore: 0.3 },
    { confidence: 0.1, expectedScore: 0.1 },
  ];
  
  testCases.forEach(({ confidence, expectedScore }) => {
    const response = {
      success: true,
      service_type: 'biasguard',
      data: {
        raw_response: [{ 
          is_poisoned: true, 
          confidence: confidence 
        }]
      }
    };
    
    const result = gateway.validateApiResponse(response, 'analyze');
    assertTrue(result.isValid, 'Response should be valid');
    assertEqual(result.transformedResponse.score, expectedScore, 
      `is_poisoned=true with confidence=${confidence} should use confidence as score`);
  });
});

/**
 * Test edge cases for is_poisoned fallback
 */
test('Should handle edge cases for is_poisoned fallback', () => {
  const gateway = new window.AiGuardianGateway();
  
  // Test case 1: is_poisoned=false with NaN confidence
  const nanConfResponse = {
    success: true,
    service_type: 'biasguard',
    data: {
      raw_response: [{ 
        is_poisoned: false, 
        confidence: NaN 
      }]
    }
  };
  
  const nanResult = gateway.validateApiResponse(nanConfResponse, 'analyze');
  assertTrue(nanResult.isValid, 'Response should be valid');
  assertEqual(nanResult.transformedResponse.score, 0.0, 
    'is_poisoned=false with NaN confidence should default to score 0.0');
  
  // Test case 2: is_poisoned=false with null confidence
  const nullConfResponse = {
    success: true,
    service_type: 'biasguard',
    data: {
      raw_response: [{ 
        is_poisoned: false, 
        confidence: null 
      }]
    }
  };
  
  const nullResult = gateway.validateApiResponse(nullConfResponse, 'analyze');
  assertTrue(nullResult.isValid, 'Response should be valid');
  assertEqual(nullResult.transformedResponse.score, 0.0, 
    'is_poisoned=false with null confidence should default to score 0.0');
  
  // Test case 3: is_poisoned=false with undefined confidence
  const undefinedConfResponse = {
    success: true,
    service_type: 'biasguard',
    data: {
      raw_response: [{ 
        is_poisoned: false
        // confidence is undefined
      }]
    }
  };
  
  const undefinedResult = gateway.validateApiResponse(undefinedConfResponse, 'analyze');
  assertTrue(undefinedResult.isValid, 'Response should be valid');
        assertEqual(undefinedResult.transformedResponse.score, 0.0, 
          'is_poisoned=false with undefined confidence should default to score 0.0');
      });

      /**
       * Test that zero confidence values are NOT skipped
       * This verifies the fix for the bug where popup_data.confidence=0 was incorrectly skipped
       */
      test('Should extract zero confidence scores from popup_data.confidence', () => {
        const gateway = new window.AiGuardianGateway();
        
        // Test case 1: popup_data.confidence = 0.0 (valid zero score)
        const zeroConfidenceResponse = {
          success: true,
          service_type: 'biasguard',
          data: {
            popup_data: { 
              confidence: 0.0 
            }
            // No bias_score field - should use confidence
          }
        };
        
        const zeroResult = gateway.validateApiResponse(zeroConfidenceResponse, 'analyze');
        assertTrue(zeroResult.isValid, 'Response should be valid');
        assertEqual(zeroResult.transformedResponse.score, 0.0, 
          'popup_data.confidence=0.0 should be extracted as score 0.0 (not skipped)');
        
        // Test case 2: popup_data.confidence = 0 with other fields present
        const zeroWithOtherFieldsResponse = {
          success: true,
          service_type: 'biasguard',
          data: {
            bias_score: 0.5, // This should take priority
            popup_data: { 
              confidence: 0.0 
            }
          }
        };
        
        const priorityResult = gateway.validateApiResponse(zeroWithOtherFieldsResponse, 'analyze');
        assertTrue(priorityResult.isValid, 'Response should be valid');
        assertEqual(priorityResult.transformedResponse.score, 0.5, 
          'bias_score should take priority over popup_data.confidence');
        
        // Test case 3: Only popup_data.confidence = 0 (no other score fields)
        const onlyZeroConfidenceResponse = {
          success: true,
          service_type: 'biasguard',
          data: {
            popup_data: { 
              confidence: 0.0 
            }
            // No bias_score, no other score fields
          }
        };
        
        const onlyZeroResult = gateway.validateApiResponse(onlyZeroConfidenceResponse, 'analyze');
        assertTrue(onlyZeroResult.isValid, 'Response should be valid');
        assertEqual(onlyZeroResult.transformedResponse.score, 0.0, 
          'popup_data.confidence=0.0 should be extracted when it\'s the only score field');
      });

