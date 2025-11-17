# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Setup
- Install dependencies for the extension and SDK (Yarn workspaces-style layout):
  - `npm install`
- Node.js 16+ is required (see `package.json` `engines`).

### Build & packaging
- Build the Chrome extension Clerk bundle:
  - `npm run build`  
    (alias: `npm run build:clerk`, both run `node scripts/bundle-clerk.js`)
- Build the SDK (pure ES modules, no bundler beyond this stub):
  - `npm run build:sdk`  
    (runs `cd sdk && npm run build`, which currently just echoes status)
- Package the extension as a distributable zip (used before Chrome Web Store submission):
  - `npm run package`

### Tests (extension & backend)
All test orchestration is defined in the root `package.json` and custom Node scripts.

- Run the browser-based unit tests (Puppeteer driving `tests/test-runner.html`):
  - `npm run test:unit`  
    - Uses `scripts/run-unit-tests.cjs` to spin up a static HTTP server, launch Chromium via Puppeteer, and execute all unit specs wired into `tests/test-runner.html` using the in-browser runner in `tests/unit/test-runner.js`.
- Run integration tests (non-backend):
  - `npm run test:integration`  
    (runs `node tests/integration-test.js`).
- Run backend integration tests against the AiGuardian gateway (CodeGuardians backend):
  - Basic run (uses defaults and env vars):
    - `npm run test:backend`
  - With explicit backend URL and API key (arguments are passed through to `scripts/run-backend-integration-tests.js`):
    - `npm run test:backend -- --url http://localhost:8000 --key YOUR_API_KEY`
  - Optional env vars used by the runner:
    - `AIGUARDIAN_GATEWAY_URL` – backend base URL (e.g. `https://api.aiguardian.ai` or local dev)
    - `AIGUARDIAN_API_KEY` – API key for authenticated requests
- Run the focused backend-integration test harness directly:
  - `npm run test:backend-integration`  
    (runs `node tests/integration/backend-integration.test.js` using the same configuration conventions documented in `docs/guides/BACKEND_INTEGRATION_GUIDE.md`).
- Smoke and security checks:
  - Smoke tests: `npm run test:smoke`  
    (high-level extension sanity checks)
  - Security / vulnerability audit: `npm run test:security`
  - Auth pattern validation: `npm run test:auth:patterns`
- End-to-end (E2E) extension tests using Jest and Puppeteer:
  - Run the full E2E suite: `npm run test:e2e`  
    (script: `jest tests/e2e/extension.test.js`)
  - Run a single Jest E2E test or subset by pattern:
    - `npm run test:e2e -- -t "pattern in test name"`
- Run the SDK test suite:
  - From repo root (uses workspace): `npm run test:sdk`  
    (runs `cd sdk && npm test`, which executes `node tests/runner.js`)
  - Or directly inside `sdk/`: `cd sdk && npm test`
- Run the common aggregate test pipeline:
  - `npm run test:all`  
    (runs smoke, unit, integration, and security suites in sequence).

> Note: The in-browser unit test harness (`tests/test-runner.html` + `tests/unit/test-runner.js`) does not expose a CLI-level "single spec" filter. To run only a subset of unit tests, temporarily narrow the imports/registration of tests in the HTML/runner rather than expecting Jest-style filtering.

### Development flows
- Iterative extension development:
  1. Load the extension via `chrome://extensions` → **Load unpacked** pointing at the repo root (see root `README.md` and `docs/guides/DEVELOPER_GUIDE.md`).
  2. Edit files under `src/`.
  3. Refresh the extension on `chrome://extensions` and reload the target page; for service worker changes, explicitly restart the service worker.
- Backend integration iteration:
  - Use `npm run test:backend` (and `test:backend-integration`) to quickly validate that `src/gateway.js` is correctly wired to your backend instance. The detailed contract is in `docs/guides/BACKEND_INTEGRATION_GUIDE.md`.

### SDK and landing page
- SDK development commands (in `sdk/`):
  - Install: `cd sdk && npm install`
  - Tests: `cd sdk && npm test`
  - Build stub: `cd sdk && npm run build`
- Landing page (React + Vite) under `assets/brand/ai-guardian-landing-page-stuff/`:
  - Install: `cd assets/brand/ai-guardian-landing-page-stuff && npm install`
  - Run dev server: `npm run dev`  
    (Vite, default port 3000 as configured in `vite.config.ts`)
  - Build static assets: `npm run build`

## High-level architecture & structure

### Top-level layout
- Root project combines three main concerns:
  - **Chrome extension** (primary focus) – source under `src/`, tests under `tests/`, and scripts under `scripts/` with a Manifest V3 `manifest.json` at root.
  - **Client SDK** – publishable package under `sdk/` (`@aiguardian/sdk`), implemented as pure ES modules, with its own `package.json`, tests, and README.
  - **Marketing / landing page** – a small React/Vite app under `assets/brand/ai-guardian-landing-page-stuff/` used for the public site / AI Studio app front-end.
