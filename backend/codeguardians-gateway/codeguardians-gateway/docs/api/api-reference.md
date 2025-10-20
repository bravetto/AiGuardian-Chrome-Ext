# CodeGuardians Gateway - API Reference

## 📋 **Overview**

The CodeGuardians Gateway provides a unified REST API for accessing all guard services in the ecosystem. This document provides comprehensive API documentation with examples, request/response schemas, and integration guides.

## 🔗 **Base URLs**

- **Development**: `http://localhost:8000`
- **Staging**: `https://staging-api.codeguardians.com`
- **Production**: `https://api.codeguardians.com`

## 🔐 **Authentication**

### **API Key Authentication**
```http
Authorization: Bearer your-api-key-here
```

### **JWT Token Authentication**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Session Authentication**
```http
Cookie: session_id=your-session-id
```

## 📊 **Response Format**

All API responses follow a consistent format:

### **Success Response**
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "metadata": {
    "request_id": "req-123",
    "processing_time": 0.5,
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### **Error Response**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": {
      "field": "service_type",
      "reason": "Invalid service type specified"
    }
  },
  "metadata": {
    "request_id": "req-123",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## 🛡️ **Guard Services API**

### **Unified Orchestration Endpoint**

#### **Process Request**
```http
POST /api/v1/guards/process
```

**Description**: Routes requests to the appropriate guard service based on service type.

**Request Body**:
```json
{
  "service_type": "tokenguard",
  "payload": {
    "text": "Content to process",
    "max_tokens": 100,
    "optimization_level": "high"
  },
  "user_id": "user-123",
  "session_id": "session-456",
  "priority": 1,
  "timeout": 30,
  "fallback_enabled": true
}
```

**Response**:
```json
{
  "request_id": "req-789",
  "service_type": "tokenguard",
  "success": true,
  "data": {
    "optimized_text": "Processed content",
    "original_tokens": 150,
    "optimized_tokens": 100,
    "savings_percentage": 33.3,
    "confidence_score": 0.95
  },
  "processing_time": 0.5,
  "service_used": "tokenguard",
  "fallback_used": false
}
```

**Parameters**:
- `service_type` (string, required): Type of guard service (`tokenguard`, `trustguard`, `contextguard`, `biasguard`)
- `payload` (object, required): Service-specific payload
- `user_id` (string, optional): User identifier for tracking
- `session_id` (string, optional): Session identifier
- `priority` (integer, optional): Request priority (1-10, default: 1)
- `timeout` (integer, optional): Request timeout in seconds (default: 30)
- `fallback_enabled` (boolean, optional): Enable fallback mechanisms (default: true)

### **Direct Service Access**

#### **TokenGuard Optimization**
```http
POST /api/v1/guards/tokenguard/optimize
```

**Request Body**:
```json
{
  "text": "Your input text here",
  "max_tokens": 100,
  "optimization_level": "high",
  "preserve_quality": true,
  "chunking_strategy": "semantic"
}
```

**Response**:
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

#### **TrustGuard Validation**
```http
POST /api/v1/guards/trustguard/validate
```

**Request Body**:
```json
{
  "text": "AI-generated content to validate",
  "context": "Additional context information",
  "validation_type": "comprehensive",
  "confidence_threshold": 0.8,
  "patterns": ["hallucination", "bias", "context_drift"]
}
```

**Response**:
```json
{
  "validation_result": {
    "overall_trust_score": 0.85,
    "patterns_detected": [
      {
        "pattern": "hallucination",
        "confidence": 0.92,
        "severity": "high",
        "description": "Detected potential hallucination in factual claims"
      }
    ],
    "recommendations": [
      "Verify factual claims with external sources",
      "Consider additional context validation"
    ],
    "processing_time": 1.2
  }
}
```

#### **ContextGuard Analysis**
```http
POST /api/v1/guards/contextguard/analyze
```

**Request Body**:
```json
{
  "context": "Current context to analyze",
  "session_id": "session-123",
  "previous_context": "Previous context for comparison",
  "analysis_type": "comprehensive",
  "drift_threshold": 0.8
}
```

**Response**:
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

#### **BiasGuard Detection**
```http
POST /api/v1/guards/biasguard/detect
```

**Request Body**:
```json
{
  "content": "Content to analyze for bias",
  "content_type": "text",
  "analysis_type": "comprehensive",
  "bias_categories": ["demographic", "cultural", "semantic"],
  "sensitivity_threshold": 0.8
}
```

**Response**:
```json
{
  "detection_result": {
    "bias_detected": true,
    "overall_bias_score": 0.75,
    "bias_categories": [
      {
        "category": "demographic",
        "score": 0.8,
        "severity": "high",
        "description": "Detected demographic bias in gender representation",
        "confidence": 0.92
      }
    ],
    "mitigation_suggestions": [
      "Use gender-neutral language",
      "Include diverse examples",
      "Review demographic representation"
    ],
    "compliance_status": "non_compliant",
    "processing_time": 1.5
  }
}
```

## 🔍 **Service Management API**

### **Service Health Monitoring**

#### **Get All Services Health**
```http
GET /api/v1/guards/health
```

**Response**:
```json
{
  "tokenguard": {
    "service_name": "tokenguard",
    "status": "healthy",
    "last_check": "2024-01-01T00:00:00Z",
    "response_time": 0.05,
    "error_message": null,
    "metadata": {
      "version": "1.0.0",
      "uptime": 86400
    }
  },
  "trustguard": {
    "service_name": "trustguard",
    "status": "healthy",
    "last_check": "2024-01-01T00:00:00Z",
    "response_time": 0.08,
    "error_message": null,
    "metadata": {
      "version": "1.0.0",
      "patterns_detected": 7
    }
  }
}
```

#### **Get Specific Service Health**
```http
GET /api/v1/guards/health/{service_name}
```

**Parameters**:
- `service_name` (string, required): Name of the service (`tokenguard`, `trustguard`, `contextguard`, `biasguard`)

**Response**:
```json
{
  "service_name": "tokenguard",
  "status": "healthy",
  "last_check": "2024-01-01T00:00:00Z",
  "response_time": 0.05,
  "error_message": null,
  "metadata": {
    "version": "1.0.0",
    "uptime": 86400,
    "requests_processed": 1000
  }
}
```

#### **Refresh Health Checks**
```http
POST /api/v1/guards/health/refresh
```

**Response**:
```json
{
  "message": "Health checks refresh initiated",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### **Service Discovery**

#### **List All Services**
```http
GET /api/v1/guards/services
```

**Response**:
```json
{
  "services": {
    "tokenguard": {
      "name": "TokenGuard",
      "service_type": "tokenguard",
      "base_url": "http://localhost:8001",
      "enabled": true,
      "priority": 1,
      "tags": ["token", "optimization", "cost"],
      "status": "healthy",
      "last_check": "2024-01-01T00:00:00Z"
    },
    "trustguard": {
      "name": "TrustGuard",
      "service_type": "trustguard",
      "base_url": "http://localhost:8002",
      "enabled": true,
      "priority": 1,
      "tags": ["trust", "reliability", "validation"],
      "status": "healthy",
      "last_check": "2024-01-01T00:00:00Z"
    }
  },
  "total_services": 4,
  "healthy_services": 4
}
```

## 🏥 **Health Check API**

### **Liveness Probe**
```http
GET /health/live
```

**Response**:
```json
{
  "status": "alive",
  "service": "codeguardians-gateway",
  "version": "0.1.0",
  "timestamp": 1704067200.0
}
```

### **Readiness Probe**
```http
GET /health/ready
```

**Response**:
```json
{
  "status": "ready",
  "service": "codeguardians-gateway",
  "version": "0.1.0",
  "timestamp": 1704067200.0,
  "checks": {
    "database": "healthy",
    "guard_services": "healthy"
  }
}
```

## 📊 **Metrics API**

### **Prometheus Metrics**
```http
GET /metrics
```

**Response**: Prometheus-formatted metrics
```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="POST",endpoint="/api/v1/guards/process",status_code="200"} 1000

