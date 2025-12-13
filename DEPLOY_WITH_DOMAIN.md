# 🚀 Deploy with Custom Domain - Step by Step

## 🎯 Recommended Approach: Fly.io First, Then Cloudflare

**Why?**
1. ✅ Test deployment on Fly.io first (get it working)
2. ✅ Then add Cloudflare for DNS + CDN
3. ✅ Easier to debug if something goes wrong
4. ✅ Can use Cloudflare as proxy (orange cloud) or just DNS (gray cloud)

---

## 📋 Step 1: Deploy to Fly.io (First)

### 1.1 Install Fly CLI
```bash
brew install flyctl
# or download from https://fly.io/docs/getting-started/installing-flyctl/
```

### 1.2 Login to Fly.io
```bash
fly auth login
```

### 1.3 Initialize Fly App
```bash
cd /Users/yigitilseven/Desktop/sp
fly launch

# Follow prompts:
# - App name: stratejiplus (or your choice)
# - Region: Choose closest (e.g., iad, ord, fra)
# - PostgreSQL: No (using Supabase)
# - Deploy now: No (we'll configure first)
```

### 1.4 Configure Fly.io

Copy `fly.toml.example` to `fly.toml`:
```bash
cp fly.toml.example fly.toml
```

Edit `fly.toml`:
```toml
app = "stratejiplus"
primary_region = "iad"  # Change to your preferred region

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "8080"
  NODE_ENV = "production"

[[services]]
  internal_port = 8080
  protocol = "tcp"
  processes = ["app"]

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

### 1.5 Set Environment Variables
```bash
# Set Supabase credentials
fly secrets set VITE_SUPABASE_URL=https://your-project.supabase.co
fly secrets set VITE_SUPABASE_ANON_KEY=your-anon-key
fly secrets set SUPABASE_URL=https://your-project.supabase.co
fly secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 1.6 Deploy
```bash
fly deploy
```

### 1.7 Get Fly.io URL
After deployment, you'll get a URL like:
```
https://stratejiplus.fly.dev
```

**Test it works!** ✅

---

## 📋 Step 2: Setup Cloudflare DNS

### 2.1 Add Domain to Cloudflare

