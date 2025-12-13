# 🚀 Step-by-Step Deployment Guide

## 📋 Complete Setup: From Zero to Live Website

---

## ✅ Prerequisites Checklist

Before starting, make sure you have:
- [ ] GitHub account (free)
- [ ] Your code pushed to GitHub
- [ ] Supabase project created
- [ ] Domain purchased (or ready to purchase)

---

## 📦 PART 1: Prepare Your Code

### Step 1: Push Code to GitHub

```bash
# If you haven't already, initialize git
cd /Users/yigitilseven/Desktop/sp
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/stratejiplus.git
git branch -M main
git push -u origin main
```

**✅ Done when:** Your code is on GitHub

---

## 🗄️ PART 2: Setup Supabase (If Not Done)

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** → **"New Project"**
3. Fill in:
   - **Name**: `stratejiplus`
   - **Database Password**: (save this!)
   - **Region**: Choose closest
4. Click **"Create new project"**
5. Wait 2-3 minutes

### Step 3: Get Supabase Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)

3. Go to **Settings** → **Database**
4. Copy:
   - **Host**: `db.xxxxx.supabase.co`
   - **Password**: (the one you set)

**✅ Done when:** You have Supabase URL and keys

### Step 4: Import Database Schema

1. Go to **SQL Editor** in Supabase
2. Click **"New query"**
3. Open `supabase/exports/supabase_import.sql`
4. Copy ALL contents
5. Paste into SQL Editor
6. Click **"Run"** (or `Cmd+Enter`)
7. Wait for success message

**✅ Done when:** Schema imported successfully

---

## 🌐 PART 3: Deploy to Cloudflare Pages

### Step 5: Create Cloudflare Account

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **"Sign Up"** (free)
3. Verify email

**✅ Done when:** You can log into Cloudflare dashboard

### Step 6: Deploy to Cloudflare Pages

1. **Go to Cloudflare Dashboard**
   - Click **"Workers & Pages"** in sidebar
   - Click **"Create Application"**
   - Click **"Pages"** tab
   - Click **"Connect to Git"**

2. **Connect GitHub**
   - Click **"Connect GitHub"**
   - Authorize Cloudflare
   - Select your repository: `stratejiplus`
   - Click **"Begin setup"**

3. **Configure Build Settings**
   - **Project name**: `stratejiplus`
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave default)

4. **Add Environment Variables**
   - Click **"Add variable"**
   - Add:
     - **Name**: `VITE_SUPABASE_URL`
     - **Value**: `https://your-project.supabase.co`
   - Click **"Add variable"** again:
     - **Name**: `VITE_SUPABASE_ANON_KEY`
     - **Value**: `your-anon-key-here`
   - Click **"Save and Deploy"**

5. **Wait for Deployment**
   - Build will start automatically
   - Wait 2-5 minutes
   - You'll see: **"Deployment successful"**

**✅ Done when:** You see deployment URL: `https://stratejiplus.pages.dev`

### Step 7: Test Your Deployment

1. Click on your deployment
2. Click **"Visit site"**
3. Test your app:
   - Login works?
   - Data loads?
   - Everything works?

**✅ Done when:** Your app works on Cloudflare Pages

---

## 🌍 PART 4: Connect Your Domain

### Step 8: Add Domain to Cloudflare

1. **In Cloudflare Dashboard**
   - Click **"Add a Site"** (top right)
   - Enter your domain: `stratejiplus.com` (or your domain)
   - Click **"Add site"**

2. **Select Plan**
   - Choose **"Free"** plan
   - Click **"Continue"**

3. **Review DNS Records**
   - Cloudflare scans your existing DNS
   - Review the records
   - Click **"Continue"**

4. **Update Nameservers**
   - Cloudflare shows you 2 nameservers:
     - `ns1.cloudflare.com`
     - `ns2.cloudflare.com`
   - **Go to your domain registrar** (where you bought domain)
   - Find **"Nameservers"** or **"DNS"** settings
   - Replace with Cloudflare nameservers
   - **Save**

5. **Wait for Activation**
   - Cloudflare will verify (usually 5-30 minutes)
   - Status will change to **"Active"**

