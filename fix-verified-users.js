#!/usr/bin/env node

// Script to fix is_verified field for users who were verified but the field wasn't set

const mysql = require('mysql2');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
};

async function fixVerifiedUsers() {
    console.log('🔧 Fixing is_verified field for verified users...\n');
    
    const db = mysql.createConnection(dbConfig);
    
    try {
        // Find users who have been verified but is_verified is still 0
        const usersToFix = await new Promise((resolve, reject) => {
            db.query(`
                SELECT id, email, username, status, is_verified, email_verified_at
                FROM applicants 
                WHERE status = 'active' 
                AND email_verified_at IS NOT NULL 
                AND is_verified = 0
                ORDER BY created_at DESC
            `, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        if (usersToFix.length === 0) {
            console.log('✅ No users need fixing - all verified users have correct is_verified status');
            return;
        }
        
        console.log(`📋 Found ${usersToFix.length} users that need fixing:`);
        usersToFix.forEach((user, index) => {
            console.log(`\n${index + 1}. User ID: ${user.id}`);
            console.log(`   📧 Email: ${user.email}`);
            console.log(`   🏷  Username: ${user.username}`);
            console.log(`   📊 Status: ${user.status}`);
            console.log(`   ✅ is_verified: ${user.is_verified}`);
            console.log(`   📅 Verified at: ${user.email_verified_at}`);
        });
        
        // Fix all users
        console.log('\n🔧 Updating is_verified field...');
        
        const result = await new Promise((resolve, reject) => {
            db.query(`
                UPDATE applicants 
                SET is_verified = 1 
                WHERE status = 'active' 
                AND email_verified_at IS NOT NULL 
                AND is_verified = 0
            `, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        console.log(`✅ Fixed ${result.affectedRows} users`);
        
        // Verify the fix
        const verifyResults = await new Promise((resolve, reject) => {
            db.query(`
                SELECT id, email, username, status, is_verified, email_verified_at
                FROM applicants 
                WHERE id IN (${usersToFix.map(u => u.id).join(',')})
                ORDER BY created_at DESC
            `, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        console.log('\n📋 Verification of fixes:');
        verifyResults.forEach((user, index) => {
            console.log(`\n${index + 1}. User ID: ${user.id}`);
            console.log(`   📧 Email: ${user.email}`);
            console.log(`   🏷  Username: ${user.username}`);
            console.log(`   📊 Status: ${user.status}`);
            console.log(`   ✅ is_verified: ${user.is_verified ? 'Yes' : 'No'} ${user.is_verified ? '✅' : '❌'}`);
            console.log(`   📅 Verified at: ${user.email_verified_at}`);
        });
        
    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        db.end();
    }
}

fixVerifiedUsers().catch(console.error);