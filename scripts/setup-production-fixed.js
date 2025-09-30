#!/usr/bin/env node

/**
 * Fixed Production Database Setup Script
 * Uses root user to create database and tables directly
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    let connection;
    
    try {
        console.log('🚀 Setting up JobScooter Production Database...\n');
        
        // Connect as root
        console.log('🔌 Connecting to MySQL as root...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: 'root',
            password: '',
            multipleStatements: true
        });
        console.log('✅ Connected as root\n');
        
        // Create production database
        const dbName = process.env.DB_NAME;
        console.log(`🗄️  Setting up database: ${dbName}`);
        
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log('✅ Database created/verified');
        
        // Use the database
        await connection.query(`USE \`${dbName}\``);
        console.log('✅ Connected to production database\n');
        
        // Load schema file
        console.log('📄 Loading database schema...');
        const schemaPath = path.join(__dirname, '..', 'database', 'jobscooter_complete_schema.sql');
        
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found at: ${schemaPath}`);
        }
        
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        console.log(`✅ Schema loaded (${Math.round(schemaSQL.length / 1024)}KB)\n`);
        
        // Execute tables first
        console.log('📋 Creating tables...');
        const tableStatements = extractCreateTableStatements(schemaSQL);
        
        for (let i = 0; i < tableStatements.length; i++) {
            const statement = tableStatements[i];
            try {
                const tableName = extractTableName(statement);
                console.log(`   [${i + 1}/${tableStatements.length}] Creating ${tableName}...`);
                await connection.query(statement);
                console.log(`   ✅ ${tableName} created`);
            } catch (error) {
                if (error.code === 'ER_TABLE_EXISTS_ERROR') {
                    const tableName = extractTableName(statement);
                    console.log(`   ⚠️  ${tableName} already exists`);
                } else {
                    console.error(`   ❌ Error: ${error.message}`);
                }
            }
        }
        
        // Insert sample data
        console.log('\n📊 Inserting sample data...');
        const insertStatements = extractInsertStatements(schemaSQL);
        
        for (let i = 0; i < insertStatements.length; i++) {
            const statement = insertStatements[i];
            try {
                const tableName = extractInsertTableName(statement);
                console.log(`   [${i + 1}/${insertStatements.length}] Inserting into ${tableName}...`);
                await connection.query(statement);
                console.log(`   ✅ Data inserted into ${tableName}`);
            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    const tableName = extractInsertTableName(statement);
                    console.log(`   ⚠️  ${tableName} data already exists`);
                } else {
                    console.error(`   ❌ Error: ${error.message}`);
                }
            }
        }
        
        // Create indexes
        console.log('\n🔍 Creating indexes...');
        const indexStatements = extractIndexStatements(schemaSQL);
        
        for (let i = 0; i < indexStatements.length; i++) {
            const statement = indexStatements[i];
            try {
                console.log(`   [${i + 1}/${indexStatements.length}] Creating index...`);
                await connection.query(statement);
                console.log(`   ✅ Index created`);
            } catch (error) {
                if (error.code === 'ER_DUP_KEYNAME') {
                    console.log(`   ⚠️  Index already exists`);
                } else {
                    console.error(`   ❌ Error: ${error.message}`);
                }
            }
        }
        
        // Verify setup
        console.log('\n🔍 Verifying database setup...');
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`✅ Database contains ${tables.length} tables:\n`);
        
        const tableNames = tables.map(table => Object.values(table)[0]).sort();
        tableNames.forEach((tableName, index) => {
            console.log(`   ${(index + 1).toString().padStart(2, ' ')}. ${tableName}`);
        });
        
        // Check sample data
        console.log('\n📊 Sample data verification:');
        const checks = [
            { table: 'accredited_institutions', desc: 'accredited institutions' },
            { table: 'system_settings', desc: 'system settings' }
        ];
        
        for (const check of checks) {
            try {
                const [result] = await connection.query(`SELECT COUNT(*) as count FROM ${check.table}`);
                console.log(`   • ${result[0].count} ${check.desc}`);
            } catch (err) {
                console.log(`   ⚠️  ${check.table}: Table not found`);
            }
        }
        
        console.log('\n🎊 Production database setup completed successfully!');
        console.log('\n🔐 Database Information:');
        console.log(`   Host: ${process.env.DB_HOST}`);
        console.log(`   Database: ${process.env.DB_NAME}`);
        console.log(`   Tables: ${tables.length}`);
        console.log(`   User: root (for development)`);
        
        console.log('\n🚀 JobScooter is ready for production!');
        
    } catch (error) {
        console.error('\n❌ Database setup failed:');
        console.error(`   Error: ${error.message}`);
        console.error(`   Code: ${error.code || 'UNKNOWN'}`);
        process.exit(1);
        
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

function extractCreateTableStatements(sql) {
    const regex = /CREATE TABLE.*?ENGINE=InnoDB[^;]*;/gs;
    const matches = sql.match(regex) || [];
    return matches;
}

function extractInsertStatements(sql) {
    const regex = /INSERT INTO.*?;/gs;
    const matches = sql.match(regex) || [];
    return matches;
}

function extractIndexStatements(sql) {
    const regex = /CREATE INDEX.*?;/gs;
    const matches = sql.match(regex) || [];
    return matches;
}

function extractTableName(createStatement) {
    const match = createStatement.match(/CREATE TABLE\s+`([^`]+)`/i);
    return match ? match[1] : 'unknown_table';
}

function extractInsertTableName(insertStatement) {
    const match = insertStatement.match(/INSERT INTO\s+`([^`]+)`/i);
    return match ? match[1] : 'unknown_table';
}

// Run the setup
if (require.main === module) {
    setupDatabase().catch(console.error);
}

module.exports = { setupDatabase };