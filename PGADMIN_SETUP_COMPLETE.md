# ✅ pgAdmin Setup - Complete Guide

## Your Database Connection Details

```
Server Name: Local PostgreSQL
Host:        localhost
Port:        5432
Database:    stratejiplus
Username:    yigitilseven
Password:    (leave EMPTY - just press OK)
```

## Step-by-Step: Connect to pgAdmin

### Step 1: Open pgAdmin
1. **Open Finder** → **Applications**
2. **Find "pgAdmin 4"**
3. **Double-click to launch**
4. **Wait 30-60 seconds** for it to start
5. **Browser will open** or go to: **http://localhost:5050**

### Step 2: Set Master Password (First Time Only)
- When pgAdmin opens, it will ask for a **master password**
- This is for pgAdmin security (NOT PostgreSQL)
- Enter any password you'll remember
- Click **"OK"**

### Step 3: Add PostgreSQL Server

1. **In the left sidebar**, find **"Servers"**
2. **Right-click "Servers"** → **"Create"** → **"Server"**

3. **General Tab:**
   ```
   Name: Local PostgreSQL
   ```
   (You can use any name)

4. **Connection Tab:**
   ```
   Host name/address: localhost
   Port: 5432
   Maintenance database: postgres
   Username: yigitilseven
   Password: (leave EMPTY - don't type anything)
   ```
   
   ☑️ **Save password** (optional - check this box)

5. **Click "Save"**

### Step 4: Connect to Your Database

1. **Expand "Servers"** in left sidebar
2. **Click on "Local PostgreSQL"**
3. **If asked for password**, just click **"OK"** (leave empty)
4. **You're connected!**

### Step 5: View Your Database

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
- ✅ And 7 more tables...

## View Data in pgAdmin

### Method 1: View Table Data (Easiest)
1. **Right-click on "users" table**
2. **Select "View/Edit Data"** → **"All Rows"**
3. **See your data in a nice table!**

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
4. **Click "Execute"** (or press **F5**)
5. **See results below!**

### Method 3: View Table Structure
1. **Right-click "users" table**
2. **Select "Properties"**
3. **Go to "Columns" tab**
4. **See all column definitions**

## Quick SQL Queries to Try

Copy and paste these in Query Tool:

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

## Troubleshooting

### "Connection refused" or Safari can't connect
- **Wait 30-60 seconds** after opening pgAdmin
- pgAdmin takes time to start the web server
- Try refreshing: http://localhost:5050
- Check if pgAdmin icon is in your Dock

### "Password authentication failed"
- Password should be **EMPTY** (don't type anything)
- Username: `yigitilseven`
- Just click OK if prompted

### "Database does not exist"
- Make sure you're connecting to `postgres` first
- Then expand to see `stratejiplus` database

### Can't see tables
- Make sure you expanded: Servers → Local PostgreSQL → Databases → stratejiplus → Schemas → public → Tables

## What You Should See

### Users Table (1 record):
- user_id: admin-001
- full_name: Sistem Yöneticisi
- email: admin@stratejiplus.com
- role_id: admin
- status: aktif

### Units Table (1 record):
- unit_id: unit-001
- unit_name: Genel Müdürlük
- unit_code: GM
- status: aktif

---

**✅ Once connected, you can view, edit, and manage all your PostgreSQL database in pgAdmin!**

