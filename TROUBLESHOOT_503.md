# 🚨 503 Service Unavailable - Troubleshooting Guide

## 🎯 Current Status
You're getting **503 Service Unavailable** errors from your cPanel/Passenger Node.js app.

## 🔍 Step-by-Step Diagnosis & Fix

### STEP 1: Test with Minimal Server First 🧪

**Upload and test the minimal server:**

1. **Upload these files to your server:**
   - `test-server.js` (minimal Express app)
   - `diagnose.js` (diagnostic script)

2. **Change cPanel Node.js settings:**
   - **App Startup File**: Change from `server.js` to `test-server.js`
   - **Restart the application**

3. **Test the minimal server:**
   ```bash
   curl https://sedap.info/
   curl https://sedap.info/api/health
   ```

**Expected results:**
- ✅ JSON response with "JobScooter Test Server is working!"
- ✅ No more 503 errors

**If Step 1 WORKS** → Your Passenger setup is correct, the issue is in your main `server.js`
**If Step 1 FAILS** → Passenger/cPanel configuration issue

---

### STEP 2: Run Diagnostics 🔍

**If the test server works, run diagnostics:**

```bash
ssh into your server and run:
cd /home/sedafzgt/nodeapp
node diagnose.js
```

**Look for any ❌ errors in the output:**
- Missing files
- Permission issues
- Missing dependencies
- Environment variable problems

---

### STEP 3: Fix Main Server 🔧

**I've updated your `server.js` with proper Passenger compatibility:**

- ✅ **Exports the app first** (before any logic)
- ✅ **Only calls `app.listen()` when run directly**
- ✅ **Passenger handles server startup in production**

**Upload the updated `server.js` and test:**

1. **Change cPanel startup file back to `server.js`**
2. **Restart the application**
3. **Test your endpoints**

---

### STEP 4: Check Logs 📋

**If still getting 503, check the logs:**

```bash
# In cPanel File Manager or via SSH:
tail -f /home/sedafzgt/nodeapp/logs/jobscooter.log

# Or check cPanel error logs:
tail -f /home/sedafzgt/logs/sedap.info.error.log
```

**Look for:**
- Module loading errors
- Database connection issues
- Permission denied errors
- Missing dependency errors

---

### STEP 5: Common Fixes 🛠️

**If you see specific errors, try these fixes:**

#### **"Cannot find module" errors:**
```bash
cd /home/sedafzgt/nodeapp
npm install
```

#### **Permission errors:**
```bash
chmod 755 /home/sedafzgt/nodeapp
chmod 644 /home/sedafzgt/nodeapp/server.js
chmod 644 /home/sedafzgt/nodeapp/test-server.js
```

#### **Database connection errors:**
- Check your `.env` file has correct database credentials
- Verify database server is running
- Test database connection separately

#### **Missing .env file:**
- Upload your `.env` file to the server
- Ensure it has production database credentials

---

### STEP 6: cPanel Configuration Check ⚙️

**Verify cPanel Node.js settings:**

1. **Node.js Selector → Your Domain**
2. **Check these settings:**
   - **Node.js Version**: Latest stable (16.x or 18.x)
   - **App Root Directory**: `/home/sedafzgt/nodeapp`
   - **App URL**: `sedap.info/` (or your domain)
   - **App Startup File**: `server.js` (or `test-server.js` for testing)
   - **Mode**: `production`

3. **Environment Variables** (if needed):
   - Add `NODE_ENV=production`
   - Don't set `PORT` (Passenger handles it)

---

### STEP 7: Final Test 🎉

**After fixing issues, test all endpoints:**

```bash
curl -I https://sedap.info/
curl https://sedap.info/api/health
curl https://sedap.info/api/info
```

**Expected results:**
- ✅ **Homepage loads** (HTML or JSON)
- ✅ **Health check returns** `{"status":"OK"}`
- ✅ **Info endpoint returns** app information
- ✅ **No 503 errors**

---

## 🎯 Quick Summary

1. **Test with `test-server.js` first** → Verify Passenger works
2. **Run `diagnose.js`** → Check for configuration issues  
3. **Use updated `server.js`** → Proper Passenger compatibility
4. **Check logs** → Find specific error messages
5. **Apply fixes** → Dependencies, permissions, database
6. **Verify cPanel settings** → Correct app configuration
7. **Test all endpoints** → Confirm everything works

## 🆘 If Still Stuck

**If you're still getting 503 errors after all steps:**

1. **Share the output of `diagnose.js`**
2. **Share the contents of your error logs**
3. **Confirm which step succeeded/failed**

**This methodical approach will identify and fix the 503 issue! 🚀**