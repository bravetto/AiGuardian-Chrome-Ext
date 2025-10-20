# AI Guardians Chrome Extension - Comprehensive Testing Guide

## 🧪 **Testing Architecture Overview**

This guide covers comprehensive testing for the AI Guardians Chrome Extension with all 6 guard services integration.

### **Testing Levels**
1. **Unit Tests** - Individual component testing
2. **Smoke Tests** - Basic functionality validation
3. **Dependency Checks** - Requirements and compatibility validation
4. **Integration Tests** - End-to-end guard service testing
5. **Performance Tests** - Load and response time testing
6. **Security Tests** - Security and privacy validation

## 🔧 **Testing Framework Setup**

### **Prerequisites**
- Chrome browser with developer mode enabled
- Node.js (for dependency management)
- Git (for version control)

### **Test Environment Setup**
```bash
# Load extension in Chrome
1. Open chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked" and select this directory
4. Verify extension loads without errors
```

## 📊 **Test Data and Validation**

### **Guard Service Test Cases**

#### **BiasGuard Test Cases**
```javascript
const biasTestCases = {
  positive_cases: [
    {
      text: "This product is clearly superior to all competitors and anyone who disagrees is wrong.",
      expected_bias_score: 0.8,
      expected_bias_type: "opinion_bias"
    },
    {
      text: "Women are naturally better at cooking than men.",
      expected_bias_score: 0.9,
      expected_bias_type: "gender_bias"
    }
  ],
  negative_cases: [
    {
      text: "The weather today is sunny with a temperature of 75 degrees.",
      expected_bias_score: 0.1,
      expected_bias_type: "neutral"
    }
  ]
};
```

#### **TrustGuard Test Cases**
```javascript
const trustTestCases = {
  positive_cases: [
    {
      text: "This AI system has been trained on biased data and may produce unreliable results.",
      expected_trust_score: 0.3,
      expected_trust_type: "low_reliability"
    }
  ],
  negative_cases: [
    {
      text: "This AI system has been thoroughly tested and validated with high accuracy.",
      expected_trust_score: 0.9,
      expected_trust_type: "high_reliability"
    }
  ]
};
```

#### **ContextGuard Test Cases**
```javascript
const contextTestCases = {
  positive_cases: [
    {
      text: "The context has shifted significantly from the original training data.",
      expected_context_score: 0.2,
      expected_context_type: "context_drift"
    }
  ],
  negative_cases: [
    {
      text: "The context remains consistent with the training data.",
      expected_context_score: 0.9,
      expected_context_type: "context_stable"
    }
  ]
};
```

#### **TokenGuard Test Cases**
```javascript
const tokenTestCases = {
  positive_cases: [
    {
      text: "This is a very long and verbose text that could be optimized for token efficiency.",
      expected_optimization_score: 0.8,
      expected_optimization_type: "high_optimization_potential"
    }
  ],
  negative_cases: [
    {
      text: "Concise text.",
      expected_optimization_score: 0.1,
      expected_optimization_type: "already_optimized"
    }
  ]
};
```

#### **SecurityGuard Test Cases**
```javascript
const securityTestCases = {
  positive_cases: [
    {
      text: "This contains potential security vulnerabilities and should be reviewed.",
      expected_security_score: 0.8,
      expected_security_type: "security_risk"
    }
  ],
  negative_cases: [
    {
      text: "This appears to be safe and secure content.",
      expected_security_score: 0.1,
      expected_security_type: "secure"
    }
  ]
};
```

#### **HealthGuard Test Cases**
```javascript
const healthTestCases = {
  positive_cases: [
    {
      text: "System performance is degrading and requires attention.",
      expected_health_score: 0.3,
      expected_health_type: "performance_issue"
    }
  ],
  negative_cases: [
    {
      text: "System is operating normally with optimal performance.",
      expected_health_score: 0.9,
      expected_health_type: "healthy"
    }
  ]
};
```

## 🚀 **Test Execution**

### **1. Unit Tests**
```javascript
// Run unit tests for each component
const unitTests = {
  gateway: testGatewayFunctionality(),
  background: testBackgroundScript(),
  content: testContentScript(),
  options: testOptionsInterface(),
  popup: testPopupInterface()
};
```

### **2. Smoke Tests**
```javascript
// Basic functionality validation
const smokeTests = {
  extension_loading: testExtensionLoading(),
  text_selection: testTextSelection(),
  analysis_display: testAnalysisDisplay(),
  options_access: testOptionsAccess(),
  popup_functionality: testPopupFunctionality()
};
```

### **3. Dependency Checks**
```javascript
// Validate all dependencies
const dependencyChecks = {
  manifest_validation: validateManifest(),
  permissions_check: checkPermissions(),
  file_structure: validateFileStructure(),
  chrome_apis: testChromeAPIs(),
  storage_access: testStorageAccess()
};
```

