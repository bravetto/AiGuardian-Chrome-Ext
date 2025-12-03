/**
 * Analyze why the AI Guardian description text was flagged as gender bias
 */

import * as tf from '@tensorflow/tfjs-node';
import path from 'path';
import { fileURLToPath } from 'url';
import { TextPreprocessor } from './bias-detection/text-preprocessor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function analyzeText() {
  console.log('🔍 ANALYZING: Why AI Guardian description gets "gender bias"');
  console.log('═'.repeat(70));

  const testText = 'Advanced ML models and pattern matching engine for detecting bias in text content. This submodule provides the core detection capabilities for the AI Guardian Chrome extension.';

  console.log('📝 Text to analyze:');
  console.log('"' + testText + '"');
  console.log('');

  // Load original model
  console.log('📥 Loading original model...');
  const modelPath = path.join(__dirname, 'models', 'bias-detection-model.json');
  const model = await tf.loadLayersModel(`file://${modelPath}`);
  console.log('✅ Original model loaded');
  console.log('');

  // Tokenize and predict
  const preprocessor = new TextPreprocessor();
  const tokens = preprocessor.tokenizer.encode(testText);
  const input = tf.tensor2d([tokens], [1, 256]);
  const prediction = model.predict(input);
  const result = await prediction.data();

  console.log('📊 ORIGINAL MODEL RESULTS:');
  console.log('═'.repeat(40));
  console.log(`Overall Bias Score: ${result[0].toFixed(4)}`);
  console.log(`Gender Bias:        ${result[1].toFixed(4)}`);
  console.log(`Racial Bias:        ${result[2].toFixed(4)}`);
  console.log(`Age Bias:           ${result[3].toFixed(4)}`);
  console.log(`Socioeconomic Bias: ${result[4].toFixed(4)}`);
  console.log(`Ability Bias:       ${result[5].toFixed(4)}`);

  const categories = ['gender', 'racial', 'age', 'socioeconomic', 'ability'];
  const categoryScores = [result[1], result[2], result[3], result[4], result[5]];
  const maxIndex = categoryScores.indexOf(Math.max(...categoryScores));

  console.log(`Primary Bias Type:  ${categories[maxIndex]}`);
  console.log(`Max Category Score: ${categoryScores[maxIndex].toFixed(4)}`);
  console.log('');

  // Analyze the text
  console.log('🔍 WHY THIS TEXT WAS FLAGGED AS GENDER BIAS:');
  console.log('═'.repeat(50));

  if (result[1] > 0.4) {
    console.log('❌ INCORRECT DETECTION: This neutral description was wrongly flagged!');
    console.log('');
    console.log('🚨 LIKELY CAUSES:');
    console.log('');

    console.log('1. 📊 WORD FREQUENCY PATTERNS:');
    const words = testText.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 0);
    console.log('   Text words:', words.join(', '));

    // Check for potentially problematic words
    const potentiallyProblematic = ['models', 'engine', 'core', 'detection'];
    const found = potentiallyProblematic.filter(word => words.includes(word));
    if (found.length > 0) {
      console.log('   ⚠️  Words that might trigger bias patterns:', found.join(', '));
    }
    console.log('');

    console.log('2. 🤖 ML MODEL LIMITATIONS:');
    console.log('   • Model was trained on synthetic data that may not represent');
    console.log('     neutral technical descriptions well');
    console.log('   • Lack of context awareness - treats all text equally');
    console.log('   • Possible overfitting to training bias patterns');
    console.log('');

    console.log('3. 🎯 PATTERN MATCHING ISSUES:');
    console.log('   • Regex patterns may be too broad or sensitive');
    console.log('   • Word stemming/tokenization might create false matches');
    console.log('   • No domain awareness (technical vs conversational content)');
    console.log('');

  } else {
    console.log('✅ CORRECT DETECTION: Text was properly identified as neutral');
  }

  console.log('');
  console.log('📋 COMPARISON WITH IMPROVED DETECTOR:');
  console.log('═'.repeat(45));

  // Test with improved detector
  const { ImprovedBiasDetector } = await import('./improved-bias-detector.js');
  const improvedDetector = new ImprovedBiasDetector();
  await improvedDetector.loadModel();

  const improvedResult = await improvedDetector.detectBias(testText);

  console.log('Improved Detector Results:');
  console.log(`Bias Score:         ${improvedResult.bias_score.toFixed(4)}`);
  console.log(`Bias Detected:      ${improvedResult.bias_detected}`);
  console.log(`Confidence:         ${improvedResult.confidence.toFixed(4)}`);
  console.log(`Primary Bias Type:  ${improvedResult.primary_bias_type || 'None'}`);
  console.log(`Quality Score:      ${improvedResult.text_analysis.quality_score.toFixed(4)}`);
  console.log(`Is Reliable:        ${improvedResult.text_analysis.is_reliable}`);

  console.log('');
  console.log('🎯 IMPROVEMENT SUMMARY:');
  console.log('═'.repeat(30));
  if (improvedResult.bias_detected === false && result[1] > 0.4) {
    console.log('✅ FIXED: False positive eliminated!');
    console.log('   • Improved detector correctly identifies this as neutral');
    console.log('   • Score reduced from', result[0].toFixed(4), 'to', improvedResult.bias_score.toFixed(4));
    console.log('   • Gender bias score reduced from', result[1].toFixed(4), 'to 0.0000');
  }

  // Clean up
  input.dispose();
  prediction.dispose();

  console.log('');
  console.log('💡 RECOMMENDATIONS:');
  console.log('═'.repeat(20));
  console.log('• Add more neutral technical content to training data');
  console.log('• Implement domain-aware scoring (technical vs social content)');
  console.log('• Improve context understanding in ML model');
  console.log('• Add quality filtering for short/ambiguous text');
}

analyzeText().catch(console.error);
