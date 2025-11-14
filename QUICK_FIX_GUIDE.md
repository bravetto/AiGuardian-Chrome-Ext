# 🚀 Quick Fix Guide - "Authentication Not Set Up"

## The Problem in Simple Terms

The extension needs **ONE** thing to work: **Clerk Publishable Key**

It tries to get this key in 2 ways:
1. **Automatically** from your backend (if backend is configured)
2. **Manually** from you (if you enter it in settings)

Right now, **neither is working**, so you see the error.

## 3-Minute Fix

### Step 1: Open Extension Settings
- Click the **"Open Settings"** button in the popup

### Step 2: Check Backend Connection
- Look for **"Backend Connection"** section
- Click **"Test Connection"**
- **If it says ✅ Connected:** Your backend is working! Skip to Step 4.
- **If it says ❌ Failed:** Go to Step 3.

### Step 3: Set Gateway URL (if backend failed)
- In the **"Backend Connection"** section
- Enter: `https://api.aiguardian.ai`
- Click **"Test Connection"** again
- Should now say ✅ Connected

### Step 4: Check Clerk Key Status
- Look for **"Clerk Publishable Key"** section
- Check the status indicator:
  - **"Auto"** (green) = ✅ Working! Backend provided the key automatically
  - **"Manual"** (red) = Need to enter key manually

### Step 5A: If Status is "Auto" ✅
- **You're done!** Just click **"Sign In"** or **"Sign Up"** in the popup

### Step 5B: If Status is "Manual" ❌
You need to get your Clerk key:

1. **Get Clerk Key:**
   - Go to https://dashboard.clerk.com
   - Select your application
   - Go to **"API Keys"** → **"Publishable Key"**
   - Copy it (starts with `pk_test_` or `pk_live_`)

2. **Enter in Settings:**
   - Paste the key into **"Clerk Publishable Key"** field
   - Status should change to "Manual" (this is OK if backend isn't providing it)

3. **Sign In:**
   - Go back to popup
   - Click **"Sign In"** or **"Sign Up"**

## Why This Happens

```
Extension Opens
    ↓
Needs Clerk Key to initialize
    ↓
Tries: Backend API → ❌ (no gateway URL or backend not configured)
    ↓
Tries: Manual Config → ❌ (you haven't entered it yet)
    ↓
Shows: "Authentication Not Set Up" ⚠️
```

## After Fixing

Once the Clerk key is configured:
- Extension initializes Clerk SDK ✅
- You can sign in/sign up ✅
- Analysis features work ✅

## Still Not Working?

Check browser console (F12):
1. Open popup
2. Press F12
3. Look for errors starting with `[Auth]`
4. Common issues:
   - `No gateway URL configured` → Set gateway URL in settings
   - `Failed to fetch public config` → Backend might be down or wrong URL
   - `Clerk SDK not loaded` → Extension might need reload

## TL;DR

1. Open Settings
2. Test Backend Connection (should be ✅)
3. Check Clerk Key Status
4. If "Manual", enter your Clerk key
5. Sign In/Sign Up
6. Done! 🎉

