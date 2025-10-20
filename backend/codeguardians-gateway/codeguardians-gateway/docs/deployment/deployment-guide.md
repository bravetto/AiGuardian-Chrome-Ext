# CodeGuardians Gateway - Deployment Guide

## 📋 **Overview**

This guide provides comprehensive instructions for deploying the CodeGuardians Gateway and its associated guard services in various environments, from local development to production Kubernetes clusters.

## 🎯 **Deployment Options**

### **1. Local Development**
- Docker Compose setup
- Individual service deployment
- Development environment configuration

### **2. Staging Environment**
- Docker Swarm deployment
- Integration testing setup
- Performance testing configuration

### **3. Production Environment**
- Kubernetes deployment
- High availability setup
- Production monitoring and alerting

## 🚀 **Quick Start Deployment**

### **Prerequisites**
- Docker 20.10+
- Docker Compose 2.0+
- Git
- 8GB RAM minimum
- 20GB disk space

### **One-Command Deployment**
```bash
# Clone repository
git clone <repository-url>
cd codeguardians-gateway

# Deploy entire ecosystem
python scripts/deploy_codeguardians_ecosystem.py

# Verify deployment
curl http://localhost:8000/health/live
```

## 🐳 **Docker Compose Deployment**

### **Complete Ecosystem**
```yaml
version: '3.8'

services:
  # CodeGuardians Gateway
  gateway:
    build: ./codeguardians-gateway
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
    networks:
      - codeguardians-network

  # TokenGuard Service
  tokenguard:
    build: ./tokenguard
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
    networks:
      - codeguardians-network

  # TrustGuard Service
  trustguard:
    build: ./trust-guard
    ports:
      - "8002:8002"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/trustguard
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
    depends_on:
      - db
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8002/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - codeguardians-network

  # ContextGuard Service
  contextguard:
    build: ./contextguard
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
    networks:
      - codeguardians-network

  # BiasGuard Backend Service
  biasguard:
    build: ./biasguard-backend
    ports:
      - "8004:8004"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/biasguard
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    depends_on:
      - db
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8004/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - codeguardians-network

  # PostgreSQL Database
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=codeguardians
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    networks:
      - codeguardians-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - codeguardians-network

  # Prometheus Monitoring
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    networks:
      - codeguardians-network

  # Grafana Dashboards
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    networks:
      - codeguardians-network

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  codeguardians-network:
    driver: bridge
```

### **Deployment Commands**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale gateway=3

# Stop all services
docker-compose down

# Clean up volumes
docker-compose down -v
```

## ☸️ **Kubernetes Deployment**

### **Namespace Setup**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: codeguardians
  labels:
    name: codeguardians
```

### **ConfigMaps**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: codeguardians-config
  namespace: codeguardians
data:
  gateway-config.yaml: |
    service:
      name: "codeguardians-gateway"
      port: 8000
    guard_services:
      tokenguard:
        base_url: "http://tokenguard-service:8001"
      trustguard:
        base_url: "http://trustguard-service:8002"
      contextguard:
        base_url: "http://contextguard-service:8003"
      biasguard:
        base_url: "http://biasguard-service:8004"
```

### **Secrets**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: codeguardians-secrets
  namespace: codeguardians
type: Opaque
data:
  database-url: <base64-encoded-database-url>
  openai-api-key: <base64-encoded-openai-key>
  jwt-secret: <base64-encoded-jwt-secret>
  clerk-secret-key: <base64-encoded-clerk-key>
  stripe-secret-key: <base64-encoded-stripe-key>
```

### **Gateway Deployment**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: codeguardians-gateway
  namespace: codeguardians
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
              name: codeguardians-secrets
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
        volumeMounts:
        - name: config
          mountPath: /app/config
      volumes:
      - name: config
        configMap:
          name: codeguardians-config
```

### **Gateway Service**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: codeguardians-gateway-service
  namespace: codeguardians
spec:
  selector:
    app: codeguardians-gateway
  ports:
  - port: 8000
    targetPort: 8000
    protocol: TCP
  type: LoadBalancer
```

### **Ingress Configuration**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: codeguardians-ingress
  namespace: codeguardians
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.codeguardians.com
    secretName: codeguardians-tls
  rules:
  - host: api.codeguardians.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: codeguardians-gateway-service
            port:
              number: 8000
```

## 🔧 **Environment-Specific Configurations**

### **Development Environment**
```bash
# Environment variables
export ENVIRONMENT=development
export LOG_LEVEL=DEBUG
export DATABASE_URL=postgresql://user:pass@localhost:5432/codeguardians_dev
export PROMETHEUS_ENABLED=false

# Start services
docker-compose -f docker-compose.dev.yml up -d
```

### **Staging Environment**
```bash
# Environment variables
export ENVIRONMENT=staging
export LOG_LEVEL=INFO
export DATABASE_URL=postgresql://user:pass@staging-db:5432/codeguardians_staging
export PROMETHEUS_ENABLED=true

# Deploy to staging
kubectl apply -f k8s/staging/
```

### **Production Environment**
```bash
# Environment variables
export ENVIRONMENT=production
export LOG_LEVEL=WARNING
export DATABASE_URL=postgresql://user:pass@prod-db:5432/codeguardians_prod
export PROMETHEUS_ENABLED=true
export SECURITY_ENABLED=true

