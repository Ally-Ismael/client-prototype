# 🚀 JobScooter LiteSpeed/Passenger Deployment Guide

## 🔍 Current Status
Your Node.js application is running locally on port 3001, but LiteSpeed is not routing requests to it properly. This guide will fix that.

## ✅ Files Created for LiteSpeed Integration

1. **`app.js`** - Passenger entry point (exports Express app)
2. **`.htaccess`** - Passenger configuration and routing
3. **Updated `package.json`** - Main entry point changed to `app.js`
4. **Updated `server.js`** - Exports app without conflicting listen calls

## 🔧 Server Configuration Steps

### Step 1: Upload New Files
Upload these files to your server at `/home/sedafzgt/nodeapp/`:

```bash
# On your server, ensure these files are present:
ls -la /home/sedafzgt/nodeapp/
# Should show:
# - app.js (new Passenger entry point)
# - .htaccess (Passenger configuration)
# - server.js (updated to export app)
# - package.json (updated main entry point)
```

### Step 2: Install Dependencies
```bash
cd /home/sedafzgt/nodeapp
npm install --production
```

### Step 3: Set Correct Permissions
```bash
chmod 644 .htaccess
chmod 644 package.json
chmod 755 app.js
chmod 755 server.js
chown -R sedafzgt:sedafzgt /home/sedafzgt/nodeapp/
```

### Step 4: Restart Application in cPanel
In your cPanel Node.js app settings:
1. **App Root Directory**: `/home/sedafzgt/nodeapp`
2. **App Startup File**: `app.js` (changed from server.js)
3. **App URL**: `sedap.info/`
4. **Mode**: `production`
5. Click **Restart** button

## 🔍 Verify Configuration

After restarting, test these endpoints:

```bash
# Test from server
curl -I https://sedap.info/api/health
curl https://sedap.info/api/info
curl -I https://sedap.info/login

# Should return proper responses instead of 404
```

## 🛠️ Troubleshooting

### If you still get 404 errors:

1. **Check Node.js Path in .htaccess**
   ```bash
   which node
   # Update .htaccess line 14 with the correct path:
   # PassengerNodejs /usr/bin/node  # or whatever path is returned
   ```

2. **Check Application Root Path**
   Verify in `.htaccess` line 13:
   ```apache
   PassengerAppRoot /home/sedafzgt/nodeapp
   ```

3. **Check Passenger Status**
   ```bash
   # Check if Passenger can find your app
   passenger-status
   # or check error logs
   tail -f /home/sedafzgt/nodeapp/logs/jobscooter.log
   ```

### Alternative .htaccess Configuration
If the current .htaccess doesn't work, try this simplified version:

```apache
PassengerEnabled on
PassengerAppType node
PassengerStartupFile app.js
PassengerAppEnv production

RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## 🔧 Manual Testing

Once deployed, verify these work:

1. **Homepage**: https://sedap.info/
2. **API Health**: https://sedap.info/api/health
3. **API Info**: https://sedap.info/api/info
4. **Login Page**: https://sedap.info/login
5. **Static Files**: https://sedap.info/page1.html

## 📋 Current Application Status

Your Node.js app is running and shows:
- ✅ Database connected
- ✅ Environment: production
- ✅ All routes defined
- ❌ LiteSpeed not routing to Node.js app

## 🎯 Expected Results

After following this guide:
- ✅ https://sedap.info/api/health should return `{"status":"OK",...}`
- ✅ https://sedap.info/api/info should return app information
- ✅ https://sedap.info/ should show JobScooter homepage
- ✅ All API endpoints should work

## 🔄 Next Steps After Fix

Once LiteSpeed routing is working:

1. **Test User Registration**
2. **Test Login Flow**
3. **Test File Uploads**
4. **Test CV Generation**
5. **Test Public Profiles**

## 📞 Support

If issues persist:

1. **Check cPanel Error Logs**
2. **Check Node.js app logs**: `/home/sedafzgt/nodeapp/logs/jobscooter.log`
3. **Verify Node.js version**: `node --version` (should be 14+)
4. **Check Passenger version**: `passenger --version`

---

**The key fix is using `app.js` as the entry point and ensuring Passenger can properly route requests to your Express application.**