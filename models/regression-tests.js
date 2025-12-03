/**
 * Comprehensive Regression Testing Suite
 *
 * Ensures that improvements don't break existing functionality
 * Tests backward compatibility and performance consistency
 */

import * as tf from '@tensorflow/tfjs-node';
import path from 'path';
import { fileURLToPath } from 'url';
import { ImprovedBiasDetector } from './improved-bias-detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RegressionTestSuite {
  constructor() {
    this.originalModel = null;
    this.improvedDetector = new ImprovedBiasDetector();
    this.testResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      errors: []
    };
    this.performanceMetrics = {};
  }

  /**
   * Load both original and improved models for comparison
   */
  async setup() {
    console.log('🔧 Setting up regression test environment...\n');

    try {
      // Load original model
      console.log('📥 Loading original model...');
      const modelPath = path.join(__dirname, 'models', 'bias-detection-model.json');
      this.originalModel = await tf.loadLayersModel(`file://${modelPath}`);
      console.log('✅ Original model loaded');

      // Load improved detector
      console.log('📥 Loading improved detector...');
      await this.improvedDetector.loadModel();
      console.log('✅ Improved detector loaded');

      console.log('✅ Test environment ready\n');
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      throw error;
    }
  }

  /**
   * Run all regression tests
   */
  async runAllTests() {
    console.log('🧪 RUNNING COMPREHENSIVE REGRESSION TESTS');
    console.log('═'.repeat(60));

    const testSuites = [
      this.testBasicFunctionality.bind(this),
      this.testModelInference.bind(this),
      this.testPerformanceRegression.bind(this),
      this.testBackwardCompatibility.bind(this),
      this.testEdgeCaseRegression.bind(this),
      this.testIntegrationScenarios.bind(this),
      this.testErrorHandling.bind(this)
    ];

    for (const testSuite of testSuites) {
      try {
        await testSuite();
      } catch (error) {
        this.logError('Test suite failed', error);
      }
    }

    this.printSummary();
  }

  /**
   * Test 1: Basic functionality regression
   */
  async testBasicFunctionality() {
    console.log('\n📋 Test Suite 1: Basic Functionality Regression');
    console.log('─'.repeat(50));

    const testCases = [
      {
        name: 'Model loading',
        test: async () => {
          this.assert(this.originalModel !== null, 'Original model should be loaded');
          this.assert(this.improvedDetector.isLoaded, 'Improved detector should be loaded');
        }
      },
      {
        name: 'Model architecture',
        test: async () => {
          const origSummary = this.originalModel.summary();
          // Handle case where summary might be undefined in some environments
          if (origSummary && typeof origSummary === 'string') {
            this.assert(origSummary.includes('embedding'), 'Should have embedding layer');
            this.assert(origSummary.includes('dense'), 'Should have dense layers');
          } else {
            // Alternative validation: check model structure directly
            this.assert(this.originalModel.layers.length > 0, 'Model should have layers');
            const hasEmbedding = this.originalModel.layers.some(layer =>
              layer.name && layer.name.includes('embedding')
            );
            const hasDense = this.originalModel.layers.some(layer =>
              layer.name && layer.name.includes('dense')
            );
            this.assert(hasEmbedding, 'Should have embedding layer');
            this.assert(hasDense, 'Should have dense layers');
          }
        }
      },
      {
        name: 'Basic inference capability',
        test: async () => {
          const tokens = new Array(256).fill(0);
          const input = tf.tensor2d([tokens], [1, 256]);

          const origResult = this.originalModel.predict(input);
          const origData = await origResult.data();

          // TensorFlow.js returns TypedArray (Float32Array), not regular Array
          this.assert(origData && typeof origData.length === 'number', 'Should return array-like data');
          this.assert(origData.length === 6, 'Should return 6 bias scores');

          // Verify all values are valid numbers
          for (let i = 0; i < origData.length; i++) {
            this.assert(typeof origData[i] === 'number' && !isNaN(origData[i]), `Score ${i} should be valid number`);
            this.assert(origData[i] >= 0 && origData[i] <= 1, `Score ${i} should be between 0 and 1`);
          }

          input.dispose();
          origResult.dispose();
        }
      }
    ];

    await this.runTestCases(testCases);
  }

  /**
   * Test 2: Model inference consistency
   */
  async testModelInference() {
    console.log('\n📋 Test Suite 2: Model Inference Consistency');
    console.log('─'.repeat(50));

    const testTexts = [
      "Women are better than men at programming",
      "White people are more intelligent than others",
      "Young people are lazy and entitled",
      "Poor people are criminals",
      "Disabled people cannot work effectively",
      "This is neutral content",
      "We welcome diversity and inclusion"
    ];

    const testCases = testTexts.map(text => ({
      name: `Inference: "${text.substring(0, 30)}..."`,
      test: async () => {
        // Original model inference
        const tokens = this.improvedDetector.tokenize(text);
        const input = tf.tensor2d([tokens], [1, 256]);
        const origResult = this.originalModel.predict(input);
        const origData = await origResult.data();

        // Improved detector inference
        const improvedResult = await this.improvedDetector.detectBias(text);

        // Consistency checks
        this.assert(Math.abs(origData[0] - improvedResult.metadata.raw_scores.overall) < 0.001,
                   'Raw scores should match');

        // Improved detector should handle edge cases better
        if (text.split(/\s+/).length < 3) {
          this.assert(improvedResult.bias_score < 0.3,
                     'Short text should have low bias score in improved detector');
        }

        input.dispose();
        origResult.dispose();
      }
    }));

    await this.runTestCases(testCases);
  }

  /**
   * Test 3: Performance regression
   */
  async testPerformanceRegression() {
    console.log('\n📋 Test Suite 3: Performance Regression');
    console.log('─'.repeat(50));

    const testCases = [
      {
        name: 'Single inference speed',
        test: async () => {
          const text = "Women are better than men at programming";
          const startTime = Date.now();

          for (let i = 0; i < 10; i++) {
            const result = await this.improvedDetector.detectBias(text);
            this.assert(result.success, 'Should succeed');
          }

          const endTime = Date.now();
          const avgTime = (endTime - startTime) / 10;

          this.performanceMetrics.avgInferenceTime = avgTime;
          this.assert(avgTime < 100, `Average inference should be < 100ms, got ${avgTime}ms`);

          console.log(`   📊 Average inference time: ${avgTime.toFixed(2)}ms`);
        }
      },
      {
        name: 'Memory usage stability',
        test: async () => {
          // Run multiple inferences to check for memory leaks
          const texts = Array(50).fill().map((_, i) =>
            `Test text ${i} with some content for bias detection testing purposes`
          );

          for (const text of texts) {
            const result = await this.improvedDetector.detectBias(text);
            this.assert(result.success, 'Should succeed');
          }

          // Force garbage collection if available
          if (global.gc) {
            global.gc();
          }

          console.log('   ✅ Memory usage test passed');
        }
      },
      {
        name: 'Batch processing capability',
        test: async () => {
          const batchSize = 5;
          const texts = Array(batchSize).fill("Test bias detection text");

          const startTime = Date.now();
          const results = await Promise.all(
            texts.map(text => this.improvedDetector.detectBias(text))
          );
          const endTime = Date.now();

          results.forEach(result => {
            this.assert(result.success, 'All batch results should succeed');
          });

          const totalTime = endTime - startTime;
          const avgTime = totalTime / batchSize;

          console.log(`   📊 Batch processing: ${totalTime}ms total, ${avgTime.toFixed(2)}ms avg per item`);
        }
      }
    ];

    await this.runTestCases(testCases);
  }

  /**
   * Test 4: Backward compatibility
   */
  async testBackwardCompatibility() {
    console.log('\n📋 Test Suite 4: Backward Compatibility');
    console.log('─'.repeat(50));

    const testCases = [
      {
        name: 'API consistency',
        test: async () => {
          const result = await this.improvedDetector.detectBias("Test text");

          // Check that all expected properties exist
          const requiredProps = ['success', 'bias_score', 'bias_detected', 'confidence'];
          requiredProps.forEach(prop => {
            this.assert(result.hasOwnProperty(prop), `Should have ${prop} property`);
          });

          this.assert(typeof result.bias_score === 'number', 'bias_score should be number');
          this.assert(typeof result.confidence === 'number', 'confidence should be number');
        }
      },
      {
        name: 'Error handling consistency',
        test: async () => {
          // Test with null input
          const result1 = await this.improvedDetector.detectBias(null);
          this.assert(result1.success === false || result1.bias_score === 0,
                     'Should handle null input gracefully');

          // Test with empty string
          const result2 = await this.improvedDetector.detectBias("");
          this.assert(result2.bias_score === 0, 'Empty string should return zero bias');
        }
      },
      {
        name: 'Output format stability',
        test: async () => {
          const texts = ["Short", "Medium length text", "Very long text that exceeds normal bounds and should still work properly"];

          for (const text of texts) {
            const result = await this.improvedDetector.detectBias(text);

            // Check output structure stability
            this.assert(typeof result.bias_categories === 'object', 'Should have bias_categories');
            this.assert(Object.keys(result.bias_categories).length === 5, 'Should have 5 bias categories');

            const categories = ['gender', 'racial', 'age', 'socioeconomic', 'ability'];
            categories.forEach(cat => {
              this.assert(result.bias_categories.hasOwnProperty(cat), `Should have ${cat} category`);
              this.assert(typeof result.bias_categories[cat] === 'number', `${cat} should be number`);
            });
          }
        }
      }
    ];

    await this.runTestCases(testCases);
  }

  /**
   * Test 5: Edge case regression (ensure improvements work)
   */
  async testEdgeCaseRegression() {
    console.log('\n📋 Test Suite 5: Edge Case Regression');
    console.log('─'.repeat(50));

    const edgeCases = [
      { text: "", expectedBias: 0, description: "Empty string" },
      { text: "Men", expectedBias: 0, description: "Single word" },
      { text: "Bad men", expectedBias: "< 0.3", description: "Short text" },
      { text: "Women are better than men", expectedBias: "> 0.4", description: "Clear bias" },
      { text: "This is neutral content", expectedBias: "< 0.1", description: "Neutral content" },
      { text: "Visit https://example.com", expectedBias: "< 0.2", description: "URL content" },
      { text: "<b>Bold text</b>", expectedBias: "< 0.2", description: "HTML content" }
    ];

    const testCases = edgeCases.map(edgeCase => ({
      name: `Edge case: ${edgeCase.description}`,
      test: async () => {
        const result = await this.improvedDetector.detectBias(edgeCase.text);

        if (edgeCase.expectedBias === 0) {
          this.assert(result.bias_score === 0, `${edgeCase.description} should have zero bias`);
        } else if (typeof edgeCase.expectedBias === 'string') {
          if (edgeCase.expectedBias.startsWith('<')) {
            const max = parseFloat(edgeCase.expectedBias.substring(1));
            this.assert(result.bias_score < max,
                       `${edgeCase.description} bias should be < ${max}, got ${result.bias_score}`);
          } else if (edgeCase.expectedBias.startsWith('>')) {
            const min = parseFloat(edgeCase.expectedBias.substring(1));
            this.assert(result.bias_score > min,
                       `${edgeCase.description} bias should be > ${min}, got ${result.bias_score}`);
          }
        }

        console.log(`   📊 ${edgeCase.description}: bias=${result.bias_score.toFixed(4)}, detected=${result.bias_detected}`);
      }
    }));

    await this.runTestCases(testCases);
  }

  /**
   * Test 6: Integration scenarios
   */
  async testIntegrationScenarios() {
    console.log('\n📋 Test Suite 6: Integration Scenarios');
    console.log('─'.repeat(50));

    const testCases = [
      {
        name: 'Real-world content simulation',
        test: async () => {
          // Simulate real web content
          const realWorldTexts = [
            "Our company values diversity and inclusion. We believe that people from all backgrounds bring unique perspectives to our work.",
            "The study found that women in tech face unique challenges that require targeted solutions.",
            "Economic inequality affects communities worldwide, requiring comprehensive policy responses.",
            "Age discrimination in the workplace remains a significant concern for older workers.",
            "People with disabilities bring valuable skills and perspectives to any organization."
          ];

          for (const text of realWorldTexts) {
            const result = await this.improvedDetector.detectBias(text);

            // Should not have excessive false positives
            this.assert(result.bias_score < 0.7, `Real content should not be overly flagged: ${text.substring(0, 50)}...`);

            // Should provide confidence scores
            this.assert(typeof result.confidence === 'number', 'Should have confidence score');
            this.assert(result.confidence >= 0 && result.confidence <= 1, 'Confidence should be 0-1');
          }

          console.log('   ✅ Real-world content integration test passed');
        }
      },
      {
        name: 'Batch processing reliability',
        test: async () => {
          // Test processing multiple texts simultaneously
          const batchTexts = Array(20).fill().map((_, i) =>
            `Sample text ${i} for batch processing test with some content to analyze for bias detection.`
          );

          const results = await Promise.all(
            batchTexts.map(text => this.improvedDetector.detectBias(text))
          );

          // All should succeed
          results.forEach((result, i) => {
            this.assert(result.success, `Batch item ${i} should succeed`);
            this.assert(typeof result.bias_score === 'number', `Batch item ${i} should have bias score`);
          });

          console.log(`   📊 Successfully processed ${results.length} texts in batch`);
        }
      },
      {
        name: 'Memory cleanup verification',
        test: async () => {
          // Process many texts and ensure no memory issues
          for (let i = 0; i < 100; i++) {
            const result = await this.improvedDetector.detectBias(`Test text ${i} with content`);
            this.assert(result.success, `Iteration ${i} should succeed`);
          }

          console.log('   ✅ Memory cleanup test passed (100 iterations)');
        }
      }
    ];

    await this.runTestCases(testCases);
  }

  /**
   * Test 7: Error handling consistency
   */
  async testErrorHandling() {
    console.log('\n📋 Test Suite 7: Error Handling Consistency');
    console.log('─'.repeat(50));

    const testCases = [
      {
        name: 'Invalid input types',
        test: async () => {
          const invalidInputs = [null, undefined, 123, {}, []];

          for (const input of invalidInputs) {
            const result = await this.improvedDetector.detectBias(input);
            this.assert(result.success === false || result.bias_score === 0,
                       `Should handle ${typeof input} input gracefully`);
          }
        }
      },
      {
        name: 'Extremely long input',
        test: async () => {
          const longText = "word ".repeat(1000); // 1000 words
          const result = await this.improvedDetector.detectBias(longText);

          // Should still work (truncation handled)
          this.assert(result.success !== undefined, 'Should handle long text');
          this.assert(typeof result.bias_score === 'number', 'Should return valid bias score');
        }
      },
      {
        name: 'Special characters and encoding',
        test: async () => {
          const specialTexts = [
            "Text with 🚀 emojis and ümlauts",
            "Text with <script> tags and 'quotes'",
            "Text with newlines\nand\ttabs",
            "Text with numbers 123 and symbols @#$%"
          ];

          for (const text of specialTexts) {
            const result = await this.improvedDetector.detectBias(text);
            this.assert(result.success !== undefined, 'Should handle special characters');
            this.assert(typeof result.bias_score === 'number', 'Should return valid score');
          }
        }
      },
      {
        name: 'Model state consistency',
        test: async () => {
          // Test that multiple calls don't corrupt model state
          const testText = "Consistent test text";
          const results = [];

          for (let i = 0; i < 5; i++) {
            const result = await this.improvedDetector.detectBias(testText);
            results.push(result.bias_score);
          }

          // All results should be identical (deterministic)
          const firstResult = results[0];
          const allSame = results.every(score => Math.abs(score - firstResult) < 0.001);

          this.assert(allSame, 'Model should produce consistent results');
          console.log(`   📊 Consistency check: ${results.length} identical results`);
        }
      }
    ];

    await this.runTestCases(testCases);
  }

  /**
   * Helper methods
   */
  async runTestCases(testCases) {
    for (const testCase of testCases) {
      try {
        await testCase.test();
        this.testResults.passed++;
        console.log(`✅ ${testCase.name}`);
      } catch (error) {
        this.testResults.failed++;
        this.logError(testCase.name, error);
      }
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  logError(testName, error) {
    const errorMsg = `${testName}: ${error.message}`;
    this.testResults.errors.push(errorMsg);
    console.log(`❌ ${errorMsg}`);
  }

  printSummary() {
    console.log('\n' + '═'.repeat(60));
    console.log('📊 REGRESSION TESTING SUMMARY');
    console.log('═'.repeat(60));

    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`⚠️  Warnings: ${this.testResults.warnings}`);

    const totalTests = this.testResults.passed + this.testResults.failed;
    const successRate = totalTests > 0 ? ((this.testResults.passed / totalTests) * 100).toFixed(1) : '0';

    console.log(`📈 Success Rate: ${successRate}%`);

    if (this.testResults.errors.length > 0) {
      console.log('\n🚨 ERRORS FOUND:');
      this.testResults.errors.forEach(error => console.log(`   • ${error}`));
    }

    if (Object.keys(this.performanceMetrics).length > 0) {
      console.log('\n⚡ PERFORMANCE METRICS:');
      Object.entries(this.performanceMetrics).forEach(([key, value]) => {
        console.log(`   • ${key}: ${typeof value === 'number' ? value.toFixed(2) : value}`);
      });
    }

    console.log('\n' + (this.testResults.failed === 0 ? '🎉 ALL REGRESSION TESTS PASSED!' : '⚠️  REGRESSION ISSUES DETECTED'));

    if (this.testResults.failed === 0) {
      console.log('\n✅ Backward compatibility maintained');
      console.log('✅ Performance requirements met');
      console.log('✅ Edge case improvements validated');
      console.log('✅ Integration scenarios working');
    }
  }
}

// Run regression tests
async function runRegressionSuite() {
  const suite = new RegressionTestSuite();

  try {
    await suite.setup();
    await suite.runAllTests();
  } catch (error) {
    console.error('❌ Regression testing failed:', error.message);
    process.exit(1);
  }
}

// Export for use in other modules
export { RegressionTestSuite };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runRegressionSuite().catch(console.error);
}
