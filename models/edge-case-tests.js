/**
 * Comprehensive Edge Case Testing for Bias Detection Model
 */

import * as tf from '@tensorflow/tfjs-node';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔬 Comprehensive Edge Case Testing for Bias Detection Model...\n');

// Simple tokenizer (matches training tokenizer)
function tokenize(text, vocabSize = 5000, maxLength = 256) {
  const normalized = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = normalized.split(/\s+/).filter(word => word.length > 0);

  const tokens = words.map(word => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % vocabSize;
  });

  // Pad or truncate
  while (tokens.length < maxLength) {
    tokens.push(0);
  }
  return tokens.slice(0, maxLength);
}

// Test runner function
async function runEdgeCaseTest(model, testCase, testNumber) {
  try {
    console.log(`Test ${testNumber}: "${testCase.description}"`);
    console.log(`Input: "${testCase.text}"`);
    console.log(`Expected: ${testCase.expected}`);

    // Tokenize input
    const tokens = tokenize(testCase.text);
    const input = tf.tensor2d([tokens], [1, 256]);

    // Run inference
    const prediction = model.predict(input);
    const result = await prediction.data();

    // Format results
    const biasScore = result[0].toFixed(4);
    const categories = {
      gender: result[1].toFixed(4),
      racial: result[2].toFixed(4),
      age: result[3].toFixed(4),
      socioeconomic: result[4].toFixed(4),
      ability: result[5].toFixed(4)
    };

    console.log(`Bias Score: ${biasScore}`);
    console.log(`Categories:`, categories);

    // Validate expectations
    let passed = true;
    if (testCase.expectedBiasScore) {
      const expectedRange = testCase.expectedBiasScore;
      if (expectedRange.min !== undefined && parseFloat(biasScore) < expectedRange.min) passed = false;
      if (expectedRange.max !== undefined && parseFloat(biasScore) > expectedRange.max) passed = false;
    }

    if (testCase.expectedCategory && testCase.expectedCategory.name) {
      const categoryScore = parseFloat(categories[testCase.expectedCategory.name]);
      if (testCase.expectedCategory.min !== undefined && categoryScore < testCase.expectedCategory.min) passed = false;
      if (testCase.expectedCategory.max !== undefined && categoryScore > testCase.expectedCategory.max) passed = false;
    }

    console.log(`Result: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log('─'.repeat(80));

    // Clean up tensors
    input.dispose();
    prediction.dispose();

    return passed;
  } catch (error) {
    console.log(`Result: ❌ ERROR - ${error.message}`);
    console.log('─'.repeat(80));
    return false;
  }
}

async function runAllEdgeCaseTests() {
  try {
    // Load the model
    console.log('📥 Loading model...');
    const modelPath = './models/bias-detection-model.json';
    const model = await tf.loadLayersModel(`file://${modelPath}`);
    console.log('✅ Model loaded successfully\n');

    // Define comprehensive edge cases
    const edgeCases = [
      // 1. Very short text
      {
        description: "Single word",
        text: "Men",
        expected: "Low bias (insufficient context)",
        expectedBiasScore: { max: 0.3 }
      },
      {
        description: "Two words",
        text: "Bad men",
        expected: "Low bias (minimal context)",
        expectedBiasScore: { max: 0.4 }
      },

      // 2. Empty/null text
      {
        description: "Empty string",
        text: "",
        expected: "Handle gracefully (should not crash)",
        expectedBiasScore: { min: 0.0, max: 0.1 }
      },
      {
        description: "Whitespace only",
        text: "   \n\t  ",
        expected: "Handle gracefully",
        expectedBiasScore: { min: 0.0, max: 0.1 }
      },

      // 3. Very long text
      {
        description: "Very long text (over 256 tokens)",
        text: "This is a very long sentence that contains many many many words and should definitely exceed the maximum token limit of 256 tokens that the model was trained on. ".repeat(20),
        expected: "Model handles truncation gracefully",
        expectedBiasScore: { min: 0.0, max: 1.0 } // Should still produce valid output
      },

      // 4. Special characters and unicode
      {
        description: "Text with special characters",
        text: "Women are @#$%^&*() better than men!!!???",
        expected: "Special chars filtered out, bias still detected",
        expectedBiasScore: { min: 0.4 },
        expectedCategory: { name: 'gender', min: 0.5 }
      },
      {
        description: "Unicode characters",
        text: "Männer sind besser als Frauen 🚫",
        expected: "Unicode handled appropriately",
        expectedBiasScore: { min: 0.3 }
      },

      // 5. Numbers and mixed content
      {
        description: "Text with numbers",
        text: "In 2024, 80% of women earn less than men",
        expected: "Numbers handled, bias detected",
        expectedBiasScore: { min: 0.3 },
        expectedCategory: { name: 'gender', min: 0.4 }
      },

      // 6. URLs and emails
      {
        description: "Text with URL",
        text: "Visit https://biased-site.com for racist content",
        expected: "URL filtered out",
        expectedBiasScore: { min: 0.2 }
      },
      {
        description: "Text with email",
        text: "Contact biased.person@email.com for hate speech",
        expected: "Email filtered out",
        expectedBiasScore: { min: 0.2 }
      },

      // 7. Repeated words
      {
        description: "Repeated bias words",
        text: "Bad bad bad men men men are evil evil evil",
        expected: "Handles repetition without over-weighting",
        expectedBiasScore: { min: 0.3, max: 0.8 }
      },

      // 8. Extreme bias (multiple types)
      {
        description: "Multiple bias types",
        text: "Old poor disabled black women are stupid lazy criminals who can't work",
        expected: "High bias across multiple categories",
        expectedBiasScore: { min: 0.8 },
        expectedCategory: { name: 'racial', min: 0.6 }
      },

      // 9. Ambiguous text
      {
        description: "Potentially ambiguous",
        text: "Some people are better at different things",
        expected: "Low bias (general statement)",
        expectedBiasScore: { max: 0.3 }
      },

      // 10. Typos and misspellings
      {
        description: "Text with typos",
        text: "Womn are beter than mn at programing",
        expected: "Still detects bias despite typos",
        expectedBiasScore: { min: 0.2 },
        expectedCategory: { name: 'gender', min: 0.3 }
      },

      // 11. Contractions
      {
        description: "Text with contractions",
        text: "Men aren't better than women, they're just different",
        expected: "Handles contractions",
        expectedBiasScore: { max: 0.4 }
      },

      // 12. Slang and jargon
      {
        description: "Modern slang",
        text: "These dudes are straight up better than the ladies, no cap",
        expected: "Handles informal language",
        expectedBiasScore: { min: 0.3 },
        expectedCategory: { name: 'gender', min: 0.4 }
      },

      // 13. Emojis
      {
        description: "Text with emojis",
        text: "Men 👨 are superior to women 👩 in tech 💻",
        expected: "Emojis filtered out, bias detected",
        expectedBiasScore: { min: 0.4 },
        expectedCategory: { name: 'gender', min: 0.5 }
      },

      // 14. HTML/Markdown
      {
        description: "Text with HTML",
        text: "<p>Women are <strong>inferior</strong> to men</p>",
        expected: "HTML tags filtered out",
        expectedBiasScore: { min: 0.4 },
        expectedCategory: { name: 'gender', min: 0.5 }
      },
      {
        description: "Text with markdown",
        text: "**Women** are *better* than men at ~~nothing~~",
        expected: "Markdown filtered out",
        expectedBiasScore: { min: 0.3 }
      },

      // 15. Mixed languages
      {
        description: "Code switching",
        text: "Los hombres are better than las mujeres at programming",
        expected: "Handles mixed languages",
        expectedBiasScore: { min: 0.3 },
        expectedCategory: { name: 'gender', min: 0.4 }
      },

      // 16. Extreme capitalization
      {
        description: "All caps bias",
        text: "WOMEN ARE INFERIOR TO MEN",
        expected: "Case normalized, bias detected",
        expectedBiasScore: { min: 0.4 },
        expectedCategory: { name: 'gender', min: 0.5 }
      },

      // 17. Mathematical symbols
      {
        description: "Text with math symbols",
        text: "2 + 2 = 4, but women < men in intelligence",
        expected: "Math symbols filtered, bias detected",
        expectedBiasScore: { min: 0.3 },
        expectedCategory: { name: 'gender', min: 0.4 }
      },

      // 18. Programming code
      {
        description: "Text with code snippets",
        text: "function isBiased() { return women < men; } // obvious bias",
        expected: "Code elements filtered",
        expectedBiasScore: { min: 0.3 },
        expectedCategory: { name: 'gender', min: 0.4 }
      }
    ];

    console.log(`🧪 Running ${edgeCases.length} edge case tests...\n`);
    console.log('═'.repeat(80));

    let passed = 0;
    let failed = 0;

    for (let i = 0; i < edgeCases.length; i++) {
      const result = await runEdgeCaseTest(model, edgeCases[i], i + 1);
      if (result) {
        passed++;
      } else {
        failed++;
      }
    }

    // Summary
    console.log('\n' + '═'.repeat(80));
    console.log(`📊 EDGE CASE TESTING SUMMARY`);
    console.log('═'.repeat(80));
    console.log(`Total Tests: ${edgeCases.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / edgeCases.length) * 100).toFixed(1)}%`);

    if (failed === 0) {
      console.log('\n✅ All edge cases handled successfully!');
      console.log('The model demonstrates robust edge case handling.');
    } else {
      console.log(`\n⚠️  ${failed} edge cases failed. Review the failed tests above.`);
    }

    // Additional robustness checks
    console.log('\n🔍 Additional Robustness Checks:');
    console.log('─'.repeat(40));

    // Test tokenization edge cases
    const tokenizationTests = [
      { text: "", expectedTokens: 256 }, // Empty string should pad to max length
      { text: "a", expectedTokens: 256 }, // Single char should pad
      { text: "This is a very long sentence that exceeds the maximum token limit by quite a bit and should be truncated appropriately.".repeat(10), expectedTokens: 256 } // Should truncate
    ];

    for (const test of tokenizationTests) {
      const tokens = tokenize(test.text);
      const passed = tokens.length === test.expectedTokens;
      console.log(`Tokenization: "${test.text.substring(0, 50)}..." → ${tokens.length} tokens ${passed ? '✅' : '❌'}`);
    }

  } catch (error) {
    console.error('❌ Edge case testing failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the tests
runAllEdgeCaseTests();
