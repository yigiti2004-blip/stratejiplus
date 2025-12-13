# Configure pgAdmin - Step by Step

## Quick Configuration Steps

### Step 1: Open pgAdmin
1. Go to: **http://localhost:5050**
2. Or open from Applications → **pgAdmin 4**

### Step 2: Set Master Password (First Time Only)
- When pgAdmin opens for the first time, it will ask for a **master password**
- This is for pgAdmin security (not PostgreSQL)
- Enter any password you'll remember (e.g., `admin123` or your preferred password)
- Click **"OK"**

### Step 3: Add PostgreSQL Server

1. **In the left sidebar**, find **"Servers"**
2. **Right-click "Servers"** → **"Create"** → **"Server"**

3. **General Tab:**
   ```
   Name: Local PostgreSQL
   ```
   (You can use any name you like)

4. **Connection Tab:**
   ```
   Host name/address: localhost
   Port: 5432
   Maintenance database: postgres
   Username: yigitilseven
   Password: (leave EMPTY - Homebrew default)
   ```
   
   ☑️ **Save password** (optional checkbox)

5. **Click "Save"**

### Step 4: Connect to Your Database

1. **Expand "Servers"** in the left sidebar
2. **Click on "Local PostgreSQL"**
3. **If prompted for password**, leave it empty and click "OK"
4. **You're connected!**

### Step 5: View Your Database

1. **Expand "Local PostgreSQL"**
2. **Expand "Databases"**
3. **Expand "stratejiplus"** ← Your database!
4. **Expand "Schemas"**
5. **Expand "public"**
6. **Click "Tables"**

### You'll See 13 Tables:
- ✅ `users` - User accounts
- ✅ `units` - Organizational units  
- ✅ `strategic_areas` - Strategic planning areas
- ✅ `strategic_objectives` - Objectives
- ✅ `targets` - Targets
- ✅ `indicators` - Performance indicators
- ✅ `risks` - Risk management
- ✅ And 6 more tables...

## View Data

### Method 1: View Table Data
1. **Right-click any table** (e.g., "users")
2. **Select "View/Edit Data"** → **"All Rows"**
3. **See all your data!**

### Method 2: Run SQL Query
1. **Right-click "stratejiplus" database**
2. **Select "Query Tool"**
3. **Type SQL:**
   ```sql
   SELECT * FROM users;
   ```
4. **Click "Execute"** (or press F5)

## Quick SQL Queries

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

### View All Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

## Your Configuration Summary

```
Server Name: Local PostgreSQL
Host: localhost
Port: 5432
Database: stratejiplus
Username: yigitilseven
Password: (empty)
```

## Troubleshooting

### "Connection refused"
→ PostgreSQL not running:
```bash
brew services start postgresql@15
```

### "Password authentication failed"
→ For Homebrew install, password should be **EMPTY**
→ Username should be: `yigitilseven`

### "Database does not exist"
→ Create it:
```sql
CREATE DATABASE stratejiplus;
```

### Can't connect
→ Test connection:
```bash
npm run test-db
```

---

**✅ Configuration Complete!** You can now view and manage your PostgreSQL database in pgAdmin.

