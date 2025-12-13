# How to View Your Database in pgAdmin

## Step 1: Open pgAdmin

1. **Open Finder** → **Applications**
2. **Find "pgAdmin 4"**
3. **Double-click to launch**
4. **Wait 30-60 seconds** for it to fully start
5. **Go to:** http://localhost:5050

## Step 2: Connect to PostgreSQL Server

### If you haven't added the server yet:

1. **In pgAdmin left sidebar**, find **"Servers"**
2. **Right-click "Servers"** → **"Create"** → **"Server"**

3. **General Tab:**
   ```
   Name: Local PostgreSQL
   ```

4. **Connection Tab:**
   ```
   Host name/address: localhost
   Port: 5432
   Maintenance database: postgres
   Username: yigitilseven
   Password: (leave EMPTY)
   ```
   ☑️ **Save password** (optional)

5. **Click "Save"**

### If server already exists:

1. **Expand "Servers"** in left sidebar
2. **Click on "Local PostgreSQL"**
3. **Enter password** (if prompted, leave empty)
4. **You're connected!**

## Step 3: View Your Database

1. **Expand "Servers"** → **"Local PostgreSQL"**
2. **Expand "Databases"**
3. **Expand "stratejiplus"** ← Your database!
4. **Expand "Schemas"**
5. **Expand "public"**
6. **Click "Tables"**

### You'll see 13 tables:
- ✅ `users` - 1 user (admin@stratejiplus.com)
- ✅ `units` - 1 unit (Genel Müdürlük)
- ✅ `strategic_areas` - 0 records
- ✅ `strategic_objectives` - 0 records
- ✅ `targets` - 0 records
- ✅ `indicators` - 0 records
- ✅ And 7 more tables...

## Step 4: View Table Data

### Method 1: View All Rows
1. **Right-click on "users" table**
2. **Select "View/Edit Data"** → **"All Rows"**
3. **See your data in a table format!**

You should see:
```
user_id:    admin-001
full_name:  Sistem Yöneticisi
email:      admin@stratejiplus.com
role_id:    admin
status:     aktif
```

### Method 2: Run SQL Query
1. **Right-click "stratejiplus" database**
2. **Select "Query Tool"**
3. **Type SQL:**
   ```sql
   SELECT * FROM users;
   ```
4. **Click "Execute"** (or press F5)

### Method 3: View Table Structure
1. **Right-click "users" table**
2. **Select "Properties"**
3. **Go to "Columns" tab**
4. **See all column definitions**

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

### View All Tables with Counts
```sql
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'units', COUNT(*) FROM units
UNION ALL
SELECT 'strategic_areas', COUNT(*) FROM strategic_areas;
```

### View Table Structure
```sql
\d users
```

## Troubleshooting

### "Connection refused" or Safari can't connect
- **Wait 30-60 seconds** after opening pgAdmin
- pgAdmin takes time to start the web server
- Try refreshing: http://localhost:5050

### "Password authentication failed"
- Password should be **EMPTY** (leave blank)
- Username: `yigitilseven`

### Can't see tables
- Make sure you expanded: Servers → Local PostgreSQL → Databases → stratejiplus → Schemas → public → Tables

### pgAdmin won't start
- Check Activity Monitor for pgAdmin process
- Try restarting: Quit pgAdmin, then reopen
- Or use command line: `psql -U yigitilseven -d stratejiplus`

## What You Should See

### Users Table:
- 1 row: admin@stratejiplus.com

### Units Table:
- 1 row: Genel Müdürlük (GM)

### Other Tables:
- Empty (ready for data from your app)

---

**✅ Once connected, you can view, edit, and manage all your database data in pgAdmin!**

