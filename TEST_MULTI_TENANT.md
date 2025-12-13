# Test Multi-Tenant System

## ✅ System Ready!

Multi-tenant system is implemented. Each company sees only their own data.

## Test Steps

### Step 1: Clear Old Data (Optional)
If you have old data without company_id, clear localStorage:
```javascript
// In browser console (F12):
localStorage.clear();
location.reload();
```

### Step 2: Initialize Data
The app will automatically initialize data for both companies when you first load.

### Step 3: Test Company A

1. **Login**: `ahmet@companya.com` / `admin123`
2. **You should see**:
   - Company: TechCorp A
   - Units: GM-A, IK-A, TECH-A
   - Strategic Areas: "Dijital Dönüşüm ve İnovasyon", "Müşteri Memnuniyeti"
   - Activities: AI Altyapı Kurulumu, Müşteri Anket Sistemi
   - Budget: Technology investments, Marketing

### Step 4: Test Company B

1. **Logout** from Company A
2. **Login**: `mehmet@companyb.com` / `admin123`
3. **You should see**:
   - Company: Manufacturing B
   - Units: GM-B, PROD-B, QC-B
   - Strategic Areas: "Üretim Verimliliği", "Kalite Yönetimi"
   - Activities: Yeni Üretim Hattı Kurulumu, Kalite Kontrol Sistemi
   - Budget: Machinery & Equipment, Quality Systems

## Verify Data Isolation

### Company A Should NOT See:
- ❌ Company B units
- ❌ Company B strategic areas
- ❌ Company B activities
- ❌ Company B risks

### Company B Should NOT See:
- ❌ Company A units
- ❌ Company A strategic areas
- ❌ Company A activities
- ❌ Company A risks

## Test Users

### Company A (TechCorp A)
- **Admin**: `ahmet@companya.com` / `admin123`
- **Manager**: `ayse@companya.com` / `user123`

### Company B (Manufacturing B)
- **Admin**: `mehmet@companyb.com` / `admin123`
- **Manager**: `fatma@companyb.com` / `user123`

## What to Check

1. ✅ Login with Company A user → See only Company A data
2. ✅ Logout and login with Company B user → See only Company B data
3. ✅ Dashboard shows different data for each company
4. ✅ Strategic Planning shows different hierarchy
5. ✅ Risk Management shows different risks
6. ✅ Budget shows different budgets
7. ✅ Reports show different data

## Troubleshooting

### "I see data from both companies"
- Make sure you cleared localStorage
- Check that users have `companyId` field
- Verify data initializer ran

### "No data showing"
- Check browser console for errors
- Verify data was initialized
- Check that `companyId` matches between user and data

### "Login doesn't work"
- Make sure email is exactly: `ahmet@companya.com` or `mehmet@companyb.com`
- Password is: `admin123`
- Check browser console for errors

---

**✅ Ready to test! Login with different company users to see data isolation!**

