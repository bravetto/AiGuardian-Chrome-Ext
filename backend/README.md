# AI-Guardians-Code-Guardians 🛡️

A unified gateway repository that integrates powerful AI development tools and comprehensive template collections. This repository serves as the central hub for accessing the AI Agent Suite framework and Template Heaven's extensive collection of project templates.

## 🚀 What's Included

### 🤖 AI Agent Suite
A comprehensive framework for building, managing, and deploying AI agents with enterprise-grade features.

**Key Features:**
- **Core Architecture**: Robust foundation for AI agent development
- **Security Framework**: Built-in security protocols and validation
- **Memory Bank System**: Persistent context and learning capabilities
- **Protocol Management**: Standardized communication and execution protocols
- **Enterprise Dashboard**: Web-based management interface
- **LSP Integration**: Language Server Protocol support for enhanced development
- **TypeScript/JavaScript Support**: Full-stack development capabilities
- **Comprehensive Testing**: Automated testing and validation suite

### 🛡️ Security & Context Frameworks
Advanced security and context management frameworks for AI agents and systems, providing comprehensive protection, validation, and context management mechanisms.

#### TokenGuard
AI token cost optimization service with intelligent token management strategies.

**Key Features:**
- **Token Cost Optimization**: Multiple strategies to reduce token usage and costs
- **Intelligent Chunking**: Smart text segmentation for optimal processing
- **Summarization**: Content compression while preserving key information
- **Caching**: Intelligent response caching to avoid redundant processing
- **Rate Limiting**: Built-in rate limiting for API protection
- **Monitoring**: Prometheus metrics integration with comprehensive observability
- **FastAPI**: Modern async API with automatic documentation
- **Production Ready**: Docker, Kubernetes, and comprehensive testing

#### TrustGuard
Enterprise-grade AI reliability service that detects and mitigates critical AI failure patterns.

**Key Features:**
- **AI Failure Pattern Detection**: Detects 7 critical AI failure patterns with high accuracy
- **Mathematical Validation**: KL divergence, uncertainty quantification, and statistical analysis
- **Constitutional Prompting**: Automated mitigation strategies and enhancement techniques
- **Enterprise Security**: API key authentication, JWT tokens, RBAC, and audit logging
- **Real-time Monitoring**: Prometheus metrics, health checks, and distributed tracing
- **Production Ready**: Comprehensive error handling, graceful degradation, and observability
- **FastAPI**: Modern async API with automatic documentation and OpenAPI specs

#### ContextGuard
Advanced AI context drift detection and management framework with mathematical precision.

**Key Features:**
- **Context Drift Detection**: Mathematical algorithms with 96% accuracy
- **Memory Management**: Persistent context storage and retrieval
- **Neuromorphic Processing**: Advanced compression-aware context management
- **Real-time Monitoring**: Live context utilization tracking
- **RAG Integration**: Retrieval-Augmented Generation with metacognitive loops
- **Multi-model Support**: Claude, GPT-4, Llama, and other AI models
- **VS Code Extension**: Integrated development environment support
- **AST-based Analysis**: Advanced syntax tree analysis for context understanding

#### BiasGuard
Advanced bias detection and mitigation framework for AI systems and content analysis.

**Key Features:**
- **Bias Detection**: Comprehensive bias detection algorithms with mathematical precision
- **Content Analysis**: Multi-dimensional bias analysis across various content types
- **Mitigation Strategies**: Automated bias mitigation and correction mechanisms
- **Real-time Monitoring**: Live bias detection and alerting systems
- **Compliance**: Built-in bias compliance frameworks and standards
- **Backend API**: Full-featured backend service with authentication and payment integration
- **Database Integration**: Drizzle ORM with comprehensive schema management
- **Integration**: Seamless integration with AI Agent Suite and other frameworks

### 🏗️ Template Heaven
A curated collection of 100+ production-ready templates across various technology stacks.

**Available Stacks:**
- **Frontend**: React, Vite, Next.js, T3 Stack
- **Backend**: Express API, Node.js, Python
- **Full-Stack**: Next.js applications, T3 Stack
- **AI/ML**: LLM RAG applications, Data Science pipelines
- **DevOps**: GitHub Actions, Kubernetes, Docker
- **Mobile**: React Native applications
- **Modern Languages**: Rust systems, TypeScript extensions
- **Specialized**: Quantum computing, Web3, Space technologies
- **Enterprise**: Microservices, Monorepo structures

## 📁 Repository Structure