### **4. Integration Tests**
```javascript
// End-to-end testing with all 6 guards
const integrationTests = {
  all_guards_analysis: testAllGuardsAnalysis(),
  gateway_communication: testGatewayCommunication(),
  central_logging: testCentralLogging(),
  configuration_management: testConfigurationManagement(),
  error_handling: testErrorHandling()
};
```

### **5. Performance Tests**
```javascript
// Performance and load testing
const performanceTests = {
  response_times: measureResponseTimes(),
  memory_usage: monitorMemoryUsage(),
  concurrent_requests: testConcurrentRequests(),
  large_text_processing: testLargeTextProcessing(),
  stress_testing: runStressTests()
};
```

### **6. Security Tests**
```javascript
// Security and privacy validation
const securityTests = {
  data_privacy: testDataPrivacy(),
  api_security: testAPISecurity(),
  storage_security: testStorageSecurity(),
  permission_validation: testPermissionValidation(),
  content_security: testContentSecurity()
};
```

## 📈 **Test Results and Metrics**

### **Success Criteria**
- **Unit Tests**: 100% pass rate
- **Smoke Tests**: 100% pass rate
- **Dependency Checks**: All dependencies valid
- **Integration Tests**: All guards functional
- **Performance Tests**: <2s response time
- **Security Tests**: No vulnerabilities detected

### **Test Reporting**
```javascript
const testReport = {
  timestamp: new Date().toISOString(),
  total_tests: 0,
  passed_tests: 0,
  failed_tests: 0,
  success_rate: 0,
  performance_metrics: {},
  security_metrics: {},
  guard_service_results: {}
};
```

## 🔍 **Logging and Tracing**

### **Comprehensive Logging**
```javascript
// All test activities are logged with:
const testLog = {
  test_id: generateTestId(),
  timestamp: new Date().toISOString(),
  test_type: 'unit|smoke|integration|performance|security',
  component: 'gateway|background|content|options|popup',
  guard_service: 'biasguard|trustguard|contextguard|tokenguard|securityguard|healthguard',
  input_data: testInput,
  expected_result: expectedOutput,
  actual_result: actualOutput,
  success: boolean,
  error_message: errorDetails,
  performance_metrics: {
    response_time: milliseconds,
    memory_usage: bytes,
    cpu_usage: percentage
  }
};
```

### **Trace Statistics**
```javascript
// Comprehensive trace data collection
const traceStats = {
  request_count: 0,
  success_count: 0,
  error_count: 0,
  average_response_time: 0,
  guard_service_usage: {},
  performance_metrics: {},
  error_patterns: {},
  user_interactions: {}
};
```

## 🎯 **Test Execution Commands**

### **Run All Tests**
```bash
# Open Chrome DevTools and run:
# 1. Load extension
# 2. Open options page
# 3. Click "Run Guard Service Tests"
# 4. Click "Run Performance Tests"
# 5. Click "Run Integration Tests"
```

### **Individual Test Execution**
```javascript
// Test specific components
testGatewayConnection();
testGuardServices();
testPerformanceMetrics();
testSecurityValidation();
testErrorHandling();
```

## 📋 **Test Checklist**

### **Pre-Test Validation**
- [ ] Extension loads without errors
- [ ] All files present and valid
- [ ] Manifest.json syntax correct
- [ ] No console errors on load
- [ ] All permissions granted

### **Unit Test Checklist**
- [ ] Gateway initialization
- [ ] Background script functionality
- [ ] Content script injection
- [ ] Options interface
- [ ] Popup interface
- [ ] Storage operations
- [ ] Message passing

### **Integration Test Checklist**
- [ ] All 6 guards functional
- [ ] Gateway communication
- [ ] Central logging
- [ ] Configuration management
- [ ] Error handling
- [ ] Performance metrics

### **Security Test Checklist**
- [ ] Data privacy protection
- [ ] API security validation
- [ ] Storage security
- [ ] Permission validation
- [ ] Content security policy

## 🚨 **Troubleshooting**

### **Common Issues**
1. **Extension won't load**: Check manifest.json syntax
2. **Guards not responding**: Verify gateway configuration
3. **Performance issues**: Check memory usage and response times
4. **Security warnings**: Validate permissions and CSP

### **Debug Mode**
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

## 📊 **Test Results Dashboard**

The testing framework provides a comprehensive dashboard showing:
- Test execution status
- Performance metrics
- Guard service effectiveness
- Error patterns and resolution
- Security validation results
- User interaction analytics

---

**Ready to test?** Use the options page testing interface or run tests programmatically through the testing framework!
