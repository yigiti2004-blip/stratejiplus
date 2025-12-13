# ✅ How to View Your Database in pgAdmin

## You're Connected! Now View Your Data

### Step 1: Navigate to Your Database

1. **Expand "Servers"** → **"Local PostgreSQL"**
2. **Expand "Databases"**
3. **Expand "stratejiplus"** ← Your database!
4. **Expand "Schemas"**
5. **Expand "public"**
6. **Click "Tables"**

### You'll See 13 Tables:
- ✅ `users` - 1 user (admin@stratejiplus.com)
- ✅ `units` - 1 unit (Genel Müdürlük)
- ✅ `strategic_areas`
- ✅ `strategic_objectives`
- ✅ `targets`
- ✅ `indicators`
- ✅ `risks`
- ✅ `revisions`
- ✅ `budget_chapters`
- ✅ `annual_work_plan_items`
- ✅ `risk_action_plans`
- ✅ `risk_monitoring_logs`
- ✅ `risk_projects`

## View Table Data

### Method 1: View All Rows (Easiest)

1. **Right-click on "users" table**
2. **Select "View/Edit Data"** → **"All Rows"**
3. **See your data in a table!**

You'll see:
```
user_id:    admin-001
full_name:  Sistem Yöneticisi
email:      admin@stratejiplus.com
role_id:    admin
status:     aktif
```

### Method 2: Use Query Tool

1. **Right-click "stratejiplus" database**
2. **Select "Query Tool"**
3. **Type SQL:**
   ```sql
   SELECT * FROM users;
   ```
4. **Click "Execute"** (or press F5)
5. **See results below!**

## Quick SQL Queries to Try

### View All Users
```sql
SELECT user_id, full_name, email, role_id, status 
FROM users;
```

### View All Units
```sql
SELECT unit_id, unit_name, unit_code, status 
FROM units;
```

### List All Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Count Records
```sql
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'units', COUNT(*) FROM units;
```

### View Table Structure
```sql
\d users
```

## Edit Data (Optional)

1. **Right-click table** → **"View/Edit Data"** → **"All Rows"**
2. **Click on any cell to edit**
3. **Click "Save"** to save changes

## Tips

- **Refresh:** Right-click database → "Refresh"
- **New Query:** Right-click database → "Query Tool"
- **Export Data:** Right-click table → "Backup" or "Export/Import"
- **View Table Info:** Right-click table → "Properties"

---

**✅ You're all set! You can now view and manage your PostgreSQL database in pgAdmin!**

