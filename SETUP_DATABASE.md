# PostgreSQL Database Setup Guide (pgAdmin)

## Step 1: Install PostgreSQL

### macOS (using Homebrew):
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Or download from:
https://www.postgresql.org/download/

## Step 2: Install Dependencies

```bash
npm install
```

This will install:
- `pg` - PostgreSQL database driver
- `express` - API server
- `cors` - CORS middleware
- `bcryptjs` - Password hashing

## Step 3: Set Up Database in pgAdmin

1. **Open pgAdmin**
   - Usually at: `http://localhost/pgadmin` or open pgAdmin application

2. **Connect to PostgreSQL Server**
   - Right-click "Servers" → "Create" → "Server"
   - General tab:
     - Name: `Local PostgreSQL`
   - Connection tab:
     - Host: `localhost`
     - Port: `5432`
     - Username: `postgres`
     - Password: (your PostgreSQL password)
   - Click "Save"

3. **Create Database**
   - Right-click "Databases" → "Create" → "Database"
   - Database name: `stratejiplus`
   - Owner: `postgres`
   - Encoding: `UTF8`
   - Click "Save"

4. **Import Schema**
   - Right-click `stratejiplus` database → "Query Tool"
   - Open file: `database/postgres_schema.sql`
   - Click "Execute" (F5) or click the play button

## Step 4: Configure Database Connection

1. **Edit `database/config.js`** with your PostgreSQL credentials:
   ```javascript
   export const dbConfig = {
     host: 'localhost',
     port: 5432,
     user: 'postgres',              // Your PostgreSQL username
     password: 'your_password',     // Your PostgreSQL password
     database: 'stratejiplus',
     // ... rest stays the same
   };
   ```

## Step 5: Test Database Connection

```bash
npm run test-db
```

You should see:
```
✅ Successfully connected to PostgreSQL database!
📊 Found X tables:
  - units
  - users
  - strategic_areas
  ...
```

## Step 6: Create Default Admin User

```bash
npm run migrate
```

This creates:
- Default unit: `unit-001` (Genel Müdürlük)
- Admin user: `admin@stratejiplus.com` / `admin123`

## Step 7: Start API Server

In a **new terminal window**:

```bash
npm run server
```

You should see:
```
🚀 StratejiPlus API Server running on http://localhost:3001
📊 Health check: http://localhost:3001/health
```

## Step 8: Start Frontend

In **another terminal window**:

```bash
npm run dev
```

The frontend will automatically connect to the PostgreSQL database via the API.

## How It Works

- **Frontend** → Uses `dbService.js` to call API
- **API Server** → Connects to PostgreSQL database
- **PostgreSQL** → Stores all data
- **Fallback** → If API is unavailable, falls back to localStorage

## Troubleshooting

### "Cannot connect to database"
- Check PostgreSQL is running: `brew services list` (macOS) or check service status
- Verify credentials in `database/config.js`
- Test connection: `npm run test-db`
- Check PostgreSQL is listening: `lsof -i :5432`

### "Database does not exist"
- Make sure you created `stratejiplus` database in pgAdmin
- Check database name in `config.js` matches

### "Table doesn't exist"
- Make sure you executed `postgres_schema.sql` in pgAdmin Query Tool
- Check you're connected to the correct database

### "API not responding"
- Make sure API server is running: `npm run server`
- Check port 3001 is not in use
- Verify health endpoint: `http://localhost:3001/health`

### "Permission denied"
- Check PostgreSQL user has permissions
- Default user `postgres` should have all permissions
- If using different user, grant permissions:
  ```sql
  GRANT ALL PRIVILEGES ON DATABASE stratejiplus TO your_username;
  ```

## PostgreSQL vs MySQL Differences

- **Port**: 5432 (PostgreSQL) vs 3306 (MySQL)
- **Parameter placeholders**: `$1, $2, $3` (PostgreSQL) vs `?, ?, ?` (MySQL)
- **JSON**: `JSONB` type (PostgreSQL) vs `JSON` type (MySQL)
- **Auto-increment**: Uses `SERIAL` or `GENERATED ALWAYS AS` (PostgreSQL)

## API Endpoints

Available endpoints:
- `GET /health` - Health check
- `GET /api/users` - Get all users
- `GET /api/units` - Get all units
- `GET /api/strategic-areas` - Get strategic areas
- `GET /api/strategic-objectives` - Get objectives
- `GET /api/targets` - Get targets
- `GET /api/indicators` - Get indicators
- `GET /api/activities` - Get activities
- `GET /api/budget-chapters` - Get budget chapters
- `GET /api/expenses` - Get expenses
- `GET /api/risks` - Get risks
- `GET /api/activity-monitoring-records` - Get monitoring records
- `GET /api/revisions` - Get revisions

## Next Steps

1. ✅ PostgreSQL installed
2. ✅ Database schema imported
3. ✅ API server running
4. ✅ Frontend connected
5. 🔄 Migrate existing localStorage data (optional)
6. 🔄 Add more API endpoints as needed
7. 🔄 Implement authentication middleware
8. 🔄 Add data validation

## Quick Commands

```bash
# Test database connection
npm run test-db

# Create admin user
npm run migrate

# Start API server
npm run server

# Start frontend
npm run dev
```