- Extensive documentation lives under `docs/`, with subdirectories for architecture, guides, features, technical notes, reports, and brand assets. When in doubt about behavior, prefer reading the corresponding doc rather than reverse-engineering from code alone.

### Chrome extension runtime architecture
The extension is a Manifest V3 Chrome extension organized around a background service worker, content scripts, UI surfaces (popup/options), and a shared gateway layer for backend calls.

- **Service Worker (background)** – `src/service-worker.js`
  - Acts as the primary orchestrator:
    - Initializes default settings on installation (via `chrome.runtime.onInstalled`).
    - Instantiates a single `AiGuardianGateway` instance (from `src/gateway.js`).
    - Handles messages from content scripts, popup, and options via `chrome.runtime.onMessage` and routes them to specific handlers such as `handleTextAnalysis`, `handleGuardStatusRequest`, `handleCentralConfigUpdate`, `handleDiagnosticsRequest`, and `handleGatewayConnectionTest`.
  - Performs security validation:
    - Validates message origin and structure (`validateOrigin`, `validateMessage`).
    - Checks `chrome.runtime.lastError` after Chrome API calls.
  - All analysis requests, configuration updates, diagnostics, and connection tests ultimately flow through the gateway.

- **Content script** – `src/content.js`
  - Injected into web pages and responsible for:
    - Watching DOM events (`mouseup`, keyboard events) to detect text selection.
    - Validating selection length (min/max characters) before sending to the background.
    - Calling the service worker via `chrome.runtime.sendMessage({ type: "ANALYZE_TEXT", payload: text })` and handling async responses.
    - Rendering visual feedback in-page (highlights, badges, status messages) via helper functions like `analyzeSelection`, `displayAnalysisResults`, `highlightSelection`, `showBadge`, and cleanup utilities.
  - Maintains per-page state such as debounce timers, current badge, and active highlights.

- **Popup UI** – `src/popup.html` / `src/popup.js` / `src/popup.css`
  - Toolbar popup displayed when the extension icon is clicked.
  - Provides quick actions:
    - Triggering analysis on selected text (“Show Me the Proof”).
    - Opening configuration (“Configure Service”).
    - Showing audit trail / history of analyses.
    - Clearing highlights and copying analysis results.
  - Communicates with the background service worker using message types documented in `docs/guides/DEVELOPER_GUIDE.md` and relies on the centralized logging and diagnostics facilities.

- **Options page** – `src/options.html` / `src/options.js`
  - Allows configuration of:
    - Backend gateway URL (e.g. `https://api.aiguardian.ai` or local dev).
    - API key / authentication data.
    - Guard services and thresholds.
    - Logging verbosity and feature flags.
  - Persists configuration in `chrome.storage.sync` under keys like `gateway_url`, `api_key`, and structured settings for guards and logging.
  - Uses helper functions to load current configuration, validate user input, save to storage, and notify the service worker so the gateway can reload its internal config.
  - Provides a “Test connection” flow that uses the gateway’s `testGatewayConnection()` (mapped to `/health/live`) to validate backend availability.

- **Core modules** (all under `src/` and heavily shared across components; see `docs/architecture/ARCHITECTURE.md` for diagrams):
  - `gateway.js` – **AiGuardianGateway**
    - Central integration point between the extension and backend, abstracting the transport details.
    - Responsibilities:
      - Sanitize and validate request payloads (`sanitizeRequestData`, `validateRequest`).
      - Perform input validation and security checks using `input-validator.js`.
      - Manage caching via `cache-manager.js`.
      - Enforce rate limits via `rate-limiter.js` (token bucket with configurable limits).
      - Handle retries and exponential backoff for transient errors.
      - Normalize responses and surface structured errors to callers.
      - Maintain trace statistics and optionally expose diagnostics (used by tests and options UI).
    - Maintains a mapping from logical actions (`'analyze'`, `'guards'`, `'config'`, `'health'`, `'logging'`) to concrete backend endpoints (see Backend integration below).

  - `logging.js` – **Logger**
    - Simple, centralized logger with `info`, `warn`, `error`, and trace-style logging wrappers.
    - All logging is wrapped in try/catch to avoid logging failures breaking extension behavior.
    - Used across background, content, popup, options, and gateway modules for consistent, prefixed logs (`[BG]`, `[CS]`, `[Gateway]`, etc.).

  - `cache-manager.js` – **CacheManager**
    - In-memory cache keyed by a generated cache key (`generateCacheKey(endpoint, payload)`), with TTL and basic LRU-like semantics.
    - Supports deduplication of in-flight requests by tracking queued requests.
    - Gateway consults cache before making network calls and stores successful responses.

  - `input-validator.js` – **InputValidator**
    - Validation for text (min/max length, type string), API keys (regex-based format checks), and URLs (enforces HTTPS).
    - Provides sanitization helpers to strip or encode potentially dangerous content (XSS/script tags, injection patterns).
    - Throws descriptive errors (e.g., `"Text too long: maximum 10,000 characters allowed"`, `"Invalid API key format"`, `"Only HTTPS URLs are allowed"`).

  - `rate-limiter.js` – **RateLimiter**
    - Implements a token bucket rate limiter used inside the gateway to enforce per-window request quotas.
    - Exposes stats (tokens remaining, utilization, next refill) that the SDK and extension can query.

  - `data-encryption.js` – **DataEncryption**
    - Handles sensitive data encryption before transmission where necessary.
    - Integrated into the gateway’s request pipeline (sanitization → validation → encryption → fetch).

  - `string-optimizer.js` – **StringOptimizer**
    - Responsible for efficient string manipulation and pre-processing to minimize payload size (ties into TokenGuard semantics).

  - `constants.js` – **Constants**
    - Central place for magic numbers, text length thresholds, default URLs, debounce intervals, and feature flags shared across modules.

