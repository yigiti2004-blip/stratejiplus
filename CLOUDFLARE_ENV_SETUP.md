# ⚙️ Cloudflare Pages - Environment Variables Setup

## 🎯 Goal: Add Supabase API Keys to Cloudflare Pages

Your app needs these environment variables to connect to Supabase:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon public key

---

## 📋 Step-by-Step Guide

### Step 1: Get Your Supabase API Keys

1. **Go to Supabase Dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Login to your account
   - Click on your project: `stratejiplus`

2. **Go to Settings → API**
   - Click **"Settings"** in the left sidebar
   - Click **"API"**

3. **Copy Your Keys**
   - **Project URL**: 
     ```
     https://xxxxx.supabase.co
     ```
     - Copy this entire URL
   
   - **anon public key**:
     ```
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2MjM5MDIyfQ.xxxxx...
     ```
     - Click **"Reveal"** or **"Copy"** button
     - Copy the entire key (it's very long, starts with `eyJ`)
     - ⚠️ **Use "anon public" key, NOT "service_role" key!**

4. **Save Both Values**
   - Keep them handy (you'll paste them in Step 2)

---

### Step 2: Add Environment Variables in Cloudflare Pages

1. **Go to Cloudflare Pages**
   - Visit [dash.cloudflare.com](https://dash.cloudflare.com)
   - Click **"Workers & Pages"** (left sidebar)
   - Click **"Pages"**
   - Click on your project: `stratejiplus`

2. **Go to Settings**
   - Click **"Settings"** tab (top navigation)
   - Scroll down to **"Environment Variables"** section

3. **Add First Variable: VITE_SUPABASE_URL**
   - Click **"Add variable"** button
   - **Variable name**: `VITE_SUPABASE_URL`
   - **Value**: Paste your Supabase Project URL
     ```
     https://xxxxx.supabase.co
     ```
   - **Environment**: Select **"Production"** (or "All environments" if you want it for all)
   - Click **"Save"**

4. **Add Second Variable: VITE_SUPABASE_ANON_KEY**
   - Click **"Add variable"** button again
   - **Variable name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Paste your Supabase anon public key
     ```
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2MjM5MDIyfQ.xxxxx...
     ```
   - **Environment**: Select **"Production"** (or "All environments")
   - Click **"Save"**

5. **Verify Variables Are Added**
   - You should see both variables in the list:
     - ✅ `VITE_SUPABASE_URL`
     - ✅ `VITE_SUPABASE_ANON_KEY`

---

### Step 3: Redeploy Your Site

**Important:** After adding environment variables, you need to redeploy!

1. **Go to Deployments Tab**
   - Click **"Deployments"** tab (top navigation)
   - Find the latest deployment
   - Click the **"..."** (three dots) menu
   - Click **"Retry deployment"** or **"Redeploy"**

2. **Or Trigger New Deployment**
   - Make a small change to your code
   - Push to GitHub
   - Cloudflare will automatically redeploy with new environment variables

3. **Wait for Deployment**
   - Usually takes 1-3 minutes
   - Status will show: **"Building"** → **"Success"** ✅

---

### Step 4: Test Your Site

1. **Visit Your Site**
   - Go to: `https://stratejiplus.pages.dev` (or your custom domain)
   - Or: `https://yourdomain.com` (if custom domain is set up)

2. **Test Supabase Connection**
   - Try to login
   - Check if data loads from Supabase
   - Open browser console (F12) and check for errors

3. **Verify Environment Variables**
   - In browser console, check if Supabase is connected
   - Should NOT see: "Supabase environment variables not set"

---

## ✅ Checklist

- [ ] Got Supabase Project URL from Settings → API
- [ ] Got Supabase anon public key (NOT service_role)
- [ ] Added `VITE_SUPABASE_URL` in Cloudflare Pages
- [ ] Added `VITE_SUPABASE_ANON_KEY` in Cloudflare Pages
- [ ] Set environment to "Production" (or "All environments")
- [ ] Redeployed site
- [ ] Tested site - Supabase connection works ✅

---

## 🔑 Which Key to Use?

### ✅ Use: **anon public** Key
- Safe for frontend
- Works with RLS (Row Level Security)
- Can be exposed in browser
- This is what you need!

### ❌ Don't Use: **service_role** Key
- Server-side only
- Bypasses RLS (security risk)
- Never expose in frontend!

---

## 🆘 Troubleshooting

### Environment Variables Not Working

**Problem:** Site still shows "Supabase environment variables not set"

**Solutions:**
1. **Redeploy** - Environment variables only apply to new deployments
2. **Check variable names** - Must be exactly:
   - `VITE_SUPABASE_URL` (not `SUPABASE_URL`)
   - `VITE_SUPABASE_ANON_KEY` (not `SUPABASE_ANON_KEY`)
3. **Check environment** - Make sure variables are set for "Production"
4. **Check values** - Make sure you copied the full URL and key (no extra spaces)

---

### Can't Find Environment Variables Section

**Problem:** Can't find "Environment Variables" in Settings

**Solution:**
- Make sure you're in **Pages** project (not Workers)
- Go to: **Settings** tab → Scroll down to **"Environment Variables"**
- If still not visible, try refreshing the page

---

### Wrong Key Used

**Problem:** Using service_role key instead of anon key

**Solution:**
- Go back to Supabase → Settings → API
- Use the **"anon public"** key (not service_role)
- Update the environment variable in Cloudflare

---

### Site Not Connecting to Supabase

**Problem:** Site loads but can't connect to Supabase

**Solutions:**
1. **Check browser console** for errors
2. **Verify environment variables** are set correctly
3. **Check Supabase project** is active
4. **Verify RLS policies** are set up in Supabase
5. **Check network tab** - should see requests to Supabase

---

## 📝 Quick Reference

### Environment Variables Needed:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (anon public key)
```

### Where to Find in Supabase:
- **Settings** → **API** → **Project URL** and **anon public** key

### Where to Add in Cloudflare:
- **Pages** → **Your Project** → **Settings** → **Environment Variables**

---

## 🎯 Summary

1. **Get keys** from Supabase (Settings → API)
2. **Add variables** in Cloudflare Pages (Settings → Environment Variables)
3. **Redeploy** your site
4. **Test** - Should work! ✅

---

**After setup, your app will connect to Supabase!** 🚀

