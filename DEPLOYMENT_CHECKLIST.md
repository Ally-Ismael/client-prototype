# 🚀 JobScooter Production Deployment Checklist

## ✅ Pre-Deployment Preparation

### 1. Environment Configuration ✅
- [x] Updated `.env` with production settings
- [x] Database credentials: `sedafzgt_jobscooter` / `Developer@2025`
- [x] Domain: `https://sedap.info`
- [x] Email server: `server701.web-hosting.com`
- [x] SSL/HTTPS configuration

### 2. Database Files Prepared ✅
- [x] **Main Database**: `database/sedafzgt_jobscootercoz614_jobscooter.sql` (52.4 KB - Latest)
- [x] **Cleanup Script**: `database/clean-production-export.sql` (Data integrity fixes)
- [x] **Schema Only**: `database/jobscooter_complete_schema.sql` (Backup reference)

### 3. Deployment Files Created ✅
- [x] `ecosystem.config.js` - PM2 configuration
- [x] `package-production.json` - Production dependencies
- [x] `deploy.sh` - Automated deployment script
- [x] `DEPLOYMENT.md` - Complete deployment guide
- [x] `.gitignore-production` - Production git ignore rules

## 📋 Deployment Steps

### Step 1: Database Setup
```bash
# 1. Import main database (contains all your data)
mysql -u sedafzgt_jobscooter -p sedafzgt_jobscootercoz614_jobscooter < database/sedafzgt_jobscootercoz614_jobscooter.sql

# 2. Run cleanup script to fix foreign key constraints
mysql -u sedafzgt_jobscooter -p sedafzgt_jobscootercoz614_jobscooter < database/clean-production-export.sql
```

### Step 2: Application Deployment
```bash
# Upload all files to server, then run:
chmod +x deploy.sh
./deploy.sh
```

### Step 3: Verify Deployment
- [ ] Application starts without errors
- [ ] Database connections work
- [ ] SSL certificate active
- [ ] File uploads functional
- [ ] Email sending works
- [ ] CV generation works
- [ ] User login/registration works

## 🔧 Key Configuration Details

### Database
- **Database Name**: `sedafzgt_jobscootercoz614_jobscooter`
- **User**: `sedafzgt_jobscooter`
- **Password**: `Developer@2025`
- **Host**: `localhost`
- **Port**: `3306`

### Application
- **Domain**: `https://sedap.info`
- **Environment**: `production`
- **Process Manager**: PM2
- **Process Name**: `jobscooter-production`
- **SSL**: Enabled

### Email Configuration
- **SMTP Host**: `server701.web-hosting.com`
- **Port**: `465` (SSL)
- **User**: `support@sedap.info`
- **Password**: `Gt/(067#min`

## 📊 Database Contents
Your production database includes:
- ✅ **21 User Accounts** (including your verified account)
- ✅ **Profile Pictures** and **Video Introductions**
- ✅ **Certificate Data** with AI processing
- ✅ **Language Verifications**
- ✅ **Generated CVs**
- ✅ **Activity Logs** (126+ entries)
- ✅ **Accredited Institutions** (62 institutions)

## 🛠️ Management Commands

### PM2 Process Management
```bash
pm2 list                           # View all processes
pm2 logs jobscooter-production     # View logs
pm2 restart jobscooter-production  # Restart app
pm2 stop jobscooter-production     # Stop app
pm2 monit                         # Monitor resources
```

### Database Management
```bash
# Backup database
mysqldump -u sedafzgt_jobscooter -p sedafzgt_jobscootercoz614_jobscooter > backup_$(date +%Y%m%d).sql

# Check application status
mysql -u sedafzgt_jobscooter -p -e "SELECT COUNT(*) as users FROM sedafzgt_jobscootercoz614_jobscooter.applicants;"
```

## 🔍 Health Checks

After deployment, verify these endpoints:
- `https://sedap.info` - Landing page
- `https://sedap.info/api/health` - Health check
- `https://sedap.info/api/info` - System info
- `https://sedap.info/login` - Login page
- `https://sedap.info/public-profile.html` - Public profiles

## 🚨 Troubleshooting Quick Fixes

### Database Foreign Key Issues
```sql
-- If you get foreign key constraint errors, run:
SET FOREIGN_KEY_CHECKS = 0;
-- (import your database)
SOURCE database/clean-production-export.sql;
SET FOREIGN_KEY_CHECKS = 1;
```

### Application Won't Start
```bash
# Check logs
pm2 logs jobscooter-production --err

# Reset PM2
pm2 kill
pm2 start ecosystem.config.js --env production
```

### File Upload Issues
```bash
# Fix upload permissions
chmod 755 uploads/ -R
chown -R $USER:$USER uploads/
```

## 📞 Support Information

### Production Details
- **Server**: `server701.web-hosting.com`
- **Domain**: `https://sedap.info`
- **Database**: MySQL/MariaDB
- **Contact**: `support@sedap.info`

### Important Files Locations
- **Application**: `/home/sedafzgt/jobscooter/`
- **Logs**: `./logs/jobscooter.log`
- **Uploads**: `./uploads/`
- **Database Backups**: `/home/sedafzgt/backups/jobscooter/`

## ✅ Final Checklist

Before going live, ensure:
- [ ] Database imported successfully
- [ ] Foreign key constraints fixed
- [ ] PM2 process running
- [ ] SSL certificate active
- [ ] DNS pointing to correct server
- [ ] Email sending functional
- [ ] File uploads working
- [ ] User registration/login working
- [ ] CV generation working
- [ ] Public profiles displaying correctly

---

## 🎉 Deployment Ready!

Your JobScooter application is fully configured and ready for production deployment at:

**https://sedap.info**

All files are prepared, database is ready, and the deployment script will handle the automation.

**Good luck with your deployment! 🚀**