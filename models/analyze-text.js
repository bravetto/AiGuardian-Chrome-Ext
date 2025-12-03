#!/usr/bin/env node

/**
 * Simple helper script to analyze text for bias detection
 * Usage: node analyze-text.js "Your text to analyze here"
 */

import { ImprovedBiasDetector } from './improved-bias-detector.js';

// Get text from command line arguments
const textToAnalyze = process.argv.slice(2).join(' ');

if (!textToAnalyze) {
  console.log('❌ Error: Please provide text to analyze');
  console.log('Usage: node analyze-text.js "Your text to analyze here"');
  process.exit(1);
}

async function analyzeText() {
  try {
    console.log('🔍 Analyzing text for bias...');
    console.log('═'.repeat(50));
    console.log(`Text: "${textToAnalyze}"`);
    console.log('');

    const detector = new ImprovedBiasDetector();
    await detector.loadModel();

    const result = await detector.detectBias(textToAnalyze);

    console.log('📊 ANALYSIS RESULTS:');
    console.log('═'.repeat(30));
    console.log(`Bias Score:         ${result.bias_score.toFixed(4)}`);
    console.log(`Bias Detected:      ${result.bias_detected}`);
    console.log(`Confidence:         ${result.confidence.toFixed(4)}`);
    console.log(`Primary Bias Type:  ${result.primary_bias_type || 'None'}`);
    console.log(`Quality Score:      ${result.text_analysis.quality_score.toFixed(4)}`);
    console.log(`Is Reliable:        ${result.text_analysis.is_reliable}`);

    if (result.bias_detected && result.primary_bias_type) {
      console.log(`\n⚠️  BIAS DETECTED: ${result.primary_bias_type.toUpperCase()}`);
    } else {
      console.log('\n✅ No significant bias detected');
    }

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

analyzeText();
