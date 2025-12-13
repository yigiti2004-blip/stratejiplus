# 🚀 QUICK START - Get Your App Running

## ⚠️ IMPORTANT: You Need Node.js First!

The app **cannot run** without Node.js installed. Here's how to fix this:

## Step 1: Install Node.js

### Option A: Using Homebrew (Easiest)
```bash
# If you don't have Homebrew, install it first:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install Node.js:
brew install node
```

### Option B: Download Installer (Simplest)
1. Go to: **https://nodejs.org/**
2. Click "Download Node.js (LTS)" - the green button
3. Run the downloaded `.pkg` file
4. Follow the installer
5. **RESTART YOUR TERMINAL** after installation

### Option C: Using nvm
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.zshrc
nvm install --lts
```

## Step 2: Verify Installation

Open a **NEW terminal window** and run:
```bash
node --version
npm --version
```

You should see version numbers. If you see "command not found", Node.js isn't installed correctly.

## Step 3: Install Dependencies

```bash
cd /Users/yigitilseven/Desktop/sp
npm install
```

This will take a few minutes the first time.

## Step 4: Start the Server

```bash
npm run dev
```

You should see output like:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.111:3000/
```

## Step 5: Open in Safari

**Copy the EXACT URL from the terminal** (it will show you the full URL)

Or try these in Safari:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://192.168.1.111:3000` (use the IP shown in your terminal)

## 🔍 Troubleshooting

### "Command not found: node"
→ Node.js is not installed. Follow Step 1 above.

### "Port 3000 is already in use"
→ Another app is using port 3000. Either:
- Stop the other app
- Or change the port in `package.json` from `3000` to `3001`

### Safari won't open the URL
1. Make sure the server is actually running (check terminal)
2. Try Chrome or Firefox first to confirm it works
3. In Safari: Safari → Preferences → Advanced → Enable "Show Develop menu"
4. Try `http://127.0.0.1:3000` instead of `localhost`

### "npm install" fails
→ Make sure you have internet connection and try again.

## 📝 Default Login

Once the app opens:
- **Email:** `admin@stratejiplus.com`
- **Password:** `admin123`

---

**Still having issues?** Make sure:
1. ✅ Node.js is installed (`node --version` works)
2. ✅ Dependencies are installed (`npm install` completed)
3. ✅ Server is running (`npm run dev` shows a URL)
4. ✅ You're using the EXACT URL from the terminal

