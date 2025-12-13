# 💰 Fly.io Pricing Guide

## 🎯 What You Actually Need

### For Your App (StratejiPlus):
- ✅ **1 VM** (shared-cpu-1x) - Enough for most apps
- ✅ **PostgreSQL** - NOT needed (using Supabase)
- ✅ **Volume Storage** - Optional (if you need file storage)
- ✅ **Outbound Data** - Included in free tier

---

## 💵 Fly.io Pricing Breakdown

### Free Tier (Hobby Plan)

**What's Included:**
- ✅ **3 shared-cpu-1x VMs** (free)
- ✅ **3GB persistent volume storage** (free)
- ✅ **160GB outbound data transfer/month** (free)
- ✅ **Unlimited inbound data** (free)
- ✅ **Automatic SSL certificates** (free)
- ✅ **Global edge network** (free)

**Limitations:**
- ⚠️ VMs sleep after 5 minutes of inactivity
- ⚠️ Cold starts when waking up
- ⚠️ Limited to 3 VMs total

**Cost: $0/month** ✅

---

### Paid Plans (If You Need More)

#### Shared CPU Plans

**shared-cpu-1x** (1 vCPU, 256MB RAM)
- **Price**: $1.94/month per VM
- **Best for**: Small apps, development
- **Your app**: This is enough! ✅

**shared-cpu-2x** (2 vCPU, 512MB RAM)
- **Price**: $3.88/month per VM
- **Best for**: Medium traffic

**shared-cpu-4x** (4 vCPU, 1GB RAM)
- **Price**: $7.76/month per VM
- **Best for**: High traffic

#### Dedicated CPU Plans

**dedicated-cpu-1x** (1 vCPU, 2GB RAM)
- **Price**: $11.68/month per VM
- **Best for**: Production apps needing guaranteed CPU

**dedicated-cpu-2x** (2 vCPU, 4GB RAM)
- **Price**: $23.36/month per VM

**dedicated-cpu-4x** (4 vCPU, 8GB RAM)
- **Price**: $46.72/month per VM

---

## 📊 Your App Requirements

### Minimum Setup (Free Tier)

```
1x shared-cpu-1x VM
- Handles: Frontend + Backend API
- RAM: 256MB (enough for Node.js app)
- Cost: $0/month ✅
```

**This is enough for:**
- ✅ Development
- ✅ Small to medium traffic
- ✅ Testing
- ✅ MVP launch

### Recommended Setup (Paid)

```
1x shared-cpu-1x VM
- More reliable (no sleep)
- Faster response times
- Cost: $1.94/month ✅
```

**When to upgrade:**
- ⚠️ App sleeps too often (free tier limitation)
- ⚠️ Need faster response times
- ⚠️ Production launch

---

## 💰 Total Cost Breakdown

### Option 1: Free Tier (Start Here)

```
Fly.io:        $0/month
Supabase:      $0/month (free tier)
Domain:        ~$10-15/year (one-time)
Total:         $0/month ✅
```

**Limitations:**
- App sleeps after 5 min inactivity
- Cold starts (~2-5 seconds)

### Option 2: Paid (Recommended for Production)

```
Fly.io:        $1.94/month (1x shared-cpu-1x)
Supabase:      $0/month (free tier)
Domain:        ~$10-15/year
Total:         ~$2/month ✅
```

**Benefits:**
- ✅ No sleep (always on)
- ✅ Faster response
- ✅ Better for production

### Option 3: High Traffic

```
Fly.io:        $3.88/month (2x shared-cpu-2x)
Supabase:      $25/month (Pro plan if needed)
Domain:        ~$10-15/year
Total:         ~$29/month
```

**When needed:**
- High traffic (>1000 users/day)
- Need more RAM/CPU
- Database needs scaling

---

## 🎯 What You Should Buy

### For Development/Testing:
**Nothing!** ✅
- Use free tier
- Test everything
- Deploy and verify

### For Production Launch:
**Minimum: $1.94/month** ✅
- 1x shared-cpu-1x VM
- Always-on (no sleep)
- Fast enough for most apps

### If You Need More:
**Upgrade later:**
- Monitor usage
- Scale up if needed
- Pay only for what you use

---

## 📋 Additional Costs (Optional)

### Volume Storage
- **Free**: 3GB included
- **Paid**: $0.15/GB/month (if you need more)
- **Your app**: Probably don't need this (using Supabase)

### Outbound Data
- **Free**: 160GB/month included
- **Paid**: $0.02/GB after free tier
- **Your app**: Should be fine with free tier

### PostgreSQL (Not Needed)
- **Fly Postgres**: $1.94/month (small)
- **Your app**: Using Supabase instead ✅

---

## 💡 Cost Optimization Tips

### 1. Start Free
- Use free tier for development
- Test everything
- Only pay when you need to

### 2. Monitor Usage
```bash
# Check app metrics
fly status
fly metrics
```

### 3. Scale Down When Not Needed
- Development: Free tier
- Production: Paid tier
- Scale up only when needed

### 4. Use Supabase Free Tier
- 500MB database (enough for start)
- 2GB bandwidth (should be fine)
- Upgrade only when needed

---

## 🎯 Recommended Plan

### Phase 1: Development (Now)
```
Fly.io:        FREE ✅
Supabase:      FREE ✅
Total:         $0/month
```

### Phase 2: Production Launch
```
Fly.io:        $1.94/month (1x shared-cpu-1x)
Supabase:      FREE (upgrade if needed)
Total:         ~$2/month ✅
```

### Phase 3: Growth (If Needed)
```
Fly.io:        $3.88/month (2x shared-cpu-2x)
Supabase:      $25/month (Pro - if database grows)
Total:         ~$29/month
```

---

## 📊 Comparison with Alternatives

| Platform | Free Tier | Paid Start | Your Cost |
|----------|-----------|------------|-----------|
| **Fly.io** | ✅ 3 VMs | $1.94/month | **$1.94/month** ✅ |
| **Vercel** | ✅ Unlimited | $20/month | $0 (free tier) |
| **Cloudflare Pages** | ✅ Unlimited | $5/month | $0 (free tier) |
| **Heroku** | ❌ No | $7/month | $7/month |
| **AWS** | ❌ Complex | Variable | $5-20/month |

---

## ✅ Final Recommendation

### Start Here:
1. ✅ **Deploy to Fly.io FREE tier**
2. ✅ **Test everything**
3. ✅ **Use Supabase FREE tier**
4. ✅ **Total: $0/month**

### When Ready for Production:
1. ✅ **Upgrade to $1.94/month** (shared-cpu-1x)
2. ✅ **Always-on, no sleep**
3. ✅ **Fast enough for most apps**

### Total Monthly Cost:
- **Development**: $0 ✅
- **Production**: ~$2/month ✅
- **High Traffic**: ~$29/month (if needed)

---

## 🚀 Next Steps

1. ✅ Deploy to Fly.io (free tier)
2. ✅ Test your app
3. ✅ Monitor usage
4. ✅ Upgrade only if needed

**You can start completely free!** 🎉

---

## 📚 Resources

- Fly.io Pricing: https://fly.io/docs/about/pricing/
- Supabase Pricing: https://supabase.com/pricing
- Fly.io Billing: https://fly.io/docs/app-guides/usage-and-billing/

---

**Bottom Line: Start free, pay $2/month when you go live!** ✅

