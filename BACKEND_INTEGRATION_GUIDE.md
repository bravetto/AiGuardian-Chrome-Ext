# AI Guardians Backend Integration Guide

This guide provides comprehensive instructions for integrating the Chrome extension with your AI Guardians backend services through the central gateway.

## 🏗️ Architecture Overview

### Central Gateway Pattern
The extension uses a **central gateway pattern** to communicate with AI Guardians backend services:

```
Chrome Extension → Central Gateway → Guard Services
                     ↓
                Central Logging
                     ↓
                Central Config
```

### Key Components
- **Gateway Bridge** (`src/gateway.js`) - Central communication hub
- **Guard Services** - Individual AI analysis services
- **Central Logging** - Unified logging across all services
- **Central Config** - Configuration management
- **Testing Framework** - Comprehensive testing capabilities

## 🔧 Backend Integration Setup

### 1. Gateway Configuration

#### Configure Your Gateway Endpoint
```javascript
// In src/gateway.js, update the configuration:
this.config = {
  gatewayUrl: 'https://your-ai-guardians-gateway.com/api/v1',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000
};
```

#### Required Gateway Endpoints
Your AI Guardians gateway must implement these endpoints:

```http
POST /api/v1/analyze
POST /api/v1/logging
POST /api/v1/health
GET  /api/v1/config
PUT  /api/v1/config
```

### 2. Authentication Setup

#### API Key Authentication
```javascript
// The extension sends requests with:
headers: {
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
  'X-Extension-Version': '0.1.0',
  'X-Request-ID': 'unique-request-id'
}
```

#### Request Format
```json
{
  "analysis_id": "ext_1234567890_abc123",
  "text": "Text to analyze",
  "guards": ["bias_detection", "toxicity_detection"],
  "options": {
    "pipeline": "default",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Guard Services Integration

#### Supported Guard Services (All 6 AI Guardians)
- **BiasGuard** - Bias detection and mitigation (6 algorithms, 89-94% accuracy)
- **TrustGuard** - AI failure pattern detection and reliability analysis
- **ContextGuard** - Context drift detection and memory management
- **TokenGuard** - Token optimization and cost reduction
- **SecurityGuard** - Security threat detection and protection
- **HealthGuard** - System health monitoring and diagnostics

#### Guard Service Configuration
```javascript
// Each guard service can be configured with:
{
  "enabled": true,
  "threshold": 0.5,
  "pipeline": "bias_analysis_v2",
  "last_used": "2024-01-01T00:00:00.000Z",
  "success_count": 100,
  "error_count": 5
}
```

## 📊 Central Logging Integration

### Logging Configuration
```javascript
// Configure central logging in options:
{
  "enable_central_logging": true,
  "enable_local_logging": true,
  "level": "info"
}
```

### Log Format
```json
{
  "level": "info",
  "message": "Text analysis completed",
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "extension_version": "0.1.0",
    "user_agent": "Mozilla/5.0...",
    "analysis_id": "ext_1234567890_abc123",
    "guard_services": ["bias_detection"],
    "response_time": 1500
  }
}
```

### Central Logging Endpoint
```http
POST /api/v1/logging
Content-Type: application/json

{
  "level": "info",
  "message": "Analysis completed",
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "extension_version": "0.1.0",
    "analysis_id": "ext_1234567890_abc123"
  }
}
```

## ⚙️ Central Configuration Management

### Configuration Structure
```javascript
{
  "gateway_url": "https://your-ai-guardians-gateway.com/api/v1",
  "api_key": "your-api-key",
  "guard_services": {
    "bias_detection": {
      "enabled": true,
      "threshold": 0.5,
      "pipeline": "bias_analysis_v2"
    },
    "toxicity_detection": {
      "enabled": true,
      "threshold": 0.7,
      "pipeline": "toxicity_analysis_v1"
    }
  },
  "logging_config": {
    "enable_central_logging": true,
    "enable_local_logging": true,
    "level": "info"
  },
  "analysis_pipeline": "default"
}
```

### Configuration Endpoints
```http
GET /api/v1/config
PUT /api/v1/config
```

## 🧪 Testing Framework Integration

### Test Data Structure
```javascript
{
  "bias_detection": {
    "positive_cases": [
      {
        "text": "This product is clearly superior to all competitors.",
        "expected_bias_score": 0.8,
        "expected_bias_type": "opinion_bias"
      }
    ],
    "negative_cases": [
      {
        "text": "The weather today is sunny with a temperature of 75 degrees.",
        "expected_bias_score": 0.1,
        "expected_bias_type": "neutral"
      }
    ]
  }
}
```

### Test Execution
```javascript
// Run comprehensive tests
const testing = new AIGuardiansTesting();
const results = await testing.runGuardServiceTests();
const performanceResults = await testing.runPerformanceTests();
const integrationResults = await testing.runIntegrationTests();
```

## 🔄 Message Flow

### 1. Text Analysis Flow
```
Content Script → Background Script → Gateway → Guard Services
                     ↓
                Central Logging
                     ↓
                Response Transformation
                     ↓
                Content Script (UI Update)
