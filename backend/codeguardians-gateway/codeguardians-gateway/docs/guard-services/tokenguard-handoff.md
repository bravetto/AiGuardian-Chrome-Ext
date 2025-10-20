# TokenGuard - Team Handoff Document

## 📋 **Service Overview**

**TokenGuard** is an AI token cost optimization service that provides intelligent token management strategies to reduce costs while maintaining quality. It implements advanced pruning algorithms, confidence analysis, and intelligent chunking to optimize token usage across AI applications.

## 🎯 **Service Purpose**

- **Primary Goal**: Optimize AI token usage and reduce costs
- **Key Features**: Token pruning, confidence analysis, intelligent chunking, caching
- **Target Users**: AI developers, cost-conscious organizations, high-volume AI applications

## 🏗️ **Technical Architecture**

### **Service Details**
- **Port**: 8001
- **Framework**: FastAPI (Python)
- **Database**: SQLite (development), PostgreSQL (production)
- **Dependencies**: OpenAI API, Anthropic API, custom pruning algorithms

### **Core Components**
```
tokenguard/
├── tokenguard/
│   ├── config.py          # Configuration management
│   ├── llm_client.py      # LLM client integration
│   ├── mcp_server.py      # Model Context Protocol server
│   ├── models.py          # Data models and schemas
│   └── pruning.py         # Token pruning algorithms
├── tests/                 # Comprehensive test suite
├── scripts/               # Deployment and utility scripts
├── k8s/                   # Kubernetes deployment configs
└── monitoring/            # Prometheus monitoring setup
```

### **Key Algorithms**
1. **Confidence-Based Pruning**: Removes tokens with low confidence scores
2. **Semantic Chunking**: Intelligent text segmentation
3. **Cost Optimization**: Multiple strategies for token reduction
4. **Caching**: Intelligent response caching

## 🔌 **API Reference**

### **Base URL**
```
http://localhost:8001
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
  "service": "tokenguard",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### **Token Optimization**
```http
POST /api/v1/optimize
```
**Request Body:**
```json
{
  "text": "Your input text here",
  "max_tokens": 100,
  "optimization_level": "high",
  "preserve_quality": true,
  "chunking_strategy": "semantic"
}
```
**Response:**
```json
{
  "optimized_text": "Optimized text output",
  "original_tokens": 150,
  "optimized_tokens": 100,
  "savings_percentage": 33.3,
  "confidence_score": 0.95,
  "processing_time": 0.5
}
```

#### **Batch Optimization**
```http
POST /api/v1/optimize/batch
```
**Request Body:**
```json
{
  "texts": [
    "First text to optimize",
    "Second text to optimize"
  ],
  "max_tokens": 100,
  "optimization_level": "medium"
}
```

#### **Configuration Update**
```http
PUT /api/v1/config
```
**Request Body:**
```json
{
  "optimization_strategies": ["pruning", "chunking", "caching"],
  "default_max_tokens": 100,
  "confidence_threshold": 0.8
}
```

## ⚙️ **Configuration**

### **Environment Variables**
```bash
# Service Configuration
TOKENGUARD_PORT=8001
TOKENGUARD_HOST=0.0.0.0
TOKENGUARD_ENVIRONMENT=production

# Database Configuration
DATABASE_URL=postgresql://user:pass@localhost/tokenguard
DATABASE_POOL_SIZE=10

# LLM API Configuration
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
DEFAULT_LLM_PROVIDER=openai

# Optimization Settings
DEFAULT_MAX_TOKENS=100
DEFAULT_OPTIMIZATION_LEVEL=medium
CONFIDENCE_THRESHOLD=0.8
CACHE_TTL=3600

# Monitoring
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
LOG_LEVEL=INFO
```

### **Configuration File**
```yaml
# config.yaml
service:
  name: "tokenguard"
  version: "1.0.0"
  port: 8001

optimization:
  strategies:
    - "pruning"
    - "chunking"
    - "caching"
  default_max_tokens: 100
  confidence_threshold: 0.8
  cache_ttl: 3600

