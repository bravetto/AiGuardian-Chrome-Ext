# AI Guardians Code Guardians - Complete Demo Guide

This guide provides a comprehensive overview of all demos available in the AI Guardians Code Guardians ecosystem. Each guard service includes interactive demonstrations showcasing their key features and capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [HealthGuard (PoisonGuard) Demo](#healthguard-poisonguard-demo)
- [TrustGuard Demo](#trustguard-demo)
- [BiasGuard Backend Demo](#biasguard-backend-demo)
- [ContextGuard Demo](#contextguard-demo)
- [TokenGuard Demos](#tokenguard-demos)
- [Template Heaven Demos](#template-heaven-demos)
- [Quick Start Guide](#quick-start-guide)

---

## Overview

The AI Guardians ecosystem includes **8 comprehensive demo files** across multiple services:

| Service | Demo Files | Purpose |
|---------|-----------|---------|
| **HealthGuard** | `health-guard/demo.py` | LLM data poisoning detection |
| **TrustGuard** | `trust-guard/demo.py` | AI failure pattern detection |
| **BiasGuard Backend** | `biasguard-backend/demo.ts` | Authentication & billing API |
| **ContextGuard** | `contextguard/src/bias-detector/demo.ts` | Bias detection algorithms |
| **TokenGuard** | `tokenguard/demo.py`, `core_demo.py`, `multi_mode_demo.py`, `copilot_integration_example.py` | Token optimization |
| **Template Heaven** | `template-heaven/demo.py`, `quick_demo.py`, `simple_demo.py` | Template management |

---

## HealthGuard (PoisonGuard) Demo

**Location:** `health-guard/demo.py`

### What It Demonstrates

- 🔍 **Data Poisoning Detection**: Identifies malicious data in LLM training/input datasets
- 🛡️ **Mitigation Strategies**: Automatic sanitization and flagging of poisoned data
- 📊 **Comprehensive Reporting**: Security analysis with detailed threat reports
- ⚡ **Performance Metrics**: High-throughput analysis capabilities

### Running the Demo

```bash
# Option 1: With API service running
cd health-guard
python run_server.py  # Terminal 1 - Start the service
python demo.py        # Terminal 2 - Run the demo

# Option 2: Local mode (without API)
cd health-guard
python demo.py --local

# Custom API URL
python demo.py --url http://localhost:8000
```

### Key Features Shown

1. **Health Check**: Service availability and status
2. **Analysis Engine**: 8 test samples with various poisoning patterns
3. **Detection Algorithms**: 
   - Prompt injection detection
   - Malicious keyword identification
   - Adversarial pattern recognition
   - XSS and SQL injection detection
4. **Mitigation Actions**: Flag, sanitize, or reject malicious samples
5. **Performance Benchmarks**: Throughput testing with 10, 50, 100 samples

### Expected Output

```
🚀 PoisonGuard (HealthGuard) Demo
======================================================================
Protecting LLM applications from data poisoning attacks
======================================================================

🏥 PoisonGuard Health Check
✅ PoisonGuard API is healthy and ready

🔍 Data Poisoning Detection Analysis
📊 Analyzing 8 data samples...
✅ Analysis completed in 45.3ms

📈 Analysis Results Summary:
   Total Samples: 8
   ✅ Clean Samples: 3
   ⚠️  Suspicious Samples: 5
```

---

## TrustGuard Demo

**Location:** `trust-guard/demo.py`

### What It Demonstrates

- 🎯 **7 AI Failure Patterns**: Hallucination, Drift, Bias, Deception, Security Theater, Duplication, Stub Syndrome
- 📐 **Mathematical Validation**: KL divergence, uncertainty quantification
- 🛡️ **Constitutional Prompting**: Automated mitigation strategies
- 🔐 **Enterprise Security**: API keys, JWT, RBAC, rate limiting
- 📊 **Observability**: Prometheus metrics, health checks, distributed tracing

### Running the Demo

```bash
# Start the TrustGuard service
cd trust-guard
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# Run the demo (in another terminal)
python demo.py

# Custom API URL
python demo.py --url http://localhost:8000
```

### Key Features Shown

1. **Health Check**: Comprehensive service status
2. **Pattern Detection**: 7 test cases for each AI failure pattern
3. **Mathematical Validation**: KL divergence and uncertainty analysis
4. **Constitutional Prompting**: Mitigation of biased/deceptive content
5. **Security Features**: Authentication, rate limiting, audit logging
6. **Observability**: Metrics, health probes, monitoring endpoints
7. **Performance Benchmarks**: Sub-200ms response time validation

### Expected Output

```
🚀 TrustGuard AI Reliability Service Demo
======================================================================
Enterprise-grade AI failure pattern detection and mitigation
======================================================================

🏥 TrustGuard Health Check
✅ TrustGuard service is healthy
   Status: healthy
   Uptime: 1234.5s

🔍 AI Failure Pattern Detection
📊 Testing 7 scenarios for AI failure patterns...

🧪 Test Case 1: Hallucination Detection
   Expected Pattern: hallucination
   ⚠️  Detected: hallucination, false_information
   Confidence: 87.45%
   Response time: 156.2ms
```

---

## BiasGuard Backend Demo

**Location:** `biasguard-backend/demo.ts`

### What It Demonstrates

- 🔐 **Authentication System**: Clerk integration for user management
- 💳 **Subscription Management**: Stripe integration for billing
- 👥 **Team Collaboration**: Multi-user team features
- 🔔 **Webhook Handling**: Real-time event processing
- 🗄️ **Database Schema**: PostgreSQL with Drizzle ORM

### Running the Demo

```bash
# Start the BiasGuard backend service
cd biasguard-backend
npm install
npm run dev  # Starts on port 4000

# Run the demo (in another terminal)
npm install -g ts-node  # If not already installed
ts-node demo.ts

# Or compile and run
npm run build
node dist/demo.js
```

### Key Features Shown

1. **Health Check**: Backend service availability
2. **API Architecture**: Complete REST API endpoint overview
3. **Authentication Flow**: Clerk-based user authentication
4. **Subscription Plans**: Free, Pro, and Enterprise tiers
5. **Team Management**: Roles, invitations, collaboration
6. **Webhook Processing**: Clerk and Stripe event handlers
7. **Database Models**: User, subscription, team, product schemas
8. **ContextGuard Integration**: How bias detection connects

### Expected Output

```
🚀 BiasGuard Backend API Demo
======================================================================
Backend service for authentication, billing, and team management
======================================================================

🏥 BiasGuard Backend Health Check
✅ BiasGuard backend is healthy
   Status: ok
   Uptime: 456s

🏗️  BiasGuard Backend Architecture
📋 Available API Endpoints:

🔐 Authentication & Authorization (Clerk Integration):
   • POST /v1/auth/signup - User registration
   • POST /v1/auth/signin - User login
   ...
```

---

## ContextGuard Demo

**Location:** `contextguard/src/bias-detector/demo.ts`

### What It Demonstrates

- ✅ **Success Declaration Bias**: Overconfident completion claims
- 🖥️ **Terminal Worship**: Over-reliance on console output
- 📅 **Planning Fallacy**: Unrealistic time estimates
- 🔄 **Real-time Analysis**: Sub-millisecond detection
- 📊 **Mathematical Objectivity**: Deterministic scoring algorithms
- 📈 **Batch Analysis**: Project-wide bias detection

### Running the Demo

```bash
cd contextguard
npm install
ts-node src/bias-detector/demo.ts

# Or compile and run
npm run build
node dist/bias-detector/demo.js
```

### Expected Output

```
=== Success Declaration Bias Detection ===
Bias Score: 0.85
Severity: high
Confidence: 0.92
Detected Patterns: ['success_declaration', 'completion_bias']
Mathematical Trace: {...}

=== Real-Time Analysis ===
Analysis Time: 0.8 ms
Bias Score: 0.78
Top Patterns: ['certainty_bias', 'universal_statements']
```

---

## TokenGuard Demos

**Location:** `tokenguard/`

### Available Demos

1. **`demo.py`** - Main Microservice Demo
2. **`core_demo.py`** - Core Functionality Demo
3. **`multi_mode_demo.py`** - Multi-Mode Operation Demo
4. **`copilot_integration_example.py`** - Copilot Integration Example

### Running TokenGuard Demos

```bash
cd tokenguard

# Main demo (requires service running)
python main.py  # Terminal 1
python demo.py  # Terminal 2

# Core demo (no service required)
python core_demo.py

# Multi-mode demo
python multi_mode_demo.py

# Copilot integration example
python copilot_integration_example.py
```

### What They Demonstrate

- **demo.py**: Health checks, pruning, analysis, generation, error handling
- **core_demo.py**: Pruning logic, confidence analysis, performance
- **multi_mode_demo.py**: Standard, tool call, and MCP modes
- **copilot_integration_example.py**: Custom AI assistant integration

---

## Template Heaven Demos

**Location:** `template-heaven/`

### Available Demos

1. **`demo.py`** - Comprehensive Template Management Demo
2. **`quick_demo.py`** - Quick Python API Demo
3. **`simple_demo.py`** - Simple Demo (No Unicode)

### Running Template Heaven Demos

```bash
cd template-heaven

# Comprehensive demo
python demo.py

# Quick demo
python quick_demo.py

# Simple demo (no Unicode)
python simple_demo.py
```

### What They Demonstrate

- Template discovery and listing
- Search functionality
- Stack categories
- Configuration management
- Template validation
- Statistics and analytics

---

## Quick Start Guide

### Run All Demos in Sequence

```bash
# 1. HealthGuard
cd health-guard && python demo.py --local && cd ..

# 2. TrustGuard (requires service)
cd trust-guard && python -m uvicorn main:app --reload &
sleep 5 && python demo.py && cd ..

# 3. BiasGuard Backend (requires service)
cd biasguard-backend && npm run dev &
sleep 5 && ts-node demo.ts && cd ..

# 4. ContextGuard
cd contextguard && ts-node src/bias-detector/demo.ts && cd ..

# 5. TokenGuard
cd tokenguard && python core_demo.py && cd ..

# 6. Template Heaven
cd template-heaven && python demo.py && cd ..
```

### Prerequisites by Demo

| Demo | Prerequisites |
|------|--------------|
| **HealthGuard** | Python 3.8+, PyYAML, requests |
| **TrustGuard** | Python 3.8+, FastAPI, uvicorn |
| **BiasGuard Backend** | Node.js 16+, TypeScript, PostgreSQL |
| **ContextGuard** | Node.js 16+, TypeScript |
| **TokenGuard** | Python 3.8+, FastAPI (optional) |
| **Template Heaven** | Python 3.8+ |

---

## Environment Setup

### Python-based Demos

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies for each service
pip install -r health-guard/requirements.txt
pip install -r trust-guard/requirements.txt
pip install -r tokenguard/requirements.txt
```

### Node.js-based Demos

```bash
# Install dependencies
cd biasguard-backend && npm install && cd ..
cd contextguard && npm install && cd ..
```

---

## Demo Summary Matrix

| Feature | HealthGuard | TrustGuard | BiasGuard | ContextGuard | TokenGuard |
|---------|------------|-----------|-----------|--------------|-----------|
| **Health Checks** | ✅ | ✅ | ✅ | ➖ | ✅ |
| **API Endpoints** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Local Mode** | ✅ | ➖ | ➖ | ✅ | ✅ |
| **Performance Tests** | ✅ | ✅ | ➖ | ✅ | ✅ |
| **Security Features** | ✅ | ✅ | ✅ | ➖ | ✅ |
| **Reporting** | ✅ | ✅ | ➖ | ✅ | ✅ |

---

## Troubleshooting

### Service Not Running

If a demo fails with connection errors:

1. Check if the service is running
2. Verify the correct port
3. Try local mode (if available)
4. Check firewall/network settings

### Module Not Found

```bash
# Python
pip install -r requirements.txt
python -m pip install <missing-module>

# Node.js
npm install
npm install <missing-package>
```

### Port Conflicts

Default ports used:
- HealthGuard: 8000
- TrustGuard: 8000
- BiasGuard Backend: 4000
- TokenGuard: 8000

Change ports using `--port` flag or environment variables.

---

## Next Steps

After running the demos:

1. **Explore API Documentation**
   - HealthGuard: Run service, visit `/docs`
   - TrustGuard: http://localhost:8000/docs
   - BiasGuard: API endpoints in demo output

2. **Review Architecture Docs**
   - `trust-guard/docs/ARCHITECTURE.md`
   - `CODE_GUARDIANS_ARCHITECTURE.md`
   - Service-specific README files

3. **Integration Examples**
   - `tokenguard/copilot_integration_example.py`
   - `biasguard-backend/demo.ts` (Integration section)

4. **Production Deployment**
   - `DEPLOYMENT_GUIDE.md`
   - Service-specific Docker/K8s configs
   - AWS deployment scripts in `trust-guard/aws/`

---

## Support

For questions or issues:
- Review service-specific README files
- Check comprehensive architecture docs
- Consult validation reports in each service directory

---

**Last Updated:** October 17, 2025  
**Demo Version:** 1.0.0  
**Ecosystem:** AI Guardians Code Guardians