1. **Go to Cloudflare Dashboard**
   - [dash.cloudflare.com](https://dash.cloudflare.com)
   - Click **"Add a Site"**

2. **Enter Your Domain**
   - Enter your domain (e.g., `stratejiplus.com`)
   - Select plan (Free is fine)

3. **Cloudflare Scans DNS**
   - Wait for DNS scan to complete
   - Review DNS records

4. **Update Nameservers**
   - Cloudflare will give you nameservers
   - Go to your domain registrar
   - Update nameservers to Cloudflare's

### 2.2 Add DNS Record for Fly.io

1. **Go to DNS Settings**
   - In Cloudflare dashboard → Your domain → **DNS**

2. **Add A Record (or CNAME)**
   
   **Option A: Root Domain (stratejiplus.com)**
   ```
   Type: A
   Name: @
   IPv4: (Get from Fly.io - see below)
   Proxy: ✅ (Orange cloud - recommended)
   TTL: Auto
   ```
   
   **Option B: Subdomain (app.stratejiplus.com)**
   ```
   Type: CNAME
   Name: app
   Target: stratejiplus.fly.dev
   Proxy: ✅ (Orange cloud - recommended)
   TTL: Auto
   ```

### 2.3 Get Fly.io IP Address (if using A record)

```bash
# Get Fly.io IPv4 addresses
fly ips list

# Or use dig
dig +short stratejiplus.fly.dev
```

**Note:** Fly.io uses multiple IPs. For root domain, you might want to use CNAME with a subdomain instead.

---

## 📋 Step 3: Configure Fly.io for Custom Domain

### 3.1 Add Domain to Fly.io

```bash
# Add your domain
fly certs add stratejiplus.com

# Or for subdomain
fly certs add app.stratejiplus.com
```

### 3.2 Verify DNS

Fly.io will give you DNS records to add. Add them to Cloudflare:

```
Type: CNAME
Name: _acme-challenge
Target: (from Fly.io)
Proxy: ❌ (Gray cloud - must be DNS only)
```

### 3.3 Wait for SSL Certificate

Fly.io automatically provisions SSL via Let's Encrypt:
```bash
# Check certificate status
fly certs show stratejiplus.com
```

Wait for status: `Issued` ✅

---

## 📋 Step 4: Configure Cloudflare Settings

### 4.1 SSL/TLS Mode

1. **Go to SSL/TLS Settings**
   - Cloudflare Dashboard → SSL/TLS

2. **Set Mode**
   - **Full (strict)** - Recommended (Fly.io has valid SSL)
   - Or **Full** if you get errors

### 4.2 Enable Features (Optional)

- **Always Use HTTPS**: On
- **Automatic HTTPS Rewrites**: On
- **Minimum TLS Version**: 1.2

### 4.3 Performance Settings

- **Auto Minify**: Enable for JS, CSS, HTML
- **Brotli**: Enable
- **Rocket Loader**: Optional

---

## 📋 Step 5: Test & Verify

### 5.1 Test Domain

```bash
# Test DNS propagation
dig stratejiplus.com

# Test HTTPS
curl -I https://stratejiplus.com
```

### 5.2 Verify in Browser

1. Visit your domain: `https://stratejiplus.com`
2. Check SSL certificate (should show valid)
3. Test app functionality

---

## 🎯 Alternative: Cloudflare Pages (Simpler)

If you prefer **Cloudflare Pages** instead of Fly.io:

### Option: Cloudflare Pages + Supabase

1. **Deploy to Cloudflare Pages**
   - Connect GitHub repo
   - Build command: `npm run build`
   - Output: `dist`

2. **Add Custom Domain**
   - Pages project → Custom domains
   - Add your domain
   - Cloudflare auto-configures DNS + SSL

3. **Set Environment Variables**
   - In Pages project settings
   - Add Supabase credentials

**This is simpler but less flexible than Fly.io.**

---

## 🔧 Troubleshooting

### Domain Not Resolving

1. **Check DNS Propagation**
   ```bash
   dig stratejiplus.com
   nslookup stratejiplus.com
   ```

2. **Verify Nameservers**
   - Check domain registrar has Cloudflare nameservers
   - Wait 24-48 hours for propagation

### SSL Certificate Issues

1. **Check Fly.io Certificate**
   ```bash
   fly certs show stratejiplus.com
   ```

2. **Check Cloudflare SSL Mode**
   - Should be "Full" or "Full (strict)"

3. **Verify DNS Records**
   - `_acme-challenge` record must be DNS only (gray cloud)

### App Not Loading

1. **Check Fly.io App Status**
   ```bash
   fly status
   fly logs
   ```

2. **Check Environment Variables**
   ```bash
   fly secrets list
   ```

3. **Test Fly.io URL Directly**
   - Visit `https://stratejiplus.fly.dev`
   - If works, issue is DNS/Cloudflare

---

## 📊 Comparison: Fly.io vs Cloudflare Pages

| Feature | Fly.io | Cloudflare Pages |
|---------|--------|------------------|
| **Backend API** | ✅ Full Node.js | ❌ Serverless only |
| **Custom Domain** | ✅ Easy | ✅ Very Easy |
| **SSL** | ✅ Auto (Let's Encrypt) | ✅ Auto |
| **CDN** | ❌ No | ✅ Global CDN |
| **Docker** | ✅ Yes | ❌ No |
| **Best For** | Full-stack apps | Static/SPA apps |

---

## 🎯 Recommended Setup

**For Your App (Full-stack with Supabase):**

1. ✅ **Deploy to Fly.io** (backend + frontend)
2. ✅ **Use Cloudflare for DNS** (point to Fly.io)
3. ✅ **Enable Cloudflare Proxy** (orange cloud)
4. ✅ **Use Cloudflare SSL** (Full mode)

**Benefits:**
- Fly.io handles app hosting
- Cloudflare provides CDN + DDoS protection
- Automatic SSL from both sides
- Best performance + security

---

## 📚 Next Steps

1. ✅ Deploy to Fly.io
2. ✅ Test on `stratejiplus.fly.dev`
3. ✅ Add domain to Cloudflare
4. ✅ Configure DNS
5. ✅ Add domain to Fly.io
6. ✅ Wait for SSL
7. ✅ Test custom domain

---

**Ready to deploy?** Start with Step 1! 🚀

