# CodeGuardians Gateway - Team Handoff Document

## 📋 **Service Overview**

**CodeGuardians Gateway** is a comprehensive orchestration service that provides unified access, routing, and management for all AI guard services in the Code Guardians ecosystem. Built using Template Heaven's gold-standard Python service template, it ensures enterprise-grade reliability, security, and scalability.

## 🎯 **Service Purpose**

- **Primary Goal**: Provide unified orchestration and routing for all guard services
- **Key Features**: Service discovery, health monitoring, circuit breakers, load balancing, unified API
- **Target Users**: AI developers, enterprise teams, operations teams, system integrators

## 🏗️ **Technical Architecture**

### **Service Details**
- **Port**: 8000
- **Framework**: FastAPI (Python)
- **Database**: SQLite (development), PostgreSQL (production)
- **Dependencies**: httpx, docker, pyyaml, prometheus-client

### **Core Components**
```
codeguardians-gateway/
├── app/
│   ├── core/
│   │   ├── guard_orchestrator.py    # Core orchestration engine
│   │   ├── config.py                # Configuration management
│   │   └── exceptions.py            # Custom exceptions
│   ├── api/v1/
│   │   └── guards.py                # Guard services API endpoints
│   └── main.py                      # FastAPI application
├── tests/
│   └── test_guard_orchestrator.py   # Comprehensive test suite
├── scripts/
│   ├── test_codeguardians_gateway.py      # Testing automation
│   └── deploy_codeguardians_ecosystem.py  # Deployment automation
└── requirements.txt                 # Dependencies
```

### **Orchestration Features**
1. **Service Discovery** - Dynamic service registration and health monitoring
2. **Circuit Breaker** - Fault tolerance and graceful degradation
3. **Load Balancing** - Intelligent request distribution
4. **Health Monitoring** - Real-time service availability tracking
5. **Configuration Management** - Centralized configuration for all services
6. **Security Layer** - Authentication, authorization, and input validation

## 🔌 **API Reference**

### **Base URL**
```
http://localhost:8000
```

### **Endpoints**

#### **Health Check**
```http
GET /health/live
GET /health/ready
```
**Response:**
```json
{
  "status": "alive",
  "service": "codeguardians-gateway",
  "version": "0.1.0",
  "timestamp": 1704067200.0
}
```

#### **Unified Orchestration**
```http
POST /api/v1/guards/process
```
**Request Body:**
```json
{
  "service_type": "tokenguard",
  "payload": {
    "text": "Content to process",
    "max_tokens": 100
  },
  "user_id": "user-123",
  "session_id": "session-456",
  "priority": 1,
  "timeout": 30,
  "fallback_enabled": true
}
```
**Response:**
```json
{
  "request_id": "req-789",
  "service_type": "tokenguard",
  "success": true,
  "data": {
    "optimized_text": "Processed content",
    "tokens_saved": 25
  },
  "processing_time": 0.5,
  "service_used": "tokenguard",
  "fallback_used": false
}
```

#### **Direct Service Access**
```http
POST /api/v1/guards/tokenguard/optimize
POST /api/v1/guards/trustguard/validate
POST /api/v1/guards/contextguard/analyze
POST /api/v1/guards/biasguard/detect
```

#### **Service Health Monitoring**
```http
GET /api/v1/guards/health
GET /api/v1/guards/health/{service_name}
POST /api/v1/guards/health/refresh
```

#### **Service Discovery**
```http
GET /api/v1/guards/services
```

#### **Metrics**
```http
GET /metrics
```

## ⚙️ **Configuration**

### **Environment Variables**
```bash
# Service Configuration
GATEWAY_PORT=8000
GATEWAY_HOST=0.0.0.0
GATEWAY_ENVIRONMENT=production

# Database Configuration
DATABASE_URL=postgresql://user:pass@localhost/gateway
DATABASE_POOL_SIZE=10

# Guard Services Configuration
TOKENGUARD_URL=http://localhost:8001
TRUSTGUARD_URL=http://localhost:8002
CONTEXTGUARD_URL=http://localhost:8003
BIASGUARD_URL=http://localhost:8004

# Circuit Breaker Settings
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=60
REQUEST_TIMEOUT=30
RETRY_ATTEMPTS=3

# Security Settings
SECRET_KEY=your_secret_key_here
JWT_SECRET_KEY=your_jwt_secret
API_KEY_REQUIRED=false
RATE_LIMIT_PER_MINUTE=1000

# Monitoring
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
LOG_LEVEL=INFO
```

