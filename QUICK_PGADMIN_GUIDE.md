# Quick Guide: View PostgreSQL in pgAdmin

## Step 1: Install pgAdmin (if not installed)

### Option A: Download Installer (Recommended)
1. Go to: **https://www.pgadmin.org/download/**
2. Download **pgAdmin 4** for macOS
3. Install the `.dmg` file
4. Move pgAdmin to Applications folder

### Option B: Install via Homebrew
```bash
brew install --cask pgadmin4
```

## Step 2: Open pgAdmin

### Method 1: From Applications
1. Open **Finder**
2. Press `Cmd + Shift + A` (or go to Applications)
3. Find **"pgAdmin 4"**
4. Double-click to open

### Method 2: From Terminal
```bash
open -a "pgAdmin 4"
```

### Method 3: Web Interface
pgAdmin might open in your browser automatically at:
- http://localhost:5050

## Step 3: Connect to PostgreSQL

### First Connection Setup

1. **In pgAdmin**, you'll see the left sidebar
2. **Right-click "Servers"** → **"Create"** → **"Server"**

3. **General Tab**:
   ```
   Name: Local PostgreSQL
   ```

4. **Connection Tab**:
   ```
   Host name/address: localhost
   Port: 5432
   Maintenance database: postgres
   Username: yigitilseven
   Password: (leave empty - Homebrew default)
   ```
   ☑️ **Save password** (optional)

5. **Click "Save"**

## Step 4: View Your Database

1. **Expand "Servers"** → **"Local PostgreSQL"**
2. **Expand "Databases"**
3. **Expand "stratejiplus"** ← Your database!
4. **Expand "Schemas"** → **"public"**
5. **Click "Tables"**

### You'll see 13 tables:
- ✅ `users` - Your user accounts
- ✅ `units` - Organizational units
- ✅ `strategic_areas` - Strategic planning areas
- ✅ `strategic_objectives` - Objectives
- ✅ `targets` - Targets
- ✅ `indicators` - Performance indicators
- ✅ And more...

## Step 5: View Data

### View Table Data:
1. **Right-click any table** (e.g., "users")
2. **Select "View/Edit Data"** → **"All Rows"**
3. **See all your data!**

### Run SQL Queries:
1. **Right-click "stratejiplus" database**
2. **Select "Query Tool"**
3. **Type SQL**, for example:
   ```sql
   SELECT * FROM users;
   SELECT * FROM units;
   ```
4. **Click "Execute"** (F5)

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

### Count All Records
```sql
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'units', COUNT(*) FROM units
UNION ALL SELECT 'strategic_areas', COUNT(*) FROM strategic_areas;
```

## Your Connection Details

```
Host: localhost
Port: 5432
Database: stratejiplus
Username: yigitilseven
Password: (empty)
```

## Troubleshooting

### "Connection refused"
PostgreSQL not running:
```bash
brew services start postgresql@15
```

### "Password authentication failed"
- For Homebrew install, password is usually **empty**
- Username should be: `yigitilseven` (your system username)

### "Database does not exist"
Create it:
```sql
CREATE DATABASE stratejiplus;
```

### Can't find pgAdmin
Install it:
```bash
brew install --cask pgadmin4
```

## Alternative: Command Line (psql)

If you prefer terminal:

```bash
# Connect
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
psql -U yigitilseven -d stratejiplus

# Commands:
\dt              # List tables
SELECT * FROM users;  # View data
\q               # Quit
```

---

**Need help?** Test your connection:
```bash
npm run test-db
```

