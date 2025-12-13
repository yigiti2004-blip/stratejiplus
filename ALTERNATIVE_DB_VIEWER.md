# Alternative: View Database Without pgAdmin

Since pgAdmin is having connection issues, here are alternatives:

## Option 1: Use Command Line (psql) - Works Now!

```bash
# Connect to your database
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
psql -U yigitilseven -d stratejiplus
```

### Useful Commands:
```sql
\dt                    -- List all tables
\d users               -- Describe users table
SELECT * FROM users;   -- View all users
SELECT * FROM units;   -- View all units
\q                     -- Quit
```

## Option 2: Install DBeaver (Free, Works Great!)

```bash
brew install --cask dbeaver-community
```

Then:
1. Open DBeaver
2. New Connection → PostgreSQL
3. Use these settings:
   - Host: `localhost`
   - Port: `5432`
   - Database: `stratejiplus`
   - Username: `yigitilseven`
   - Password: (empty)
4. Test Connection → Finish

## Option 3: Install TablePlus (Beautiful UI)

```bash
brew install --cask tableplus
```

Then:
1. Open TablePlus
2. Create New → PostgreSQL
3. Use same connection details as above

## Option 4: Use Your App's API

Your app already has an API running! Check:

```bash
# View users via API
curl http://localhost:3001/api/users

# View health
curl http://localhost:3001/health
```

## Quick Test - Verify Database Works

```bash
npm run test-db
```

If this works, your database is fine - just pgAdmin has issues.

---

**Recommendation**: Use **DBeaver** or **psql** command line - both work reliably!

