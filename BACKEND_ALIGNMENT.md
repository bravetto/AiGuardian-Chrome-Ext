# Backend API Alignment - Chrome Extension

**Last Updated:** November 5, 2025  
**Backend Version:** AIGuards-Backend v1.0.0  
**Extension Version:** 1.0.0

## Overview

This document describes how the Chrome extension aligns with the AIGuards Backend API Gateway.

## Backend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension                         │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │ Content Script │  │ Service Worker │  │    Popup UI   │ │
│  └────────┬───────┘  └────────┬───────┘  └───────┬───────┘ │
└───────────┼────────────────────┼────────────────────┼─────────┘
            │                    │                    │
            └────────────────────┼────────────────────┘
                                 │ HTTPS
                                 ▼
                    ┌────────────────────────┐
                    │   API Gateway (8000)   │
                    │ codeguardians-gateway  │
                    └────────────┬───────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
    ┌─────────┐            ┌─────────┐            ┌─────────┐
    │ Bias    │            │ Trust   │            │ Context │
    │ Guard   │            │ Guard   │            │ Guard   │
    │ (8004)  │            │ (8002)  │            │ (8003)  │
    └─────────┘            └─────────┘            └─────────┘
         │                       │                       │
         ▼                       ▼                       ▼
    ┌─────────┐            ┌─────────┐
    │ Token   │            │ Health  │
    │ Guard   │            │ Guard   │
    │ (8001)  │            │ (8006)  │
    └─────────┘            └─────────┘
```

## API Endpoints

### Production Endpoint
```
https://api.aiguardian.ai
```

### Development Endpoint
```
http://localhost:8000
```

## Aligned Endpoints

| Extension Endpoint | Backend API Endpoint | Method | Purpose |
|--------------------|---------------------|---------|----------|
| `analyze` | `/api/v1/guards/process` | POST | Unified guard processing |
| `health` | `/health/live` | GET | Liveness probe |
| `health-ready` | `/health/ready` | GET | Readiness probe |
| `guards` | `/api/v1/guards/services` | GET | Service discovery |
| `logging` | `/api/v1/logging` | POST | Central logging |
| `config` | `/api/v1/config` | GET/POST | Configuration |

## Request Format

### Analyze Text Request
```javascript
{
  service_type: 'biasguard',  // or 'trustguard', 'contextguard', 'tokenguard', 'healthguard'
  payload: {
    text: 'Text to analyze...',
    contentType: 'text',
    scanLevel: 'standard',
    context: 'webpage-content'
  },
  user_id: 'user_123',         // Optional: Clerk user ID
  session_id: 'session_abc',   // Unique session identifier
  client_type: 'chrome',       // Client identifier
  client_version: '1.0.0'      // Extension version
}
```

### Response Format
```javascript
{
  status: 'success',           // or 'error', 'partial'
  service: 'biasguard',
  result: {
    bias_score: 0.15,
    confidence: 0.92,
    // ... service-specific results
  },
  processing_time: 0.234,
  cached: false,
  error: null                  // Present only if status is 'error'
}
```

## Guard Services

### Available Services

| Service Type | Port | Purpose | Default Enabled |
|--------------|------|---------|-----------------|
| `biasguard` | 8004 | Bias detection and content analysis | ✅ Yes |
| `trustguard` | 8002 | Trust validation and reliability | ✅ Yes |
| `contextguard` | 8003 | Context drift detection | ✅ Yes |
| `tokenguard` | 8001 | Token optimization and cost management | ❌ No |
| `healthguard` | 8006 | Health monitoring and validation | ❌ No |

## Authentication

### API Key Authentication (Current)
```javascript
headers: {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json',
  'X-Extension-Version': '1.0.0',
  'X-Request-ID': 'req_123',
  'X-Timestamp': '2025-11-05T10:30:00Z'
}
```

### JWT Authentication (Planned - Clerk Integration)
```javascript
headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...',
  'Content-Type': 'application/json',
  'X-User-ID': 'user_123'
}
```

## Configuration

### Extension Settings (`src/constants.js`)
```javascript
const DEFAULT_CONFIG = {
  GATEWAY_URL: 'https://api.aiguardian.ai',  // Production
  // GATEWAY_URL: 'http://localhost:8000',   // Development
  API_KEY: '',                                // User configures via options
  GUARD_SERVICES: {
    biasguard: { enabled: true, threshold: 0.5, service_type: 'biasguard' },
    trustguard: { enabled: true, threshold: 0.7, service_type: 'trustguard' },
    contextguard: { enabled: true, threshold: 0.6, service_type: 'contextguard' },
    tokenguard: { enabled: false, threshold: 0.5, service_type: 'tokenguard' },
    healthguard: { enabled: false, threshold: 0.8, service_type: 'healthguard' }
  }
};
```

## Error Handling

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid payload)
- `401` - Unauthorized (invalid API key/JWT)
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error
- `503` - Service Unavailable (guard service down)

### Retry Strategy
- Retry attempts: 3
- Retry delay: 1s, 2s, 4s (exponential backoff)
- Circuit breaker: Opens after 5 consecutive failures

## Rate Limiting

| Tier | Limit | Endpoint |
|------|-------|----------|
| Free | 100 requests/hour | `/api/v1/guards/process` |
| Pro | 1000 requests/hour | `/api/v1/guards/process` |
| Enterprise | Unlimited | `/api/v1/guards/process` |

## Testing

### Test Backend Connection
```javascript
// In console or popup
await chrome.runtime.sendMessage({
  action: 'TEST_GATEWAY_CONNECTION'
});
```

### Test Analysis
```javascript
await chrome.runtime.sendMessage({
  action: 'ANALYZE_TEXT',
  data: {
    text: 'This is a test message',
    service_type: 'biasguard'
  }
});
```

## Migration Notes

### Breaking Changes from Old API
1. ✅ **Unified endpoint**: All guards now use `/api/v1/guards/process` instead of separate endpoints
2. ✅ **Service type parameter**: Must specify `service_type` in request body
3. ✅ **Response format**: Standardized across all guards
4. ✅ **Guard names**: Updated to match backend (removed 'securityguard', added 'healthguard')

### Updated Files
- `src/gateway.js` - Endpoint mapping updated
- `src/constants.js` - Guard services configuration updated
- `manifest.json` - Permissions aligned with backend requirements

## Next Steps

1. **Clerk Integration** - Add JWT authentication support
2. **Subscription Management** - Integrate Stripe subscription checks
3. **Webhook Support** - Handle real-time subscription updates
4. **Analytics** - Add usage tracking and metrics

## Support

For backend-related issues:
- Backend Repository: https://github.com/bravetto/AIGuards-Backend
- Backend Team: dev@bravetto.com
- API Documentation: http://localhost:8000/docs (development)
- API Documentation: https://api.aiguardian.ai/docs (production)

