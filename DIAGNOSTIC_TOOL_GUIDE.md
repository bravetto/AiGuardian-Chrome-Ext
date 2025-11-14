# 🔍 Diagnostic Tool Guide

## What I Just Added

I've added a **Connection Status** diagnostic panel to your extension popup that automatically shows when there are issues. This will help you quickly understand what's wrong with your sign-in and backend connection.

## How to Use It

### Automatic Detection
The diagnostic panel **automatically appears** when:
- Backend connection fails
- Clerk key is not configured
- Authentication is not working

### Manual Access
1. Open the extension popup
2. Click the **"🔍 Status"** button next to Sign In/Sign Up
3. The diagnostic panel will show:
   - **Backend**: Connection status to your API
   - **Clerk Key**: Whether authentication key is configured
   - **Auth State**: Whether you're signed in

### What Each Status Means

#### ✅ Green (OK)
- **Backend: ✅ Connected** - Your backend API is reachable
- **Clerk Key: ✅ Configured** - Authentication key is set up
- **Auth State: ✅ Signed in** - You're authenticated

#### ❌ Red (Error)
- **Backend: ❌ Disconnected** - Backend API is not reachable
  - **Fix**: Check your backend URL in Settings → Test Connection
- **Clerk Key: ❌ Not configured** - Authentication key missing
  - **Fix**: Go to Settings → Enter Clerk Publishable Key OR ensure backend provides it
- **Auth State: ❌ Error** - Authentication check failed
  - **Fix**: Try signing in again

#### ⚠️ Yellow (Warning)
- **Auth State: ⚠️ Not signed in** - You need to sign in
  - **Fix**: Click "Sign In" or "Sign Up" button

## Quick Troubleshooting Steps

### If Backend Shows ❌ Disconnected:
1. Click **"⚙️ Open Settings"** in diagnostic panel
2. Scroll to **"🔌 Backend Connection"**
3. Enter your backend URL (default: `https://api.aiguardian.ai`)
4. Click **"🔍 Test Connection"**
5. If it fails, check:
   - Is your backend running?
   - Is the URL correct?
   - Can you access it in a browser?

### If Clerk Key Shows ❌ Not configured:
1. Click **"⚙️ Open Settings"** in diagnostic panel
2. The extension tries to fetch it from backend automatically
3. If that fails:
   - Get your Clerk Publishable Key from https://dashboard.clerk.com
   - Enter it in Settings → Clerk Publishable Key
   - Save

### If Auth State Shows ⚠️ Not signed in:
1. Make sure Backend and Clerk Key are ✅ OK first
2. Click **"Sign In"** or **"Sign Up"** button
3. Complete authentication in the new tab
4. You'll be redirected back automatically

## Diagnostic Panel Actions

- **🔄 Refresh** - Re-check all statuses
- **⚙️ Open Settings** - Go directly to extension settings

## What Happens When Everything Works

When all three statuses show ✅:
- The diagnostic panel can be closed (click ✕)
- You can use all extension features
- Sign-in will work properly

## Still Having Issues?

1. **Check Browser Console** (F12 → Console tab)
   - Look for `[Auth]` and `[Gateway]` log messages
   - These show detailed error information

2. **Check Extension Options Page**
   - Right-click extension icon → Options
   - Use the "Check Auth State" button for detailed debugging

3. **Verify Backend is Running**
   - Test the health endpoint: `https://api.aiguardian.ai/health/live`
   - Should return: `{"status": "healthy"}`

## Summary

The diagnostic tool now gives you **instant visibility** into:
- ✅/❌ Backend connection status
- ✅/❌ Clerk key configuration
- ✅/⚠️/❌ Authentication state

No more guessing - you'll know exactly what's wrong and how to fix it!

