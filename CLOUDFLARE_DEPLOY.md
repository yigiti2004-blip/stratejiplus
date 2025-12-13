# ☁️ Cloudflare Deployment Guide

## Architecture Options

### Option 1: Cloudflare Pages + Supabase (Recommended)
- **Frontend**: Cloudflare Pages (static hosting)
- **Backend API**: Cloudflare Workers (serverless functions)
- **Database**: Supabase PostgreSQL
- **Why**: Free tier, global CDN, fast, easy setup

### Option 2: Cloudflare Pages Only
- **Frontend**: Cloudflare Pages
- **Backend**: Direct Supabase client (no API layer needed)
- **Database**: Supabase PostgreSQL
- **Why**: Simplest setup, no backend needed

---

## 🚀 Option 1: Cloudflare Pages + Workers

### Step 1: Prepare Project

1. **Install Wrangler CLI** (Cloudflare's CLI):
```bash
npm install -g wrangler
# or
npm install --save-dev wrangler
```

2. **Login to Cloudflare**:
```bash
wrangler login
```

### Step 2: Create Cloudflare Workers API

Create `functions/api/[[path]].js` for API routes:

```javascript
// functions/api/[[path]].js
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');

  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Proxy to Supabase or handle API logic
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

  // Example: Proxy to Supabase
  if (path.startsWith('supabase/')) {
    const supabasePath = path.replace('supabase/', '');
    const response = await fetch(`${supabaseUrl}/rest/v1/${supabasePath}`, {
      method: request.method,
      headers: {
        ...request.headers,
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: request.method !== 'GET' ? await request.text() : undefined,
    });

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

### Step 3: Configure Cloudflare Pages

Create `wrangler.toml`:

```toml
name = "stratejiplus"
compatibility_date = "2024-01-01"

[env.production]
name = "stratejiplus"
account_id = "your-account-id"

[env.production.vars]
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_ANON_KEY = "your-anon-key"

# Secrets (set via wrangler secret put)
# SUPABASE_SERVICE_ROLE_KEY = "set-via-wrangler-secret"
```

### Step 4: Deploy to Cloudflare Pages

#### Via Wrangler CLI:

```bash
# Build the project
npm run build

# Deploy
wrangler pages deploy dist --project-name=stratejiplus
```

#### Via GitHub Integration:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Workers & Pages** → **Create Application** → **Pages**
3. Connect your GitHub repository
4. Configure:
   - **Project name**: `stratejiplus`
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Save and Deploy**

### Step 5: Set Environment Variables

#### In Cloudflare Dashboard:

1. Go to your Pages project
2. **Settings** → **Environment Variables**
3. Add:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
4. Select environments: **Production**, **Preview**, **Development**

#### Via Wrangler CLI:

```bash
# Set secrets (for Workers)
wrangler secret put SUPABASE_SERVICE_ROLE_KEY

# Set environment variables (for Pages)
wrangler pages project create stratejiplus
```

### Step 6: Custom Domain (Optional)

1. Go to **Custom Domains** in Pages project
2. Click **Set up a custom domain**
3. Enter your domain
4. Follow DNS configuration instructions
5. Cloudflare will automatically provision SSL

---

## 🚀 Option 2: Cloudflare Pages Only (Simpler)

### Step 1: Build Configuration

Create `cloudflare-pages.json`:

```json
{
  "build": {
    "command": "npm run build",
    "cwd": ".",
    "outputDirectory": "dist"
  },
  "environment": {
    "VITE_SUPABASE_URL": "https://your-project.supabase.co",
    "VITE_SUPABASE_ANON_KEY": "your-anon-key"
  }
}
```

### Step 2: Deploy via Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Workers & Pages** → **Create Application** → **Pages**
3. Connect GitHub repository
4. Configure:
   - **Project name**: `stratejiplus`
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Add environment variables
6. Deploy

### Step 3: Direct Supabase Connection

Your frontend connects directly to Supabase (no API layer needed):

```javascript
// src/lib/supabase.js (already created)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

RLS policies in Supabase handle security automatically!

---

## 🔧 Cloudflare-Specific Configuration

### Update `vite.config.js` for Cloudflare:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  // Cloudflare Pages compatibility
  define: {
    'process.env': {},
  },
})
```

### Add `_redirects` file for SPA routing:

Create `public/_redirects`:

```
/*    /index.html   200
```

This ensures all routes redirect to `index.html` for React Router.

---

## 📊 Monitoring & Analytics

### Cloudflare Analytics:

1. Go to **Analytics** in Pages project
2. View:
   - Page views
   - Bandwidth usage
   - Request metrics
   - Error rates

### Cloudflare Workers Analytics:

1. Go to **Workers** dashboard
2. View:
   - Request count
   - CPU time
   - Error rate
   - Response times

---

## 🔒 Security Best Practices

1. **Use Environment Variables**: Never commit API keys
2. **Enable RLS**: Supabase RLS handles data security
3. **Use Service Role Key**: Only in Workers (server-side)
4. **Use Anon Key**: In frontend (RLS protects data)
5. **Enable WAF**: Cloudflare Web Application Firewall

---

## 🎯 Advantages of Cloudflare

✅ **Free Tier**:
- Unlimited requests (Pages)
- 100,000 requests/day (Workers free)
- Global CDN included

✅ **Performance**:
- Edge computing (low latency)
- Automatic caching
- Image optimization

✅ **Security**:
- DDoS protection
- SSL/TLS included
- WAF available

✅ **Easy Setup**:
- GitHub integration
- Automatic deployments
- Preview deployments for PRs

---

## 🆘 Troubleshooting

### Build Fails:

1. Check build logs in Cloudflare dashboard
2. Verify `package.json` has correct build script
3. Check Node.js version (Cloudflare uses Node 18)

### Environment Variables Not Working:

1. Make sure variables are set for correct environment
2. Redeploy after adding variables
3. Check variable names match code (case-sensitive)

### Routing Issues:

1. Add `_redirects` file in `public/`
2. Verify React Router is configured correctly
3. Check Cloudflare Pages routing settings

### CORS Issues:

1. Supabase handles CORS automatically
2. If using Workers API, add CORS headers
3. Check Supabase project settings

---

## 📚 Next Steps

1. ✅ Deploy to Cloudflare Pages
2. ✅ Set environment variables
3. ✅ Configure custom domain (optional)
4. ✅ Test multi-tenant functionality
5. ✅ Monitor analytics

---

**Your app is now live on Cloudflare!** 🎉

Visit: `https://stratejiplus.pages.dev` (or your custom domain)

