# ✅ Exact pgAdmin Settings (Verified Working)

## Your PostgreSQL is Working! ✅
- PostgreSQL is running
- Database `stratejiplus` exists
- Connection works from command line

## Exact Settings for pgAdmin

### Step 1: Register Server

1. **Right-click "Servers"** (or your Server Group)
2. **"Register" → "Server"**

### Step 2: General Tab

```
Name: Local PostgreSQL
```

(That's it - just the name)

### Step 3: Connection Tab

**IMPORTANT - Use these EXACT values:**

```
Host name/address: localhost
Port: 5432
Maintenance database: postgres
Username: yigitilseven
Password: (LEAVE COMPLETELY EMPTY - don't type anything!)
```

**DO NOT:**
- ❌ Type anything in password field
- ❌ Use "postgres" as username
- ❌ Use any password

**DO:**
- ✅ Leave password field completely empty
- ✅ Use username: `yigitilseven`
- ✅ Use database: `postgres` (for connection, not stratejiplus)

### Step 4: Advanced Tab (Optional)

Leave as default - don't change anything

### Step 5: Save

- Click **"Save"**
- If it asks for password, just click **"OK"** (leave empty)

## Common Mistakes

### ❌ Wrong Username
- Don't use: `postgres`
- Use: `yigitilseven` (your system username)

### ❌ Password Field
- Don't type anything
- Don't use: `postgres`, `admin`, or any password
- Leave it completely empty

### ❌ Wrong Database for Connection
- Don't use: `stratejiplus` (for connection)
- Use: `postgres` (for connection)
- You'll see `stratejiplus` after connecting

## After Connecting

1. **Expand "Servers"** → **"Local PostgreSQL"**
2. **Expand "Databases"**
3. **You'll see:**
   - `postgres` (system database)
   - `stratejiplus` ← Your database!
4. **Expand "stratejiplus"**
5. **Expand "Schemas"** → **"public"** → **"Tables"**
6. **See all 13 tables!**

## If It Still Doesn't Work

### Try This Test First:
```bash
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
psql -U yigitilseven -d postgres
```

If this works, PostgreSQL is fine - the issue is pgAdmin settings.

### Check pgAdmin Error Message

What exact error do you see?
- "Connection refused" → PostgreSQL not running (but it is!)
- "Password authentication failed" → Wrong username or password field not empty
- "Database does not exist" → Wrong database name (use `postgres` for connection)
- "Role does not exist" → Wrong username (use `yigitilseven`)

## Verified Working Settings

```
✅ Host: localhost
✅ Port: 5432
✅ Username: yigitilseven
✅ Password: (empty)
✅ Database: postgres (for connection)
```

---

**These settings are verified to work! Use them exactly as shown.**

