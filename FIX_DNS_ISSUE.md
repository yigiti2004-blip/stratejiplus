# 🔧 Fix DNS Issue - Domain Still Points to Hostinger

## ⚠️ Problem

Your domain `stratejiplus.com` might still be pointing to your old Hostinger website, not to Cloudflare Pages.

---

## ✅ Quick Fix Steps

### Step 1: Check Current DNS

**Method 1: Online Tool**
- Go to: [whatsmydns.net](https://www.whatsmydns.net/#A/stratejiplus.com)
- Enter: `stratejiplus.com`
- Check what IP addresses show

**Method 2: Terminal**
```bash
dig stratejiplus.com
# or
nslookup stratejiplus.com
```

**What to see:**
- ✅ **Cloudflare IPs** (103.21.xxx.xxx, 104.16.xxx.xxx, etc.) → Good!
- ❌ **Hostinger IPs** (31.xxx.xxx.xxx, 185.xxx.xxx.xxx) → DNS not updated!

---

### Step 2: Verify Cloudflare Pages URL Works

**Test the .pages.dev URL directly:**
1. Visit: `https://stratejiplus.pages.dev`
2. Does it work? Show your new site?

**If yes:** → DNS issue (domain points to Hostinger)
**If no:** → Code/deployment issue

---

### Step 3: Fix DNS in Cloudflare

1. **Go to Cloudflare Dashboard**
   - Visit: [dash.cloudflare.com](https://dash.cloudflare.com)
   - Click on your domain

2. **Go to DNS tab**
   - Click "DNS" in left sidebar

3. **Check/Update DNS Records**
   - Look for `A` or `CNAME` record for `@` (root) or `stratejiplus.com`
   - **Delete** any old records pointing to Hostinger IPs
   - **Add** new CNAME record:
     - Type: `CNAME`
     - Name: `@`
     - Target: `stratejiplus.pages.dev`
     - Proxied: ✅ (orange cloud)

4. **Also add www (optional)**
   - Type: `CNAME`
   - Name: `www`
   - Target: `stratejiplus.pages.dev`
   - Proxied: ✅

---

### Step 4: Verify Custom Domain in Pages

1. **Go to Pages project**
   - Cloudflare → Workers & Pages → Pages → `stratejiplus`

2. **Check Custom Domains**
   - Click "Custom domains" tab
   - Make sure `stratejiplus.com` shows "Active" ✅
   - If not listed, add it

---

### Step 5: Clear Browser Cache

**Important:** Your browser might be caching the old Hostinger site!

**Option 1: Hard Refresh**
- Mac: `Cmd + Shift + R`
- Windows: `Ctrl + Shift + R`

**Option 2: Clear Cache**
- Chrome: Settings → Privacy → Clear browsing data
- Safari: Develop → Empty Caches

**Option 3: Incognito/Private Window**
- Use incognito/private window to test
- This bypasses cache

---

## 🔍 Diagnostic Commands

### Check DNS:
```bash
# Check A records
dig A stratejiplus.com

# Check CNAME records  
dig CNAME stratejiplus.com

# Check nameservers
dig NS stratejiplus.com
```

### Expected Results:
- Nameservers should show: `ns1.cloudflare.com`, `ns2.cloudflare.com`
- CNAME should point to: `stratejiplus.pages.dev`
- Or A records should show Cloudflare IPs

---

## ✅ Correct DNS Configuration

### Option A: CNAME (Recommended for Pages)
```
Type: CNAME
Name: @
Target: stratejiplus.pages.dev
Proxied: ✅
```

### Option B: A Records (If CNAME doesn't work for root)
```
Type: A
Name: @
Content: [Cloudflare Pages IP - get from Cloudflare]
Proxied: ✅
```

---

## 🆘 If DNS Still Shows Hostinger

### Check 1: Nameservers
Make sure nameservers at Hostinger point to Cloudflare:
- `ns1.cloudflare.com`
- `ns2.cloudflare.com`

### Check 2: DNS Propagation
DNS changes can take 5-30 minutes (sometimes up to 48 hours).
Check propagation: [whatsmydns.net](https://www.whatsmydns.net)

### Check 3: Old A Records
Delete any old A records pointing to Hostinger IPs.

---

## 📋 Quick Checklist

- [ ] Nameservers point to Cloudflare (check at Hostinger)
- [ ] DNS record points to `stratejiplus.pages.dev` (in Cloudflare)
- [ ] No old Hostinger IP records in DNS
- [ ] Custom domain shows "Active" in Pages
- [ ] Browser cache cleared
- [ ] `.pages.dev` URL works (test this first)

---

## 🧪 Test After Fixing

1. **Clear browser cache** or use incognito
2. **Visit:** `https://stratejiplus.com`
3. **Open Network tab** (F12)
4. **Filter by:** `supabase`
5. **Should see:** Supabase requests ✅

---

**The most likely issue is old DNS records pointing to Hostinger. Delete them and add CNAME to Pages!** 🔧

