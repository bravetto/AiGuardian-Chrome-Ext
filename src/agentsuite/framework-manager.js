/**
 * Framework Manager - Handles AI Agent Suite framework components
 * 
 * Provides access to rules (Constitution, Principles), workflows (Protocols),
 * prompts, tools, and memory-bank context for the Chrome Extension.
 * 
 * Based on the .aiagentsuite framework methodology.
 */

class FrameworkManager {
  constructor() {
    this.basePath = chrome.runtime.getURL('src/agentsuite/');
    this._constitution = null;
    this._principles = {};
    this._protocols = {};
    this._initialized = false;
  }

  /**
   * Initialize framework components by loading all documents
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this._initialized) {
      return;
    }

    try {
      await Promise.all([
        this._loadConstitution(),
        this._loadPrinciples(),
        this._loadProtocols()
      ]);
      this._initialized = true;
    } catch (error) {
      console.error('[FrameworkManager] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load the master AI agent constitution
   * @private
   * @returns {Promise<void>}
   */
  async _loadConstitution() {
    try {
      const response = await fetch(`${this.basePath}rules/MASTER_AI_AGENT_CONSTITUTION.md`);
      if (response.ok) {
        this._constitution = await response.text();
      } else {
        console.warn('[FrameworkManager] Constitution not found');
      }
    } catch (error) {
      console.error('[FrameworkManager] Error loading constitution:', error);
    }
  }

  /**
   * Load all VDE principles
   * @private
   * @returns {Promise<void>}
   */
  async _loadPrinciples() {
    const principleFiles = [
      { name: 'VDE Core Philosophy', file: 'Principle_1_VDE_Core_Philosophy.md' },
      { name: 'Branching Strategy', file: 'Principle_2_Branching_and_Commit_Strategy.md' },
      { name: 'YAGNI', file: 'Principle_3_YAGNI.md' }
    ];

    for (const principle of principleFiles) {
      try {
        const response = await fetch(`${this.basePath}rules/${principle.file}`);
        if (response.ok) {
          this._principles[principle.name] = await response.text();
        }
      } catch (error) {
        console.error(`[FrameworkManager] Error loading principle ${principle.name}:`, error);
      }
    }
  }

  /**
   * Load all available protocols
   * @private
   * @returns {Promise<void>}
   */
  async _loadProtocols() {
    const protocolFiles = [
      { name: 'Secure Code Implementation', file: 'Protocol_Secure_Code_Implementation.md' },
      { name: 'Chrome Extension Feature Development', file: 'Protocol_Chrome_Extension_Feature_Development.md' },
      { name: 'Chrome Extension Security Audit', file: 'Protocol_Chrome_Extension_Security_Audit.md' },
      { name: 'Chrome Extension Testing Strategy', file: 'Protocol_Chrome_Extension_Testing_Strategy.md' }
    ];

    for (const protocol of protocolFiles) {
      try {
        const response = await fetch(`${this.basePath}workflows/${protocol.file}`);
        if (response.ok) {
          this._protocols[protocol.name] = await response.text();
        }
      } catch (error) {
        console.error(`[FrameworkManager] Error loading protocol ${protocol.name}:`, error);
      }
    }
  }

  /**
   * Get the master AI agent constitution
   * @returns {Promise<string>}
   */
  async getConstitution() {
    if (!this._initialized) {
      await this.initialize();
    }
    return this._constitution || 'Constitution not available';
  }

  /**
   * Get a specific VDE principle
   * @param {string} principleName - Name of the principle
   * @returns {Promise<string>}
   */
  async getPrinciple(principleName) {
    if (!this._initialized) {
      await this.initialize();
    }
    return this._principles[principleName] || `Principle '${principleName}' not found`;
  }

  /**
   * Get all VDE principles
   * @returns {Promise<Object<string, string>>}
   */
  async getAllPrinciples() {
    if (!this._initialized) {
      await this.initialize();
    }
    return { ...this._principles };
  }

  /**
   * Get a specific protocol
   * @param {string} protocolName - Name of the protocol
   * @returns {Promise<string>}
   */
  async getProtocol(protocolName) {
    if (!this._initialized) {
      await this.initialize();
    }
    return this._protocols[protocolName] || `Protocol '${protocolName}' not found`;
  }

  /**
   * List all available protocols
   * @returns {Promise<string[]>}
   */
  async listProtocols() {
    if (!this._initialized) {
      await this.initialize();
    }
    return Object.keys(this._protocols);
  }

  /**
   * Get memory bank context
   * @param {string} contextType - Type of context (activeContext, decisionLog, productContext, etc.)
   * @returns {Promise<string>}
   */
  async getMemoryContext(contextType) {
    try {
      const response = await fetch(`${this.basePath}memory-bank/${contextType}.md`);
      if (response.ok) {
        return await response.text();
      }
      return `${contextType} not available`;
    } catch (error) {
      console.error(`[FrameworkManager] Error loading memory context ${contextType}:`, error);
      return `${contextType} not available`;
    }
  }

  /**
   * Check if framework is initialized
   * @returns {boolean}
   */
  isInitialized() {
    return this._initialized;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FrameworkManager;
}

// Make available globally for Chrome Extension context
if (typeof window !== 'undefined') {
  window.FrameworkManager = FrameworkManager;
}

