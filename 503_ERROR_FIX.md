# 🚨 503 Service Unavailable - Troubleshooting Guide

## 🔍 What 503 Error Means
Your Node.js application is **crashing or failing to start**. The web server can't connect to your app.

## 🛠️ Step-by-Step Diagnosis

### Step 1: Check Application Logs
```bash
# SSH to your server and check logs:
tail -f /home/sedafzgt/nodeapp/logs/jobscooter.log

# Also check for any error logs:
ls -la /home/sedafzgt/nodeapp/logs/
cat /home/sedafzgt/nodeapp/logs/*.log
```

### Step 2: Check if Node.js Process is Running
```bash
# Check if your app is running:
ps aux | grep node
ps aux | grep server.js

# Check what's listening on ports:
netstat -tulnp | grep :3000
netstat -tulnp | grep node
```

### Step 3: Try Starting Manually
```bash
cd /home/sedafzgt/nodeapp
node server.js
```

## 🚨 Common Causes & Fixes

### 1. **Missing Dependencies**
```bash
cd /home/sedafzgt/nodeapp
npm install --production
```

### 2. **Database Connection Issues**
Check if MySQL is running and credentials are correct:
```bash
mysql -u sedafzgt_jobscooter -p
# Try connecting with your database credentials
```

### 3. **Environment Variables Issues**
Check if `.env` file exists and has correct values:
```bash
ls -la /home/sedafzgt/nodeapp/.env
cat /home/sedafzgt/nodeapp/.env
```

### 4. **File Permissions**
```bash
chmod 644 /home/sedafzgt/nodeapp/.env
chmod 755 /home/sedafzgt/nodeapp/server.js
chown -R sedafzgt:sedafzgt /home/sedafzgt/nodeapp/
```

### 5. **Port Conflicts**
Check if another process is using the port:
```bash
lsof -i :3000
lsof -i :3001
```

## 🔧 Quick Fixes to Try

### Fix 1: Restart Node.js App in cPanel
1. Go to cPanel → Node.js Selector
2. Click **Stop** → **Start**
3. Check logs immediately after

### Fix 2: Check Node.js Version Compatibility
```bash
node --version
npm --version
```
Ensure Node.js is version 14+ as specified in package.json

### Fix 3: Clear npm Cache and Reinstall
```bash
cd /home/sedafzgt/nodeapp
rm -rf node_modules/
rm package-lock.json
npm cache clean --force
npm install --production
```

### Fix 4: Check for Missing Files
```bash
ls -la /home/sedafzgt/nodeapp/public/index.html
ls -la /home/sedafzgt/nodeapp/.env
ls -la /home/sedafzgt/nodeapp/package.json
```

## 📋 Manual Testing

Try starting the app manually to see error messages:

```bash
cd /home/sedafzgt/nodeapp
export NODE_ENV=production
node server.js
```

This will show you the exact error causing the crash.

## 🎯 Most Likely Issues

1. **Database connection failing** - Check MySQL credentials
2. **Missing node_modules** - Run `npm install`
3. **Wrong Node.js version** - Update Node.js
4. **Port already in use** - Check for port conflicts
5. **Missing .env file** - Upload correct environment variables

## 📞 Diagnostic Commands

Run these to gather information:

```bash
# System info
node --version
npm --version
pwd
ls -la

# App specific
cd /home/sedafzgt/nodeapp
ls -la
cat package.json
tail -20 logs/jobscooter.log

# Database test
mysql -u sedafzgt_jobscooter -p -e "SELECT 1;"
```

## 🚀 Expected Fix

The most common cause is **database connection issues** or **missing dependencies**. 

1. **Check the logs first** - they'll tell you exactly what's wrong
2. **Ensure database credentials are correct** in `.env`
3. **Run `npm install`** to ensure all dependencies are installed
4. **Restart the app** in cPanel

**Once you identify the specific error from the logs, the fix will be straightforward! 🔧**