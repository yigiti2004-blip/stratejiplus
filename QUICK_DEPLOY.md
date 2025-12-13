# ⚡ Quick Deploy Guide

## 🎯 Recommended: Supabase + Vercel

**Why?**
- ✅ Built-in RLS (Row Level Security) for multi-tenant
- ✅ Free tier (500MB DB, 2GB bandwidth)
- ✅ Easy setup
- ✅ Automatic backups

---

## 📋 5-Minute Setup

### Step 1: Create Supabase Project (2 min)

1. Go to [supabase.com](https://supabase.com) → Sign up
2. Click **"New Project"**
3. Name: `stratejiplus`
4. Set password (save it!)
5. Wait 2-3 minutes

### Step 2: Run Schema (1 min)

1. In Supabase dashboard → **SQL Editor**
2. Click **"New query"**
3. Copy/paste `supabase/schema.sql`
4. Click **"Run"**

### Step 3: Get API Keys (30 sec)

1. **Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon key**: `eyJhbGc...`

### Step 4: Set Environment Variables (30 sec)

Create `.env.local`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5: Deploy to Vercel (1 min)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Then redeploy: vercel --prod
```

---

## 🔄 Migrate Data (Optional)

If you have existing localStorage data:

```bash
# Set service role key in .env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Run migration
node supabase/migrate-to-supabase.js
```

---

## ✅ Done!

Your app is now live at: `https://your-project.vercel.app`

---

## 📚 Full Guides

- **Supabase Setup**: See `SUPABASE_SETUP.md`
- **Vercel Deployment**: See `VERCEL_DEPLOY.md`
- **Full Deployment Guide**: See `DEPLOYMENT_GUIDE.md`

---

## 🆘 Troubleshooting

**Can't connect to Supabase?**
- Check environment variables are set
- Verify project is active in Supabase dashboard

**RLS not working?**
- Make sure schema.sql ran successfully
- Check RLS policies in Supabase dashboard

**Build fails?**
- Check Vercel build logs
- Verify all dependencies are in package.json

---

**Need help?** Check the full guides or Supabase docs!

