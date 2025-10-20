# ContextGuard - Team Handoff Document

## 📋 **Service Overview**

**ContextGuard** is an advanced context drift detection and management service that monitors AI context sessions for drift, maintains context consistency, and provides intelligent memory management. It implements AST-based analysis, semantic similarity detection, and comprehensive context tracking.

## 🎯 **Service Purpose**

- **Primary Goal**: Detect and manage context drift in AI conversations with 96% accuracy
- **Key Features**: Context drift detection, memory management, RAG integration, session tracking
- **Target Users**: AI developers, conversational AI systems, long-context applications

## 🏗️ **Technical Architecture**

### **Service Details**
- **Port**: 8003
- **Framework**: VS Code Extension (TypeScript/JavaScript)
- **Backend**: Node.js with WebAssembly components
- **Dependencies**: TypeScript, WebAssembly, AST parsing libraries

### **Core Components**
```
contextguard/
├── src/
│   ├── services/
│   │   ├── ContextGuardService.ts      # Core context management
│   │   ├── EnhancedContextTracker.ts   # Context session tracking
│   │   ├── DriftDetector.ts            # Drift detection algorithms
│   │   └── MemoryManager.ts            # Memory management
│   ├── providers/
│   │   ├── CompletionProvider.ts       # Code completion integration
│   │   └── DiagnosticProvider.ts       # Diagnostic integration
│   └── utils/
│       ├── ASTAnalyzer.ts              # AST-based analysis
│       └── SemanticAnalyzer.ts         # Semantic similarity
├── tests/                              # Comprehensive test suite
├── webpack.config.js                   # Build configuration
└── package.json                        # Dependencies and scripts
```

### **Context Drift Detection Methods**
1. **AST-Based Analysis** - Analyzes code structure changes
2. **Semantic Similarity** - Detects meaning changes in text
3. **Memory Pattern Analysis** - Tracks memory usage patterns
4. **Session Continuity** - Monitors conversation flow
5. **RAG Integration** - Integrates with retrieval-augmented generation

## 🔌 **API Reference**

### **Base URL**
```
http://localhost:8003
```

### **Endpoints**

