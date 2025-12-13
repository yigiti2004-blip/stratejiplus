# 🚀 Deployment Guide: Multi-Tenant App to Internet

## Recommended Architecture

### **Option 1: Supabase + Vercel (Recommended)**
- **Database**: Supabase PostgreSQL (with RLS)
- **Backend API**: Vercel Serverless Functions
- **Frontend**: Vercel
- **Why**: Best for multi-tenant, easy setup, free tier

### **Option 2: Supabase + Cloudflare Pages**
- **Database**: Supabase PostgreSQL (with RLS)
- **Backend API**: Cloudflare Workers
- **Frontend**: Cloudflare Pages
- **Why**: Global CDN, fast, free tier

### **Option 3: Fly.io (Full Stack)**
- **Database**: Fly.io PostgreSQL or Supabase
- **Backend API**: Fly.io App
- **Frontend**: Fly.io App
- **Why**: Single platform, good for containers

## 🎯 Recommended: Supabase + Vercel

### Why Supabase?
✅ Built-in Row Level Security (RLS) for multi-tenant
✅ PostgreSQL with automatic backups
✅ Real-time subscriptions
✅ Auth built-in (optional)
✅ Free tier: 500MB database, 2GB bandwidth
✅ Easy migration from your current setup

### Why Vercel?
✅ Free tier for frontend + API
✅ Automatic deployments from Git
✅ Edge functions for low latency
✅ Easy environment variables

---

## 📋 Step-by-Step Deployment

### Part 1: Supabase Setup (Database)

#### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up / Login
3. Click "New Project"
4. Fill in:
   - **Name**: `stratejiplus`
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
5. Wait 2-3 minutes for setup

#### 2. Get Connection Details
After project is ready:
1. Go to **Settings** → **Database**
2. Copy:
   - **Host**: `db.xxxxx.supabase.co`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: (the one you set)

#### 3. Run Schema Migration
```bash
# Install Supabase CLI (optional, or use web SQL editor)
npm install -g supabase

# Or use the web SQL editor:
# Go to SQL Editor in Supabase dashboard
```

#### 4. Enable Row Level Security (RLS)
We'll add RLS policies for multi-tenant security.

---

### Part 2: Update Code for Supabase

#### 1. Install Supabase Client
```bash
npm install @supabase/supabase-js
```

#### 2. Create Supabase Config
Create `src/lib/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### 3. Update Backend to Use Supabase
Replace `pg` with Supabase client.

---

### Part 3: Vercel Deployment

#### 1. Prepare for Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login
```

#### 2. Deploy Frontend
```bash
# In project root
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? stratejiplus
# - Directory? ./
# - Override settings? No
```

#### 3. Add Environment Variables
In Vercel Dashboard:
- Go to **Settings** → **Environment Variables**
- Add:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (for backend)

#### 4. Deploy Backend API
Create `api/` folder for Vercel serverless functions.

---

## 🔒 Row Level Security (RLS) Setup

### Multi-Tenant RLS Policies

We'll create policies that:
- Users can only see their company's data
- Admins can see all data (if needed)
- Automatic filtering by `company_id`

### Example RLS Policy:
```sql
-- Enable RLS on all tables
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_areas ENABLE ROW LEVEL SECURITY;
-- ... (all tables)

-- Policy: Users see only their company
CREATE POLICY "Users see own company data"
ON units FOR SELECT
USING (company_id = current_setting('app.current_company_id')::text);

-- Policy: Admins see all
CREATE POLICY "Admins see all data"
ON units FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = auth.uid() 
    AND role_id = 'admin'
  )
);
```

---

## 📁 Project Structure for Deployment

```
sp/
├── api/                    # Vercel serverless functions
│   ├── users.js
│   ├── login.js
│   └── ...
├── src/
├── public/
├── vercel.json            # Vercel config
├── .env.local            # Local env (gitignored)
└── supabase/
    └── migrations/       # Supabase migrations
```

---

## 🔄 Migration Steps

1. **Export current data** from localStorage
2. **Create Supabase tables** with RLS
3. **Import data** to Supabase
4. **Update frontend** to use Supabase
5. **Deploy to Vercel**

---

## 🎯 Next Steps

I'll create:
1. ✅ Supabase schema with RLS
2. ✅ Supabase client setup
3. ✅ Migration scripts
4. ✅ Vercel API routes
5. ✅ Environment variable templates

Ready to proceed?

