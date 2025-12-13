# 🚀 Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Login
3. Click **"New Project"**
4. Fill in:
   - **Name**: `stratejiplus`
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to you (e.g., `Europe West`)
5. Click **"Create new project"**
6. Wait 2-3 minutes for setup

## Step 2: Get Connection Details

After project is ready:

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)

3. Go to **Settings** → **Database**
4. Copy:
   - **Host**: `db.xxxxx.supabase.co`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: (the one you set)

## Step 3: Run Schema Migration

### Option A: Using Supabase SQL Editor (Recommended)

1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New query"**
3. Copy and paste the contents of `supabase/schema.sql`
4. Click **"Run"**
5. Wait for success message

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

## Step 4: Configure Environment Variables

### Local Development

Create `.env.local` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Vercel Deployment

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key-here`

## Step 5: Test Connection

```bash
# Install dependencies
npm install @supabase/supabase-js

# Test connection (create a test script)
node test-supabase.js
```

## Step 6: Migrate Data from localStorage

1. Export data from localStorage (if you have existing data)
2. Use the migration script to import to Supabase
3. Verify data in Supabase dashboard

## 🔒 RLS (Row Level Security) Explained

### How It Works

1. **User logs in** → Backend sets `app.current_user_id` session variable
2. **User queries data** → RLS policies automatically filter by `company_id`
3. **Admin users** → See all companies' data (via `is_admin()` function)

### Testing RLS

```sql
-- Test as Company A user
SET LOCAL app.current_user_id = 'user-A-admin';
SELECT * FROM strategic_areas; -- Should only see Company A data

-- Test as Admin
SET LOCAL app.current_user_id = 'admin-user';
SELECT * FROM strategic_areas; -- Should see all companies' data
```

## 🎯 Next Steps

1. ✅ Run schema migration
2. ✅ Set environment variables
3. ✅ Test connection
4. ✅ Migrate existing data
5. ✅ Deploy to Vercel

---

**Need help?** Check Supabase docs: https://supabase.com/docs

