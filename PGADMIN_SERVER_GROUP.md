# pgAdmin: Server Group vs Server

## ✅ Both Options Are Fine!

### Option 1: Create Server Group First (Optional)
1. **Right-click "Servers"** → **"Create"** → **"Server Group"**
2. **Name it:** `Local Servers` (or any name)
3. **Then right-click the group** → **"Create"** → **"Server"**

### Option 2: Create Server Directly (Simpler - Recommended)
1. **Right-click "Servers"** → **"Create"** → **"Server"**
2. **Skip the server group** - just create the server directly

## ✅ Recommended: Create Server Directly

**Just do this:**
1. **Right-click "Servers"** → **"Create"** → **"Server"**
2. **Use these settings:**

   **General Tab:**
   ```
   Name: Local PostgreSQL
   ```

   **Connection Tab:**
   ```
   Host: localhost
   Port: 5432
   Username: yigitilseven
   Password: (leave EMPTY)
   Database: postgres
   ```

3. **Click "Save"**

That's it! No need for server group unless you want to organize multiple servers.

## What's the Difference?

- **Server Group**: Just a folder to organize multiple servers (optional)
- **Server**: The actual PostgreSQL connection (required)

**You only need the Server!** The group is just for organization if you have many servers.

---

**✅ So yes, creating a server group is OK, but you can skip it and create the server directly!**

