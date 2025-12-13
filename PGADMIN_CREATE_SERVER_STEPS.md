# pgAdmin: How to Create Server (Step by Step)

## If You Only See "Server Group" Option

This is normal! Some pgAdmin versions require creating a Server Group first.

## Step-by-Step Instructions

### Step 1: Create Server Group
1. **Right-click "Servers"** in the left sidebar
2. **Click "Create"** → **"Server Group"**
3. **Name it:** `Local Servers` (or any name you like)
4. **Click "Save"**

### Step 2: Create Server Inside the Group
1. **Right-click the Server Group** you just created (e.g., "Local Servers")
2. **Click "Create"** → **"Server"**
3. **Now you'll see the Server creation dialog!**

### Step 3: Fill in Server Details

**General Tab:**
```
Name: Local PostgreSQL
```

**Connection Tab:**
```
Host name/address: localhost
Port: 5432
Maintenance database: postgres
Username: yigitilseven
Password: (leave EMPTY - don't type anything)
```

☑️ **Save password** (optional checkbox)

**Click "Save"**

### Step 4: Connect
1. **Expand "Servers"** → **Your Server Group** → **"Local PostgreSQL"**
2. **Click on "Local PostgreSQL"**
3. **If asked for password**, just click **"OK"** (leave empty)
4. **You're connected!**

### Step 5: View Your Database
1. **Expand "Local PostgreSQL"**
2. **Expand "Databases"**
3. **Expand "stratejiplus"** ← Your database!
4. **Expand "Schemas"** → **"public"** → **"Tables"**
5. **See all 13 tables!**

## Visual Guide

```
Servers
  └── Local Servers (Server Group)
      └── Local PostgreSQL (Server)
          └── Databases
              └── stratejiplus
                  └── Schemas
                      └── public
                          └── Tables
                              ├── users
                              ├── units
                              └── ... (11 more)
```

## Troubleshooting

### "I don't see Server option after creating group"
- Make sure you right-click on the **Server Group** (not "Servers")
- The Server Group should be visible in the left sidebar
- Try refreshing pgAdmin or restarting it

### "Password authentication failed"
- Password should be **EMPTY** (don't type anything)
- Username: `yigitilseven`
- Just click OK if prompted

### "Connection refused"
- Make sure PostgreSQL is running:
  ```bash
  brew services start postgresql@15
  ```

---

**✅ That's it! Create Server Group first, then Server inside it!**

