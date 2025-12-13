# Setup Instructions for StratejiPlus

## Prerequisites

You need to install Node.js first. Here are the options:

### Option 1: Install Node.js via Homebrew (Recommended for macOS)

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

### Option 2: Download Node.js Installer

1. Go to https://nodejs.org/
2. Download the LTS version for macOS
3. Run the installer
4. Restart your terminal

### Option 3: Use nvm (Node Version Manager)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.zshrc

# Install Node.js
nvm install --lts
nvm use --lts
```

## After Installing Node.js

1. **Verify installation:**
```bash
node --version
npm --version
```

2. **Install project dependencies:**
```bash
cd /Users/yigitilseven/Desktop/sp
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

## Accessing the Application

Once the server starts, you'll see output like:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.111:3000/
```

### For Safari:

**Try these URLs in order:**

1. **Primary URL:**
   ```
   http://localhost:3000
   ```

2. **If localhost doesn't work, use your local IP:**
   ```
   http://192.168.1.111:3000
   ```

3. **Or try with explicit IPv4:**
   ```
   http://127.0.0.1:3000
   ```

4. **If Safari still doesn't work, try:**
   ```
   http://0.0.0.0:3000
   ```

### Troubleshooting Safari Issues

If Safari won't open localhost:

1. **Check Safari settings:**
   - Safari → Preferences → Advanced
   - Make sure "Show Develop menu" is enabled

2. **Try a different browser first:**
   - Chrome: `http://localhost:3000`
   - Firefox: `http://localhost:3000`

3. **Check if the server is actually running:**
   ```bash
   lsof -i :3000
   ```

4. **Clear Safari cache:**
   - Safari → Develop → Empty Caches
   - Or Safari → Clear History

5. **Check firewall settings:**
   - System Settings → Network → Firewall
   - Make sure Node.js is allowed

## Default Login

- **Email:** `admin@stratejiplus.com`
- **Password:** `admin123`

## If You Still Have Issues

1. Make sure the terminal shows the server is running
2. Check the exact URL shown in the terminal output
3. Try copying the full URL from the terminal (including `http://`)
4. Make sure no other application is using port 3000