### **Configuration File**
```yaml
# config.yaml
service:
  name: "codeguardians-gateway"
  version: "0.1.0"
  port: 8000

guard_services:
  tokenguard:
    name: "TokenGuard"
    base_url: "http://localhost:8001"
    health_endpoint: "/health"
    timeout: 30
    retry_attempts: 3
    circuit_breaker_threshold: 5
    circuit_breaker_timeout: 60
    enabled: true
    priority: 1
    tags: ["token", "optimization", "cost"]
  
  trustguard:
    name: "TrustGuard"
    base_url: "http://localhost:8002"
    health_endpoint: "/health"
    timeout: 30
    retry_attempts: 3
    circuit_breaker_threshold: 5
    circuit_breaker_timeout: 60
    enabled: true
    priority: 1
    tags: ["trust", "reliability", "validation"]
  
  contextguard:
    name: "ContextGuard"
    base_url: "http://localhost:8003"
    health_endpoint: "/health"
    timeout: 30
    retry_attempts: 3
    circuit_breaker_threshold: 5
    circuit_breaker_timeout: 60
    enabled: true
    priority: 1
    tags: ["context", "drift", "memory"]
  
  biasguard:
    name: "BiasGuard"
    base_url: "http://localhost:8004"
    health_endpoint: "/health"
    timeout: 30
    retry_attempts: 3
    circuit_breaker_threshold: 5
    circuit_breaker_timeout: 60
    enabled: true
    priority: 1
    tags: ["bias", "detection", "mitigation"]

orchestration:
  default_timeout: 30
  max_retry_attempts: 3
  health_check_interval: 30
  circuit_breaker_enabled: true
  load_balancing_strategy: "round_robin"

security:
  authentication:
    enabled: false
    jwt_secret: "${JWT_SECRET_KEY}"
  authorization:
    enabled: false
    rbac_enabled: false
  rate_limiting:
    enabled: true
    requests_per_minute: 1000
  cors:
    enabled: true
    allowed_origins: ["*"]
    allowed_methods: ["GET", "POST", "PUT", "DELETE"]
    allowed_headers: ["*"]

monitoring:
  prometheus:
    enabled: true
    port: 9090
  logging:
    level: "INFO"
    format: "json"
    audit_logging: true
```

## 🚀 **Deployment**

### **Docker Deployment**
```bash
# Build image
docker build -t codeguardians-gateway:latest .

# Run container
docker run -d \
  --name codeguardians-gateway \
  -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:pass@host/db \
  -e TOKENGUARD_URL=http://tokenguard:8001 \
  -e TRUSTGUARD_URL=http://trustguard:8002 \
  codeguardians-gateway:latest
```

### **Docker Compose**
```yaml
version: '3.8'
services:
  gateway:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/gateway
      - TOKENGUARD_URL=http://tokenguard:8001
      - TRUSTGUARD_URL=http://trustguard:8002
      - CONTEXTGUARD_URL=http://contextguard:8003
      - BIASGUARD_URL=http://biasguard:8004
    depends_on:
      - db
      - tokenguard
      - trustguard
      - contextguard
      - biasguard
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health/live"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=gateway
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - gateway_data:/var/lib/postgresql/data

  tokenguard:
    image: tokenguard:latest
    ports:
      - "8001:8001"

  trustguard:
    image: trustguard:latest
    ports:
      - "8002:8002"

  contextguard:
    image: contextguard:latest
    ports:
      - "8003:8003"

  biasguard:
    image: biasguard:latest
    ports:
      - "8004:8004"

volumes:
  gateway_data:
```

### **Kubernetes Deployment**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: codeguardians-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: codeguardians-gateway
  template:
    metadata:
      labels:
        app: codeguardians-gateway
    spec:
      containers:
      - name: gateway
        image: codeguardians-gateway:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: gateway-secrets
              key: database-url
        - name: TOKENGUARD_URL
          value: "http://tokenguard-service:8001"
        - name: TRUSTGUARD_URL
          value: "http://trustguard-service:8002"
        - name: CONTEXTGUARD_URL
          value: "http://contextguard-service:8003"
        - name: BIASGUARD_URL
          value: "http://biasguard-service:8004"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 📊 **Monitoring & Health Checks**

