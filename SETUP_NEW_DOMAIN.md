# 🌐 Setup New Domain: stratejiplus.org

## 🎯 Goal: Connect stratejiplus.org to Cloudflare Pages

Since you bought the domain on Cloudflare, it should be easier!

---

## ✅ Step 1: Add Custom Domain in Pages

1. **Go to Cloudflare Dashboard**
   - Visit: [dash.cloudflare.com](https://dash.cloudflare.com)
   - Click: **Workers & Pages** → **Pages**
   - Click on your project: **stratejiplus**

2. **Add Custom Domain**
   - Click: **Custom domains** tab
   - Click: **Set up a custom domain**
   - Enter: `stratejiplus.org`
   - Click: **Continue**
   - Click: **Activate domain**

3. **Wait for SSL**
   - Usually takes 1-5 minutes
   - Status should show: **Active** ✅

---

## ✅ Step 2: Check DNS Records

Since domain is on Cloudflare, DNS should auto-configure, but let's verify:

1. **Go to DNS Settings**
   - Cloudflare Dashboard → Click on `stratejiplus.org`
   - Click: **DNS** tab

2. **Verify Records**
   - Should see **CNAME** record:
     - Type: `CNAME`
     - Name: `@`
     - Target: `stratejiplus.pages.dev`
     - Proxy: ✅ Proxied (orange cloud)

3. **If CNAME doesn't exist:**
   - Click: **Add record**
   - Type: `CNAME`
   - Name: `@`
   - Target: `stratejiplus.pages.dev`
   - Proxy: ✅ Proxied
   - Click: **Save**

---

## ✅ Step 3: Check Domain Status

1. **In Pages:**
   - Custom domains tab
   - Should show `stratejiplus.org` as **Active** ✅

2. **In DNS:**
   - Should show CNAME to `stratejiplus.pages.dev`

---

## 🆘 Troubleshooting "Safari Can't Find Server"

### Issue 1: Domain Not Added in Pages

**Check:**
- Go to Pages → stratejiplus → Custom domains
- Is `stratejiplus.org` listed?

**Fix:**
- Add it if missing (Step 1 above)

---

### Issue 2: DNS Not Configured

**Check:**
- DNS tab → Do you see CNAME to `stratejiplus.pages.dev`?

**Fix:**
- Add CNAME record (Step 2 above)

---

### Issue 3: SSL Not Ready

**Check:**
- Custom domains tab → Status of `stratejiplus.org`
- If "Pending" → Wait 5-10 minutes

**Fix:**
- Wait for SSL certificate to be issued
- Usually takes 1-5 minutes

---

### Issue 4: DNS Propagation

**Check:**
```bash
dig stratejiplus.org +short
```

**Should show:** Cloudflare IPs (104.21.x.x or 172.67.x.x)

**If shows nothing or wrong IPs:**
- Wait 5-30 minutes for propagation
- Or flush DNS cache

---

## 🔍 Quick Diagnostic

### Test 1: Check if domain resolves
```bash
dig stratejiplus.org +short
```

### Test 2: Check nameservers
```bash
dig stratejiplus.org NS +short
```

**Should show:** Cloudflare nameservers (xxx.ns.cloudflare.com)

### Test 3: Test Pages URL directly
Visit: `https://stratejiplus.pages.dev`
- If this works → DNS issue with custom domain
- If this doesn't work → Deployment issue

---

## 📋 Checklist

- [ ] Domain added in Pages → Custom domains
- [ ] Status shows "Active" ✅
- [ ] DNS has CNAME: `@` → `stratejiplus.pages.dev`
- [ ] CNAME is Proxied (orange cloud) ✅
- [ ] SSL certificate issued (green checkmark)
- [ ] Wait 5-10 minutes after setup
- [ ] Test in incognito/private window

---

## 🚀 Quick Fix Steps

1. **Pages** → Custom domains → Add `stratejiplus.org`
2. **DNS** → Verify CNAME exists
3. **Wait** 5-10 minutes
4. **Test** in incognito: `https://stratejiplus.org`

---

**Most likely: Domain not added in Pages custom domains yet! Add it there first!** ✅

