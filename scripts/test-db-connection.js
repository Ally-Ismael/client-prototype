#!/usr/bin/env node

/**
 * Database Connection Test Script
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    console.log('🔍 Testing Database Connection...\n');
    
    console.log('Environment Variables:');
    console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`  DB_HOST: ${process.env.DB_HOST}`);
    console.log(`  DB_PORT: ${process.env.DB_PORT}`);
    console.log(`  DB_USER: ${process.env.DB_USER}`);
    console.log(`  DB_PASSWORD: ${process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]'}`);
    console.log(`  DB_NAME: ${process.env.DB_NAME}\n`);
    
    // Test different connection methods
    const connectionConfigs = [
        {
            name: 'Production Config (with database)',
            config: {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME
            }
        },
        {
            name: 'Production Config (without database)',
            config: {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD
            }
        },
        {
            name: 'Local Root Connection',
            config: {
                host: 'localhost',
                port: 3306,
                user: 'root',
                password: ''
            }
        }
    ];
    
    for (const { name, config } of connectionConfigs) {
        console.log(`🔌 Testing: ${name}`);
        
        try {
            const connection = await mysql.createConnection(config);
            console.log('   ✅ Connected successfully!');
            
            // Test basic query
            const [result] = await connection.execute('SELECT 1 as test');
            console.log(`   ✅ Query test passed: ${result[0].test}`);
            
            // List databases if no specific database selected
            if (!config.database) {
                try {
                    const [databases] = await connection.execute('SHOW DATABASES');
                    console.log(`   📋 Available databases: ${databases.length}`);
                    databases.forEach((db, index) => {
                        const dbName = Object.values(db)[0];
                        console.log(`      ${index + 1}. ${dbName}`);
                    });
                } catch (error) {
                    console.log(`   ⚠️  Cannot list databases: ${error.message}`);
                }
            } else {
                // Test database-specific query
                try {
                    const [tables] = await connection.execute('SHOW TABLES');
                    console.log(`   📋 Database contains ${tables.length} tables`);
                } catch (error) {
                    console.log(`   ⚠️  Cannot access database: ${error.message}`);
                }
            }
            
            await connection.end();
            console.log('   🔌 Connection closed\n');
            
        } catch (error) {
            console.log(`   ❌ Connection failed: ${error.message}`);
            console.log(`   📝 Error code: ${error.code || 'UNKNOWN'}\n`);
        }
    }
}

testConnection().catch(console.error);