# Contributing to AI-Guardians-Code-Guardians 🛡️

Thank you for your interest in contributing to the AI-Guardians-Code-Guardians unified gateway! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Contribution Types](#contribution-types)
- [Development Workflow](#development-workflow)
- [Submodule Contributions](#submodule-contributions)
- [Documentation](#documentation)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## 🤝 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the maintainers.

## 🚀 Getting Started

### Prerequisites

- Git with submodule support
- Python 3.8+ (for AI Agent Suite components)
- Node.js 16+ (for TypeScript components)
- Basic understanding of Git submodules

### Setup

1. **Fork the repository**
2. **Clone your fork with submodules:**
   ```bash
   git clone --recursive https://github.com/YOUR_USERNAME/AI-Guardians-Code-Guardians.git
   cd AI-Guardians-Code-Guardians
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/BravettoBackendTeam/AI-Guardians-Code-Guardians.git
   ```

4. **Update submodules:**
   ```bash
   git submodule update --init --recursive
   ```

## 🎯 Contribution Types

### Gateway Repository Contributions

- **Documentation improvements**
- **README updates**
- **Issue templates and PR templates**
- **CI/CD configuration**
- **Project structure improvements**
- **Integration enhancements**

### Submodule Contributions

- **AI Agent Suite**: Contribute directly to [aiagentsuite repository](https://github.com/jimmyjdejesus-cmyk/aiagentsuite)
- **Template Heaven**: Contribute directly to [template-heaven repository](https://github.com/BravettoBackendTeam/template-heaven)

## 🔄 Development Workflow

### For Gateway Repository Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
3. **Test your changes**
4. **Commit with descriptive messages:**
   ```bash
   git commit -m "Add: descriptive commit message"
   ```

5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**

### For Submodule Updates

1. **Navigate to the submodule:**
   ```bash
   cd aiagentsuite  # or template-heaven
   ```

2. **Make changes in the submodule**
3. **Commit and push to the submodule repository**
4. **Return to the main repository:**
   ```bash
   cd ..
   ```

5. **Update the submodule reference:**
   ```bash
   git add aiagentsuite  # or template-heaven
   git commit -m "Update: submodule to latest version"
   ```

## 📚 Documentation

### Documentation Standards

- Use clear, concise language
- Include code examples where appropriate
- Follow markdown best practices
- Update related documentation when making changes

### Documentation Types

- **README.md**: Project overview and getting started
- **CONTRIBUTING.md**: This file
- **CHANGELOG.md**: Version history and changes
- **SECURITY.md**: Security policies and reporting
- **CODE_OF_CONDUCT.md**: Community guidelines

## 🧪 Testing

### Gateway Repository Testing

- Verify submodule integration works correctly
- Test installation instructions
- Validate documentation links
- Check markdown formatting

### Submodule Testing

- Follow testing guidelines in each submodule repository
- Run existing test suites
- Add tests for new features

## 📝 Pull Request Process

### Before Submitting

1. **Ensure your changes are focused and atomic**
2. **Update documentation if needed**
3. **Test your changes thoroughly**
4. **Follow the commit message conventions**

### PR Requirements

- **Clear title and description**
- **Reference related issues**
- **Include screenshots for UI changes**
- **Update documentation as needed**
- **Ensure all checks pass**

### Commit Message Format

```
Type: Brief description

Detailed explanation of changes, if needed.

Fixes #issue-number
```

**Types:**
- `Add:` New features
- `Update:` Changes to existing features
- `Fix:` Bug fixes
- `Remove:` Removed features
- `Docs:` Documentation changes
- `Refactor:` Code refactoring
- `Test:` Test additions or changes

## 🐛 Issue Reporting

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check submodule repositories** for related issues
3. **Verify the issue is with the gateway repository**

### Issue Template

When creating an issue, please include:

- **Clear, descriptive title**
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Environment details**
- **Screenshots (if applicable)**

### Issue Types

- **Bug Report**: Something isn't working
- **Feature Request**: Suggest a new feature
- **Documentation**: Documentation improvements
- **Question**: Ask a question about the project

## 🔒 Security

### Security Issues

For security-related issues, please:

1. **DO NOT** create a public issue
2. **Email** security concerns to the maintainers
3. **Include** detailed information about the vulnerability
4. **Wait** for acknowledgment before public disclosure

## 📞 Getting Help

### Community Support

- **GitHub Discussions**: For questions and general discussion
- **Issues**: For bug reports and feature requests
- **Pull Requests**: For code contributions

### Maintainer Contact

- **Primary Maintainer**: Bravetto Backend Team
- **AI Agent Suite**: [jimmyjdejesus-cmyk](https://github.com/jimmyjdejesus-cmyk)
- **Template Heaven**: [BravettoBackendTeam](https://github.com/BravettoBackendTeam)

## 🎉 Recognition

Contributors will be recognized in:

- **CONTRIBUTORS.md** (if created)
- **Release notes**
- **Project documentation**

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to AI-Guardians-Code-Guardians!** 🚀

*Your contributions help make this unified gateway better for everyone in the AI development community.*
