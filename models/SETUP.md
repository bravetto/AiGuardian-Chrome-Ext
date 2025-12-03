# Model Development Setup Guide

This guide provides step-by-step instructions for setting up your environment for AI Guardian bias detection model development.

## 🎯 Prerequisites

### System Requirements
- **Operating System**: Linux, macOS, or Windows 10+
- **Node.js**: v16.0.0 or higher
- **Memory**: Minimum 4GB RAM (8GB recommended for training)
- **Storage**: 2GB free space for datasets, models, and dependencies
- **Python**: v3.8+ (optional, for advanced data processing)

### Hardware Acceleration (Optional)
- **GPU**: NVIDIA GPU with CUDA support for faster training
- **CUDA**: v11.0+ (if using GPU acceleration)

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/aiguardian/chrome-extension.git
cd chrome-extension

# Navigate to models directory
cd models/

# Run automated setup
npm run setup

# Verify installation
npm test
```

### Option 2: Manual Setup

#### Step 1: Install Node.js
```bash
# Check if Node.js is installed
node --version  # Should be v16.0.0 or higher
npm --version   # Should be v7.0.0 or higher

# If not installed, download from https://nodejs.org/
# Or use a version manager:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### Step 2: Install Dependencies
```bash
# Navigate to models directory
cd models/

# Install core dependencies
npm install

# Install TensorFlow.js for Node.js (required for training)
npm install @tensorflow/tfjs-node

# Optional: Install GPU support
npm install @tensorflow/tfjs-node-gpu
```

#### Step 3: Verify Installation
```bash
# Run basic tests
npm test

# Test TensorFlow.js installation
node -e "const tf = require('@tensorflow/tfjs-node'); console.log('TensorFlow.js version:', tf.version);"
```

## 🔧 Advanced Setup

### Python Environment (Optional)

For advanced data processing and analysis:

```bash
# Install Python (if not already installed)
# Download from https://python.org or use conda

# Install required packages
pip install numpy pandas scikit-learn matplotlib seaborn jupyter

# Install Jupyter for interactive development
pip install jupyterlab

# Launch Jupyter
jupyter lab
```

### GPU Acceleration Setup

For faster training on NVIDIA GPUs:

#### 1. Install CUDA Toolkit
```bash
# Ubuntu/Debian
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64/cuda-ubuntu2004.pin
sudo mv cuda-ubuntu2004.pin /etc/apt/preferences.d/cuda-repository-pin-600
wget https://developer.download.nvidia.com/compute/cuda/11.8.0/local_installers/cuda_11.8.0_520.61.05_linux.run
sudo sh cuda_11.8.0_520.61.05_linux.run

# macOS (limited GPU support)
# TensorFlow.js has limited GPU support on macOS
```

#### 2. Install cuDNN
```bash
# Download cuDNN from NVIDIA Developer site
# Follow installation instructions for your OS
```

#### 3. Install TensorFlow GPU
```bash
npm install @tensorflow/tfjs-node-gpu
```

#### 4. Verify GPU Setup
```bash
# Test GPU availability
node -e "
const tf = require('@tensorflow/tfjs-node-gpu');
console.log('GPU available:', tf.backend().isGPUSupported);
console.log('Backend:', tf.getBackend());
"
```

### Development Environment Setup

#### VS Code (Recommended)
```bash
# Install recommended extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension ms-vscode.vscode-json
code --install-extension ms-python.python
code --install-extension redhat.vscode-yaml
```

#### ESLint and Prettier
```bash
# Install linting and formatting tools
npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-node

# Format code
npm run format

# Lint code
npm run lint
```

## 🧪 Testing Setup

### Run Test Suite
```bash
# Run all tests
npm test

# Run specific test categories
npm run test:unit
npm run test:integration

# Run with coverage
npm run test:coverage
```

### Performance Testing
```bash
# Test inference performance
node scripts/benchmark-inference.js

# Test memory usage
node scripts/memory-profile.js
```

## 🔍 Troubleshooting

### Common Setup Issues

#### Node.js Version Issues
```
Error: Node.js version 14.x.x is not supported
```
**Solution**: Upgrade to Node.js v16+
```bash
# Using nvm
nvm install 18
nvm use 18

# Verify
node --version
```

#### TensorFlow.js Installation Issues
```
Error: Cannot find module '@tensorflow/tfjs-node'
```
**Solution**: Clean install
```bash
# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
npm install @tensorflow/tfjs-node
```

#### Memory Issues During Training
```
Error: Allocation failed - JavaScript heap out of memory
```
**Solution**: Increase Node.js memory limit
```bash
# Run with increased memory
node --max-old-space-size=4096 training/train-bias-model.js

# Or set globally
export NODE_OPTIONS="--max-old-space-size=4096"
```

#### GPU Issues
```
Error: CUDA not found
```
**Solution**: Check CUDA installation
```bash
# Check CUDA version
nvcc --version

# Check GPU status
nvidia-smi

# Reinstall TensorFlow GPU
npm uninstall @tensorflow/tfjs-node-gpu
npm install @tensorflow/tfjs-node-gpu
```

### Environment Variables

#### Development Configuration
```bash
# Set environment variables
export NODE_ENV=development
export DEBUG=ml-model
export DD_API_KEY=your_datadog_api_key  # For logging

# Training configuration
export TF_CPP_MIN_LOG_LEVEL=2  # Reduce TensorFlow logging
export CUDA_VISIBLE_DEVICES=0  # GPU device selection
```

#### Production Configuration
```bash
export NODE_ENV=production
export TF_CPP_MIN_LOG_LEVEL=3  # Minimal logging
```

## 📊 Monitoring Setup

### Datadog Logging (Optional)
```bash
# Install Datadog agent (optional)
# Follow instructions at https://docs.datadoghq.com/agent/

# Set API key
export DD_API_KEY=your_api_key_here

# Training will automatically log metrics
node training/train-bias-model.js
```

### Custom Monitoring
```bash
# Use built-in monitoring
node scripts/monitor-training.js --config=training-config.json
```

## 🚀 Getting Started After Setup

### First Training Run
```bash
# Navigate to models directory
cd models/

# Run a quick training test with synthetic data
node training/train-bias-model.js --epochs=2 --quick-test

# Validate the model
node training/validate-ml-model.js

# Test inference
node scripts/test-model-inference.js
```

### Development Workflow
```bash
# 1. Make changes to training code
# 2. Run tests
npm test

# 3. Train model with small dataset
node training/train-bias-model.js --epochs=5

# 4. Validate performance
node training/validate-ml-model.js

# 5. Test in extension (if needed)
cd ..
npm run build
npm run test:e2e
```

## 📚 Next Steps

After setup is complete:
1. Read [`TRAINING_GUIDE.md`](./TRAINING_GUIDE.md) for detailed training instructions
2. Check [`README.md`](./README.md) for project overview
3. Explore example datasets in the `training/` directory
4. Join the development community for support

## 🤝 Support

### Getting Help
- **Documentation**: Check this guide and [`TRAINING_GUIDE.md`](./TRAINING_GUIDE.md)
- **Issues**: File bugs at [GitHub Issues](https://github.com/aiguardian/chrome-extension/issues)
- **Discussions**: Join [GitHub Discussions](https://github.com/aiguardian/chrome-extension/discussions)

### System Information for Bug Reports
```bash
# Collect system information
node scripts/system-info.js

# Include this information when reporting issues:
# - Node.js version
# - npm version
# - OS and version
# - GPU information (if applicable)
# - Error messages and stack traces
```

---

*Last updated: $(date)*
