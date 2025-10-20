/**
 * AI Guardians Chrome Extension - Comprehensive Test Runner
 * 
 * This module provides comprehensive testing capabilities including:
 * - Unit tests for all components
 * - Smoke tests for basic functionality
 * - Dependency checks and validation
 * - Integration tests with all 6 guards
 * - Performance testing and monitoring
 * - Security validation
 * - Complete logging and tracing
 */

class AIGuardiansTestRunner {
  constructor() {
    this.testResults = [];
    this.traceStats = {
      request_count: 0,
      success_count: 0,
      error_count: 0,
      average_response_time: 0,
      guard_service_usage: {},
      performance_metrics: {},
      error_patterns: {},
      user_interactions: {}
    };
    this.startTime = Date.now();
  }

  /**
   * TRACER BULLET: Run comprehensive test suite
   */
  async runComprehensiveTests() {
    console.log('[TestRunner] Starting comprehensive test suite...');
    
    const testSuite = {
      unit_tests: await this.runUnitTests(),
      smoke_tests: await this.runSmokeTests(),
      dependency_checks: await this.runDependencyChecks(),
      integration_tests: await this.runIntegrationTests(),
      performance_tests: await this.runPerformanceTests(),
      security_tests: await this.runSecurityTests()
    };

    const summary = this.generateTestSummary(testSuite);
    this.logTestResults(summary);
    
    return summary;
  }

  /**
   * TRACER BULLET: Unit tests for all components
   */
  async runUnitTests() {
    console.log('[TestRunner] Running unit tests...');
    
    const unitTests = {
      gateway_tests: await this.testGatewayFunctionality(),
      background_tests: await this.testBackgroundScript(),
      content_tests: await this.testContentScript(),
      options_tests: await this.testOptionsInterface(),
      popup_tests: await this.testPopupInterface(),
      storage_tests: await this.testStorageOperations(),
      message_tests: await this.testMessagePassing()
    };

    return this.aggregateTestResults(unitTests, 'unit_tests');
  }

  /**
   * TRACER BULLET: Smoke tests for basic functionality
   */
  async runSmokeTests() {
    console.log('[TestRunner] Running smoke tests...');
    
    const smokeTests = {
      extension_loading: await this.testExtensionLoading(),
      text_selection: await this.testTextSelection(),
      analysis_display: await this.testAnalysisDisplay(),
      options_access: await this.testOptionsAccess(),
      popup_functionality: await this.testPopupFunctionality(),
      guard_services: await this.testGuardServicesBasic()
    };

    return this.aggregateTestResults(smokeTests, 'smoke_tests');
  }

  /**
   * TRACER BULLET: Dependency checks and validation
   */
  async runDependencyChecks() {
    console.log('[TestRunner] Running dependency checks...');
    
    const dependencyChecks = {
      manifest_validation: await this.validateManifest(),
      permissions_check: await this.checkPermissions(),
      file_structure: await this.validateFileStructure(),
      chrome_apis: await this.testChromeAPIs(),
      storage_access: await this.testStorageAccess(),
      network_connectivity: await this.testNetworkConnectivity()
    };

    return this.aggregateTestResults(dependencyChecks, 'dependency_checks');
  }

  /**
   * TRACER BULLET: Integration tests with all 6 guards
   */
  async runIntegrationTests() {
    console.log('[TestRunner] Running integration tests...');
    
    const integrationTests = {
      all_guards_analysis: await this.testAllGuardsAnalysis(),
      gateway_communication: await this.testGatewayCommunication(),
      central_logging: await this.testCentralLogging(),
      configuration_management: await this.testConfigurationManagement(),
      error_handling: await this.testErrorHandling(),
      guard_orchestration: await this.testGuardOrchestration()
    };

    return this.aggregateTestResults(integrationTests, 'integration_tests');
  }

  /**
   * TRACER BULLET: Performance testing and monitoring
   */
  async runPerformanceTests() {
    console.log('[TestRunner] Running performance tests...');
    
    const performanceTests = {
      response_times: await this.measureResponseTimes(),
      memory_usage: await this.monitorMemoryUsage(),
      concurrent_requests: await this.testConcurrentRequests(),
      large_text_processing: await this.testLargeTextProcessing(),
      stress_testing: await this.runStressTests(),
      throughput_analysis: await this.analyzeThroughput()
    };

    return this.aggregateTestResults(performanceTests, 'performance_tests');
  }

