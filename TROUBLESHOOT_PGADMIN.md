# Troubleshooting pgAdmin Connection

## Common Issues and Solutions

### Issue 1: "Connection refused" or "Server doesn't listen"

**Check if PostgreSQL is running:**
```bash
brew services list | grep postgresql
```

**If not running, start it:**
```bash
brew services start postgresql@15
```

### Issue 2: "Password authentication failed"

**For Homebrew PostgreSQL:**
- Username should be: `yigitilseven` (your system username)
- Password should be: **EMPTY** (leave blank, don't type anything)
- Just click OK if prompted

### Issue 3: "Database does not exist"

**Check if database exists:**
```bash
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
psql -U yigitilseven -d postgres -c "\l" | grep stratejiplus
```

**If it doesn't exist, create it:**
```bash
psql -U yigitilseven -d postgres -c "CREATE DATABASE stratejiplus;"
```

### Issue 4: "FATAL: role does not exist"

**Check your username:**
```bash
whoami
```

Use this username in pgAdmin connection (should be `yigitilseven`)

### Issue 5: Wrong port

**Check PostgreSQL port:**
```bash
lsof -ti:5432
```

Should show a process. If not, PostgreSQL isn't running.

## Correct Connection Settings

```
Host: localhost
Port: 5432
Maintenance database: postgres
Username: yigitilseven
Password: (leave EMPTY - don't type anything)
```

## Test Connection from Command Line

```bash
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
psql -U yigitilseven -d postgres
```

If this works, PostgreSQL is fine - the issue is with pgAdmin settings.

## pgAdmin Specific Issues

### "Server registration failed"
- Make sure you're using the correct username: `yigitilseven`
- Password should be empty
- Try unchecking "Save password" first

### Can't see databases after connecting
- Make sure you expand: Servers → Your Server → Databases
- The database `stratejiplus` should be there

### Connection times out
- Check if PostgreSQL is running
- Check firewall settings
- Try connecting from command line first

## Step-by-Step Debugging

1. **Test PostgreSQL from command line:**
   ```bash
   psql -U yigitilseven -d postgres
   ```
   If this works, PostgreSQL is fine.

2. **Check if database exists:**
   ```bash
   psql -U yigitilseven -d postgres -c "\l" | grep stratejiplus
   ```

3. **Test your app's database connection:**
   ```bash
   npm run test-db
   ```

4. **If all above work, pgAdmin settings might be wrong:**
   - Double-check username: `yigitilseven`
   - Make sure password is EMPTY
   - Try deleting and re-registering the server

## Alternative: Use Command Line

If pgAdmin keeps having issues, use command line:

```bash
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
psql -U yigitilseven -d stratejiplus
```

Then run:
```sql
\dt                    -- List tables
SELECT * FROM users;   -- View users
```

