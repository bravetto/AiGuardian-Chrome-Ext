/**
 * Sync Model Files Script
 *
 * Copies trained model files from models/ directory to src/models/
 * for extension integration. Run this after training a new model.
 */

const fs = require('fs');
const path = require('path');

const modelsRoot = path.join(__dirname, '..', 'models');
const biasDetectionDir = path.join(modelsRoot, 'bias-detection');
const targetDir = path.join(__dirname, '..', 'src', 'models');

// Files to sync with their source directories
const filesToSync = [
  {
    name: 'model.json',
    sourceDir: biasDetectionDir,
    targetName: 'bias-detection-model.json'
  },
  {
    name: 'model.weights.bin',
    sourceDir: biasDetectionDir,
    targetName: 'bias-detection-model.weights.bin'
  },
  {
    name: 'text-preprocessor.js',
    sourceDir: biasDetectionDir
  },
  {
    name: 'model-loader.js',
    sourceDir: biasDetectionDir
  },
  {
    name: 'enhanced-bias-detection.js',
    sourceDir: biasDetectionDir
  },
  {
    name: 'patterns.js',
    sourceDir: biasDetectionDir
  },
  {
    name: 'contextual-scoring.js',
    sourceDir: biasDetectionDir
  },
  {
    name: 'constants.js',
    sourceDir: biasDetectionDir
  },
  {
    name: 'bias-guard.js',
    sourceDir: modelsRoot
  }
];

function syncModelFiles() {
  console.log('🔄 Syncing model files from models/ to src/models/...');

  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  let syncedCount = 0;

  for (const fileInfo of filesToSync) {
    const sourcePath = path.join(fileInfo.sourceDir, fileInfo.name);
    const targetName = fileInfo.targetName || fileInfo.name;
    const targetPath = path.join(targetDir, targetName);

    try {
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✅ Copied ${fileInfo.name} → ${targetName} from ${path.relative(modelsRoot, fileInfo.sourceDir)}`);
        syncedCount++;
      } else {
        console.log(`⚠️  Source file not found: ${sourcePath}`);
      }
    } catch (error) {
      console.error(`❌ Failed to copy ${fileInfo.name}:`, error.message);
    }
  }

  console.log(`\n📊 Sync complete: ${syncedCount}/${filesToSync.length} files synced`);

  if (syncedCount === filesToSync.length) {
    console.log('🎉 Model files are ready for extension integration');
  } else {
    console.log('⚠️  Some files were not synced. Check for missing model files.');
  }
}

// Run if called directly
if (require.main === module) {
  syncModelFiles();
}

module.exports = { syncModelFiles };
