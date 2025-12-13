# pgAdmin: Register Server (Same as Create Server)

## ✅ "Register Server" = "Create Server"

In some pgAdmin versions, it says **"Register Server"** instead of "Create Server". They're the same thing!

## Step-by-Step Instructions

### Step 1: Create Server Group (if needed)
1. **Right-click "Servers"**
2. **"Create" → "Server Group"**
3. **Name:** `Local Servers`
4. **Click "Save"**

### Step 2: Register Server
1. **Right-click your Server Group** (or "Servers" if no group)
2. **Click "Register" → "Server"** ← This is what you see!
3. **Fill in the connection details**

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
1. **Expand "Servers"** → **Your Server Group** (if created) → **"Local PostgreSQL"**
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
  └── Local Servers (Server Group) [optional]
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

## Connection Details Summary

```
Name:     Local PostgreSQL
Host:     localhost
Port:     5432
Username: yigitilseven
Password: (leave EMPTY)
Database: postgres (for connection)
```

## What "Register Server" Means

- **Register** = Add/Connect to an existing PostgreSQL server
- **Create** = Same thing (just different wording)
- Both do the same: connect to your PostgreSQL database

---

**✅ So use "Register Server" - it's the same as "Create Server"!**

