# Model Training Guide

This guide provides comprehensive instructions for training the AI Guardian bias detection model from scratch or retraining with new data.

## 📋 Prerequisites

### System Requirements
- **Node.js**: v16.0.0 or higher
- **Memory**: At least 4GB RAM (8GB recommended)
- **Storage**: 2GB free space for datasets and models
- **OS**: Linux, macOS, or Windows

### Dependencies Installation
```bash
# Install core dependencies
npm install

# Install TensorFlow.js for Node.js (required for training)
npm install @tensorflow/tfjs-node

# Optional: Install Python dependencies for data preprocessing
pip install numpy pandas scikit-learn matplotlib seaborn
```

## 🎯 Quick Start Training

### 1. Prepare Your Dataset
```bash
# Create a training dataset (see Dataset Format section below)
# Save as JSON file, e.g., my-dataset.json
```

### 2. Train the Model
```bash
# Train with default synthetic data (development/testing)
node training/train-bias-model.js

# Train with your custom dataset
node training/train-bias-model.js --data=my-dataset.json

# Train with custom hyperparameters
node training/train-bias-model.js \
  --data=my-dataset.json \
  --epochs=20 \
  --batch-size=64 \
  --learning-rate=0.001
```

### 3. Validate the Model
```bash
# Run validation tests
node training/validate-ml-model.js

# Test inference with sample texts
node scripts/test-model-inference.js
```

### 4. Package for Deployment
```bash
# Package trained model files
node scripts/package-model.js

# Files created:
# - models/bias-detection-model.json (architecture)
# - models/bias-detection-model.weights.bin (weights)
```

## 📊 Dataset Format

### Required JSON Structure
```json
[
  {
    "text": "This is a biased statement about gender roles.",
    "labels": [0.85, 0.9, 0.0, 0.1, 0.0, 0.0]
  },
  {
    "text": "This is a neutral statement.",
    "labels": [0.05, 0.0, 0.0, 0.0, 0.0, 0.1]
  }
]
```

### Label Structure
Each sample must have exactly 6 labels in this order:
1. **Overall Bias Score** (0.0-1.0): Overall bias intensity
2. **Gender Bias** (0.0-1.0): Gender discrimination
3. **Racial Bias** (0.0-1.0): Racial/ethnic discrimination
4. **Age Bias** (0.0-1.0): Age-based discrimination
5. **Political Bias** (0.0-1.0): Political bias/propaganda
6. **Other Bias** (0.0-1.0): Other bias types

### Dataset Guidelines

#### Data Quality
- **Balance**: Include roughly equal examples of biased and neutral text
- **Diversity**: Cover different bias types and intensities
- **Realism**: Use natural language, not artificially constructed sentences
- **Context**: Include various contexts (news, social media, academic, etc.)

#### Sample Size Recommendations
- **Minimum**: 1,000 samples for basic training
- **Recommended**: 10,000+ samples for production model
- **Optimal**: 50,000+ samples for high accuracy

#### Bias Type Distribution
Aim for balanced representation:
- Gender bias: 20-25%
- Racial bias: 20-25%
- Age bias: 15-20%
- Political bias: 15-20%
- Other bias: 10-15%
- Neutral (low bias): 30-40%

## ⚙️ Configuration

### Model Hyperparameters

Edit `training/train-bias-model.js` to modify training configuration:

```javascript
const CONFIG = {
  // Model Architecture
  vocabSize: 5000,      // Vocabulary size (affects model size)
  maxLength: 256,       // Maximum sequence length
  embeddingDim: 64,     // Embedding dimensions (affects model size)
  denseUnits1: 32,      // First dense layer units
  denseUnits2: 16,      // Second dense layer units
  outputUnits: 6,       // Output units (fixed: bias_score + 5 categories)

  // Training Parameters
  epochs: 10,           // Number of training epochs
  batchSize: 32,        // Batch size (affects memory usage)
  learningRate: 0.001,  // Learning rate
  validationSplit: 0.2, // Fraction of data for validation

  // Data Processing
  shuffle: true,        // Shuffle data between epochs
  seed: 42             // Random seed for reproducibility
};
```

### Advanced Configuration