#### **Health Check**
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "service": "contextguard",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00Z",
  "drift_detection_accuracy": 0.96
}
```

#### **Context Analysis**
```http
POST /api/v1/analyze
```
**Request Body:**
```json
{
  "context": "Current context to analyze",
  "session_id": "session-123",
  "previous_context": "Previous context for comparison",
  "analysis_type": "comprehensive",
  "drift_threshold": 0.8
}
```
**Response:**
```json
{
  "analysis_result": {
    "drift_detected": true,
    "drift_score": 0.85,
    "drift_type": "semantic",
    "confidence": 0.92,
    "affected_areas": [
      {
        "area": "variable_scope",
        "severity": "medium",
        "description": "Variable scope has changed significantly"
      }
    ],
    "recommendations": [
      "Review variable declarations",
      "Check for scope conflicts"
    ],
    "processing_time": 0.3
  }
}
```

#### **Session Management**
```http
POST /api/v1/session/create
```
**Request Body:**
```json
{
  "session_id": "session-123",
  "initial_context": "Initial context for the session",
  "max_memory_size": 10000,
  "drift_detection_enabled": true
}
```

#### **Memory Management**
```http
POST /api/v1/memory/update
```
**Request Body:**
```json
{
  "session_id": "session-123",
  "memory_updates": [
    {
      "type": "variable",
      "name": "userInput",
      "value": "new value",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### **RAG Integration**
```http
POST /api/v1/rag/query
```
**Request Body:**
```json
{
  "query": "Search query",
  "context": "Current context",
  "max_results": 5,
  "similarity_threshold": 0.8
}
```

## ⚙️ **Configuration**

### **Environment Variables**
```bash
# Service Configuration
CONTEXTGUARD_PORT=8003
CONTEXTGUARD_HOST=0.0.0.0
CONTEXTGUARD_ENVIRONMENT=production

# Context Settings
DEFAULT_DRIFT_THRESHOLD=0.8
MAX_CONTEXT_SIZE=10000
SESSION_TIMEOUT=3600
MEMORY_CLEANUP_INTERVAL=300

# Analysis Settings
AST_ANALYSIS_ENABLED=true
SEMANTIC_ANALYSIS_ENABLED=true
PATTERN_ANALYSIS_ENABLED=true
RAG_INTEGRATION_ENABLED=true

# Performance Settings
ANALYSIS_TIMEOUT=30
BATCH_SIZE=100
CACHE_TTL=1800

# Monitoring
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
LOG_LEVEL=INFO
```

### **VS Code Extension Configuration**
```json
{
  "contextguard.enabled": true,
  "contextguard.driftDetection": true,
  "contextguard.driftThreshold": 0.8,
  "contextguard.memoryManagement": true,
  "contextguard.maxMemorySize": 10000,
  "contextguard.analysisTypes": [
    "ast",
    "semantic",
    "pattern"
  ],
  "contextguard.ragIntegration": true,
  "contextguard.notifications": {
    "driftDetected": true,
    "memoryWarning": true,
    "sessionExpired": true
  }
}
```

### **Configuration File**
```yaml
# config.yaml
service:
  name: "contextguard"
  version: "1.0.0"
  port: 8003

context:
  drift_detection:
    enabled: true
    threshold: 0.8
    accuracy_target: 0.96
  memory_management:
    enabled: true
    max_size: 10000
    cleanup_interval: 300
  session_management:
    timeout: 3600
    max_sessions: 1000

analysis:
  ast_analysis:
    enabled: true
    depth_limit: 10
  semantic_analysis:
    enabled: true
    similarity_threshold: 0.8
  pattern_analysis:
    enabled: true
    pattern_types: ["variable", "function", "class"]

rag:
  enabled: true
  max_results: 5
  similarity_threshold: 0.8
  vector_dimensions: 768

monitoring:
  prometheus:
    enabled: true
    port: 9090
  logging:
    level: "INFO"
    format: "json"
```

## 🚀 **Deployment**

### **VS Code Extension Deployment**
```bash
# Install dependencies
npm install

# Build extension
npm run compile

# Package extension
npm run package

# Install extension
code --install-extension contextguard-1.0.0.vsix
```

### **Docker Deployment**
```bash
# Build image
docker build -t contextguard:latest .

# Run container
docker run -d \
  --name contextguard \
  -p 8003:8003 \
  -e CONTEXTGUARD_PORT=8003 \
  contextguard:latest
```

### **Docker Compose**
```yaml
version: '3.8'
services:
  contextguard:
    build: .
    ports:
      - "8003:8003"
    environment:
      - CONTEXTGUARD_PORT=8003
      - DEFAULT_DRIFT_THRESHOLD=0.8
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8003/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

### **Kubernetes Deployment**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: contextguard
spec:
  replicas: 3
  selector:
    matchLabels:
      app: contextguard
  template:
    metadata:
      labels:
        app: contextguard
    spec:
      containers:
      - name: contextguard
        image: contextguard:latest
        ports:
        - containerPort: 8003
        env:
        - name: CONTEXTGUARD_PORT
          value: "8003"
        - name: DEFAULT_DRIFT_THRESHOLD
          value: "0.8"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8003
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8003
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 📊 **Monitoring & Health Checks**

### **Health Check Endpoint**
```http
GET /health
```

### **Metrics Endpoint**
```http
GET /metrics
```

### **Key Metrics**
- `contextguard_requests_total` - Total number of analysis requests
- `contextguard_drift_detections_total` - Drift detections by type
- `contextguard_drift_accuracy` - Drift detection accuracy
- `contextguard_memory_usage_bytes` - Memory usage by session
- `contextguard_session_duration_seconds` - Session duration distribution
- `contextguard_rag_queries_total` - RAG query count

### **Grafana Dashboard**
- Context analysis request rate and response time
- Drift detection accuracy and frequency
- Memory usage patterns
- Session duration and activity
- RAG query performance
- Error rates and types

## 🔧 **Development Setup**

### **Prerequisites**
- Node.js 16+
- TypeScript 4.5+
- VS Code (for extension development)
- Docker (optional)

### **Local Development**
```bash
# Clone repository
git clone <repository-url>
cd contextguard

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Run tests
npm test

# Start development server
npm run dev
```

### **VS Code Extension Development**
```bash
# Install dependencies
npm install

# Compile extension
npm run compile

# Run extension in development mode
F5 (in VS Code)

# Package extension
npm run package
```

### **Testing**
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage

# Run extension tests
npm run test:extension
```

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Extension Not Loading**
```bash
# Check extension logs
code --log trace

# Verify extension installation
code --list-extensions | grep contextguard

# Reinstall extension
code --uninstall-extension contextguard
code --install-extension contextguard-1.0.0.vsix
```

#### **Service Not Starting**
```bash
# Check logs
docker logs contextguard

# Check health endpoint
curl http://localhost:8003/health

# Verify environment variables
docker exec contextguard env | grep CONTEXTGUARD
```

#### **Drift Detection Issues**
```bash
# Test drift detection
curl -X POST http://localhost:8003/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "context": "Test context",
    "session_id": "test-session",
    "analysis_type": "comprehensive"
  }'
```

### **Performance Issues**
- Check drift detection threshold settings
- Monitor memory usage and cleanup
- Review analysis processing time
- Check session timeout settings

### **Error Codes**
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid session)
- `404` - Session Not Found
- `429` - Rate Limited (too many requests)
- `500` - Internal Server Error
- `503` - Service Unavailable

## 🔄 **Maintenance Tasks**

### **Daily**
- Monitor drift detection accuracy
- Check memory usage and cleanup
- Review session activity
- Verify RAG integration performance

### **Weekly**
- Update drift detection models
- Review context analysis patterns
- Check memory management efficiency
- Analyze session duration trends

### **Monthly**
- Update dependencies and security patches
- Review and optimize drift thresholds
- Performance testing and tuning
- Update analysis algorithms

### **Quarterly**
- Security audit and updates
- Drift detection model retraining
- Capacity planning review
- Disaster recovery testing

## 📞 **Support Contacts**

- **Development Team**: dev-team@company.com
- **AI Research Team**: ai-research@company.com
- **VS Code Extension Team**: vscode-team@company.com
- **Operations Team**: ops-team@company.com
- **Emergency Contact**: oncall@company.com

## 📚 **Additional Resources**

- [API Documentation](http://localhost:8003/docs)
- [OpenAPI Specification](http://localhost:8003/openapi.json)
- [VS Code Extension Marketplace](https://marketplace.visualstudio.com/items?itemName=company.contextguard)
- [Monitoring Dashboard](http://localhost:3000/d/contextguard)
- [Drift Detection Guide](docs/drift-detection-guide.md)
- [Memory Management Guide](docs/memory-management-guide.md)
- [RAG Integration Guide](docs/rag-integration-guide.md)
- [Source Code Repository](https://github.com/company/contextguard)

---

**Last Updated**: 2024-01-01  
**Version**: 1.0.0  
**Maintainer**: AI Research Team
