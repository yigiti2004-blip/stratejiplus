# 🔧 Fix "Invalid Nameservers" Error

## ⚠️ Problem: Cloudflare Shows "Invalid Nameservers"

This means Cloudflare can't detect that your domain is using Cloudflare nameservers.

---

## ✅ Solution: Verify Nameservers at Hostinger

### Step 1: Get Your Cloudflare Nameservers

1. **Go to Cloudflare Dashboard**
   - Visit [dash.cloudflare.com](https://dash.cloudflare.com)
   - Click on your domain

2. **Find Nameservers**
   - Look for a section showing nameservers
   - You should see something like:
     ```
     ns1.cloudflare.com
     ns2.cloudflare.com
     ```
   - **Copy these exactly** (they might be different for your account)

3. **Note Your Exact Nameservers**
   - Write them down or copy them
   - They might be:
     - `ns1.cloudflare.com` / `ns2.cloudflare.com`
     - OR custom names like `alex.ns.cloudflare.com` / `sue.ns.cloudflare.com`
     - **Use the EXACT ones Cloudflare shows you!**

---

### Step 2: Update Nameservers in Hostinger

1. **Login to Hostinger**
   - Go to [hpanel.hostinger.com](https://hpanel.hostinger.com)
   - Login to your account

2. **Go to Domain Settings**
   - Click on **"Domains"** in the left menu
   - Find your domain
   - Click on it or click **"Manage"**

3. **Find Nameserver Settings**
   - Look for:
     - **"Nameservers"**
     - **"DNS Management"**
     - **"DNS Settings"**
     - **"Change Nameservers"**
   - Usually in the domain details page

4. **Update Nameservers**
   - Click **"Change Nameservers"** or **"Edit"**
   - You'll see current nameservers (probably Hostinger's)
   - **Replace** with Cloudflare nameservers:
     - **Nameserver 1**: `ns1.cloudflare.com` (or your Cloudflare nameserver)
     - **Nameserver 2**: `ns2.cloudflare.com` (or your Cloudflare nameserver)
   - **Save** or **Update**

5. **Important:**
   - Make sure you enter **BOTH** nameservers
   - Use the **EXACT** nameservers Cloudflare gave you
   - Don't add extra spaces or characters
   - Save the changes

---

### Step 3: Verify Nameservers Are Set

1. **Wait 5-10 minutes** (DNS propagation)

2. **Check Nameservers Online**
   - Go to: [whatsmydns.net](https://www.whatsmydns.net/#NS/yourdomain.com)
   - Enter your domain
   - Check if nameservers show Cloudflare nameservers

3. **Or Use Command Line:**
   ```bash
   dig NS yourdomain.com
   ```
   - Should show Cloudflare nameservers

---

### Step 4: Check Cloudflare Again

1. **Go back to Cloudflare**
   - Refresh the page
   - Wait 5-30 minutes
   - Status should change: **"Pending"** → **"Active"** ✅

2. **If Still Showing Error:**
   - Wait longer (can take up to 24 hours)
   - Double-check nameservers at Hostinger
   - Verify you used the correct Cloudflare nameservers

---

## 🆘 Common Issues & Fixes

### Issue 1: Nameservers Not Updated at Hostinger

**Symptom:** Cloudflare still shows "Invalid nameservers"

**Fix:**
- Go back to Hostinger
- Verify nameservers are actually changed
- Make sure you clicked "Save" or "Update"
- Wait 10-30 minutes for propagation

---

### Issue 2: Wrong Nameservers Entered

**Symptom:** Cloudflare shows "Invalid nameservers"

**Fix:**
- Check Cloudflare dashboard for YOUR exact nameservers
- They might not be `ns1.cloudflare.com` / `ns2.cloudflare.com`
- They could be custom like `alex.ns.cloudflare.com`
- Use the EXACT ones Cloudflare shows you

---

### Issue 3: Hostinger Interface Confusion

**Symptom:** Can't find where to change nameservers

**Fix:**
- In Hostinger, look for:
  - **"DNS"** section
  - **"Nameservers"** option
  - **"Change Nameservers"** button
- If you can't find it, Hostinger support can help

---

### Issue 4: DNS Propagation Not Complete

**Symptom:** Nameservers updated but Cloudflare still shows error

**Fix:**
- **Wait 5-30 minutes** (usually)
- Can take up to 24-48 hours (rare)
- Check with [whatsmydns.net](https://www.whatsmydns.net) to verify
- Cloudflare will automatically detect when nameservers are correct

---

## 📋 Step-by-Step Checklist

- [ ] Get exact nameservers from Cloudflare dashboard
- [ ] Login to Hostinger
- [ ] Go to Domain settings
- [ ] Find "Nameservers" or "Change Nameservers"
- [ ] Replace with Cloudflare nameservers (BOTH)
- [ ] Save/Update changes
- [ ] Wait 5-30 minutes
- [ ] Check Cloudflare - should show "Active" ✅
- [ ] If still error, wait longer or verify nameservers

---

## 🎯 Quick Fix Guide

1. **Cloudflare Dashboard** → Copy your exact nameservers
2. **Hostinger** → Domain → Change Nameservers
3. **Replace** with Cloudflare nameservers (both)
4. **Save**
5. **Wait 10-30 minutes**
6. **Check Cloudflare** - should be "Active" ✅

---

## ⚠️ Important Notes

- **Use EXACT nameservers** Cloudflare shows you (might be custom)
- **Update BOTH nameservers** at Hostinger
- **Wait for propagation** (5-30 minutes usually)
- **Cloudflare will auto-detect** when nameservers are correct

---

## 🔍 How to Verify Nameservers Are Correct

### Method 1: Online Tool
- Go to [whatsmydns.net](https://www.whatsmydns.net/#NS/yourdomain.com)
- Enter your domain
- Should show Cloudflare nameservers

### Method 2: Command Line
```bash
dig NS yourdomain.com
```
- Should show Cloudflare nameservers

### Method 3: Cloudflare Dashboard
- After 10-30 minutes, refresh Cloudflare
- Status should change to "Active" ✅

---

**Follow these steps and the error will be fixed!** 🚀

