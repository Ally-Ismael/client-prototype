#!/usr/bin/env node

// Script to check user status in database

const mysql = require('mysql2');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
};

async function checkUsers() {
    console.log('🔍 Checking user status in database...\n');
    
    const db = mysql.createConnection(dbConfig);
    
    try {
        // Get recent users
        const users = await new Promise((resolve, reject) => {
            db.query(`
                SELECT id, username, email, first_name, surname, status, 
                       is_verified, email_verified_at, created_at, updated_at
                FROM applicants 
                ORDER BY created_at DESC 
                LIMIT 5
            `, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        console.log('📋 Recent users in database:');
        users.forEach((user, index) => {
            console.log(`\n${index + 1}. User ID: ${user.id}`);
            console.log(`   📧 Email: ${user.email}`);
            console.log(`   👤 Name: ${user.first_name} ${user.surname}`);
            console.log(`   🏷  Username: ${user.username}`);
            console.log(`   📊 Status: ${user.status}`);
            console.log(`   ✅ Verified: ${user.is_verified ? 'Yes' : 'No'}`);
            console.log(`   📅 Verified at: ${user.email_verified_at || 'Not verified'}`);
            console.log(`   📅 Created: ${user.created_at}`);
            console.log(`   📅 Updated: ${user.updated_at}`);
        });
        
        // Check for verification tokens
        const tokens = await new Promise((resolve, reject) => {
            db.query(`
                SELECT email, email_verification_token, status 
                FROM applicants 
                WHERE email_verification_token IS NOT NULL
                ORDER BY created_at DESC
                LIMIT 5
            `, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        console.log('\n🔑 Users with pending verification tokens:');
        if (tokens.length === 0) {
            console.log('   ✅ No pending verification tokens found');
        } else {
            tokens.forEach((token, index) => {
                console.log(`\n${index + 1}. Email: ${token.email}`);
                console.log(`   🔑 Token: ${token.email_verification_token}`);
                console.log(`   📊 Status: ${token.status}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        db.end();
    }
}

checkUsers().catch(console.error);