/**
 * AiGuardian Authentication Callback Handler
 *
 * Handles Clerk authentication callbacks and redirects back to extension
 */

class AuthCallbackHandler {
  constructor() {
    this.extensionId = chrome.runtime.id;
    this.isProcessing = false;
  }

  /**
   * Initialize callback handling
   */
  async initialize() {
    try {
      Logger.info('[AuthCallback] Initializing callback handler');
      Logger.info('[AuthCallback] Current URL:', window.location.href);
      Logger.info('[AuthCallback] URL search:', window.location.search);
      Logger.info('[AuthCallback] URL hash:', window.location.hash);

      // Check if we're in a callback flow
      // Clerk redirects back with various parameters in URL or hash
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const isCallback = urlParams.has('code') || 
                        urlParams.has('token') || 
                        urlParams.has('__clerk_redirect_url') ||
                        hashParams.has('access_token') ||
                        hashParams.has('__clerk_redirect_url') ||
                        window.location.hash.includes('access_token') ||
                        window.location.hash.includes('__clerk');

      Logger.info('[AuthCallback] Is callback:', isCallback);
      Logger.info('[AuthCallback] URL params:', Object.fromEntries(urlParams));
      Logger.info('[AuthCallback] Hash params:', Object.fromEntries(hashParams));

      if (isCallback) {
        await this.handleCallback();
      } else {
        // If no callback params, might be direct navigation - try to handle anyway
        Logger.warn('[AuthCallback] No callback parameters found, attempting to handle anyway');
        await this.handleCallback();
      }
    } catch (error) {
      Logger.error('[AuthCallback] Initialization error:', error);
      this.showError('Authentication failed: ' + error.message);
    }
  }

  /**
   * Handle Clerk authentication callback
   */
  async handleCallback() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      this.updateStatus('Processing authentication...');

      // Get publishable key from extension first
      const publishableKey = await this.getClerkPublishableKey();

      if (!publishableKey) {
        throw new Error('Clerk publishable key not configured');
      }

      // Set publishable key before loading Clerk SDK
      // Clerk SDK browser build reads this from window.__clerk_publishable_key
      window.__clerk_publishable_key = publishableKey;

      // Load Clerk SDK dynamically
      await this.loadClerkSDK();

      // Initialize Clerk
      // The bundled Clerk SDK auto-instantiates window.Clerk with publishable key
      const clerk = window.Clerk;
      if (!clerk) {
        throw new Error('Clerk SDK not loaded - window.Clerk not found');
      }
      
      // Ensure Clerk is loaded (only if load() method exists)
      if (typeof clerk.load === 'function' && !clerk.loaded) {
        await clerk.load();
      } else if (typeof clerk.load !== 'function') {
        Logger.info('[AuthCallback] Clerk SDK does not have load() method - assuming ready');
      }

      // Handle Clerk redirect callback
      // This processes the OAuth callback and sets up the session
      try {
        await clerk.handleRedirectCallback();
        Logger.info('[AuthCallback] Clerk redirect callback handled successfully');
      } catch (e) {
        Logger.warn('[AuthCallback] Clerk handleRedirectCallback error (may be normal if already handled):', e.message);
        // Continue anyway - Clerk might have already processed it
      }

      // Wait for Clerk to finish processing and user to be available
      // In development mode or OAuth flows, this can take longer
      let user = null;
      const maxRetries = 10;
      const retryDelay = 500; // 500ms between retries
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          // Ensure Clerk is loaded
          if (typeof clerk.load === 'function' && !clerk.loaded) {
            await clerk.load();
          }
          
          // Check for user
          user = clerk.user;
          
          if (user) {
            Logger.info(`[AuthCallback] User found on attempt ${attempt + 1}:`, user.id);
            break;
          }
          