# HELP http_request_duration_seconds HTTP request duration
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="POST",endpoint="/api/v1/guards/process",le="0.1"} 500
http_request_duration_seconds_bucket{method="POST",endpoint="/api/v1/guards/process",le="0.5"} 800
http_request_duration_seconds_bucket{method="POST",endpoint="/api/v1/guards/process",le="1.0"} 950
http_request_duration_seconds_bucket{method="POST",endpoint="/api/v1/guards/process",le="+Inf"} 1000
```

## 🔧 **Configuration API**

### **Get Configuration**
```http
GET /api/v1/config
```

**Response**:
```json
{
  "service": {
    "name": "codeguardians-gateway",
    "version": "0.1.0",
    "environment": "production"
  },
  "guard_services": {
    "tokenguard": {
      "enabled": true,
      "timeout": 30,
      "retry_attempts": 3
    }
  },
  "orchestration": {
    "default_timeout": 30,
    "max_retry_attempts": 3,
    "health_check_interval": 30
  }
}
```

### **Update Configuration**
```http
PUT /api/v1/config
```

**Request Body**:
```json
{
  "guard_services": {
    "tokenguard": {
      "timeout": 45,
      "retry_attempts": 5
    }
  },
  "orchestration": {
    "default_timeout": 45
  }
}
```

## 🚨 **Error Codes**

### **HTTP Status Codes**
- `200` - OK: Request successful
- `201` - Created: Resource created successfully
- `400` - Bad Request: Invalid request parameters
- `401` - Unauthorized: Authentication required
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource not found
- `409` - Conflict: Resource conflict
- `422` - Unprocessable Entity: Validation error
- `429` - Too Many Requests: Rate limit exceeded
- `500` - Internal Server Error: Server error
- `502` - Bad Gateway: Guard service error
- `503` - Service Unavailable: Service temporarily unavailable

### **Error Codes**
- `VALIDATION_ERROR` - Input validation failed
- `SERVICE_UNAVAILABLE` - Guard service unavailable
- `CIRCUIT_BREAKER_OPEN` - Circuit breaker is open
- `TIMEOUT_ERROR` - Request timeout
- `AUTHENTICATION_ERROR` - Authentication failed
- `AUTHORIZATION_ERROR` - Authorization failed
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `INTERNAL_ERROR` - Internal server error

## 📝 **Request Examples**

### **cURL Examples**

#### **Process Request**
```bash
curl -X POST http://localhost:8000/api/v1/guards/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "service_type": "tokenguard",
    "payload": {
      "text": "Sample text for optimization",
      "max_tokens": 100
    }
  }'
