# Enable Database Mode - Step by Step

## Current Status
- ❌ PostgreSQL not installed
- ❌ Database dependencies need installation
- ✅ Frontend is working (using localStorage)

## Step 1: Install PostgreSQL

### macOS (using Homebrew):
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify it's running
brew services list | grep postgresql
```

### Alternative: Download Installer
1. Go to: https://www.postgresql.org/download/macosx/
2. Download PostgreSQL installer
3. Run installer and follow setup wizard
4. Note your password (you'll need it)

## Step 2: Install Node Dependencies

```bash
npm install
```

This installs:
- `pg` - PostgreSQL driver
- `express` - API server
- `cors` - CORS middleware
- `bcryptjs` - Password hashing

## Step 3: Set Up Database in pgAdmin

1. **Open pgAdmin** (comes with PostgreSQL installation)

2. **Connect to Server**:
   - Right-click "Servers" → "Create" → "Server"
   - General tab: Name = `Local PostgreSQL`
   - Connection tab:
     - Host: `localhost`
     - Port: `5432`
     - Username: `postgres`
     - Password: (your PostgreSQL password)
   - Click "Save"

3. **Create Database**:
   - Right-click "Databases" → "Create" → "Database"
   - Name: `stratejiplus`
   - Owner: `postgres`
   - Click "Save"

4. **Import Schema**:
   - Right-click `stratejiplus` database → "Query Tool"
   - File → Open → Select `database/postgres_schema.sql`
   - Click "Execute" (F5) or play button
   - Should see "Success" message

## Step 4: Configure Database Connection

Edit `database/config.js`:
```javascript
export const dbConfig = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'YOUR_POSTGRES_PASSWORD', // ← Update this!
  database: 'stratejiplus',
  // ... rest stays the same
};
```

## Step 5: Test Database Connection

```bash
npm run test-db
```

Should see:
```
✅ Successfully connected to PostgreSQL database!
📊 Found X tables:
  - units
  - users
  ...
```

## Step 6: Create Admin User

```bash
npm run migrate
```

Creates:
- Default unit: `unit-001`
- Admin user: `admin@stratejiplus.com` / `admin123`

## Step 7: Start API Server

In a **new terminal**:
```bash
npm run server
```

Should see:
```
🚀 StratejiPlus API Server running on http://localhost:3001
```

## Step 8: Verify Everything Works

1. **Check API health**:
   ```bash
   curl http://localhost:3001/health
   ```

2. **Frontend will automatically use database** when API is running

3. **Test in browser**:
   - Open: http://localhost:3000
   - Login: `admin@stratejiplus.com` / `admin123`
   - Data should now come from PostgreSQL!

## Troubleshooting

### "PostgreSQL not found"
→ Install PostgreSQL first (Step 1)

### "Cannot connect to database"
→ Check PostgreSQL is running: `brew services list`
→ Verify password in `database/config.js`
→ Check database `stratejiplus` exists in pgAdmin

### "Table doesn't exist"
→ Make sure you imported `postgres_schema.sql` in pgAdmin

### "Port 5432 already in use"
→ PostgreSQL is already running (good!)
→ Or another service is using it

### "API server won't start"
→ Check database connection first: `npm run test-db`
→ Make sure port 3001 is free
→ Check for errors in terminal

## Quick Commands Reference

```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Install dependencies
npm install

# Test database
npm run test-db

# Create admin user
npm run migrate

# Start API server
npm run server

# Check system status
node check-system.js
```

