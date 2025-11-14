# 🔐 Authentication Flow - Simple Explanation

## Why You're Seeing "Authentication Not Set Up"

The extension needs a **Clerk Publishable Key** to work. This key tells Clerk which account/app to use for authentication.

## The Flow (Step by Step)

### Current Situation:
```
Extension Popup Opens
    ↓
Tries to initialize Clerk authentication
    ↓
Looks for Clerk Publishable Key
    ↓
❌ Key not found → Shows "Authentication Not Set Up"
```

### What Needs to Happen:

**Option 1: Auto-Configure (Recommended)**
```
Extension → Backend API → AWS Secrets Manager → Gets Clerk Key → Works! ✅
```

**Option 2: Manual Configure**
```
Extension → Settings Page → You enter Clerk Key manually → Works! ✅
```

## How to Fix It Right Now

### Step 1: Check if Backend is Configured

1. Open Extension Settings (click "Open Settings" button)
2. Look at "Backend Connection" section
3. Click "Test Connection"
4. If it says ✅ Connected, the backend is working!

### Step 2: Get Clerk Publishable Key

The extension will try to fetch it automatically from your backend. If that works, you're done!

If not, you need to:

1. **Get your Clerk Publishable Key:**
   - Go to https://dashboard.clerk.com
   - Select your application
   - Go to "API Keys"
   - Copy the "Publishable Key" (starts with `pk_test_` or `pk_live_`)

2. **Enter it in Extension Settings:**
   - Open Extension Settings
   - Find "Clerk Publishable Key" field
   - Paste your key
   - Save

### Step 3: Sign In

Once the key is configured:
1. Click "Sign In" or "Sign Up" in the popup
2. Clerk will open a new tab for authentication
3. After signing in, you'll be redirected back
4. Extension will work! ✅

## What Each Piece Does

| Component | What It Does |
|-----------|-------------|
| **Clerk Publishable Key** | Tells Clerk which app/account to use |
| **Backend API** | Fetches the key from AWS Secrets Manager |
| **Extension Settings** | Where you manually configure the key |
| **Clerk Authentication** | Handles sign-in/sign-up securely |

## Quick Checklist

- [ ] Backend connection works? (Test in Settings)
- [ ] Clerk key configured? (Auto from backend OR manual)
- [ ] Signed in? (Click Sign In/Sign Up)

## Still Confused?

The simplest path:
1. **Open Settings** (click the button in the popup)
2. **Test Backend Connection** (should say ✅ Connected)
3. **Check Clerk Key Status** (should say "Auto" if backend provided it)
4. **If not Auto**, manually enter your Clerk publishable key
5. **Sign In** using the popup

That's it! 🎉