```

### 2. Configuration Flow
```
Options Page → Background Script → Gateway → Central Config
                     ↓
                Local Storage Update
                     ↓
                UI Update
```

### 3. Testing Flow
```
Options Page → Testing Framework → Background Script → Gateway
                     ↓
                Test Execution
                     ↓
                Results Display
```

## 🚀 Implementation Steps

### Phase 1: Basic Integration (30 minutes)
1. **Configure Gateway URL**
   ```javascript
// In src/gateway.js
this.config.gatewayUrl = 'https://your-ai-guardians-gateway.com/api/v1';
```

2. **Set up API Authentication**
   ```javascript
// In options page, configure API key
document.getElementById('api_key').value = 'your-api-key';
```

3. **Test Connection**
   - Use the "Test Connection" button in options
   - Verify gateway responds to health checks

### Phase 2: Guard Services Integration (45 minutes)
1. **Configure Guard Services**
   - Enable/disable specific guards
   - Set thresholds for each service
   - Configure analysis pipelines

2. **Implement Analysis Pipeline**
   ```javascript
   // Update handleTextAnalysis in background.js
   const result = await gateway.analyzeText(text, {
     source: 'chrome_extension',
     timestamp: new Date().toISOString()
   });
   ```

3. **Test Guard Services**
   - Run guard service tests
   - Verify analysis results
   - Check performance metrics

### Phase 3: Advanced Features (60 minutes)
1. **Central Logging Integration**
   - Configure logging endpoints
   - Set up log levels and filtering
   - Test log delivery

2. **Configuration Management**
   - Implement config synchronization
   - Add configuration validation
   - Set up config backup/restore

3. **Testing & Validation**
   - Run comprehensive test suite
   - Performance testing
   - Integration testing

## 🔍 Monitoring & Debugging

### Health Checks
```javascript
// Gateway health check
const isHealthy = await gateway.testGatewayConnection();

// Guard services status
const status = await gateway.getGuardServiceStatus();
```

### Debug Information
```javascript
// Get comprehensive status
const status = {
  gateway_connected: await gateway.testGatewayConnection(),
  guard_services: await gateway.getGuardServiceStatus(),
  configuration: await gateway.getCentralConfiguration()
};
```

### Logging Levels
- **Debug** - Detailed debugging information
- **Info** - General information
- **Warn** - Warning messages
- **Error** - Error conditions

## 📈 Performance Optimization

### Request Optimization
- **Debouncing** - Prevents excessive requests
- **Caching** - Stores recent analysis results
- **Retry Logic** - Handles temporary failures
- **Timeout Management** - Prevents hanging requests

### Monitoring Metrics
- **Response Times** - Track analysis performance
- **Success Rates** - Monitor service reliability
- **Error Rates** - Identify issues quickly
- **Throughput** - Measure processing capacity

## 🔒 Security Considerations

### API Security
- **HTTPS Only** - All communications encrypted
- **API Key Rotation** - Regular key updates
- **Request Validation** - Input sanitization
- **Rate Limiting** - Prevent abuse

### Data Privacy
- **Local Storage** - Sensitive data encrypted
- **No Data Persistence** - Analysis results not stored
- **User Consent** - Clear privacy controls
- **Audit Logging** - Track all activities

## 🛠️ Troubleshooting

### Common Issues

#### Gateway Connection Failed
```javascript
// Check gateway URL and API key
const config = await gateway.getCentralConfiguration();
console.log('Gateway URL:', config.gateway_url);
console.log('API Key configured:', !!config.api_key_configured);
```

#### Guard Services Not Responding
```javascript
// Check guard service status
const status = await gateway.getGuardServiceStatus();
console.log('Guard services:', status.guard_services);
```

#### Analysis Results Inconsistent
```javascript
// Run test suite to validate
const results = await testingFramework.runGuardServiceTests();
console.log('Test results:', results);
```

### Debug Mode
```javascript
// Enable debug logging
chrome.storage.sync.set({
  logging_config: {
    level: 'debug',
    enable_central_logging: true,
    enable_local_logging: true
  }
});
```

## 📚 API Reference

### Gateway Methods
```javascript
// Initialize gateway
const gateway = new AIGuardiansGateway();

// Analyze text
const result = await gateway.analyzeText(text, options);

// Get status
const status = await gateway.getGuardServiceStatus();

// Update configuration
await gateway.updateCentralConfiguration(config);
```

### Testing Methods
```javascript
// Initialize testing
const testing = new AIGuardiansTesting();

// Run tests
const results = await testing.runGuardServiceTests();
const performance = await testing.runPerformanceTests();
const integration = await testing.runIntegrationTests();
```

## 🎯 Next Steps

1. **Configure Your Gateway** - Set up the central gateway endpoint
2. **Implement Guard Services** - Add your AI analysis services
3. **Set up Logging** - Configure central logging
4. **Test Integration** - Run comprehensive tests
5. **Deploy & Monitor** - Go live and monitor performance

---

**Need Help?** Check the tracer bullets in the code for specific implementation guidance!
