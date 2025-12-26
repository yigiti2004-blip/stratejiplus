# 🌐 Custom Domain Setup - Step by Step

## 🎯 Goal: Connect Your Domain to Cloudflare Pages

**Result**: Your app will be live at `https://yourdomain.com` instead of `https://stratejiplus.pages.dev`

---

## 📋 Prerequisites

- [x] Cloudflare Pages deployment working
- [x] Your domain purchased
- [x] Access to domain registrar (where you bought domain)

---

## 🚀 Step-by-Step Setup

### Step 1: Add Domain to Cloudflare

1. **Go to Cloudflare Dashboard**
   - Visit [dash.cloudflare.com](https://dash.cloudflare.com)
   - Make sure you're logged in

2. **Add Your Site**
   - Click **"Add a Site"** button (top right, orange button)
   - Enter your domain: `yourdomain.com` (replace with your actual domain)
   - Click **"Add site"**

3. **Select Plan**
   - Choose **"Free"** plan (perfect for your needs)
   - Click **"Continue"**

4. **Review DNS Records**
   - Cloudflare will scan your existing DNS records
   - Review the list (you can edit later)
   - Click **"Continue"**

5. **Get Nameservers**
   - Cloudflare will show you 2 nameservers:
     ```
     ns1.cloudflare.com
     ns2.cloudflare.com
     ```
   - **Copy these** (you'll need them in Step 2)

**✅ Done when:** You see nameservers displayed

---

### Step 2: Update Nameservers at Your Registrar

1. **Go to Your Domain Registrar**
   - Where you bought your domain (GoDaddy, Namecheap, etc.)
   - Login to your account

2. **Find DNS/Nameserver Settings**
   - Look for:
     - **"DNS Management"**
     - **"Nameservers"**
     - **"Domain Settings"**
     - Usually in domain management section

3. **Update Nameservers**
   - Find current nameservers
   - **Replace** with Cloudflare nameservers:
     ```
     ns1.cloudflare.com
     ns2.cloudflare.com
     ```
   - **Save** changes

4. **Wait for Propagation**
   - Usually takes 5-30 minutes
   - Can take up to 24-48 hours (rare)
   - Cloudflare will show status: **"Pending"** → **"Active"**

**✅ Done when:** Cloudflare shows domain status as **"Active"**

---

### Step 3: Add DNS Record for Pages

1. **Go to DNS Settings**
   - In Cloudflare dashboard
   - Click on your domain
   - Click **"DNS"** tab (left sidebar)

2. **Add CNAME Record**
   - Click **"Add record"** button
   - Configure:
     - **Type**: `CNAME`
     - **Name**: 
       - `@` (for root domain: `yourdomain.com`)
       - OR `www` (for subdomain: `www.yourdomain.com`)
       - OR both (add two records)
     - **Target**: `stratejiplus.pages.dev` (your Pages URL)
     - **Proxy status**: ✅ **Proxied** (orange cloud) - IMPORTANT!
     - **TTL**: Auto
   - Click **"Save"**

3. **If You Want Both www and root:**
   - Add another CNAME:
     - **Name**: `www`
     - **Target**: `stratejiplus.pages.dev`
     - **Proxy**: ✅ Proxied
   - Click **"Save"**

**✅ Done when:** DNS record is added

---

### Step 4: Add Custom Domain in Pages

1. **Go to Pages Project**
   - Cloudflare Dashboard → **Workers & Pages** → **Pages**
   - Click on your project: `stratejiplus`

2. **Add Custom Domain**
   - Click **"Custom domains"** tab
   - Click **"Set up a custom domain"** button
   - Enter your domain: `yourdomain.com`
   - Click **"Continue"**
   - Click **"Add domain"**

3. **Wait for SSL**
   - Cloudflare automatically provisions SSL certificate
   - Usually takes 1-5 minutes
   - Status will change: **"Pending"** → **"Active"** ✅

**✅ Done when:** Domain shows **"Active"** with green checkmark

---

### Step 5: Test Your Domain

1. **Visit Your Domain**
   - Go to: `https://yourdomain.com`
   - Check SSL certificate (should show valid/green lock)

2. **Test Your App**
   - Login works?
   - Data loads from Supabase?
   - All features work?

3. **Test www (if added)**
   - Go to: `https://www.yourdomain.com`
   - Should redirect or work the same

**✅ Done when:** Your domain works perfectly!

---

## 🔧 Common Configurations

### Option 1: Root Domain Only
```
yourdomain.com → stratejiplus.pages.dev
```

**DNS Record:**
- Type: CNAME
- Name: `@`
- Target: `stratejiplus.pages.dev`
- Proxy: ✅ Proxied

### Option 2: www Subdomain Only
```
www.yourdomain.com → stratejiplus.pages.dev
```

**DNS Record:**
- Type: CNAME
- Name: `www`
- Target: `stratejiplus.pages.dev`
- Proxy: ✅ Proxied

### Option 3: Both (Recommended)
```
yourdomain.com → stratejiplus.pages.dev
www.yourdomain.com → stratejiplus.pages.dev
```

**DNS Records:**
1. CNAME: `@` → `stratejiplus.pages.dev` (Proxied)
2. CNAME: `www` → `stratejiplus.pages.dev` (Proxied)

---

## ⚙️ Cloudflare Settings

### SSL/TLS Mode

1. **Go to SSL/TLS Settings**
   - Cloudflare → Your domain → **SSL/TLS**

2. **Set Mode**
   - **Full (strict)** - Recommended ✅
   - Or **Full** if you get errors

### Always Use HTTPS

1. **Go to SSL/TLS → Edge Certificates**
2. Enable **"Always Use HTTPS"**
3. Enable **"Automatic HTTPS Rewrites"**

---

## 🆘 Troubleshooting

### Domain Not Resolving

**Check DNS Propagation:**
```bash
# Check if DNS is working
dig yourdomain.com
nslookup yourdomain.com
```

**Solutions:**
- Wait 24-48 hours for full propagation
- Verify nameservers are correct
- Check DNS records in Cloudflare

### SSL Certificate Not Working

**Check:**
1. DNS record is **Proxied** (orange cloud) ✅
2. SSL/TLS mode is **Full** or **Full (strict)**
3. Wait 5-10 minutes for SSL provisioning

**Solutions:**
- Make sure CNAME is Proxied (not DNS only)
- Wait a few more minutes
- Check SSL status in Pages project

### Site Shows "Not Found"

**Check:**
1. Custom domain is added in Pages project
2. DNS record points to correct Pages URL
3. Pages deployment is successful

**Solutions:**
- Verify DNS record target: `stratejiplus.pages.dev`
- Check Pages deployment status
- Wait a few minutes for propagation

### www Not Working

**If you only added root domain:**
- Add another CNAME for `www`
- Or set up redirect in Cloudflare

---

## 📋 Checklist

- [ ] Domain added to Cloudflare
- [ ] Nameservers updated at registrar
- [ ] Domain shows "Active" in Cloudflare
- [ ] DNS record added (CNAME to Pages)
- [ ] DNS record is Proxied (orange cloud)
- [ ] Custom domain added in Pages project
- [ ] SSL certificate active
- [ ] Domain works: `https://yourdomain.com`
- [ ] www works (if configured): `https://www.yourdomain.com`

---

## 🎯 Quick Reference

### Your URLs:
- **Pages URL**: `https://stratejiplus.pages.dev`
- **Custom Domain**: `https://yourdomain.com`

### DNS Record:
- **Type**: CNAME
- **Name**: `@` (or `www`)
- **Target**: `stratejiplus.pages.dev`
- **Proxy**: ✅ Proxied

### Nameservers:
- `ns1.cloudflare.com`
- `ns2.cloudflare.com`

---

## ⏱️ Timeline

- **Nameserver update**: 5-30 minutes (usually)
- **DNS propagation**: 5-30 minutes (usually)
- **SSL certificate**: 1-5 minutes
- **Total**: Usually 10-60 minutes

**Note**: Can take up to 24-48 hours in rare cases.

---

## ✅ After Setup

Once your domain is working:

1. ✅ **Test HTTPS**: Should redirect to HTTPS automatically
2. ✅ **Test App**: All features should work
3. ✅ **Monitor**: Check Cloudflare dashboard for analytics
4. ✅ **Done!** Your app is live on your custom domain!

---

## 🎉 You're Live!

Your app is now accessible at:
- `https://yourdomain.com` ✅
- `https://www.yourdomain.com` (if configured) ✅

**Total Cost: $0/month** ✅

---

**Follow these steps and your custom domain will be connected!** 🚀

