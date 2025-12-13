# 🧪 Quick Test Guide

## Test Multi-Tenant System

### 1. Clear Old Data (if needed)
Open browser console (F12) and run:
```javascript
localStorage.clear();
location.reload();
```

### 2. Test Company A
- **Login**: `ahmet@companya.com` / `admin123`
- **Should see**: TechCorp A data (Technology, AI projects)

### 3. Test Company B  
- **Logout**, then **Login**: `mehmet@companyb.com` / `admin123`
- **Should see**: Manufacturing B data (Production, Quality)

## ✅ Success Criteria
- Each company sees ONLY their data
- No data mixing between companies
- Dashboard shows different content per company

