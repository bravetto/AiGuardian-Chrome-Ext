# Auth Debug Guide - Step by Step

## Current Status

You're on the sign-in page but **not signed in yet**. You need to actually sign in first.

## Step-by-Step Debug Process

### Step 1: Sign In

1. **Go to**: `https://factual-hare-3.accounts.dev/sign-in`
2. **Sign in** with your email/password OR click "Continue with Google"
3. **After signing in**, you should see one of these pages:
   - "You are signed in, but Clerk cannot redirect" (development mode)
   - Redirected to `/default-redirect`
   - Or redirected back to extension

### Step 2: Check Content Script Detection

**While on the Clerk page after signing in:**

1. Open DevTools (F12)
2. Go to Console tab
3. Look for these logs:
   - `[CS] Content script loaded`
   - `[CS] Window.load fired - all scripts should be loaded now`
   - `[CS] Clerk SDK detected via polling!`
   - `[CS] ✅ USER DETECTED: [user-id]`
   - `[CS] ✅ Successfully sent auth to extension!`

### Step 3: Check Service Worker Storage

**In DevTools Console on Clerk page, run:**

```javascript
// Check if auth was stored
chrome.storage.local.get(['clerk_user', 'clerk_token'], (data) => {
  console.log('Stored auth:', data);
  if (data.clerk_user) {
    console.log('✅ User found:', data.clerk_user.email || data.clerk_user.id);
  } else {
    console.log('❌ No user stored');
  }
});
```

### Step 4: Check Extension Popup

1. **Open extension popup**
2. **Click "🔄 Refresh Auth"** button
3. **Check if auth state updates**

### Step 5: Manual Storage Check

**In extension popup DevTools console, run:**

```javascript
chrome.storage.local.get(['clerk_user'], (data) => {
  console.log('Popup storage check:', data.clerk_user ? '✅ User found' : '❌ No user');
  if (data.clerk_user) {
    console.log('User:', data.clerk_user);
  }
});
```

## Common Issues

### Issue 1: Content Script Not Running
**Symptom**: No `[CS]` logs in console
**Fix**: Reload extension, check manifest.json

### Issue 2: Clerk SDK Not Detected
**Symptom**: `[CS] Clerk SDK not found` repeated
**Fix**: Wait longer (up to 35 seconds), or check if Clerk SDK actually loaded

### Issue 3: User Not Detected
**Symptom**: Clerk SDK found but `clerk.user` is null
**Fix**: You might not actually be signed in - check Clerk page

### Issue 4: Storage Not Updated
**Symptom**: Content script sends message but storage is empty
**Fix**: Check service worker logs, verify message received

## Test Account

**Yes, you can use a test account!** 

1. Go to `https://factual-hare-3.accounts.dev/sign-up`
2. Create a test account with any email
3. Sign in with that account
4. The extension should detect it

## Quick Test Commands

### On Clerk Page (after signing in):
```javascript
// Check Clerk SDK
console.log('Clerk SDK:', typeof window.Clerk !== 'undefined');
console.log('Clerk loaded:', window.Clerk?.loaded);
console.log('Clerk user:', window.Clerk?.user);

// Manually trigger detection
chrome.runtime.sendMessage({ type: 'FORCE_CHECK_AUTH' });
```

### In Extension Popup:
```javascript
// Check storage
chrome.storage.local.get(['clerk_user'], console.log);

// Check auth object
console.log('Auth:', auth);
console.log('Is authenticated:', auth?.isAuthenticated());
```

## Expected Flow

1. ✅ Sign in on Clerk page
2. ✅ Content script detects Clerk SDK (after it loads)
3. ✅ Content script extracts user from `clerk.user`
4. ✅ Content script sends `CLERK_AUTH_DETECTED` message
5. ✅ Service worker receives message and stores in `chrome.storage.local`
6. ✅ Popup detects storage change OR checks on open
7. ✅ Popup UI updates to show signed-in state

## If Still Not Working

1. **Check browser console** for errors
2. **Check extension service worker** logs (`chrome://extensions/` → "service worker" link)
3. **Verify Clerk key** is configured correctly
4. **Try manual sync**: Click "🔄 Sync Auth" button in popup
5. **Check storage directly**: Use console commands above