**✅ Done when:** Domain shows "Active" in Cloudflare

### Step 9: Add DNS Record for Pages

1. **Go to DNS Settings**
   - In Cloudflare → Your domain → **"DNS"**

2. **Add CNAME Record**
   - Click **"Add record"**
   - **Type**: `CNAME`
   - **Name**: `@` (for root domain) or `www` (for www subdomain)
   - **Target**: `stratejiplus.pages.dev`
   - **Proxy status**: ✅ **Proxied** (orange cloud)
   - **TTL**: Auto
   - Click **"Save"**

3. **If you want www subdomain too:**
   - Add another CNAME:
     - **Name**: `www`
     - **Target**: `stratejiplus.pages.dev`
     - **Proxy**: ✅ Proxied

**✅ Done when:** DNS record added

### Step 10: Add Custom Domain in Pages

1. **Go to Pages Project**
   - Cloudflare Dashboard → **Workers & Pages** → **Pages**
   - Click on `stratejiplus` project

2. **Add Custom Domain**
   - Click **"Custom domains"** tab
   - Click **"Set up a custom domain"**
   - Enter your domain: `stratejiplus.com`
   - Click **"Continue"**
   - Click **"Add domain"**

3. **Wait for SSL**
   - Cloudflare automatically provisions SSL
   - Wait 1-5 minutes
   - Status will show: **"Active"** with green checkmark

**✅ Done when:** Domain shows "Active" with SSL

---

## 🧪 PART 5: Test Everything

### Step 11: Test Your Domain

1. **Visit your domain**
   - Go to: `https://stratejiplus.com`
   - Check SSL certificate (should show valid)
   - Test your app:
     - Login works?
     - Data loads from Supabase?
     - All features work?

2. **Test HTTPS**
   - Make sure it redirects to HTTPS
   - Check SSL is valid (green lock icon)

**✅ Done when:** Your domain works perfectly!

---

## 🔧 PART 6: Final Configuration

### Step 12: Configure Cloudflare Settings

1. **SSL/TLS Settings**
   - Go to **SSL/TLS** in Cloudflare
   - Set to **"Full (strict)"** (recommended)
   - Or **"Full"** if you get errors

2. **Always Use HTTPS**
   - Go to **SSL/TLS** → **Edge Certificates**
   - Enable **"Always Use HTTPS"**

3. **Performance (Optional)**
   - Go to **Speed** → **Optimization**
   - Enable **"Auto Minify"** (JS, CSS, HTML)
   - Enable **"Brotli"**

**✅ Done when:** Settings configured

---

## ✅ Final Checklist

- [ ] Code pushed to GitHub
- [ ] Supabase project created
- [ ] Database schema imported
- [ ] Deployed to Cloudflare Pages
- [ ] Environment variables set
- [ ] Domain added to Cloudflare
- [ ] Nameservers updated
- [ ] DNS record added
- [ ] Custom domain added in Pages
- [ ] SSL certificate active
- [ ] Website works on custom domain
- [ ] HTTPS working
- [ ] All features tested

---

## 🎉 You're Done!

Your website is now live at: `https://stratejiplus.com`

**Total Cost: $0/month** ✅

---

## 🆘 Troubleshooting

### Build Fails
- Check build logs in Cloudflare Pages
- Verify `package.json` has correct build script
- Check environment variables are set

### Domain Not Working
- Wait 24-48 hours for DNS propagation
- Verify nameservers are correct
- Check DNS records in Cloudflare

### SSL Not Working
- Wait 5-10 minutes for SSL provisioning
- Check SSL/TLS mode is "Full" or "Full (strict)"
- Verify DNS record is "Proxied" (orange cloud)

### App Not Loading
- Check environment variables
- Verify Supabase connection
- Check browser console for errors

---

## 📚 Quick Reference

**Cloudflare Pages Dashboard:**
- [dash.cloudflare.com](https://dash.cloudflare.com)

**Supabase Dashboard:**
- [supabase.com/dashboard](https://supabase.com/dashboard)

**Your Live Site:**
- `https://stratejiplus.com` (after setup)

---

**Follow these steps in order, and you'll be live in ~30 minutes!** 🚀