# Deploy to production
kubectl apply -f k8s/production/
```

## 📊 **Monitoring Setup**

### **Prometheus Configuration**
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'codeguardians-gateway'
    static_configs:
      - targets: ['gateway:8000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'tokenguard'
    static_configs:
      - targets: ['tokenguard:8001']
    metrics_path: '/metrics'

  - job_name: 'trustguard'
    static_configs:
      - targets: ['trustguard:8002']
    metrics_path: '/metrics'

  - job_name: 'contextguard'
    static_configs:
      - targets: ['contextguard:8003']
    metrics_path: '/metrics'

  - job_name: 'biasguard'
    static_configs:
      - targets: ['biasguard:8004']
    metrics_path: '/metrics'

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### **Grafana Dashboard Configuration**
```json
{
  "dashboard": {
    "title": "CodeGuardians Gateway",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Service Health",
        "type": "stat",
        "targets": [
          {
            "expr": "up",
            "legendFormat": "{{instance}}"
          }
        ]
      }
    ]
  }
}
```

## 🔐 **Security Configuration**

### **SSL/TLS Setup**
```bash
# Generate SSL certificates
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Configure nginx with SSL
server {
    listen 443 ssl;
    server_name api.codeguardians.com;
    
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    
    location / {
        proxy_pass http://gateway:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **Authentication Setup**
```yaml
# Enable authentication in gateway
security:
  authentication:
    enabled: true
    jwt_secret: "${JWT_SECRET_KEY}"
    token_expiry: 3600
  authorization:
    enabled: true
    rbac_enabled: true
  rate_limiting:
    enabled: true
    requests_per_minute: 1000
    burst_size: 100
```

## 🚨 **Health Checks and Monitoring**

### **Health Check Scripts**
```bash
#!/bin/bash
# health-check.sh

# Check gateway health
curl -f http://localhost:8000/health/live || exit 1

# Check guard services
curl -f http://localhost:8001/health || exit 1
curl -f http://localhost:8002/health || exit 1
curl -f http://localhost:8003/health || exit 1
curl -f http://localhost:8004/health || exit 1

# Check database connectivity
pg_isready -h localhost -p 5432 || exit 1

echo "All services healthy"
```

### **Monitoring Alerts**
```yaml
# monitoring/alerts.yml
groups:
- name: codeguardians
  rules:
  - alert: ServiceDown
    expr: up == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Service {{ $labels.instance }} is down"
      
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High error rate detected"
      
  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
```

## 🔄 **Deployment Automation**

### **CI/CD Pipeline**
```yaml
# .github/workflows/deploy.yml
name: Deploy CodeGuardians Gateway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Build Docker images
      run: |
        docker build -t codeguardians-gateway:${{ github.sha }} .
        docker build -t tokenguard:${{ github.sha }} ./tokenguard
        docker build -t trustguard:${{ github.sha }} ./trust-guard
        docker build -t contextguard:${{ github.sha }} ./contextguard
        docker build -t biasguard:${{ github.sha }} ./biasguard-backend
    
    - name: Deploy to staging
      run: |
        kubectl set image deployment/codeguardians-gateway gateway=codeguardians-gateway:${{ github.sha }}
        kubectl set image deployment/tokenguard tokenguard=tokenguard:${{ github.sha }}
        kubectl set image deployment/trustguard trustguard=trustguard:${{ github.sha }}
        kubectl set image deployment/contextguard contextguard=contextguard:${{ github.sha }}
        kubectl set image deployment/biasguard biasguard=biasguard:${{ github.sha }}
    
    - name: Run health checks
      run: |
        python scripts/test_codeguardians_gateway.py --url https://staging-api.codeguardians.com
```

### **Deployment Scripts**
```bash
#!/bin/bash
# deploy.sh

set -e

ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}

echo "Deploying CodeGuardians Gateway to $ENVIRONMENT with version $VERSION"

# Build and push images
docker build -t codeguardians-gateway:$VERSION .
docker push codeguardians-gateway:$VERSION

# Deploy to Kubernetes
kubectl apply -f k8s/$ENVIRONMENT/

# Wait for deployment
kubectl rollout status deployment/codeguardians-gateway -n codeguardians

# Run health checks
python scripts/test_codeguardians_gateway.py --url https://$ENVIRONMENT-api.codeguardians.com

echo "Deployment completed successfully"
```

## 🐛 **Troubleshooting**

### **Common Deployment Issues**

#### **Service Not Starting**
```bash
# Check pod status
kubectl get pods -n codeguardians

# Check pod logs
kubectl logs -f deployment/codeguardians-gateway -n codeguardians

# Check service endpoints
kubectl get endpoints -n codeguardians
```

#### **Database Connection Issues**
```bash
# Check database pod
kubectl get pods -n codeguardians | grep postgres

# Check database logs
kubectl logs -f deployment/postgres -n codeguardians

# Test database connection
kubectl exec -it deployment/postgres -n codeguardians -- psql -U user -d codeguardians -c "SELECT 1"
```

#### **Network Connectivity Issues**
```bash
# Check network policies
kubectl get networkpolicies -n codeguardians

# Test service connectivity
kubectl exec -it deployment/codeguardians-gateway -n codeguardians -- curl http://tokenguard-service:8001/health
```

### **Performance Issues**
- Check resource limits and requests
- Monitor CPU and memory usage
- Review database query performance
- Check network latency between services

### **Security Issues**
- Verify SSL certificate validity
- Check authentication configuration
- Review network policies
- Audit access logs

## 📞 **Support and Maintenance**

### **Deployment Support**
- **Development Team**: dev-team@company.com
- **Operations Team**: ops-team@company.com
- **Infrastructure Team**: infra-team@company.com
- **Emergency Contact**: oncall@company.com

### **Maintenance Schedule**
- **Daily**: Health checks and monitoring
- **Weekly**: Performance reviews and optimization
- **Monthly**: Security updates and patches
- **Quarterly**: Capacity planning and scaling

---

**Last Updated**: 2024-01-01  
**Version**: 1.0.0  
**Maintainer**: Operations Team