```

#### **Check Service Health**
```bash
curl -X GET http://localhost:8000/api/v1/guards/health/tokenguard \
  -H "Authorization: Bearer your-api-key"
```

#### **List All Services**
```bash
curl -X GET http://localhost:8000/api/v1/guards/services \
  -H "Authorization: Bearer your-api-key"
```

### **Python Examples**

#### **Using requests library**
```python
import requests

# Process request
response = requests.post(
    'http://localhost:8000/api/v1/guards/process',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-api-key'
    },
    json={
        'service_type': 'tokenguard',
        'payload': {
            'text': 'Sample text for optimization',
            'max_tokens': 100
        }
    }
)

print(response.json())
```

#### **Using httpx (async)**
```python
import httpx
import asyncio

async def process_request():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            'http://localhost:8000/api/v1/guards/process',
            headers={
                'Content-Type': 'application/json',
                'Authorization': 'Bearer your-api-key'
            },
            json={
                'service_type': 'tokenguard',
                'payload': {
                    'text': 'Sample text for optimization',
                    'max_tokens': 100
                }
            }
        )
        return response.json()

result = asyncio.run(process_request())
print(result)
```

### **JavaScript Examples**

#### **Using fetch**
```javascript
// Process request
const response = await fetch('http://localhost:8000/api/v1/guards/process', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-api-key'
  },
  body: JSON.stringify({
    service_type: 'tokenguard',
    payload: {
      text: 'Sample text for optimization',
      max_tokens: 100
    }
  })
});

const result = await response.json();
console.log(result);
```

#### **Using axios**
```javascript
const axios = require('axios');

// Process request
const response = await axios.post(
  'http://localhost:8000/api/v1/guards/process',
  {
    service_type: 'tokenguard',
    payload: {
      text: 'Sample text for optimization',
      max_tokens: 100
    }
  },
  {
    headers: {
      'Authorization': 'Bearer your-api-key'
    }
  }
);

console.log(response.data);
```

## 🔄 **Rate Limiting**

### **Rate Limits**
- **Default**: 1000 requests per minute per API key
- **Burst**: 100 requests per second
- **Per User**: 500 requests per minute
- **Per IP**: 2000 requests per minute

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1704067260
```

### **Rate Limit Exceeded Response**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again later.",
    "details": {
      "limit": 1000,
      "remaining": 0,
      "reset_time": "2024-01-01T00:01:00Z"
    }
  }
}
```

## 📚 **SDK and Libraries**

### **Official SDKs**
- **Python**: `pip install codeguardians-sdk`
- **JavaScript**: `npm install @codeguardians/sdk`
- **Go**: `go get github.com/codeguardians/go-sdk`

### **Community Libraries**
- **Ruby**: `gem install codeguardians-ruby`
- **PHP**: `composer require codeguardians/php-sdk`
- **Java**: Available in Maven Central

## 🔗 **Webhooks**

### **Webhook Configuration**
```http
POST /api/v1/webhooks
```

**Request Body**:
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["service.health_changed", "request.completed"],
  "secret": "your-webhook-secret"
}
```

### **Webhook Payload**
```json
{
  "event": "service.health_changed",
  "data": {
    "service_name": "tokenguard",
    "status": "unhealthy",
    "previous_status": "healthy",
    "timestamp": "2024-01-01T00:00:00Z"
  },
  "signature": "sha256=..."
}
```

## 📞 **Support**

### **API Support**
- **Documentation**: https://docs.codeguardians.com
- **Support Email**: api-support@codeguardians.com
- **Status Page**: https://status.codeguardians.com
- **Community Forum**: https://community.codeguardians.com

### **Rate Limits and Quotas**
- **Free Tier**: 1000 requests/month
- **Pro Tier**: 100,000 requests/month
- **Enterprise**: Custom limits

---

**Last Updated**: 2024-01-01  
**Version**: 1.0.0  
**API Version**: v1