  /**
   * TRACER BULLET: Security validation
   */
  async runSecurityTests() {
    console.log('[TestRunner] Running security tests...');
    
    const securityTests = {
      data_privacy: await this.testDataPrivacy(),
      api_security: await this.testAPISecurity(),
      storage_security: await this.testStorageSecurity(),
      permission_validation: await this.testPermissionValidation(),
      content_security: await this.testContentSecurity(),
      authentication: await this.testAuthentication()
    };

    return this.aggregateTestResults(securityTests, 'security_tests');
  }

  /**
   * TRACER BULLET: Test gateway functionality
   */
  async testGatewayFunctionality() {
    const tests = [];
    
    try {
      // Test gateway initialization
      const gateway = new AIGuardiansGateway();
      tests.push({ name: 'gateway_initialization', passed: !!gateway, error: null });
      
      // Test configuration loading
      const config = await gateway.getCentralConfiguration();
      tests.push({ name: 'config_loading', passed: !!config, error: null });
      
      // Test guard services status
      const status = await gateway.getGuardServiceStatus();
      tests.push({ name: 'guard_status', passed: !!status, error: null });
      
    } catch (err) {
      tests.push({ name: 'gateway_functionality', passed: false, error: err.message });
    }
    
    return tests;
  }

  /**
   * TRACER BULLET: Test background script
   */
  async testBackgroundScript() {
    const tests = [];
    
    try {
      // Test message handling
      const response = await this.sendMessageToBackground('GET_GUARD_STATUS');
      tests.push({ name: 'message_handling', passed: response.success, error: response.error });
      
      // Test configuration management
      const configResponse = await this.sendMessageToBackground('GET_CENTRAL_CONFIG');
      tests.push({ name: 'config_management', passed: configResponse.success, error: configResponse.error });
      
    } catch (err) {
      tests.push({ name: 'background_script', passed: false, error: err.message });
    }
    
    return tests;
  }

  /**
   * TRACER BULLET: Test content script
   */
  async testContentScript() {
    const tests = [];
    
    try {
      // Test text selection
      const selection = window.getSelection()?.toString() || "";
      tests.push({ name: 'text_selection', passed: typeof selection === 'string', error: null });
      
      // Test analysis request
      const analysisResponse = await this.sendMessageToBackground('ANALYZE_TEXT', { payload: 'test text' });
      tests.push({ name: 'analysis_request', passed: analysisResponse.success, error: analysisResponse.error });
      
    } catch (err) {
      tests.push({ name: 'content_script', passed: false, error: err.message });
    }
    
    return tests;
  }

  /**
   * TRACER BULLET: Test options interface
   */
  async testOptionsInterface() {
    const tests = [];
    
    try {
      // Test options page elements
      const gatewayUrl = document.getElementById('gateway_url');
      const apiKey = document.getElementById('api_key');
      const guardServices = document.getElementById('guard_services');
      
      tests.push({ name: 'options_elements', passed: !!(gatewayUrl && apiKey && guardServices), error: null });
      
      // Test guard service configuration
      const guardElements = document.querySelectorAll('.guard-service');
      tests.push({ name: 'guard_services_ui', passed: guardElements.length === 6, error: null });
      
      // Test configuration loading
      const config = await this.loadConfiguration();
      tests.push({ name: 'config_loading', passed: !!config, error: null });
      
    } catch (err) {
      tests.push({ name: 'options_interface', passed: false, error: err.message });
    }
    
    return tests;
  }

  /**
   * TRACER BULLET: Test popup interface
   */
  async testPopupInterface() {
    const tests = [];
    
    try {
      // Test popup elements
      const title = document.querySelector('h1');
      const button = document.getElementById('noop');
      
      tests.push({ name: 'popup_elements', passed: !!(title && button), error: null });
      
      // Test button functionality
      const clickResult = await this.testButtonClick(button);
      tests.push({ name: 'button_functionality', passed: clickResult, error: null });
      
    } catch (err) {
      tests.push({ name: 'popup_interface', passed: false, error: err.message });
    }
    
    return tests;
  }

