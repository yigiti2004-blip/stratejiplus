# How to View PostgreSQL Database in pgAdmin

## Quick Access

### Option 1: Open pgAdmin from Applications

1. **Open Finder**
2. **Go to Applications** (or press `Cmd + Shift + A`)
3. **Look for "pgAdmin 4"** or "PostgreSQL" folder
4. **Double-click pgAdmin 4** to launch

### Option 2: Open from Terminal

```bash
# Try opening pgAdmin
open -a "pgAdmin 4"

# Or if installed via Homebrew
open /Applications/pgAdmin\ 4.app
```

### Option 3: Access via Browser

pgAdmin might be running as a web application. Try:
- http://localhost:5050
- http://127.0.0.1:5050

## Connect to Your Database

### First Time Setup

1. **When pgAdmin opens**, you'll see the left sidebar
2. **Right-click "Servers"** → **"Create"** → **"Server"**

3. **General Tab**:
   - Name: `Local PostgreSQL` (or any name you prefer)

4. **Connection Tab**:
   - Host name/address: `localhost`
   - Port: `5432`
   - Maintenance database: `postgres`
   - Username: `yigitilseven` (your system username)
   - Password: (leave empty for local Homebrew install, or your PostgreSQL password if you set one)
   - ☑️ Save password (optional)

5. **Click "Save"**

### Connect to Existing Server

If you already set up a server:
1. **Expand "Servers"** in the left sidebar
2. **Click on your server name** (e.g., "Local PostgreSQL")
3. **Enter password** if prompted
4. **You're connected!**

## View Your Database

1. **Expand your server** (click the arrow)
2. **Expand "Databases"**
3. **Expand "stratejiplus"** (your database)
4. **Expand "Schemas"**
5. **Expand "public"**
6. **Click "Tables"**

You should see 13 tables:
- `annual_work_plan_items`
- `budget_chapters`
- `indicators`
- `revisions`
- `risk_action_plans`
- `risk_monitoring_logs`
- `risk_projects`
- `risks`
- `strategic_areas`
- `strategic_objectives`
- `targets`
- `units`
- `users`

## View Table Data

1. **Right-click on any table** (e.g., "users")
2. **Select "View/Edit Data"** → **"All Rows"**
3. **You'll see all data in that table!**

## Run Queries

1. **Right-click on "stratejiplus" database**
2. **Select "Query Tool"**
3. **Type your SQL query**, for example:
   ```sql
   SELECT * FROM users;
   SELECT * FROM units;
   SELECT * FROM strategic_areas;
   ```
4. **Click "Execute"** (or press F5)

## Quick Commands

### View All Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### View Users
```sql
SELECT user_id, full_name, email, role_id, status 
FROM users;
```

### View Units
```sql
SELECT unit_id, unit_name, unit_code, status 
FROM units;
```

### Count Records
```sql
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'units', COUNT(*) FROM units
UNION ALL
SELECT 'strategic_areas', COUNT(*) FROM strategic_areas;
```

## Troubleshooting

### "Connection refused"
→ PostgreSQL might not be running:
```bash
brew services start postgresql@15
```

### "Password authentication failed"
→ For local Homebrew install, password is usually empty
→ Or try your system username: `yigitilseven`

### "Database does not exist"
→ Create it:
```sql
CREATE DATABASE stratejiplus;
```

### Can't find pgAdmin
→ Install it:
```bash
# Download from: https://www.pgadmin.org/download/
# Or via Homebrew (if available):
brew install --cask pgadmin4
```

## Alternative: Use Command Line (psql)

If you prefer command line:

```bash
# Connect to database
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
psql -U yigitilseven -d stratejiplus

# Then run SQL commands:
\dt                    # List all tables
SELECT * FROM users;   # View users
\q                     # Quit
```

## Your Database Connection Info

- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `stratejiplus`
- **Username**: `yigitilseven`
- **Password**: (empty for local install)

---

**Need help?** Check the connection with:
```bash
npm run test-db
```