```
AI-Guardians-Code-Guardians/
├── README.md
├── .gitmodules
├── aiagentsuite/          # AI Agent Suite submodule
│   ├── src/               # Core framework source code
│   ├── protocols/         # Standardized protocols
│   ├── memory_bank/       # Context and learning systems
│   ├── enterprise_dashboard.py
│   └── ...
├── tokenguard/            # TokenGuard AI token optimization service (submodule)
│   ├── tokenguard/        # Core TokenGuard package
│   │   ├── config.py      # Configuration management
│   │   ├── llm_client.py  # LLM client integration
│   │   ├── mcp_server.py  # Model Context Protocol server
│   │   ├── models.py      # Data models and schemas
│   │   └── pruning.py     # Token pruning algorithms
│   ├── tests/             # Comprehensive test suite
│   ├── scripts/           # Deployment and utility scripts
│   ├── k8s/               # Kubernetes deployment configs
│   └── monitoring/        # Prometheus monitoring setup
├── trust-guard/           # TrustGuard AI reliability service (submodule)
│   ├── trustguard/        # Core TrustGuard package
│   │   ├── core.py        # Core reliability detection
│   │   ├── constitutional.py # Constitutional prompting
│   │   ├── validation.py  # Mathematical validation
│   │   ├── security.py    # Enterprise security features
│   │   └── observability.py # Monitoring and tracing
│   ├── tests/             # Comprehensive test suite
│   ├── docs/              # Architecture and API documentation
│   └── aws/               # AWS deployment configurations
├── contextguard/          # ContextGuard context management framework (submodule)
│   ├── src/               # Context management framework source code
│   │   ├── ast-detector/  # AST-based context analysis
│   │   ├── services/      # Context tracking services
│   │   └── utils/         # Context management utilities
│   ├── tests/             # Comprehensive test suite
│   └── ...
├── biasguard-backend/     # BiasGuard backend API service (submodule)
│   ├── src/               # Backend API source code
│   │   ├── controllers/   # API controllers for bias detection
│   │   ├── services/      # Business logic services
│   │   ├── db/            # Database schema and utilities
│   │   ├── middleware/    # Authentication and validation middleware
│   │   └── router/        # API routing and webhooks
│   ├── drizzle/           # Database migrations and schema
│   └── ...
└── template-heaven/       # Template collection submodule
    ├── stacks/            # Organized by technology stack
    ├── tools/             # Development tools and utilities
    └── scripts/           # Automation scripts
```

## 🛠️ Getting Started

### Prerequisites
- Git (with submodule support)
- Python 3.8+ (for AI Agent Suite)
- Node.js 16+ (for TypeScript components)

### Installation

1. **Clone with submodules:**
   ```bash
   git clone --recursive https://github.com/BravettoBackendTeam/AI-Guardians-Code-Guardians.git
   cd AI-Guardians-Code-Guardians
   ```

2. **Or initialize submodules for existing clone:**
   ```bash
   git submodule update --init --recursive
   ```

### Quick Start

#### Using AI Agent Suite
```bash
cd aiagentsuite
pip install -r requirements.txt
python -m aiagentsuite.cli.main --help
```

#### Using Template Heaven
```bash
cd template-heaven
# Browse available templates in the stacks/ directory
# Each template includes setup instructions
```

## 🔄 Updating Submodules

To get the latest updates from the integrated repositories:

```bash
# Update all submodules to latest commits
git submodule update --remote

# Update specific submodule
git submodule update --remote aiagentsuite
git submodule update --remote template-heaven
```

## 🏗️ Development Workflow

1. **Working with AI Agent Suite:**
   - Navigate to `aiagentsuite/` directory
   - Follow the framework's development guidelines
   - Use the built-in testing and validation tools

2. **Using Template Heaven:**
   - Browse templates in `template-heaven/stacks/`
   - Each template includes comprehensive documentation
   - Use the provided scripts for template synchronization

3. **Contributing:**
   - Each submodule maintains its own contribution guidelines
   - Refer to individual repository documentation for specific requirements

## 📚 Documentation

- **AI Agent Suite**: See `aiagentsuite/README.md` and `aiagentsuite/docs/`
- **Template Heaven**: See `template-heaven/README.md` and individual template documentation
- **Architecture**: Detailed architecture documentation in `aiagentsuite/docs/ARCHITECTURE.md`

## 🤝 Contributing

This repository serves as a unified gateway. For contributions:

1. **AI Agent Suite**: Contribute directly to the [aiagentsuite repository](https://github.com/jimmyjdejesus-cmyk/aiagentsuite)
2. **Template Heaven**: Contribute directly to the [template-heaven repository](https://github.com/BravettoBackendTeam/template-heaven)
3. **Gateway Improvements**: Submit issues and pull requests to this repository

## 📄 License

- **AI Agent Suite**: See `aiagentsuite/LICENSE`
- **Template Heaven**: See `template-heaven/LICENSE`
- **Gateway Repository**: This unified gateway follows the same licensing terms

## 🔗 Links

- **AI Agent Suite**: [GitHub Repository](https://github.com/jimmyjdejesus-cmyk/aiagentsuite)
- **Template Heaven**: [GitHub Repository](https://github.com/BravettoBackendTeam/template-heaven)
- **Issues**: [Report Issues](https://github.com/BravettoBackendTeam/AI-Guardians-Code-Guardians/issues)

---

**Built with ❤️ by the Bravetto Backend Team**

*This unified gateway brings together the power of AI agent development and comprehensive project templates in one accessible location.* 
