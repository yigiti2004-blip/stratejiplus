# 📦 Part 1: Prepare Code - Detailed Steps

## Step 1: Push Code to GitHub

### 1.1 Check if Git is Initialized

```bash
cd /Users/yigitilseven/Desktop/sp
git status
```

If you see "not a git repository", continue to 1.2. If you see file list, skip to 1.3.

### 1.2 Initialize Git (If Needed)

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - StratejiPlus app"
```

### 1.3 Create GitHub Repository

1. **Go to GitHub**
   - Visit [github.com](https://github.com)
   - Login or create account (free)

2. **Create New Repository**
   - Click **"+"** (top right) → **"New repository"**
   - **Repository name**: `stratejiplus`
   - **Description**: "StratejiPlus - Kurumsal Performans Yönetim Sistemi"
   - **Visibility**: Public or Private (your choice)
   - **DO NOT** check "Initialize with README"
   - Click **"Create repository"**

3. **Copy Repository URL**
   - GitHub will show you commands
   - Copy the repository URL (e.g., `https://github.com/YOUR_USERNAME/stratejiplus.git`)

### 1.4 Push Code to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/stratejiplus.git

# Rename branch to main (if needed)
git branch -M main

# Push code
git push -u origin main
```

**If asked for credentials:**
- Use GitHub Personal Access Token (not password)
- Or use GitHub CLI: `gh auth login`

**✅ Done when:** You see your code on GitHub.com

---

## Step 2: Create Supabase Project

### 2.1 Sign Up / Login to Supabase

1. **Go to Supabase**
   - Visit [supabase.com](https://supabase.com)
   - Click **"Start your project"** or **"Sign in"**

2. **Create Account** (if new)
   - Sign up with GitHub (easiest)
   - Or use email

### 2.2 Create New Project

1. **Click "New Project"**
   - In Supabase dashboard
   - Click **"New Project"** button

2. **Fill Project Details**
   - **Name**: `stratejiplus`
   - **Database Password**: 
     - Create a strong password
     - **SAVE THIS PASSWORD!** (you'll need it)
     - Example: `MyStr0ng!P@ssw0rd`
   - **Region**: Choose closest to you
     - `Europe West` (if in Europe)
     - `US East` (if in US)
   - **Pricing Plan**: Free (default)

3. **Create Project**
   - Click **"Create new project"**
   - Wait 2-3 minutes for setup

**✅ Done when:** Project shows "Active" status

### 2.3 Get Supabase Credentials

1. **Get API Keys**
   - Go to **Settings** → **API** (left sidebar)
   - Copy these values:
     - **Project URL**: `https://xxxxx.supabase.co`
       - Example: `https://abcdefghijklmnop.supabase.co`
     - **anon public key**: `eyJhbGc...` (very long string)
       - Starts with `eyJ`
       - Copy the entire key

2. **Get Database Connection** (Optional, for reference)
   - Go to **Settings** → **Database**
   - Note these (you might need them):
     - **Host**: `db.xxxxx.supabase.co`
     - **Port**: `5432`
     - **Database name**: `postgres`
     - **User**: `postgres`
     - **Password**: (the one you set)

**✅ Save these credentials!** You'll need them later.

---

## Step 3: Import Database Schema

### 3.1 Open SQL Editor

1. **In Supabase Dashboard**
   - Click **"SQL Editor"** in left sidebar
   - Click **"New query"** button

### 3.2 Open Schema File

1. **On Your Computer**
   - Open file: `supabase/exports/supabase_import.sql`
   - Or if that doesn't exist, use: `supabase/schema.sql`

2. **Select All and Copy**
   - Select ALL contents (Cmd+A / Ctrl+A)
   - Copy (Cmd+C / Ctrl+C)

### 3.3 Paste and Run in Supabase

1. **In Supabase SQL Editor**
   - Paste the SQL (Cmd+V / Ctrl+V)
   - Review the SQL (should have CREATE TABLE statements)
   - Click **"Run"** button (or press `Cmd+Enter` / `Ctrl+Enter`)

2. **Wait for Success**
   - You'll see "Success" message
   - Or check for any errors (fix if needed)

### 3.4 Verify Tables Created

1. **Check Tables**
   - In Supabase dashboard
   - Go to **"Table Editor"** (left sidebar)
   - You should see tables like:
     - `companies`
     - `units`
     - `users`
     - `strategic_areas`
     - etc.

**✅ Done when:** You see all tables in Table Editor

---

## ✅ Part 1 Complete Checklist

- [ ] Code pushed to GitHub
  - [ ] Git initialized
  - [ ] GitHub repository created
  - [ ] Code pushed successfully

- [ ] Supabase project created
  - [ ] Account created
  - [ ] Project created
  - [ ] Credentials saved

- [ ] Database schema imported
  - [ ] SQL Editor opened
  - [ ] Schema file copied
  - [ ] SQL executed successfully
  - [ ] Tables verified

---

## 🎯 Next Steps

After completing Part 1:

1. ✅ You have code on GitHub
2. ✅ You have Supabase project
3. ✅ You have database schema imported

**Ready for Part 2:** Deploy to Cloudflare Pages

---

## 🆘 Troubleshooting

### Git Issues

**"fatal: not a git repository"**
```bash
git init
git add .
git commit -m "Initial commit"
```

**"remote origin already exists"**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/stratejiplus.git
```

**"Permission denied"**
- Use GitHub Personal Access Token instead of password
- Or use SSH keys

### Supabase Issues

**"Project creation failed"**
- Wait a few minutes and try again
- Check if you have existing projects (free tier limit: 2 projects)

**"Can't find SQL Editor"**
- Make sure project is fully created (wait 2-3 minutes)
- Refresh the page

**"SQL execution failed"**
- Check for syntax errors
- Make sure you copied the entire file
- Try running in smaller chunks

---

**Follow these steps and you'll complete Part 1!** ✅

