#!/bin/bash

# JobScooter Production Deployment Script
# Run this script to deploy the application to production

echo "🚀 Starting JobScooter Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="jobscooter-production"
DEPLOY_DIR="/home/sedafzgt/jobscooter"
BACKUP_DIR="/home/sedafzgt/backups/jobscooter"
LOG_FILE="./deployment.log"

# Functions
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}❌ ERROR: $1${NC}" | tee -a $LOG_FILE
    exit 1
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a $LOG_FILE
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}" | tee -a $LOG_FILE
}

# Pre-deployment checks
info "Running pre-deployment checks..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    error "Node.js is not installed. Please install Node.js 16+ first."
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    warning "PM2 is not installed. Installing PM2..."
    npm install -g pm2 || error "Failed to install PM2"
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
if [ "$(printf '%s\n' "16.0.0" "$NODE_VERSION" | sort -V | head -n1)" != "16.0.0" ]; then
    error "Node.js version must be 16.0.0 or higher. Current version: $NODE_VERSION"
fi

success "Pre-deployment checks passed"

# Create necessary directories
info "Creating deployment directories..."
mkdir -p $DEPLOY_DIR
mkdir -p $BACKUP_DIR
mkdir -p $DEPLOY_DIR/logs
mkdir -p $DEPLOY_DIR/uploads
mkdir -p $DEPLOY_DIR/uploads/media
mkdir -p $DEPLOY_DIR/uploads/cvs
mkdir -p $DEPLOY_DIR/uploads/documents

success "Directories created"

# Backup existing deployment (if exists)
if [ -d "$DEPLOY_DIR/node_modules" ]; then
    info "Creating backup of existing deployment..."
    BACKUP_NAME="jobscooter_backup_$(date +%Y%m%d_%H%M%S)"
    tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" -C $DEPLOY_DIR . 2>/dev/null || warning "Backup creation failed"
    success "Backup created: $BACKUP_NAME.tar.gz"
fi

# Install dependencies
info "Installing production dependencies..."
if [ -f "package-production.json" ]; then
    cp package-production.json package.json
fi

npm ci --only=production || error "Failed to install dependencies"
success "Dependencies installed"

# Copy application files
info "Copying application files..."
rsync -av --exclude=node_modules --exclude=.git --exclude=logs/* --exclude=*.log . $DEPLOY_DIR/ || error "Failed to copy files"
success "Application files copied"

# Set correct permissions
info "Setting file permissions..."
chmod +x $DEPLOY_DIR/deploy.sh
chmod 755 $DEPLOY_DIR/uploads
chmod 755 $DEPLOY_DIR/logs
chown -R $USER:$USER $DEPLOY_DIR
success "Permissions set"

# Database deployment
if [ -f "database/sedafzgt_jobscootercoz614_jobscooter.sql" ]; then
    info "Database file found. Please import manually:"
    info "mysql -u sedafzgt_jobscooter -p sedafzgt_jobscootercoz614_jobscooter < database/sedafzgt_jobscootercoz614_jobscooter.sql"
    info "Then run: mysql -u sedafzgt_jobscooter -p sedafzgt_jobscootercoz614_jobscooter < database/clean-production-export.sql"
else
    warning "Database file not found. Please ensure database is set up manually."
fi

# Stop existing PM2 processes
info "Stopping existing PM2 processes..."
pm2 stop $APP_NAME 2>/dev/null || info "No existing processes to stop"
pm2 delete $APP_NAME 2>/dev/null || info "No existing processes to delete"

# Start application with PM2
info "Starting application with PM2..."
cd $DEPLOY_DIR
pm2 start ecosystem.config.js --env production || error "Failed to start application"

# Save PM2 configuration
pm2 save || warning "Failed to save PM2 configuration"
pm2 startup || warning "Failed to setup PM2 startup"

success "Application started successfully"

# Health check
info "Performing health check..."
sleep 10

if pm2 list | grep -q "$APP_NAME.*online"; then
    success "Health check passed - Application is running"
else
    error "Health check failed - Application is not running properly"
fi

# Show application status
info "Deployment Summary:"
pm2 list
pm2 logs $APP_NAME --lines 10

success "🎉 JobScooter deployment completed successfully!"
info "Application URL: https://sedap.info"
info "PM2 Management Commands:"
info "  - View logs: pm2 logs $APP_NAME"
info "  - Restart: pm2 restart $APP_NAME"
info "  - Stop: pm2 stop $APP_NAME"
info "  - Monitor: pm2 monit"

log "Deployment completed at $(date)"