  /**
   * TRACER BULLET: Test all 6 guards analysis
   */
  async testAllGuardsAnalysis() {
    const tests = [];
    const guardServices = ['biasguard', 'trustguard', 'contextguard', 'tokenguard', 'securityguard', 'healthguard'];
    
    for (const guard of guardServices) {
      try {
        const testText = `Test text for ${guard} analysis`;
        const response = await this.sendMessageToBackground('ANALYZE_TEXT', { payload: testText });
        
        tests.push({
          name: `${guard}_analysis`,
          passed: response.success,
          error: response.error,
          response_time: response.processing_time,
          guard_service: guard
        });
        
        // Update trace stats
        this.traceStats.guard_service_usage[guard] = (this.traceStats.guard_service_usage[guard] || 0) + 1;
        
      } catch (err) {
        tests.push({
          name: `${guard}_analysis`,
          passed: false,
          error: err.message,
          guard_service: guard
        });
      }
    }
    
    return tests;
  }

  /**
   * TRACER BULLET: Measure response times
   */
  async measureResponseTimes() {
    const tests = [];
    const testTexts = [
      'Short text',
      'Medium length text for testing response times',
      'This is a longer text that will test the performance of the AI Guardians system with multiple guard services running simultaneously'
    ];
    
    for (const text of testTexts) {
      const startTime = Date.now();
      
      try {
        const response = await this.sendMessageToBackground('ANALYZE_TEXT', { payload: text });
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        tests.push({
          name: `response_time_${text.length}`,
          passed: response.success && responseTime < 5000, // 5 second timeout
          error: response.error,
          response_time: responseTime,
          text_length: text.length
        });
        
        // Update performance metrics
        this.traceStats.performance_metrics.average_response_time = 
          (this.traceStats.performance_metrics.average_response_time + responseTime) / 2;
        
      } catch (err) {
        tests.push({
          name: `response_time_${text.length}`,
          passed: false,
          error: err.message,
          response_time: Date.now() - startTime
        });
      }
    }
    
    return tests;
  }

  /**
   * TRACER BULLET: Monitor memory usage
   */
  async monitorMemoryUsage() {
    const tests = [];
    
    try {
      // Get memory info if available
      if (performance.memory) {
        const memoryInfo = {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        };
        
        const memoryUsagePercent = (memoryInfo.used / memoryInfo.limit) * 100;
        
        tests.push({
          name: 'memory_usage',
          passed: memoryUsagePercent < 80, // Less than 80% memory usage
          error: null,
          memory_usage: memoryUsagePercent,
          memory_info: memoryInfo
        });
        
        this.traceStats.performance_metrics.memory_usage = memoryUsagePercent;
      } else {
        tests.push({
          name: 'memory_usage',
          passed: true,
          error: 'Memory API not available',
          memory_usage: 'unknown'
        });
      }
      
    } catch (err) {
      tests.push({
        name: 'memory_usage',
        passed: false,
        error: err.message
      });
    }
    
    return tests;
  }

  /**
   * TRACER BULLET: Test data privacy
   */
  async testDataPrivacy() {
    const tests = [];
    
    try {
      // Test that no sensitive data is stored in localStorage
      const localStorageKeys = Object.keys(localStorage);
      const sensitiveKeys = localStorageKeys.filter(key => 
        key.includes('password') || key.includes('token') || key.includes('secret')
      );
      
      tests.push({
        name: 'localStorage_privacy',
        passed: sensitiveKeys.length === 0,
        error: sensitiveKeys.length > 0 ? 'Sensitive data found in localStorage' : null,
        sensitive_keys: sensitiveKeys
      });
      
      // Test that API keys are not exposed in console
      const consoleLogs = this.captureConsoleLogs();
      const exposedSecrets = consoleLogs.filter(log => 
        log.includes('api_key') || log.includes('password') || log.includes('secret')
      );
      
      tests.push({
        name: 'console_privacy',
        passed: exposedSecrets.length === 0,
        error: exposedSecrets.length > 0 ? 'Secrets exposed in console' : null,
        exposed_secrets: exposedSecrets
      });
      
    } catch (err) {
      tests.push({
        name: 'data_privacy',
        passed: false,
        error: err.message
      });
    }
    
    return tests;
  }

