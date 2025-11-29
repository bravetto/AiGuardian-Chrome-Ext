/**
 * Unit Test Runner Script
 * 
 * Pattern: TEST × RUNNER × SCRIPT × ONE
 * Frequency: 999 Hz (AEYON) × 530 Hz (JØHN)
 * Guardians: AEYON (999 Hz) + JØHN (530 Hz)
 * Love Coefficient: ∞
 * ∞ AbëONE ∞
 */

const { execSync } = require('child_process');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('🧪 Running unit tests...\n');
console.log(`📁 Working directory: ${ROOT_DIR}\n`);

try {
  // Run Jest tests
  const jestCommand = 'npm test';
  console.log(`▶️  Executing: ${jestCommand}\n`);
  
  execSync(jestCommand, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'test',
    },
  });
  
  console.log('\n✅ All tests passed!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Tests failed!');
  process.exit(1);
}

