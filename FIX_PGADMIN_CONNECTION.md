# Fix pgAdmin Connection Issue

## Problem: Safari Cannot Connect to Server

This usually means pgAdmin isn't running or hasn't started yet.

## Solutions

### Solution 1: Start pgAdmin Manually

1. **Open Finder**
2. **Go to Applications** (Cmd + Shift + A)
3. **Find "pgAdmin 4"**
4. **Double-click to launch**
5. **Wait 10-30 seconds** for it to start
6. **Then try:** http://localhost:5050

### Solution 2: Check if pgAdmin is Running

```bash
# Check if pgAdmin is running
lsof -ti:5050

# If nothing shows, pgAdmin is not running
```

### Solution 3: Start pgAdmin from Terminal

```bash
open -a "pgAdmin 4"
```

Wait 10-30 seconds, then try: http://localhost:5050

### Solution 4: Check pgAdmin Logs

pgAdmin logs are usually at:
```
~/Library/Application Support/pgAdmin/pgadmin4.log
```

### Solution 5: Alternative - Use Command Line (psql)

If pgAdmin won't start, you can use command line:

```bash
# Connect to database
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
psql -U yigitilseven -d stratejiplus

# Then run SQL commands:
\dt                    # List all tables
SELECT * FROM users;   # View users
\q                     # Quit
```

### Solution 6: Reinstall pgAdmin

If pgAdmin won't start at all:

```bash
# Uninstall
brew uninstall --cask pgadmin4

# Reinstall
brew install --cask pgadmin4

# Then open
open -a "pgAdmin 4"
```

## Common Issues

### Issue 1: "Connection Refused"
- **Cause**: pgAdmin not running
- **Fix**: Start pgAdmin from Applications

### Issue 2: Port 5050 Already in Use
- **Cause**: Another instance running
- **Fix**: Kill existing process:
  ```bash
  kill $(lsof -ti:5050)
  ```

### Issue 3: pgAdmin Takes Too Long to Start
- **Cause**: First launch can take 30-60 seconds
- **Fix**: Wait patiently, check Activity Monitor

### Issue 4: Safari Can't Connect
- **Cause**: pgAdmin web server not started
- **Fix**: Make sure pgAdmin app is fully launched (check dock)

## Verify pgAdmin is Running

1. **Check Dock** - pgAdmin icon should be visible
2. **Check Activity Monitor** - Look for "pgAdmin" process
3. **Check Port**:
   ```bash
   lsof -ti:5050
   ```
   Should show a process ID if running

## Alternative: Use DBeaver or TablePlus

If pgAdmin continues to have issues:

### DBeaver (Free)
```bash
brew install --cask dbeaver-community
```

### TablePlus (Free trial)
```bash
brew install --cask tableplus
```

Both can connect to PostgreSQL with the same credentials.

## Quick Test

Test if PostgreSQL is accessible (this should work even if pgAdmin doesn't):

```bash
npm run test-db
```

If this works, PostgreSQL is fine - the issue is just with pgAdmin.

---

**Need help?** Check if PostgreSQL is running:
```bash
brew services list | grep postgresql
```

