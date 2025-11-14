# AI Agent Suite Integration

This directory contains the integration of the [.aiagentsuite framework](https://github.com/BravettoBackendTeam/ai-agent-suite) into the AI Guardians Chrome Extension. The framework provides structured development workflows, principles, and protocols for AI-assisted development using the Vibe-Driven Engineering (VDE) methodology.

## Directory Structure

```
src/agentsuite/
├── rules/                    # Core principles and constitution
│   ├── MASTER_AI_AGENT_CONSTITUTION.md
│   ├── Principle_1_VDE_Core_Philosophy.md
│   ├── Principle_2_Branching_and_Commit_Strategy.md
│   └── Principle_3_YAGNI.md
├── workflows/                # Development protocols
│   ├── Protocol_Secure_Code_Implementation.md
│   ├── Protocol_Chrome_Extension_Feature_Development.md
│   ├── Protocol_Chrome_Extension_Security_Audit.md
│   └── Protocol_Chrome_Extension_Testing_Strategy.md
├── prompts/                 # Prompt templates (for future use)
├── tools/                   # Tool definitions (for future use)
├── memory-bank/             # Project context and decision log
│   ├── activeContext.md
│   ├── projectContext.md
│   └── decisionLog.md
├── framework-manager.js     # JavaScript framework manager
└── README.md                # This file
```

## Framework Components

### Rules

The `rules/` directory contains the foundational principles and constitution that govern AI-assisted development:

- **MASTER_AI_AGENT_CONSTITUTION.md**: The core constitution defining how AI agents should operate
- **Principle_1_VDE_Core_Philosophy.md**: The Vibe-Driven Engineering methodology philosophy
- **Principle_2_Branching_and_Commit_Strategy.md**: Git workflow and commit conventions
- **Principle_3_YAGNI.md**: "You Ain't Gonna Need It" - simplicity principle

### Workflows

The `workflows/` directory contains detailed protocols for specific development tasks:

- **Protocol_Secure_Code_Implementation.md**: Security-first code development protocol
- **Protocol_Chrome_Extension_Feature_Development.md**: Complete feature development workflow
- **Protocol_Chrome_Extension_Security_Audit.md**: Security audit procedures
- **Protocol_Chrome_Extension_Testing_Strategy.md**: Comprehensive testing approach

### Memory Bank

The `memory-bank/` directory contains project-specific context:

- **activeContext.md**: Current goals, blockers, and recent decisions
- **projectContext.md**: Project architecture, technologies, and conventions
- **decisionLog.md**: Architectural and implementation decisions

## Usage

### Framework Manager

The `FrameworkManager` class provides programmatic access to all framework resources:

```javascript
// Import the framework manager
importScripts('src/agentsuite/framework-manager.js');

// Initialize the framework
const frameworkManager = new FrameworkManager();
await frameworkManager.initialize();

// Get the constitution
const constitution = await frameworkManager.getConstitution();

// Get a specific principle
const yagni = await frameworkManager.getPrinciple('YAGNI');

// Get all principles
const allPrinciples = await frameworkManager.getAllPrinciples();

// Get a protocol
const securityProtocol = await frameworkManager.getProtocol('Chrome Extension Security Audit');

// List all available protocols
const protocols = await frameworkManager.listProtocols();

// Get memory bank context
const projectContext = await frameworkManager.getMemoryContext('projectContext');
```

### Using Protocols

When developing new features, follow the appropriate protocol:

1. **Feature Development**: Use `Protocol_Chrome_Extension_Feature_Development.md`
2. **Security Work**: Use `Protocol_Chrome_Extension_Security_Audit.md`
3. **Testing**: Use `Protocol_Chrome_Extension_Testing_Strategy.md`
4. **General Code**: Use `Protocol_Secure_Code_Implementation.md`

### Principles in Practice

All development should adhere to:

1. **VDE Core Philosophy**: Trust but verify, intent-driven, flow state, systematic
2. **Branching Strategy**: Trunk-based development with feature branches
3. **YAGNI**: Only implement what is explicitly required

## VDE Methodology

The Vibe-Driven Engineering (VDE) methodology is built on four pillars:

1. **Trust, but Verify**: AI is a capable partner, but all outputs require human verification
2. **Intent-Driven Development**: Focus on "why" not just "what"
3. **Flow State over Friction**: Reduce cognitive load and eliminate friction
4. **Systematic and Structured**: Structured prompts, protocols, and outputs

## Integration with Chrome Extension

This framework integration is specifically adapted for Chrome Extension development:

- **Security-First**: All protocols emphasize Chrome Extension security best practices
- **Cross-Context Communication**: Protocols address message passing between service worker, content script, and popup
- **Chrome Storage**: Secure handling of Chrome Storage API
- **Extension Permissions**: Principle of least privilege for permissions
- **Content Security**: CSP compliance and content script security

## Development Workflow

1. **Review Framework**: Read relevant rules and principles
2. **Select Protocol**: Choose appropriate protocol for the task
3. **Follow Protocol**: Execute protocol steps precisely
4. **Verify**: Ensure all quality and security requirements are met
5. **Document**: Update memory-bank with decisions and context

## Maintenance

- **Framework Updates**: Monitor for updates to the .aiagentsuite framework
- **Context Updates**: Update projectContext.md as the project evolves
- **Protocol Refinement**: Refine protocols based on team feedback
- **Decision Logging**: Log significant decisions in decisionLog.md

## Resources

- **Original Framework**: https://github.com/BravettoBackendTeam/ai-agent-suite
- **VDE Methodology**: See Principle_1_VDE_Core_Philosophy.md
- **Protocol Documentation**: See individual protocol files in workflows/

## Support

For questions or issues with the framework integration:
1. Review the relevant protocol documentation
2. Check the memory-bank for project-specific context
3. Refer to the original .aiagentsuite framework documentation

This integration ensures that AI Guardians Chrome Extension development maintains the highest standards of quality, security, and maintainability while leveraging AI assistance effectively and safely.

