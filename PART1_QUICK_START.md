# ⚡ Part 1: Quick Start Guide

## ✅ Step 1: Push Code to GitHub (DONE!)

Git is initialized and ready. Now:

### Create GitHub Repository:

1. **Go to GitHub**
   - [github.com](https://github.com)
   - Login or sign up (free)

2. **Create New Repository**
   - Click **"+"** → **"New repository"**
   - Name: `stratejiplus`
   - **DO NOT** check "Initialize with README"
   - Click **"Create repository"**

3. **Copy Repository URL**
   - GitHub shows: `https://github.com/YOUR_USERNAME/stratejiplus.git`
   - Copy this URL

4. **Push Your Code**
   ```bash
   cd /Users/yigitilseven/Desktop/sp
   
   # Add remote (replace YOUR_USERNAME)
   git remote add origin https://github.com/YOUR_USERNAME/stratejiplus.git
   
   # Push code
   git branch -M main
   git push -u origin main
   ```

**✅ Done when:** You see your code on GitHub!

---

## ✅ Step 2: Create Supabase Project

### 2.1 Go to Supabase

1. Visit [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub (easiest) or email

### 2.2 Create Project

1. Click **"New Project"**
2. Fill in:
   - **Name**: `stratejiplus`
   - **Database Password**: 
     - Create strong password
     - **SAVE IT!** (you'll need it)
   - **Region**: Choose closest
3. Click **"Create new project"**
4. Wait 2-3 minutes

### 2.3 Get Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)

**✅ Save these!** You'll need them for Cloudflare Pages.

---

## ✅ Step 3: Import Database Schema

### 3.1 Open SQL Editor

1. In Supabase → **SQL Editor**
2. Click **"New query"**

### 3.2 Import Schema

1. **On your computer**, open:
   ```
   /Users/yigitilseven/Desktop/sp/supabase/exports/supabase_import.sql
   ```

2. **Copy ALL contents** (Cmd+A, then Cmd+C)

3. **In Supabase SQL Editor**:
   - Paste (Cmd+V)
   - Click **"Run"** (or Cmd+Enter)

4. **Wait for success** ✅

### 3.3 Verify

1. Go to **Table Editor** in Supabase
2. You should see tables:
   - `companies`
   - `units`
   - `users`
   - `strategic_areas`
   - etc.

**✅ Done when:** Tables are visible!

---

## 🎯 Quick Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Supabase project created
- [ ] Supabase credentials saved
- [ ] Database schema imported
- [ ] Tables verified in Supabase

---

## 📝 Save These Credentials

After Step 2, save these:

```
Supabase Project URL: https://xxxxx.supabase.co
Supabase Anon Key: eyJhbGc...
```

You'll need them in Part 2 (Cloudflare Pages deployment)!

---

## 🆘 Need Help?

- **Git issues?** See `PART1_SETUP.md` troubleshooting
- **Supabase issues?** Check Supabase docs
- **Schema import errors?** Check SQL file is complete

---

**Complete these 3 steps and you're ready for Part 2!** 🚀

