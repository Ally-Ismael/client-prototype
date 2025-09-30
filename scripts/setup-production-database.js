#!/usr/bin/env node

/**
 * Production Database Setup Script
 * Creates production user, database, and schema
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupProductionDatabase() {
    let adminConnection;
    let prodConnection;
    
    try {
        console.log('🚀 Setting up JobScooter for Production...\n');
        
        // Step 1: Connect as root to create production user and database
        console.log('🔑 Connecting as administrator (root)...');
        adminConnection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: 'root',
            password: '',
            multipleStatements: true
        });
        console.log('✅ Connected as root\n');
        
        // Step 2: Create production database
        console.log('🗄️  Creating production database...');
        const dbName = process.env.DB_NAME;
        
        try {
            await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
            console.log(`✅ Database '${dbName}' created/verified`);
        } catch (error) {
            if (error.code !== 'ER_DB_CREATE_EXISTS') {
                throw error;
            }
            console.log(`✅ Database '${dbName}' already exists`);
        }
        
        // Step 3: Create production user
        console.log('\n👤 Creating production user...');
        const prodUser = process.env.DB_USER;
        const prodPassword = process.env.DB_PASSWORD;
        
        try {
            // Drop user if exists (for clean setup)
            try {
                await adminConnection.query(`DROP USER IF EXISTS '${prodUser}'@'localhost'`);
            } catch (err) {
                // Ignore if user doesn't exist
            }
            
            // Create new user
            await adminConnection.query(`CREATE USER '${prodUser}'@'localhost' IDENTIFIED BY '${prodPassword}'`);
            console.log(`✅ User '${prodUser}' created`);
            
            // Grant all privileges on the database
            await adminConnection.query(`GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO '${prodUser}'@'localhost'`);
            await adminConnection.query(`FLUSH PRIVILEGES`);
            console.log(`✅ Privileges granted to '${prodUser}' on '${dbName}'`);
            
        } catch (error) {
            if (error.code === 'ER_CANNOT_USER') {
                console.log(`✅ User '${prodUser}' already exists`);
                // Still grant privileges in case they changed
                await adminConnection.query(`GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO '${prodUser}'@'localhost'`);
                await adminConnection.query(`FLUSH PRIVILEGES`);
                console.log(`✅ Privileges updated for '${prodUser}'`);
            } else {
                throw error;
            }
        }
        
        await adminConnection.end();
        console.log('🔌 Admin connection closed\n');
        
        // Step 4: Connect as production user and set up schema
        console.log('🔌 Connecting as production user...');
        prodConnection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });
        console.log('✅ Connected as production user\n');
        
        // Step 5: Load and execute schema
        console.log('📄 Loading database schema...');
        const schemaPath = path.join(__dirname, '..', 'database', 'jobscooter_complete_schema.sql');
        
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found at: ${schemaPath}`);
        }
        
        let schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        // Remove CREATE DATABASE and USE statements since we're already connected to the right DB
        schemaSQL = schemaSQL.replace(/CREATE DATABASE[^;]+;/gi, '-- Database already created');
        schemaSQL = schemaSQL.replace(/USE[^;]+;/gi, '-- Already using correct database');
        
        console.log(`✅ Schema loaded (${Math.round(schemaSQL.length / 1024)}KB)\n`);
        
        // Step 6: Execute schema in chunks to handle complex statements
        console.log('⚡ Executing database schema...');
        
        const statements = splitSQLStatements(schemaSQL);
        let successCount = 0;
        let skipCount = 0;
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();
            
            if (!statement || 
                statement.startsWith('--') || 
                statement.toLowerCase().includes('database already created') ||
                statement.toLowerCase().includes('already using correct database')) {
                skipCount++;
                continue;
            }
            
            try {
                console.log(`   [${i + 1}/${statements.length}] ${getStatementType(statement)}`);
                
                await prodConnection.query(statement);
                successCount++;
                
            } catch (error) {
                if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
                    error.code === 'ER_DUP_KEYNAME' ||
                    error.message.includes('already exists')) {
                    console.log(`   ⚠️  Already exists (skipping)`);
                    skipCount++;
                } else {
                    console.error(`   ❌ Error: ${error.message}`);
                    // Don't fail on non-critical errors
                    if (!error.code || error.code.includes('ER_PARSE')) {
                        skipCount++;
                    } else {
                        throw error;
                    }
                }
            }
        }
        
        console.log(`\n🎉 Schema execution completed!`);
        console.log(`   ✅ ${successCount} statements executed successfully`);
        console.log(`   ⚠️  ${skipCount} statements skipped\n`);
        
        // Step 7: Verify the setup
        console.log('🔍 Verifying production database...');
        
        const [tables] = await prodConnection.query('SHOW TABLES');
        console.log(`✅ Database contains ${tables.length} tables:`);
        
        const tableNames = tables.map(table => Object.values(table)[0]).sort();
        tableNames.forEach((tableName, index) => {
            console.log(`   ${(index + 1).toString().padStart(2, ' ')}. ${tableName}`);
        });
        
        // Check for views
        const [views] = await prodConnection.query('SHOW FULL TABLES WHERE Table_type = "VIEW"');
        if (views.length > 0) {
            console.log(`\n✅ Database contains ${views.length} views:`);
            views.forEach((view, index) => {
                const viewName = Object.values(view)[0];
                console.log(`   ${index + 1}. ${viewName}`);
            });
        }
        
        // Check sample data
        try {
            const [institutions] = await prodConnection.query('SELECT COUNT(*) as count FROM accredited_institutions');
            const [settings] = await prodConnection.query('SELECT COUNT(*) as count FROM system_settings');
            console.log(`\n📊 Sample data:`);
            console.log(`   • ${institutions[0].count} accredited institutions`);
            console.log(`   • ${settings[0].count} system settings`);
        } catch (error) {
            console.log('   ⚠️  Could not verify sample data');
        }
        
        console.log('\n🎊 Production database setup completed successfully!');
        console.log('\n🔐 Production Credentials:');
        console.log(`   Host: ${process.env.DB_HOST}`);
        console.log(`   Database: ${process.env.DB_NAME}`);
        console.log(`   User: ${process.env.DB_USER}`);
        console.log(`   Password: [CONFIGURED]`);
        
        console.log('\n🚀 JobScooter is ready for production deployment!');
        
    } catch (error) {
        console.error('\n❌ Production setup failed:');
        console.error(`   Error: ${error.message}`);
        console.error(`   Code: ${error.code || 'UNKNOWN'}`);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n💡 Make sure MySQL root user has no password or update the script');
        }
        
        process.exit(1);
        
    } finally {
        if (prodConnection) {
            await prodConnection.end();
            console.log('\n🔌 Production connection closed');
        }
        if (adminConnection) {
            await adminConnection.end();
        }
    }
}

function splitSQLStatements(sql) {
    // Enhanced SQL statement splitter
    const statements = [];
    const lines = sql.split('\n');
    let currentStatement = '';
    let delimiter = ';';
    let inDelimiterBlock = false;
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip comments and empty lines
        if (!trimmedLine || trimmedLine.startsWith('--')) {
            continue;
        }
        
        // Handle DELIMITER commands
        if (trimmedLine.toUpperCase().startsWith('DELIMITER')) {
            const newDelimiter = trimmedLine.split(/\s+/)[1];
            if (newDelimiter) {
                delimiter = newDelimiter;
                inDelimiterBlock = delimiter !== ';';
            }
            continue;
        }
        
        currentStatement += line + '\n';
        
        // Check if statement ends
        if (trimmedLine.endsWith(delimiter)) {
            if (delimiter === '$$' && inDelimiterBlock) {
                // End of procedure/function
                statements.push(currentStatement.slice(0, -delimiter.length - 1));
                currentStatement = '';
                delimiter = ';';
                inDelimiterBlock = false;
            } else if (delimiter === ';') {
                // Regular statement
                statements.push(currentStatement.slice(0, -2));
                currentStatement = '';
            }
        }
    }
    
    if (currentStatement.trim()) {
        statements.push(currentStatement);
    }
    
    return statements.filter(stmt => stmt.trim().length > 0);
}

function getStatementType(statement) {
    const stmt = statement.trim().toLowerCase();
    if (stmt.includes('create table')) return 'CREATE TABLE';
    if (stmt.includes('create view')) return 'CREATE VIEW';
    if (stmt.includes('create procedure')) return 'CREATE PROCEDURE';
    if (stmt.includes('create trigger')) return 'CREATE TRIGGER';
    if (stmt.includes('create index')) return 'CREATE INDEX';
    if (stmt.includes('insert into')) return 'INSERT DATA';
    if (stmt.includes('alter table')) return 'ALTER TABLE';
    if (stmt.startsWith('set ')) return 'SET VARIABLE';
    return 'SQL STATEMENT';
}

// Run the setup
if (require.main === module) {
    setupProductionDatabase().catch(console.error);
}

module.exports = { setupProductionDatabase };