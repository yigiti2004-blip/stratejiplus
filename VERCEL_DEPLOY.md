# 🚀 Vercel Deployment Guide

## Prerequisites

- ✅ Supabase project created
- ✅ Environment variables ready
- ✅ Code updated for Supabase

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

## Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

## Step 3: Deploy

### First Time Deployment

```bash
# In project root
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? stratejiplus
# - Directory? ./
# - Override settings? No
```

### Subsequent Deployments

```bash
vercel --prod
```

## Step 4: Add Environment Variables

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:

```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key-here
```

5. Select **Production**, **Preview**, and **Development**
6. Click **Save**

## Step 5: Redeploy

After adding environment variables:

```bash
vercel --prod
```

Or trigger a new deployment from the Vercel dashboard.

## Step 6: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your domain
3. Follow DNS configuration instructions

## 🎯 Automatic Deployments

### Connect GitHub

1. Go to **Settings** → **Git**
2. Connect your GitHub repository
3. Enable automatic deployments:
   - **Production**: Deploy on `main` branch
   - **Preview**: Deploy on pull requests

### Deploy on Push

Now every push to `main` automatically deploys!

```bash
git push origin main
```

## 📊 Monitoring

- **Deployments**: See all deployments in dashboard
- **Logs**: View real-time logs
- **Analytics**: Built-in analytics (if enabled)

## 🔧 Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Verify environment variables are set
3. Check `package.json` build script

### Environment Variables Not Working

1. Make sure variables are set for correct environment
2. Redeploy after adding variables
3. Check variable names match code (case-sensitive)

### Database Connection Issues

1. Verify Supabase URL and keys
2. Check Supabase project is active
3. Verify RLS policies are set correctly

---

**Your app is now live!** 🎉

Visit: `https://your-project.vercel.app`