- **Storage and state**
  - Persistent user configuration lives in `chrome.storage.sync`:
    - Keys for `gateway_url`, `api_key`, guard configurations, logging config, and other settings (see the Storage Architecture section in `docs/architecture/ARCHITECTURE.md`).
    - Some runtime metrics (request counts, last sync time, error log) are also persisted there for diagnostics.
  - Ephemeral state such as response cache, request queue, and trace statistics is kept in memory within the gateway and associated utility modules.

### Backend integration (CodeGuardians gateway)
Backend integration is defined jointly by `src/gateway.js` and the documentation in `docs/guides/BACKEND_INTEGRATION_GUIDE.md`.

- **Base URLs** (from the guide):
  - Production: `https://api.aiguardian.ai`
  - Development: typically `http://localhost:8000`
  - The gateway path for most endpoints is `/api/v1`.

- **Primary unified analysis endpoint**
  - Extension-level “analyze” operations map to:
    - `POST /api/v1/guards/process`
  - Requests specify `service_type` (e.g. `"tokenguard"`, `"trustguard"`, `"contextguard"`, `"biasguard"`, `"healthguard"`) plus a `payload` with `text` and additional parameters.
  - Backend responds with a unified structure containing `success`, `data`, `processing_time`, and metadata.

- **Direct guard endpoints** (optional / advanced use):
  - `POST /api/v1/guards/tokenguard`
  - `POST /api/v1/guards/trustguard`
  - `POST /api/v1/guards/contextguard`
  - `POST /api/v1/guards/biasguard`
  - `POST /api/v1/guards/healthguard`

- **Health endpoints used by the extension**
  - `GET /health/live` – used by `testGatewayConnection()` for quick liveness checks.
  - Additional endpoints (`/health`, `/health/ready`, `/health/comprehensive`, `/api/v1/guards/health`) are documented for deeper diagnostics but are typically exercised from backend tests, not from the core UX.

- **Guard discovery & status endpoints**
  - `GET /api/v1/guards/services` – list available guard services and high-level status.
  - `GET /api/v1/guards/status` – full status of all guard services.
  - `GET /api/v1/guards/discovery/services` – discovery endpoint for advanced clients.

- **Configuration endpoints**
  - `GET /api/v1/config/config` – main configuration document (gateway URL, timeouts, retry attempts, rate-limit settings, feature flags).
  - Additional endpoints for rate-limits and feature flags (`/api/v1/config/rate-limits`, `/api/v1/config/feature-flags`, etc.).

- **Logging and analytics**
  - `POST /api/v1/logging` – central logging endpoint (existence should be verified on the backend; the guide flags this as potentially optional).
  - Various analytics endpoints under `/api/v1/analytics/...` for benefits, performance dashboards, and per-guard metrics.

- **Authentication**
  - Requests from the extension use Bearer tokens in the `Authorization` header:
    - `Authorization: Bearer <api-key-or-token>`
  - Headers typically also include:
    - `X-Extension-Version`, `X-Request-ID`, `X-Timestamp`, and `X-Client-Type: chrome`.
  - Backend supports both API key auth and Clerk-based JWT auth; see the **Authentication** section in `docs/guides/BACKEND_INTEGRATION_GUIDE.md` for the exact flows (`/api/v1/auth/login`, `register`, `refresh`, etc.).

