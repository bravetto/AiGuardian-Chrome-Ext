# Clerk SDK Detection Root Cause Analysis

## Root Cause Identified

**The content script runs before the Clerk SDK script finishes loading.**

## Technical Details

### 1. Script Loading Sequence

**Clerk SDK Script:**
- URL: `https://factual-hare-3.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js`
- Attributes: `async: true` (loads asynchronously, non-blocking)
- Loads in parallel with page rendering

**Content Script:**
- Runs when: `document.readyState === 'interactive'` (DOM ready, but scripts may still be loading)
- Runs immediately when page reaches interactive state
- Does NOT wait for async scripts to finish

### 2. Timing Issue

```
Timeline:
0ms    - Page starts loading
100ms  - DOM becomes 'interactive'
100ms  - Content script runs ✅
100ms  - Checks for window.Clerk ❌ (not loaded yet)
200ms  - Clerk SDK script starts loading (async)
2000ms - Clerk SDK script finishes loading
2000ms - window.Clerk becomes available ✅
2000ms - Content script already gave up (10 attempts × 1s = 10s max, but checks stop)
```

### 3. Evidence from Browser Testing

**After 5 seconds:**
- `windowClerkExists: true` ✅
- `clerkLoaded: true` ✅  
- `clerkHasLoad: true` ✅
- `clerkUser: null` (user not signed in on this page, but SDK is available)

**Content script timing:**
- Runs at `document.readyState: 'interactive'`
- Clerk SDK script has `async: true`
- Script loads AFTER content script runs

### 4. Why Current Solution Fails

**Current approach:**
- Checks every 1 second for 10 attempts (10 seconds total)
- But checks START immediately when content script runs
- Clerk SDK may take 2-5 seconds to load
- If Clerk loads at 3 seconds, we've already checked 3 times and given up

**Problem:**
- Content script runs at `interactive` state
- Clerk SDK loads asynchronously AFTER `interactive` state
- Race condition: Content script checks before Clerk SDK is ready

## Root Cause Summary

**Content scripts run at `document.readyState: 'interactive'`, but Clerk SDK loads asynchronously via `<script async>` tag, which loads AFTER the interactive state. The content script checks too early.**

## Solutions

### Solution 1: Wait for Script Load Event (Best)
Listen for when the Clerk SDK script actually finishes loading:

```javascript
// Wait for Clerk SDK script to load
const clerkScript = document.querySelector('script[src*="clerk.browser.js"]');
if (clerkScript) {
  clerkScript.addEventListener('load', () => {
    // Now Clerk SDK should be available
    checkClerkAuth();
  });
  // Also check if already loaded
  if (clerkScript.readyState === 'complete' || clerkScript.readyState === 'loaded') {
    checkClerkAuth();
  }
}
```

### Solution 2: MutationObserver (Reliable)
Watch for `window.Clerk` to appear:

```javascript
const observer = new MutationObserver(() => {
  if (typeof window.Clerk !== 'undefined') {
    observer.disconnect();
    checkClerkAuth();
  }
});
observer.observe(document, { childList: true, subtree: true });
```

### Solution 3: Poll with Exponential Backoff (Simple)
Increase wait time and use exponential backoff:

```javascript
let attempts = 0;
const maxAttempts = 30;
let delay = 500; // Start with 500ms

function check() {
  attempts++;
  if (typeof window.Clerk !== 'undefined') {
    // Found it!
    checkClerkAuth();
  } else if (attempts < maxAttempts) {
    setTimeout(check, delay);
    delay = Math.min(delay * 1.5, 3000); // Exponential backoff, max 3s
  }
}
check();
```

### Solution 4: Wait for 'complete' State (Simple but slower)
Wait for `document.readyState === 'complete'`:

```javascript
if (document.readyState === 'complete') {
  checkClerkAuth();
} else {
  window.addEventListener('load', () => {
    // All scripts loaded
    checkClerkAuth();
  });
}
```

## Recommended Solution

**Hybrid Approach:**
1. Wait for `window.load` event (all scripts loaded)
2. Use MutationObserver as backup
3. Keep current polling as final fallback
4. After max attempts, wait 5 more seconds and check once more

This ensures we catch Clerk SDK whether it loads:
- Before content script runs (MutationObserver)
- During content script execution (polling)
- After initial checks (post-load re-check)

## Implementation Priority

1. **HIGH**: Add `window.load` event listener
2. **MEDIUM**: Add MutationObserver for `window.Clerk`
3. **LOW**: Increase polling attempts/time
4. **LOW**: Add post-load re-check

## Files to Modify

- `src/content.js`: Add script load detection and window.load listener

