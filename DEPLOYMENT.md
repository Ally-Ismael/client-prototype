# JobScooter Production Deployment Guide

## 📋 Overview
This guide covers the complete deployment process for JobScooter to the production environment at `https://sedap.info`.

## 🚀 Quick Deployment

### Prerequisites
- Node.js 16+ installed on server
- MySQL/MariaDB database access
- PM2 for process management
- SSH access to production server

### 1. Environment Setup
The application is configured for production with the following settings:
- **Domain**: https://sedap.info
- **Database**: sedafzgt_jobscootercoz614_jobscooter
- **Email**: server701.web-hosting.com
- **SSL**: Enabled

### 2. Database Deployment
```bash
# 1. Import main database structure and data
mysql -u sedafzgt_jobscooter -p sedafzgt_jobscootercoz614_jobscooter < database/sedafzgt_jobscootercoz614_jobscooter.sql

# 2. Run cleanup and optimization script
mysql -u sedafzgt_jobscooter -p sedafzgt_jobscootercoz614_jobscooter < database/clean-production-export.sql
```

### 3. Application Deployment
```bash
# Run the automated deployment script
chmod +x deploy.sh
./deploy.sh
```

## 📁 File Structure
```
jobscooter/
├── server.js                 # Main application entry point
├── ecosystem.config.js       # PM2 configuration
├── package-production.json   # Production dependencies
├── .env                     # Production environment variables
├── deploy.sh               # Deployment script
├── routes/                 # API routes
├── services/               # Business logic
├── public/                 # Static files
├── uploads/               # File uploads
├── logs/                  # Application logs
└── database/              # Database files
```

## 🔧 Configuration Files

### `.env` (Production)
```env
NODE_ENV=production
DB_HOST=localhost
DB_USER=sedafzgt_jobscooter
DB_PASSWORD=Developer@2025
DB_NAME=sedafzgt_jobscootercoz614_jobscooter
BASE_URL=https://sedap.info
CORS_ORIGIN=https://sedap.info
```

### `ecosystem.config.js` (PM2)
- **Process Name**: jobscooter-production
- **Instances**: max (cluster mode)
- **Memory Limit**: 1GB
- **Auto Restart**: Enabled
- **Logs**: ./logs/pm2-*.log

## 📊 Database Information

### Tables Overview
- **applicants**: User accounts and profiles
- **certificates**: Uploaded certificates and verification
- **language_verifications**: Language skills
- **traffic_light_scores**: Profile scoring system
- **generated_cvs**: Auto-generated CVs
- **activity_logs**: System activity tracking
- **accredited_institutions**: Institution database

### Key Features
- ✅ Foreign key constraints
- ✅ Data integrity checks
- ✅ Automatic cleanup of orphaned records
- ✅ Performance indexes
- ✅ UTF-8 character support

## 🛠️ Management Commands

### PM2 Process Management
```bash
# View application status
pm2 list

# View logs
pm2 logs jobscooter-production

# Restart application
pm2 restart jobscooter-production

# Stop application
pm2 stop jobscooter-production

# Monitor resources
pm2 monit

# Save configuration
pm2 save
```

### Database Management
```bash
# Create database backup
mysqldump -u sedafzgt_jobscooter -p sedafzgt_jobscootercoz614_jobscooter > backup_$(date +%Y%m%d).sql

# Check database status
mysql -u sedafzgt_jobscooter -p -e "SELECT COUNT(*) as total_users FROM sedafzgt_jobscootercoz614_jobscooter.applicants;"
```

## 🔐 Security Features

### Production Security
- ✅ HTTPS enforced
- ✅ CORS configured for domain
- ✅ Rate limiting enabled
- ✅ SQL injection protection
- ✅ Input validation
- ✅ JWT token authentication
- ✅ Password hashing (bcrypt)
- ✅ File upload restrictions

### Environment Security
- ✅ Environment variables for secrets
- ✅ Database user with limited privileges
- ✅ Secure session management
- ✅ Error logging without sensitive data

## 📈 Monitoring & Logs

### Application Logs
- **Location**: `./logs/jobscooter.log`
- **PM2 Logs**: `./logs/pm2-*.log`
- **Rotation**: Daily rotation enabled

### Health Monitoring
```bash
# Check application health
curl -I https://sedap.info/api/health

# Check database connection
curl https://sedap.info/api/info
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check database connectivity
   mysql -u sedafzgt_jobscooter -p -h localhost
   ```

2. **Foreign Key Constraint Errors**
   ```sql
   # Run the cleanup script
   SOURCE database/clean-production-export.sql;
   ```

3. **File Upload Issues**
   ```bash
   # Check upload directory permissions
   ls -la uploads/
   chmod 755 uploads/ -R
   ```

4. **PM2 Process Issues**
   ```bash
   # Reset PM2
   pm2 kill
   pm2 start ecosystem.config.js --env production
   ```

### Log Analysis
```bash
# View error logs
pm2 logs jobscooter-production --err

# Monitor real-time logs
tail -f logs/jobscooter.log

# Check system resources
pm2 monit
```

## 📞 Support

### Production Environment Details
- **Server**: server701.web-hosting.com
- **Domain**: https://sedap.info
- **Database**: MySQL/MariaDB
- **Process Manager**: PM2
- **SSL**: Enabled

### Contact Information
- **Technical Support**: support@sedap.info
- **Application Logs**: `./logs/jobscooter.log`
- **Deployment Logs**: `./deployment.log`

## ✅ Post-Deployment Checklist

After successful deployment, verify:

- [ ] Application starts without errors
- [ ] Database connections work
- [ ] File uploads function
- [ ] Email sending works
- [ ] SSL certificate valid
- [ ] CV generation works
- [ ] User registration/login works
- [ ] API endpoints respond correctly
- [ ] Static files serve properly
- [ ] Logs are being written

## 🔄 Updates & Maintenance

### Regular Maintenance
1. **Database Backups**: Daily automated backups
2. **Log Rotation**: Automatic log cleanup
3. **Security Updates**: Monitor and apply Node.js/npm updates
4. **Performance Monitoring**: Check PM2 metrics regularly

### Updating Application
```bash
# Stop application
pm2 stop jobscooter-production

# Update code
git pull origin main

# Install dependencies
npm ci --only=production

# Restart application
pm2 start ecosystem.config.js --env production
```

---

**Deployment completed successfully! 🎉**

Application URL: https://sedap.info