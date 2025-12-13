# Troubleshooting: App Not Loading

## If you only see "Hostinger Horizons" or blank page:

### Step 1: Check Browser Console for Errors

**In Safari:**
1. Safari → Preferences → Advanced
2. Enable "Show Develop menu in menu bar"
3. Develop → Show JavaScript Console (or press Cmd+Option+C)
4. Look for any red error messages

**In Chrome/Firefox:**
- Press F12 or Cmd+Option+I
- Click the "Console" tab
- Look for red error messages

### Step 2: Common Issues

#### Issue: "Cannot find module" or import errors
**Solution:** The server might need to be restarted. Stop it (Ctrl+C) and run `npm run dev` again.

#### Issue: Blank white page
**Solution:** 
1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Clear browser cache
3. Check console for errors

#### Issue: "Failed to load resource"
**Solution:** Make sure the dev server is running. Check terminal for errors.

### Step 3: Verify Server is Running

In your terminal, you should see:
```
VITE v4.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

If you see errors in the terminal, share them.

### Step 4: Try Different Browser

Sometimes Safari has issues. Try:
- Chrome: `http://localhost:3000`
- Firefox: `http://localhost:3000`

### Step 5: Check Network Tab

1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Refresh the page
4. Look for failed requests (red items)
5. Check if `/src/main.jsx` is loading (should be 200 status)

### Step 6: Restart Everything

1. Stop the server (Ctrl+C in terminal)
2. Clear browser cache
3. Restart server: `npm run dev`
4. Hard refresh browser: Cmd+Shift+R

## What Should You See?

When the app loads correctly, you should see:
- A login page with "StratejiPlus" title
- Email and password fields
- Blue "Giriş Yap" button
- Dark background

If you're seeing something else, check the console for errors!

