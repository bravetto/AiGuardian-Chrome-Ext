# 🛡️ AiGuardian

**Finally, AI tools for engineers who don't believe the hype.**

AI-powered content analysis with transparent failure logging, confidence scores, and uncertainty flagging for skeptical developers.

## 🚀 AiGuardian SDK

This repository contains both the **Chrome Extension** and the **AiGuardian SDK** for client-side AI content analysis.

### 📦 SDK Installation

```bash
# Install the SDK
npm install @aiguardian/sdk

# Or use directly in browser
<script src="https://cdn.aiguardian.ai/sdk/v1.0.0/aiguardian-sdk.js"></script>
```

### 💻 SDK Usage

```javascript
import AiGuardianClient from '@aiguardian/sdk';

const client = new AiGuardianClient({
  apiKey: 'your-api-key-here'
});

// Analyze text for bias
const result = await client.analyzeText(
  "This amazing technology will revolutionize everything!"
);

console.log(`Bias Score: ${(result.score * 100).toFixed(1)}%`);
console.log(`Bias Type: ${result.analysis.bias_type}`);
console.log(`Confidence: ${(result.analysis.confidence * 100).toFixed(1)}%`);
```

**[📖 Complete SDK Documentation](sdk/README.md)** - API reference, examples, and guides

## 🖥️ Chrome Extension

The Chrome extension provides browser-based AI content analysis with visual feedback.

### Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" and select this folder
4. Select text on any webpage to analyze

### Features

- **Automatic Analysis**: Select text to see bias scores instantly
- **Visual Feedback**: Color-coded highlighting based on bias levels
- **Context Menu**: Right-click analysis options
- **Keyboard Shortcuts**: `Ctrl+Shift+A` for quick analysis
- **Analysis History**: Track and review past analyses

**[📚 Extension Documentation](DEVELOPER_GUIDE.md)** - Development and user guides  
**[🔌 Backend Integration Guide](docs/BACKEND_INTEGRATION_GUIDE.md)** - Complete API integration reference

## 📁 Project Structure

```
ai-guardian/
├── sdk/                      # Client-side SDK
│   ├── src/                  # SDK source code
│   ├── examples/             # Usage examples
│   ├── tests/                # SDK tests
│   └── README.md             # SDK documentation
├── src/                      # Chrome extension source
├── docs/                     # Additional documentation
├── tests/                    # Extension tests
├── assets/                   # Extension assets
└── manifest.json             # Chrome extension manifest
```

## 🎯 Key Features

### SDK Features
- **Unified API**: Single interface for all analysis types
- **Centralized Logging**: Structured logging with trace correlation
- **Performance Tracing**: Request timing and metrics collection
- **Intelligent Caching**: TTL-based caching with LRU eviction
- **Rate Limiting**: Token bucket algorithm with burst allowance
- **Input Validation**: XSS protection and comprehensive sanitization

### Extension Features
- **Text Selection Analysis**: Automatic analysis on text selection
- **Visual Feedback**: Color-coded bias indicators
- **Context Integration**: Web search and fact-checking tools
- **Keyboard Shortcuts**: Quick access to features
- **Configuration UI**: Easy settings management

## 🔧 Development

### SDK Development
```bash
cd sdk
npm install
npm test
```

### Extension Development
```bash
# Load unpacked extension in Chrome
# Make changes, then refresh extension
# Test on web pages
```

## 📚 Documentation

- **[SDK Documentation](sdk/README.md)** - Complete SDK API reference
- **[Developer Guide](DEVELOPER_GUIDE.md)** - Extension development guide
- **[Architecture](ARCHITECTURE.md)** - System architecture
- **[User Guide](USER_GUIDE.md)** - End-user documentation

## 🤝 Support

- **Website**: https://aiguardian.ai
- **Dashboard**: https://dashboard.aiguardian.ai
- **Documentation**: See links above
- **Issues**: GitHub Issues

## 📝 License

Copyright © 2024 AiGuardian. All rights reserved.

---

**Built with ❤️ by the AiGuardian team**