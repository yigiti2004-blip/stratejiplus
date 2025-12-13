# Quick Start: Enable Database Mode

## ✅ What's Done
- ✅ Node dependencies installed (`pg`, `express`, etc.)
- ✅ PostgreSQL installed via Homebrew
- ✅ PostgreSQL service started

## 🔧 Next Steps

### Option 1: Use pgAdmin (Recommended - Visual)

1. **Open pgAdmin** (search for "pgAdmin" in Applications)

2. **Connect to Server**:
   - First time: It will ask for a master password (set one)
   - Then connect to "PostgreSQL 15" server
   - Password: (the password you set during PostgreSQL installation, or default might be empty)

3. **Create Database**:
   - Right-click "Databases" → "Create" → "Database"
   - Name: `stratejiplus`
   - Click "Save"

4. **Import Schema**:
   - Right-click `stratejiplus` → "Query Tool"
   - File → Open → Select `database/postgres_schema.sql`
   - Click "Execute" (F5)

5. **Update Config**:
   - Edit `database/config.js`
   - Set your PostgreSQL password:
     ```javascript
     password: 'your_postgres_password',
     ```

6. **Test Connection**:
   ```bash
   npm run test-db
   ```

7. **Create Admin User**:
   ```bash
   npm run migrate
   ```

8. **Start API Server**:
   ```bash
   npm run server
   ```

### Option 2: Use Command Line

1. **Set PostgreSQL password** (if not set):
   ```bash
   export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
   psql -U postgres
   # Then in psql:
   ALTER USER postgres PASSWORD 'your_password';
   \q
   ```

2. **Run setup script**:
   ```bash
   bash setup-database.sh
   ```

3. **Update config** with your password:
   ```bash
   # Edit database/config.js
   password: 'your_password',
   ```

4. **Test & Start**:
   ```bash
   npm run test-db
   npm run migrate
   npm run server
   ```

## 🎯 Quick Commands

```bash
# Test database connection
npm run test-db

# Create admin user
npm run migrate

# Start API server (in new terminal)
npm run server

# Check system status
node check-system.js
```

## 🔍 Verify It's Working

1. **API Server Running**:
   ```bash
   curl http://localhost:3001/health
   ```
   Should return: `{"status":"ok","database":"connected"}`

2. **Frontend Using Database**:
   - Open: http://localhost:3000
   - Login: `admin@stratejiplus.com` / `admin123`
   - Data should come from PostgreSQL now!

## ⚠️ Common Issues

### "Password authentication failed"
→ Update password in `database/config.js`
→ Or set password: `psql -U postgres -c "ALTER USER postgres PASSWORD 'newpass';"`

### "Database does not exist"
→ Create it in pgAdmin or: `psql -U postgres -c "CREATE DATABASE stratejiplus;"`

### "Table doesn't exist"
→ Import schema: Run `postgres_schema.sql` in pgAdmin Query Tool

### "Connection refused"
→ PostgreSQL not running: `brew services start postgresql@15`

