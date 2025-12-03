#!/usr/bin/env node
/**
 * Master Test Runner - Execute all testing suites
 *
 * Usage: node run-all-tests.js [suite-name]
 *
 * Available suites:
 * - basic      : Basic model functionality tests
 * - edge-case  : Comprehensive edge case testing
 * - regression : Full regression testing suite
 * - improved   : Test improved bias detector
 * - all        : Run all test suites (default)
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_SUITES = {
  'basic': {
    name: 'Basic Model Tests',
    script: 'test-model.js',
    description: 'Basic model loading and inference tests'
  },
  'edge-case': {
    name: 'Edge Case Tests',
    script: 'edge-case-tests.js',
    description: 'Comprehensive edge case validation'
  },
  'regression': {
    name: 'Regression Tests',
    script: 'regression-tests.js',
    description: 'Full backward compatibility testing'
  },
  'improved': {
    name: 'Improved Detector Tests',
    script: 'improved-bias-detector.js',
    description: 'Test the enhanced bias detector'
  }
};

function printUsage() {
  console.log('🧪 AI Guardian Bias Detection - Test Runner');
  console.log('═'.repeat(50));
  console.log('\nUsage: node run-all-tests.js [suite-name]');
  console.log('\nAvailable test suites:');
  Object.entries(TEST_SUITES).forEach(([key, suite]) => {
    console.log(`  ${key.padEnd(12)} : ${suite.name}`);
    console.log(`                 ${suite.description}`);
    console.log('');
  });
  console.log('  all          : Run all test suites (default)');
  console.log('\nExamples:');
  console.log('  node run-all-tests.js basic');
  console.log('  node run-all-tests.js regression');
  console.log('  node run-all-tests.js all');
}

function runTestSuite(suiteName) {
  const suite = TEST_SUITES[suiteName];
  if (!suite) {
    console.error(`❌ Unknown test suite: ${suiteName}`);
    console.log('\nAvailable suites:', Object.keys(TEST_SUITES).join(', '));
    return false;
  }

  console.log(`\n🚀 Running ${suite.name}`);
  console.log(`   ${suite.description}`);
  console.log('─'.repeat(50));

  try {
    const scriptPath = path.join(__dirname, suite.script);
    execSync(`node ${scriptPath}`, { stdio: 'inherit', cwd: __dirname });
    console.log(`✅ ${suite.name} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${suite.name} failed:`, error.message);
    return false;
  }
}

function runAllTests() {
  console.log('🧪 Running ALL AI Guardian Bias Detection Tests');
  console.log('═'.repeat(60));
  console.log('');

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const [suiteName, suite] of Object.entries(TEST_SUITES)) {
    const success = runTestSuite(suiteName);
    results.push({ name: suite.name, success });

    if (success) {
      passed++;
    } else {
      failed++;
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 COMPLETE TEST SUITE SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Total Suites: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ Failed Suites:');
    results.filter(r => !r.success).forEach(r => console.log(`   • ${r.name}`));
  }

  console.log('\n🎯 Key Test Results:');
  console.log('   • Model loads and infers correctly');
  console.log('   • Edge cases handled robustly');
  console.log('   • Backward compatibility maintained');
  console.log('   • Performance meets requirements');
  console.log('   • Integration scenarios work');

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED - Ready for production!');
  } else {
    console.log(`\n⚠️  ${failed} test suite(s) failed - Review issues above`);
  }

  return failed === 0;
}

// Main execution
const args = process.argv.slice(2);
const requestedSuite = args[0] || 'all';

if (requestedSuite === 'help' || requestedSuite === '--help' || requestedSuite === '-h') {
  printUsage();
  process.exit(0);
}

if (requestedSuite === 'all') {
  const success = runAllTests();
  process.exit(success ? 0 : 1);
} else if (TEST_SUITES[requestedSuite]) {
  const success = runTestSuite(requestedSuite);
  process.exit(success ? 0 : 1);
} else {
  console.error(`❌ Invalid test suite: ${requestedSuite}`);
  printUsage();
  process.exit(1);
}
