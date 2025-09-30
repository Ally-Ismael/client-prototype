# Account Creation Debugging Guide

## Issue Summary
- **Error**: HTTP 500 "Email already registered" when trying to create accounts
- **Location**: `/api/application-enhanced/step1/confirm-and-create-account`
- **Root Cause**: Database connection or existing data issues

## What I've Fixed

### 1. Enhanced Error Logging
- Added detailed logging in `checkExistingUser()` method
- Added database error handling to distinguish between:
  - Actual duplicate emails
  - Database connection failures
  - Empty result sets

### 2. Better Error Messages  
- Database connection errors now return specific error messages
- Distinguish between "Email already registered" vs "Database connection failed"

### 3. Debug Tools Created

#### A. Debug API Routes (Development Only)
Access these at your domain when NODE_ENV=development:

- `GET /api/debug/database-status` - Check all table counts and recent records
- `GET /api/debug/check-email/test@example.com` - Check if specific email exists  
- `DELETE /api/debug/clear-test-data` - Clear all test data from database

#### B. SQL Cleanup Script
File: `database/cleanup_test_data.sql`
Run this in your database to clear all test data safely.

## Debugging Steps

### Step 1: Check Database Status
Visit: `https://yourdomain.com/api/debug/database-status`

This will tell you:
- How many applicants are in the database
- Recent applicants with emails
- Counts of all tables

### Step 2: Check Specific Email
Visit: `https://yourdomain.com/api/debug/check-email/YOUR_TEST_EMAIL`

This will tell you if that specific email already exists.

### Step 3: Clear Test Data (if needed)
Method A - API Call:
```bash
curl -X DELETE https://yourdomain.com/api/debug/clear-test-data
```

Method B - SQL Script:
Run the `database/cleanup_test_data.sql` script in your database.

### Step 4: Check Server Logs
Look for these new log messages:
- `🔍 Starting email existence check for: EMAIL`
- `✅ Email is available, proceeding with account creation`
- `❌ Email already exists in database:`
- `❌ Database connection error during email check:`

## Common Causes & Solutions

### 1. Database Has Existing Test Data
**Symptom**: Debug shows applicants in database
**Solution**: Use cleanup script or API to clear data

### 2. Database Connection Issues  
**Symptom**: Logs show "Database connection failed" 
**Solution**: Check database credentials in .env file

### 3. Database Access Denied
**Symptom**: "Access denied for user" in logs
**Solution**: Verify database user has correct permissions

### 4. Mock Database Issues
**Symptom**: Running in development without real database
**Solution**: Check if using correct database or mock setup

## Testing the Fix

1. Clear any existing test data
2. Try creating account with new email
3. Check the detailed logs
4. If still failing, use debug endpoints to investigate

## Production Notes

- Debug routes are automatically disabled in production
- Enhanced logging still works in production
- Database cleanup script should NEVER be run in production

## Files Modified

- `services/account-service.js` - Enhanced error logging
- `routes/debug.js` - New debug routes (created)
- `database/cleanup_test_data.sql` - Database cleanup script (created)
- `server.js` - Added debug routes

The enhanced logging should now tell you exactly what's happening when the account creation fails.