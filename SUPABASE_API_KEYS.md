# 🔑 Supabase API Keys - Which One to Use

## 🎯 For Your React Webpage: Use **"anon" Public Key**

### Where to Find It:

1. **Go to Supabase Dashboard**
   - Settings → **API** (left sidebar)

2. **You'll See:**

   ```
   Project URL
   https://xxxxx.supabase.co
   
   API keys
   ┌─────────────────────────────────────────┐
   │ anon public                             │
   │ eyJhbGc... (very long string)          │ ← USE THIS ONE! ✅
   │ [Reveal] [Copy]                         │
   └─────────────────────────────────────────┘
   
   ┌─────────────────────────────────────────┐
   │ service_role secret                     │
   │ eyJhbGc... (different long string)      │ ← DON'T USE (server-side only)
   │ [Reveal] [Copy]                         │
   └─────────────────────────────────────────┘
   ```

3. **Copy the "anon public" key** ✅

---

## 🔑 Which Key to Use?

### ✅ **anon public** Key (Use This!)

**For:**
- ✅ React frontend (your webpage)
- ✅ Client-side code
- ✅ Safe to expose in browser
- ✅ Works with RLS (Row Level Security)

**Where to use:**
- Cloudflare Pages environment variables
- Your React app (`src/lib/supabase.js`)

**Example:**
```javascript
const supabaseUrl = 'https://xxxxx.supabase.co'
const supabaseAnonKey = 'eyJhbGc...' // anon public key
```

---

### ❌ **service_role** Key (Don't Use in Frontend!)

**For:**
- ❌ Server-side only
- ❌ Backend API
- ❌ Admin operations
- ⚠️ **NEVER expose in frontend!**

**Why not:**
- Bypasses RLS (security risk)
- Full database access
- Should only be used server-side

---

## 📋 What You Need to Copy

### From Supabase Settings → API:

1. **Project URL**
   ```
   https://xxxxx.supabase.co
   ```
   - Copy this entire URL

2. **anon public key**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2MjM5MDIyfQ.xxxxx...
   ```
   - Click **"Reveal"** or **"Copy"**
   - Copy the entire key (it's very long)
   - Starts with `eyJ`

---

## 🎯 Quick Answer

**Use: "anon public" key** ✅

This is the one you'll add to:
- Cloudflare Pages environment variables
- Your React app configuration

---

## 📝 Where to Use These Keys

### In Cloudflare Pages:

1. Go to Pages project → **Settings** → **Environment Variables**
2. Add:
   - **Variable**: `VITE_SUPABASE_URL`
   - **Value**: `https://xxxxx.supabase.co`
3. Add:
   - **Variable**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: `eyJhbGc...` (anon public key)

### In Your Code:

Already configured in `src/lib/supabase.js`:
```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

---

## 🔒 Security Notes

### ✅ Safe to Use (anon key):
- In frontend code
- In environment variables
- In browser
- Works with RLS automatically

### ❌ Never Use (service_role key):
- In frontend code
- In browser
- In client-side environment variables
- Only use in backend/server

---

## 📋 Checklist

- [ ] Go to Supabase → Settings → API
- [ ] Copy **Project URL**
- [ ] Copy **anon public** key (not service_role)
- [ ] Save both for Cloudflare Pages setup

---

## 🆘 If You See "Data API"

If you see a "Data API" section:

- **Project URL**: Same as above ✅
- **API Key**: Use the **"anon"** key (public key) ✅
- **REST API URL**: Usually same as Project URL ✅

**Just use the "anon public" key from API keys section!**

---

**Bottom Line: Copy the "anon public" key - that's what you need!** ✅