          // If no user yet, wait before retrying
          if (attempt < maxRetries - 1) {
            Logger.info(`[AuthCallback] No user yet, waiting ${retryDelay}ms before retry ${attempt + 2}/${maxRetries}...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        } catch (e) {
          Logger.warn(`[AuthCallback] Error getting user on attempt ${attempt + 1}:`, e.message);
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }
      
      // If still no user after retries, try checking session directly
      if (!user) {
        Logger.warn('[AuthCallback] No user found after retries, checking session directly...');
        try {
          const session = await clerk.session;
          if (session) {
            Logger.info('[AuthCallback] Session found, attempting to get user from session...');
            // Try to reload Clerk to sync session
            if (typeof clerk.load === 'function') {
              await clerk.load();
            }
            user = clerk.user;
          }
        } catch (sessionError) {
          Logger.warn('[AuthCallback] Error checking session:', sessionError.message);
        }
      }

      if (user) {
        // Get session token before storing
        let token = null;
        try {
          const session = await clerk.session;
          if (session) {
            token = await session.getToken();
            Logger.info('[AuthCallback] Session token retrieved');
          }
        } catch (e) {
          Logger.warn('[AuthCallback] Could not get token:', e);
        }

        // Store authentication state in extension storage
        Logger.info('[AuthCallback] Storing authentication state...');
        await this.storeAuthState(user, token);
        
        // Verify storage was written successfully
        const stored = await this.verifyStorage(user.id);
        if (!stored) {
          Logger.error('[AuthCallback] Storage verification failed - retrying...');
          // Retry storage write
          await new Promise(resolve => setTimeout(resolve, 500));
          await this.storeAuthState(user, token);
          const retryStored = await this.verifyStorage(user.id);
          if (!retryStored) {
            throw new Error('Failed to store authentication state');
          }
        }
        
        Logger.info('[AuthCallback] ✅ Authentication state stored successfully');
        this.updateStatus('Authentication successful! Redirecting...');

        // Wait a moment for UI update and ensure storage is persisted
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Send message to service worker before closing
        this.redirectToExtension(user);
      } else {
        throw new Error('Authentication failed - no user session found after ' + maxRetries + ' attempts');
      }

    } catch (error) {
      Logger.error('[AuthCallback] Callback handling error:', error);
      this.showError('Authentication failed: ' + error.message);
    } finally {
      // Always reset processing flag, even on error
      this.isProcessing = false;
    }
  }

  /**
   * Load Clerk SDK from bundled file
   * Uses bundled version to avoid CSP issues with external scripts in Manifest V3
   * Note: Publishable key should be set in window.__clerk_publishable_key before calling this
   */
  async loadClerkSDK() {
    // Check if Clerk is already loaded
    if (window.Clerk) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('src/vendor/clerk.js');
      script.onload = () => {
        // Clerk should be available as window.Clerk after script loads
        if (window.Clerk) {
          resolve();
        } else {
          reject(new Error('Clerk SDK loaded but window.Clerk not found'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load Clerk SDK bundle'));
      document.head.appendChild(script);
    });
  }

  /**
   * Get Clerk publishable key from extension storage
   */
  async getClerkPublishableKey() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_CLERK_KEY' }, (response) => {
        resolve(response?.key || null);
      });
    });
  }

  /**
   * Store authentication state in extension storage
   */
  async storeAuthState(user, token = null) {
    return new Promise((resolve, reject) => {
      const dataToStore = {
        clerk_user: {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          imageUrl: user.imageUrl || user.profileImageUrl
        }
      };

      // Store token if available
      if (token) {
        dataToStore.clerk_token = token;
      }

      Logger.info('[AuthCallback] Writing to storage:', {
        userId: dataToStore.clerk_user.id,
        email: dataToStore.clerk_user.email,
        hasToken: !!token
      });

      chrome.storage.local.set(dataToStore, () => {
        if (chrome.runtime.lastError) {
          Logger.error('[AuthCallback] Storage error:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          Logger.info('[AuthCallback] Storage write completed');
          resolve();
        }
      });
    });
  }

  /**
   * Verify that user was stored in extension storage
   */
  async verifyStorage(userId) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['clerk_user'], (data) => {
        if (chrome.runtime.lastError) {
          Logger.error('[AuthCallback] Storage read error:', chrome.runtime.lastError);
          resolve(false);
        } else if (data.clerk_user && data.clerk_user.id === userId) {
          Logger.info('[AuthCallback] Storage verification successful');
          resolve(true);
        } else {
          Logger.warn('[AuthCallback] Storage verification failed - user not found or ID mismatch', {
            expected: userId,
            found: data.clerk_user?.id
          });
          resolve(false);
        }
      });
    });
  }

  /**
   * Redirect back to Chrome extension
   */
  redirectToExtension(user) {
    try {
      Logger.info('[AuthCallback] Sending AUTH_CALLBACK_SUCCESS message...');
      
      // Send message to service worker with user data
      chrome.runtime.sendMessage({ 
        type: 'AUTH_CALLBACK_SUCCESS',
        user: {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          imageUrl: user.imageUrl || user.profileImageUrl
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          Logger.warn('[AuthCallback] Message send error (may be normal if popup closed):', chrome.runtime.lastError.message);
        } else {
          Logger.info('[AuthCallback] Message sent successfully');
        }
        
        // Wait a moment before closing to ensure message is processed
        setTimeout(() => {
          Logger.info('[AuthCallback] Closing callback tab...');
          // Try to close the tab
          window.close();
          
          // If window.close() doesn't work (some browsers block it), show success message
          setTimeout(() => {
            this.updateStatus('✅ Authentication successful! You can close this tab.');
            Logger.info('[AuthCallback] Tab close blocked - showing success message');
          }, 500);
        }, 500);
      });
    } catch (error) {
      Logger.error('[AuthCallback] Failed to redirect to extension:', error);
      // Show success message even if message send fails
      this.updateStatus('✅ Authentication successful! You can close this tab.');
      // Fallback: try to navigate to extension URL after delay
      setTimeout(() => {
        try {
          window.location.href = chrome.runtime.getURL('/src/popup.html');
        } catch (navError) {
          Logger.error('[AuthCallback] Navigation fallback failed:', navError);
        }
      }, 2000);
    }
  }

  /**
   * Update status message
   */
  updateStatus(message) {
    const statusEl = document.getElementById('status');
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorEl = document.getElementById('error');
    const statusEl = document.getElementById('status');

    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }

    if (statusEl) {
      statusEl.textContent = 'Authentication failed';
    }

    // Hide spinner
    const spinner = document.querySelector('.spinner');
    if (spinner) {
      spinner.style.display = 'none';
    }
  }
}

// Initialize callback handler when page loads
document.addEventListener('DOMContentLoaded', () => {
  const handler = new AuthCallbackHandler();
  handler.initialize();
});