- **Endpoint mapping nuances**
  - `docs/guides/BACKEND_INTEGRATION_GUIDE.md` includes an "Endpoint Mapping Notes" section that documents discrepancies between the current `endpointMapping` in `gateway.js` and the recommended backend routes (e.g. `"guards"` should point at `/api/v1/guards/services` and `"config"` at `/api/v1/config/config`).
  - When modifying or extending backend calls in `gateway.js`, align with the mapping table near the end of that guide to avoid drift.

### Error handling & observability
Error handling and logging are cross-cutting concerns implemented consistently across modules (see `docs/technical/ERROR_HANDLING_OVERVIEW.md`).

- **Centralized logging**
  - All major components (background, content, popup, options, gateway) log via `src/logging.js` with consistent prefixes and log levels.
  - Logging is designed to be “fail-safe”: all logging calls are wrapped in `try/catch` to avoid breaking extension logic if `console` is unavailable or throws.

- **Component-specific error behavior**
  - **Background**:
    - Validates message origin and payload; rejects invalid senders and malformed messages with descriptive errors.
    - Checks `chrome.runtime.lastError` after Chrome API usage and logs `[BG]` errors.
  - **Content script**:
    - Validates selection length and type before sending analysis requests.
    - Handles runtime errors and failed analyses by logging `[CS]` messages and showing user-facing badges like “Text too long for analysis” or “Analysis failed”.
  - **Gateway**:
    - Validates endpoints and payloads, throwing clear `Error` instances when misused (e.g. `"Invalid endpoint"`, `"Invalid text input"`).
    - Wraps fetch/network errors with `[Gateway]` logs and implements retry logic with exponential backoff (`retryAttempts`, `retryDelay`).
    - Normalizes error responses from the backend into a consistent format that callers can handle without needing backend-specific knowledge.
  - **Options/Popup**:
    - Surround initialization with try/catch and log failures via `Logger.error('Options init error', err)` or `Logger.error('Popup init error', err)`.
    - Surface connection test failures to users with clear, prefixed messages.

- **Input validation & security**
  - Input validation is treated as a first-class concern:
    - Text length bounds, API key format, URL scheme enforcement (`https://` only), numeric constraints.
    - HTML/JS sanitization to prevent XSS or injection via user-supplied strings.
  - The architecture diagrams in `docs/architecture/ARCHITECTURE.md` include a dedicated Security Architecture section showing layered validation, rate limiting, and encryption.

- **Recovery & resilience**
  - The extension degrades gracefully when backend calls fail: user-facing badges indicate failures, and the UI recovers without leaving inconsistent state.
  - Rate-limiter and cache help reduce load on the backend and provide better perceived performance.

### SDK architecture (sdk/)
The SDK exposes a programmatic API (`@aiguardian/sdk`) that mirrors many of the concepts used in the extension but packaged for general JavaScript/TypeScript applications.

- **Core entrypoint** – `AiGuardianClient` (see `sdk/README.md`)
  - Wraps HTTP communication with the AiGuardian backend.
  - Provides high-level methods:
    - `analyzeText`, `analyzeBatch` for text analysis.
    - `healthCheck`, `getGuardStatus` for health & status.
    - `getTraceStats`, `clearCache`, `getConfig`, `updateConfig`, etc. for observability and configuration.
  - Uses internally similar subsystems to those described in the extension:
    - Logging, tracing, configuration management, cache, and rate limiting.

- **Centralized subsystems**
  - **Logger** – structured logging with trace IDs and optional remote logging.
  - **Tracer** – operation-level tracing with exportable metrics and stats.
  - **ConfigManager** – hierarchical configuration with path-based access, validation, listeners, and optional persistence.
  - **Cache** – TTL-based cache with statistics (hit rate, size, miss counts).
  - **RateLimiter** – token-bucket limiter used client-side to avoid exceeding backend quotas.

- **Error model**
  - Errors are categorized with explicit `error.code` values (`INVALID_API_KEY`, `RATE_LIMIT_EXCEEDED`, `TEXT_TOO_LONG`, etc.), and typical usage patterns in the README demonstrate how callers should handle them with `switch` statements.

When making changes that affect both the extension and the SDK, ensure that error semantics and analysis payloads remain aligned with the backend contracts outlined in `docs/guides/BACKEND_INTEGRATION_GUIDE.md` and the SDK README.

### Documentation map for deeper dives
- Root project overview and quickstart: `README.md`.
- Chrome extension developer documentation: `docs/guides/DEVELOPER_GUIDE.md`.
- Architecture diagrams and module relationships: `docs/architecture/ARCHITECTURE.md`.
- Backend integration details and endpoint mapping: `docs/guides/BACKEND_INTEGRATION_GUIDE.md`.
- Error handling and logging design: `docs/technical/ERROR_HANDLING_OVERVIEW.md`.
- Testing procedures and manual Chrome testing checklists: `docs/guides/TEST_INSTRUCTIONS.md`.
- SDK API details and advanced usage: `sdk/README.md`.
