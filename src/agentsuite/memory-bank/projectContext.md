# **Project Context - AI Guardians Chrome Extension**

*This file provides stable, high-level details of the AI Guardians Chrome Extension project to AI agents for necessary domain knowledge.*

## **1. Primary Business Objective**

**Objective**: AI Guardians Chrome Extension is a comprehensive browser extension that provides real-time AI interaction monitoring, security threat detection, and content analysis. The extension integrates with the AI Guardians backend service to deliver enterprise-grade AI safety and security features directly in the browser.

**Key Features**:
- Real-time AI context monitoring and analysis
- Security threat detection and prevention (OWASP compliance)
- Content script analysis and validation
- Browser-based AI interaction tracking
- Secure communication with backend services
- Extension popup and options UI

## **2. Core Technologies**

**Primary Languages**: 
- JavaScript (ES6+) for all extension code
- HTML/CSS for UI components

**Extension Architecture**: 
- Manifest V3 (Chrome Extension)
- Service Worker (Background Script)
- Content Scripts
- Popup UI
- Options Page

**Key Libraries/SDKs**: 
- Chrome Extension APIs (chrome.runtime, chrome.storage, chrome.tabs, etc.)
- Native JavaScript (no external dependencies for core functionality)
- Chrome Extension Manifest V3

## **3. Architectural Style**

**Style**: Chrome Extension with service worker architecture

**High-Level Description**: 
AI Guardians Chrome Extension uses a standard Chrome Extension architecture:

- **Service Worker** (`src/service-worker.js`): Background script handling extension lifecycle, message passing, and external API communication
- **Content Script** (`src/content.js`): Injected into web pages for content analysis and monitoring
- **Gateway** (`src/gateway.js`): Unified interface for backend service communication
- **Popup UI** (`src/popup.html`, `src/popup.js`): Extension popup interface for user interaction
- **Options Page** (`src/options.html`, `src/options.js`): Extension settings and configuration
- **Utilities**: Logging, validation, encryption, caching, rate limiting, etc.

## **4. Coding Standards & Conventions**

**Code Style**: 
- **JavaScript**: ES6+ features, JSDoc comments for all functions
- **HTML/CSS**: Semantic HTML, modern CSS practices

**Testing Framework**: 
- Unit tests for individual functions
- Integration tests for cross-context interactions
- Security tests for vulnerability assessment
- E2E tests for complete workflows

**Key Conventions**: 
- All functions must have comprehensive JSDoc comments
- Security-first approach: all user inputs must be validated and sanitized
- Comprehensive error handling with structured logging
- Conventional commits for all changes (feat, fix, docs, etc.)
- No sensitive data in logs, error messages, or configuration files
- Follow Chrome Extension security best practices

## **5. Directory Structure Pointers**

**Core Components**:
- `src/service-worker.js`: Background service worker
- `src/content.js`: Content script for page interaction
- `src/gateway.js`: Backend service gateway
- `src/popup.html`, `src/popup.js`: Extension popup UI
- `src/options.html`, `src/options.js`: Extension options page
- `src/agentsuite/`: AI Agent Suite framework integration

**Utilities**:
- `src/logging.js`: Structured logging
- `src/input-validator.js`: Input validation and sanitization
- `src/data-encryption.js`: Data encryption utilities
- `src/cache-manager.js`: Caching functionality
- `src/rate-limiter.js`: Rate limiting
- `src/string-optimizer.js`: String optimization

**Configuration & Build**:
- `manifest.json`: Chrome Extension manifest
- `package.json`: Node.js dependencies (for development)

**Testing & Quality**:
- `tests/`: Comprehensive test suite
- `tests/unit/`: Unit tests
- `tests/integration/`: Integration tests
- `tests/e2e/`: End-to-end tests

## **6. Security Requirements**

**Critical Security Considerations**:
- All user input must be validated and sanitized
- Secure message passing between extension contexts
- Encrypted storage of sensitive data
- Secure external API communication (HTTPS)
- Content Security Policy (CSP) compliance
- Principle of least privilege for extension permissions
- No sensitive information in logs or error messages
- Regular security audits and vulnerability assessments
- OWASP Top 10 compliance

## **7. Performance Requirements**

**Performance Targets**:
- Minimal impact on browser performance
- Efficient memory usage
- Fast extension popup loading
- Efficient Chrome Storage operations
- Optimized network requests

## **8. Extension Permissions**

**Required Permissions**:
- ActiveTab: For content script injection
- Storage: For extension configuration and data
- Scripting: For content script injection (Manifest V3)

**Optional Permissions**:
- Declared in manifest.json for features that require additional permissions

## **9. Integration Points**

**External Integrations**:
- Chrome Extension APIs for browser functionality
- Backend service APIs for AI analysis and monitoring
- Chrome Storage API for local data persistence

## **10. Development Workflow**

**Development Process**:
- Feature branches for all development work
- Pull request reviews required for all changes
- Automated testing on all commits
- Security review for sensitive changes
- Documentation updates for all new features
- Follow VDE methodology and .aiagentsuite protocols

This context provides the foundation for AI agents to understand the AI Guardians Chrome Extension project's architecture, requirements, and development standards when working on any component of the extension.