#### Memory Optimization
For systems with limited RAM:
```javascript
const CONFIG = {
  batchSize: 16,        // Reduce batch size
  vocabSize: 3000,      // Reduce vocabulary
  embeddingDim: 32,     // Reduce embedding dimensions
  denseUnits1: 16,      // Reduce dense layer size
  denseUnits2: 8        // Reduce dense layer size
};
```

#### Performance Optimization
For faster training on powerful hardware:
```javascript
const CONFIG = {
  batchSize: 64,        // Increase batch size
  vocabSize: 10000,     // Larger vocabulary
  embeddingDim: 128,    // Larger embeddings
  denseUnits1: 64,      // Larger dense layers
  denseUnits2: 32
};
```

## 🏃‍♂️ Training Process

### Phase 1: Data Loading
```
Loading training data...
Found 5000 samples
Preprocessing text data...
Building vocabulary (5000 words)...
Tokenizing sequences...
Splitting train/validation (4000/1000)...
```

### Phase 2: Model Building
```
Creating model architecture...
- Input: shape [256]
- Embedding: 5000 -> 64
- Dense 1: 32 units (ReLU)
- Dense 2: 16 units (ReLU)
- Output: 6 units (sigmoid)
Total parameters: 328,006
```

### Phase 3: Training
```
Training model...
Epoch 1/10 - loss: 0.4567 - val_loss: 0.4234
Epoch 2/10 - loss: 0.3987 - val_loss: 0.3876
...
Epoch 10/10 - loss: 0.2345 - val_loss: 0.2567
Training completed in 45.67 seconds
```

### Phase 4: Model Saving
```
Saving model architecture...
Saving model weights...
Model saved successfully
- bias-detection-model.json (4.7 KB)
- bias-detection-model.weights.bin (3.2 MB)
```

## 📈 Evaluation

### Training Metrics
Monitor these metrics during training:
- **Loss**: Should decrease steadily (both train and validation)
- **Validation Loss**: Should follow training loss without large gaps
- **Overfitting**: Large gap between train/validation loss indicates overfitting

### Model Validation
```bash
# Run comprehensive validation
node training/validate-ml-model.js

# Expected output:
✅ Model loads successfully
✅ Architecture matches configuration
✅ Inference produces valid outputs
✅ Performance meets requirements
✅ All tests passed
```

### Performance Metrics
Evaluate your trained model:
```bash
# Calculate detailed metrics
node scripts/evaluate-model.js --test-data=test-dataset.json

# Output includes:
# - Accuracy, Precision, Recall, F1-Score
# - Per-category performance
# - Confusion matrices
# - ROC curves (if applicable)
```

## 🔧 Troubleshooting

### Common Training Issues

#### Memory Errors
```
Error: Allocation of 1GB failed
```
**Solution**: Reduce batch size and model complexity
```javascript
const CONFIG = {
  batchSize: 8,         // Reduce from 32
  embeddingDim: 32,     // Reduce from 64
  denseUnits1: 16       // Reduce from 32
};
```

#### Slow Training
**Solutions**:
- Use GPU acceleration (if available)
- Reduce model complexity
- Increase batch size
- Use fewer epochs initially

#### Poor Performance
**Solutions**:
- Check data quality and balance
- Increase training epochs
- Adjust learning rate
- Add more diverse training data
- Check for data preprocessing issues

#### Overfitting
**Symptoms**: Training loss decreases but validation loss increases
**Solutions**:
- Add more training data
- Use dropout layers
- Reduce model complexity
- Implement early stopping

### Validation Issues

#### Model Won't Load
```
Error: Invalid model JSON
```
**Cause**: Corrupted model file or version mismatch
**Solution**: Retrain the model or check TensorFlow.js compatibility

#### Incorrect Predictions
**Cause**: Poor training data or insufficient training
**Solution**:
- Verify dataset labels are correct
- Increase training epochs
- Check data preprocessing consistency

## 🚀 Advanced Training

### Custom Training Script
Create a custom training script for specialized needs:

```javascript
const tf = require('@tensorflow/tfjs-node');
const { TextPreprocessor } = require('../models/text-preprocessor');

// Load your custom dataset
async function loadDataset(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  // Custom preprocessing logic
  return data;
}

// Custom model architecture
function createCustomModel(config) {
  const model = tf.sequential();

  // Custom layers
  model.add(tf.layers.embedding({
    inputDim: config.vocabSize,
    outputDim: config.embeddingDim,
    inputLength: config.maxLength
  }));

  // Add custom layers as needed
  model.add(tf.layers.bidirectional({
    layer: tf.layers.lstm({ units: 64, returnSequences: false }),
    inputShape: [config.maxLength, config.embeddingDim]
  }));

  model.add(tf.layers.dense({ units: config.outputUnits, activation: 'sigmoid' }));

  return model;
}

// Custom training loop
async function trainCustomModel(dataset, config) {
  const model = createCustomModel(config);

  model.compile({
    optimizer: tf.train.adam(config.learningRate),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy']
  });

  // Custom training logic
  await model.fit(dataset.x, dataset.y, {
    epochs: config.epochs,
    batchSize: config.batchSize,
    validationSplit: config.validationSplit,
    callbacks: [/* custom callbacks */]
  });

  return model;
}
```

### Transfer Learning
```javascript
// Load pre-trained embeddings
const embeddings = await loadPretrainedEmbeddings('path/to/embeddings.txt');

// Create model with pre-trained embeddings
function createTransferLearningModel(config) {
  const model = tf.sequential();

  // Use pre-trained embeddings
  model.add(tf.layers.embedding({
    inputDim: config.vocabSize,
    outputDim: config.embeddingDim,
    inputLength: config.maxLength,
    weights: [embeddings],
    trainable: false  // Freeze embeddings
  }));

  // Add task-specific layers
  model.add(tf.layers.globalAveragePooling1d());
  model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
  model.add(tf.layers.dropout({ rate: 0.5 }));
  model.add(tf.layers.dense({ units: config.outputUnits, activation: 'sigmoid' }));

  return model;
}
```

### Hyperparameter Tuning
```bash
# Grid search over hyperparameters
node scripts/hyperparameter-search.js \
  --param=learning_rate \
  --values=0.001,0.01,0.1 \
  --param=batch_size \
  --values=16,32,64
```

## 📦 Deployment

### Packaging for Extension
```bash
# Package model for Chrome extension
node scripts/package-model.js

# Copy files to extension
cp models/bias-detection-model.json ../extension/src/models/
cp models/bias-detection-model.weights.bin ../extension/src/models/
```

### Version Control
```bash
# Tag model versions
git tag v1.0.0-model
git push origin v1.0.0-model

# Include model metadata
{
  "version": "1.0.0",
  "training_date": "2024-01-15",
  "dataset_size": 10000,
  "validation_accuracy": 0.87,
  "vocabulary_size": 5000,
  "model_size_mb": 3.2
}
```

## 🔍 Monitoring & Logging

### Training Logs
The training script includes Datadog logging:
```bash
# Set API key for monitoring
export DD_API_KEY=your_datadog_api_key

# Training will log metrics to Datadog
node training/train-bias-model.js
```

### Custom Logging
```javascript
const logger = {
  info: (msg) => console.log(`[TRAIN] ${msg}`),
  error: (msg) => console.error(`[TRAIN] ${msg}`),
  metric: (name, value) => {
    // Log to monitoring system
    console.log(`[METRIC] ${name}: ${value}`);
  }
};
```

## 📚 Resources

### Learning Resources
- [TensorFlow.js Guide](https://www.tensorflow.org/js/guide)
- [Neural Networks for Text Classification](https://developers.google.com/machine-learning/guides/text-classification)
- [Bias Detection Research Papers](https://scholar.google.com/)

### Related Tools
- [TensorBoard](https://www.tensorflow.org/tensorboard) - Training visualization
- [Netron](https://netron.app/) - Model architecture visualization
- [TensorFlow Model Analysis](https://www.tensorflow.org/tfx/guide/tfma) - Model evaluation

## 🤝 Contributing

When contributing training improvements:
1. Test on multiple datasets
2. Include performance benchmarks
3. Document hyperparameter choices
4. Update this guide if needed

---

## 📞 Support

For training issues or questions:
1. Check the troubleshooting section above
2. Review the validation output
3. Check system requirements
4. File an issue with training logs and dataset info