llm:
  providers:
    openai:
      api_key: "${OPENAI_API_KEY}"
      model: "gpt-3.5-turbo"
    anthropic:
      api_key: "${ANTHROPIC_API_KEY}"
      model: "claude-3-sonnet"

monitoring:
  prometheus:
    enabled: true
    port: 9090
  logging:
    level: "INFO"
    format: "json"
```

## 🚀 **Deployment**

### **Docker Deployment**
```bash
# Build image
docker build -t tokenguard:latest .

# Run container
docker run -d \
  --name tokenguard \
  -p 8001:8001 \
  -e DATABASE_URL=postgresql://user:pass@host/db \
  -e OPENAI_API_KEY=your_key \
  tokenguard:latest
```

### **Docker Compose**
```yaml
version: '3.8'
services:
  tokenguard:
    build: .
    ports:
      - "8001:8001"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/tokenguard
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=tokenguard
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - tokenguard_data:/var/lib/postgresql/data

volumes:
  tokenguard_data:
```

### **Kubernetes Deployment**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tokenguard
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tokenguard
  template:
    metadata:
      labels:
        app: tokenguard
    spec:
      containers:
      - name: tokenguard
        image: tokenguard:latest
        ports:
        - containerPort: 8001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: tokenguard-secrets
              key: database-url
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: tokenguard-secrets
              key: openai-api-key
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
            port: 8001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8001
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
- `tokenguard_requests_total` - Total number of requests
- `tokenguard_optimization_duration_seconds` - Optimization processing time
- `tokenguard_tokens_saved_total` - Total tokens saved
- `tokenguard_cache_hits_total` - Cache hit count
- `tokenguard_errors_total` - Error count by type

### **Grafana Dashboard**
- Request rate and response time
- Token savings metrics
- Cache hit ratio
- Error rates and types
- Resource utilization

## 🔧 **Development Setup**

### **Prerequisites**
- Python 3.8+
- PostgreSQL 12+
- Docker (optional)

### **Local Development**
```bash
# Clone repository
git clone <repository-url>
cd tokenguard

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql://user:pass@localhost/tokenguard
export OPENAI_API_KEY=your_key

# Run database migrations
alembic upgrade head

# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

### **Testing**
```bash
# Run unit tests
pytest tests/ -v

# Run integration tests
pytest tests/integration/ -v

# Run with coverage
pytest --cov=tokenguard tests/
```

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Service Not Starting**
```bash
# Check logs
docker logs tokenguard

# Check health endpoint
curl http://localhost:8001/health

# Verify environment variables
docker exec tokenguard env | grep TOKENGUARD
```

#### **Database Connection Issues**
```bash
# Test database connection
docker exec tokenguard python -c "
from sqlalchemy import create_engine
engine = create_engine('$DATABASE_URL')
print(engine.execute('SELECT 1').fetchone())
"
```

#### **API Key Issues**
```bash
# Test API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

### **Performance Issues**
- Check token optimization settings
- Monitor cache hit ratio
- Review database query performance
- Check LLM API rate limits

### **Error Codes**
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid API key)
- `429` - Rate Limited (too many requests)
- `500` - Internal Server Error
- `503` - Service Unavailable

## 🔄 **Maintenance Tasks**

### **Daily**
- Monitor service health and metrics
- Check error logs for issues
- Verify API key validity

### **Weekly**
- Review optimization performance
- Update cache statistics
- Check database performance

### **Monthly**
- Update dependencies
- Review and optimize configuration
- Performance testing and tuning

### **Quarterly**
- Security audit and updates
- Capacity planning review
- Disaster recovery testing

## 📞 **Support Contacts**

- **Development Team**: dev-team@company.com
- **Operations Team**: ops-team@company.com
- **Emergency Contact**: oncall@company.com

## 📚 **Additional Resources**

- [API Documentation](http://localhost:8001/docs)
- [OpenAPI Specification](http://localhost:8001/openapi.json)
- [Monitoring Dashboard](http://localhost:3000/d/tokenguard)
- [Source Code Repository](https://github.com/company/tokenguard)

---

**Last Updated**: 2024-01-01  
**Version**: 1.0.0  
**Maintainer**: Development Team