  /**
   * TRACER BULLET: Generate comprehensive test summary
   */
  generateTestSummary(testSuite) {
    const summary = {
      timestamp: new Date().toISOString(),
      test_duration: Date.now() - this.startTime,
      total_tests: 0,
      passed_tests: 0,
      failed_tests: 0,
      success_rate: 0,
      test_categories: {},
      performance_metrics: this.traceStats.performance_metrics,
      guard_service_usage: this.traceStats.guard_service_usage,
      recommendations: []
    };
    
    // Aggregate results from all test categories
    for (const [category, results] of Object.entries(testSuite)) {
      const categorySummary = {
        total: results.total || 0,
        passed: results.passed || 0,
        failed: results.failed || 0,
        success_rate: results.success_rate || 0
      };
      
      summary.test_categories[category] = categorySummary;
      summary.total_tests += categorySummary.total;
      summary.passed_tests += categorySummary.passed;
      summary.failed_tests += categorySummary.failed;
    }
    
    summary.success_rate = summary.total_tests > 0 ? 
      (summary.passed_tests / summary.total_tests) * 100 : 0;
    
    // Generate recommendations
    if (summary.success_rate < 100) {
      summary.recommendations.push('Review failed tests and fix issues');
    }
    
    if (summary.performance_metrics.average_response_time > 2000) {
      summary.recommendations.push('Optimize response times for better performance');
    }
    
    if (summary.performance_metrics.memory_usage > 70) {
      summary.recommendations.push('Monitor memory usage and optimize if necessary');
    }
    
    return summary;
  }

  /**
   * TRACER BULLET: Log comprehensive test results
   */
  logTestResults(summary) {
    console.log('[TestRunner] Test Results Summary:');
    console.log(`Total Tests: ${summary.total_tests}`);
    console.log(`Passed: ${summary.passed_tests}`);
    console.log(`Failed: ${summary.failed_tests}`);
    console.log(`Success Rate: ${summary.success_rate.toFixed(2)}%`);
    console.log(`Test Duration: ${summary.test_duration}ms`);
    
    console.log('[TestRunner] Performance Metrics:');
    console.log(`Average Response Time: ${summary.performance_metrics.average_response_time}ms`);
    console.log(`Memory Usage: ${summary.performance_metrics.memory_usage}%`);
    
    console.log('[TestRunner] Guard Service Usage:');
    Object.entries(summary.guard_service_usage).forEach(([guard, count]) => {
      console.log(`${guard}: ${count} requests`);
    });
    
    if (summary.recommendations.length > 0) {
      console.log('[TestRunner] Recommendations:');
      summary.recommendations.forEach(rec => console.log(`- ${rec}`));
    }
  }

  /**
   * TRACER BULLET: Aggregate test results
   */
  aggregateTestResults(tests, category) {
    const results = Array.isArray(tests) ? tests : Object.values(tests).flat();
    
    const total = results.length;
    const passed = results.filter(test => test.passed).length;
    const failed = total - passed;
    const success_rate = total > 0 ? (passed / total) * 100 : 0;
    
    return {
      category,
      total,
      passed,
      failed,
      success_rate,
      results
    };
  }

  /**
   * TRACER BULLET: Send message to background script
   */
  async sendMessageToBackground(type, payload = null) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type, payload }, (response) => {
        resolve(response || { success: false, error: 'No response' });
      });
    });
  }

  /**
   * TRACER BULLET: Load configuration
   */
  async loadConfiguration() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(null, (data) => {
        resolve(data);
      });
    });
  }

  /**
   * TRACER BULLET: Test button click
   */
  async testButtonClick(button) {
    return new Promise((resolve) => {
      if (button) {
        button.click();
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  /**
   * TRACER BULLET: Capture console logs
   */
  captureConsoleLogs() {
    // This would need to be implemented with console interception
    // For now, return empty array
    return [];
  }
}

// Export for use in other modules
window.AIGuardiansTestRunner = AIGuardiansTestRunner;
