# 🔍 Browser Console Commands - Working Methods

## ⚠️ Note: `import.meta` doesn't work in console

Use these methods instead:

---

## ✅ Method 1: Check Network Requests (Easiest)

### Step 1: Open Network Tab
1. **Press:** `F12` (or `Cmd+Option+I` on Mac)
2. **Click:** "Network" tab
3. **Refresh the page** (F5 or Cmd+R)

### Step 2: Look for Supabase Requests
- **Filter by:** Type "supabase" in the filter box
- **Look for:** Requests to `https://xxxxx.supabase.co`

**What to see:**
- ✅ **If you see requests to Supabase** → App is trying to connect!
- ❌ **If no Supabase requests** → App is using localStorage only

---

## ✅ Method 2: Check Window Object

**Paste this in console:**
```javascript
// Check if Supabase is in window object
console.log('Window.supabase:', window.supabase);
console.log('Window.__SUPABASE__:', window.__SUPABASE__);

// Check for any Supabase-related globals
Object.keys(window).filter(key => key.toLowerCase().includes('supabase'))
```

---

## ✅ Method 3: Check localStorage vs Supabase

**Paste this in console:**
```javascript
console.log('🔍 DATA SOURCE CHECK');
console.log('==================');

// Check localStorage (current source)
const hasLocalStorage = {
  areas: localStorage.getItem('strategicAreas') ? '✅' : '❌',
  users: localStorage.getItem('users') ? '✅' : '❌',
  objectives: localStorage.getItem('strategicObjectives') ? '✅' : '❌'
};

console.log('localStorage data:');
console.log('  Strategic Areas:', hasLocalStorage.areas);
console.log('  Users:', hasLocalStorage.users);
console.log('  Objectives:', hasLocalStorage.objectives);

// Check if there's any Supabase connection attempt
console.log('');
console.log('Check Network tab for Supabase requests!');
```

---

## ✅ Method 4: Check Source Code (Best Method)

### Step 1: Open Sources Tab
1. **Press:** `F12`
2. **Click:** "Sources" tab (or "Sources" in Chrome)
3. **Navigate to:** Your app files

### Step 2: Check Supabase File
1. **Find:** `src/lib/supabase.js` (or search for "supabase")
2. **Check:** If environment variables are being read

**Look for:**
```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

**If you see:**
- `undefined` → Environment variables not set
- Actual URL → Environment variables are set

---

## ✅ Method 5: Check Build Output (Most Reliable)

### Step 1: View Page Source
1. **Right-click** on page → "View Page Source"
2. **Press:** `Cmd+F` (or `Ctrl+F`)
3. **Search for:** `VITE_SUPABASE`

**What to look for:**
- If you see `VITE_SUPABASE_URL` in the code → Variables are in build
- If you don't see it → Variables not included in build

---

## ✅ Method 6: Check Application Tab

### Step 1: Open Application Tab
1. **Press:** `F12`
2. **Click:** "Application" tab (Chrome) or "Storage" tab (Firefox)

### Step 2: Check Local Storage
1. **Click:** "Local Storage" → Your domain
2. **Look for:** Data in localStorage

**If you see lots of data:**
- App is using localStorage (not Supabase)

**If localStorage is empty:**
- App might be using Supabase (or no data yet)

---

## 🎯 Quick Diagnostic: All Methods

**Paste this in console (works in browser):**
```javascript
console.log('🔍 SUPABASE DIAGNOSTIC');
console.log('======================');

// Method 1: Check localStorage (current data source)
const lsKeys = Object.keys(localStorage).filter(k => 
  ['strategicAreas', 'users', 'objectives', 'targets'].includes(k)
);
console.log('1️⃣ localStorage has data:', lsKeys.length > 0 ? '✅ YES' : '❌ NO');
if (lsKeys.length > 0) {
  console.log('   Keys:', lsKeys);
}

// Method 2: Check for Supabase in window
const supabaseInWindow = Object.keys(window).some(k => 
  k.toLowerCase().includes('supabase')
);
console.log('2️⃣ Supabase in window:', supabaseInWindow ? '✅ YES' : '❌ NO');

// Method 3: Check network (instruction)
console.log('3️⃣ Network check:');
console.log('   → Open Network tab');
console.log('   → Filter by "supabase"');
console.log('   → Refresh page');
console.log('   → Look for requests to *.supabase.co');

// Method 4: Check source code (instruction)
console.log('4️⃣ Source code check:');
console.log('   → Open Sources tab');
console.log('   → Find src/lib/supabase.js');
console.log('   → Check if VITE_SUPABASE_URL is defined');

console.log('======================');
console.log('💡 Most likely: App is using localStorage');
console.log('💡 Need to update components to use Supabase');
```

---

## 📊 What the Results Mean

### ✅ localStorage has data:
**Meaning:** App is currently using localStorage, not Supabase.

**Fix:** Need to update components to use Supabase instead of localStorage.

---

### ❌ No Supabase in window:
**Meaning:** Supabase client not exposed globally (normal).

**Fix:** Check Network tab to see if Supabase requests are being made.

---

### ✅ Supabase requests in Network tab:
**Meaning:** App is trying to connect to Supabase!

**Fix:** Check if requests are successful or have errors.

---

## 🎯 Recommended: Check Network Tab

**This is the easiest and most reliable method:**

1. **Open:** Network tab (F12 → Network)
2. **Filter:** Type "supabase" in filter box
3. **Refresh:** Page (F5)
4. **Look for:** Requests to `*.supabase.co`

**If you see requests:**
- ✅ App is connecting to Supabase
- Check if requests are successful (green) or failed (red)

**If no requests:**
- ❌ App is using localStorage only
- Need to update components

---

## 📝 What to Share

After checking, share:
1. **Network tab:** Do you see Supabase requests?
2. **localStorage:** Does it have data?
3. **Any errors** in console?

Then I can help fix it! 🔧