### **Health Check Endpoints**
```http
GET /health/live    # Liveness probe
GET /health/ready   # Readiness probe
```

### **Metrics Endpoint**
```http
GET /metrics
```

### **Key Metrics**
- `http_requests_total` - Total HTTP requests by method, endpoint, status
- `http_request_duration_seconds` - HTTP request duration
- `guard_service_requests_total` - Requests to guard services
- `guard_service_health_status` - Health status of guard services
- `circuit_breaker_state` - Circuit breaker states
- `orchestration_duration_seconds` - Orchestration processing time

### **Grafana Dashboard**
- Request rate and response time
- Guard service health and availability
- Circuit breaker states and transitions
- Error rates and types
- Resource utilization
- Orchestration performance

## 🔧 **Development Setup**

### **Prerequisites**
- Python 3.8+
- PostgreSQL 12+
- Docker (optional)

### **Local Development**
```bash
# Clone repository
git clone <repository-url>
cd codeguardians-gateway/codeguardians-gateway

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql://user:pass@localhost/gateway
export TOKENGUARD_URL=http://localhost:8001
export TRUSTGUARD_URL=http://localhost:8002
export CONTEXTGUARD_URL=http://localhost:8003
export BIASGUARD_URL=http://localhost:8004

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **Testing**
```bash
# Run unit tests
pytest tests/ -v

# Run integration tests
pytest tests/integration/ -v

# Run comprehensive tests
python scripts/test_codeguardians_gateway.py

# Run with coverage
pytest --cov=app tests/
```

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Service Not Starting**
```bash
# Check logs
docker logs codeguardians-gateway

# Check health endpoint
curl http://localhost:8000/health/live

# Verify environment variables
docker exec codeguardians-gateway env | grep GATEWAY
```

#### **Guard Service Connection Issues**
```bash
# Test guard service connectivity
curl http://localhost:8001/health  # TokenGuard
curl http://localhost:8002/health  # TrustGuard
curl http://localhost:8003/health  # ContextGuard
curl http://localhost:8004/health  # BiasGuard

# Check service discovery
curl http://localhost:8000/api/v1/guards/services
```

#### **Database Connection Issues**
```bash
# Test database connection
docker exec codeguardians-gateway python -c "
from sqlalchemy import create_engine
engine = create_engine('$DATABASE_URL')
print(engine.execute('SELECT 1').fetchone())
"
```

#### **Circuit Breaker Issues**
```bash
# Check circuit breaker status
curl http://localhost:8000/api/v1/guards/health

# Force health check refresh
curl -X POST http://localhost:8000/api/v1/guards/health/refresh
```

### **Performance Issues**
- Check guard service response times
- Monitor circuit breaker states
- Review load balancing configuration
- Check database query performance

### **Error Codes**
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid authentication)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (service not found)
- `429` - Rate Limited (too many requests)
- `500` - Internal Server Error
- `502` - Bad Gateway (guard service error)
- `503` - Service Unavailable (circuit breaker open)

## 🔄 **Maintenance Tasks**

### **Daily**
- Monitor service health and metrics
- Check guard service availability
- Review error logs for issues
- Verify circuit breaker states

### **Weekly**
- Review orchestration performance
- Check guard service response times
- Update service configurations
- Analyze request patterns

### **Monthly**
- Update dependencies and security patches
- Review and optimize circuit breaker settings
- Performance testing and tuning
- Update guard service configurations

### **Quarterly**
- Security audit and updates
- Capacity planning review
- Disaster recovery testing
- Architecture review and optimization

## 📞 **Support Contacts**

- **Development Team**: dev-team@company.com
- **Operations Team**: ops-team@company.com
- **Architecture Team**: architecture@company.com
- **Emergency Contact**: oncall@company.com

## 📚 **Additional Resources**

- [API Documentation](http://localhost:8000/docs)
- [OpenAPI Specification](http://localhost:8000/openapi.json)
- [Monitoring Dashboard](http://localhost:3000/d/codeguardians-gateway)
- [Orchestration Guide](orchestration-guide.md)
- [Configuration Guide](configuration-guide.md)
- [Deployment Guide](../deployment/deployment-guide.md)
- [Source Code Repository](https://github.com/company/codeguardians-gateway)

---

**Last Updated**: 2024-01-01  
**Version**: 0.1.0  
**Maintainer**: Development Team
