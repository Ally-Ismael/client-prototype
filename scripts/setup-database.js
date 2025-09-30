#!/usr/bin/env node

/**
 * Database Setup Script
 * Sets up the JobScooter database schema using production credentials
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    let connection;
    
    try {
        console.log('🚀 Starting JobScooter Database Setup...\n');
        
        // Read the schema file
        const schemaPath = path.join(__dirname, '..', 'database', 'jobscooter_complete_schema.sql');
        console.log(`📄 Reading schema from: ${schemaPath}`);
        
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found at: ${schemaPath}`);
        }
        
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        console.log(`✅ Schema file loaded (${Math.round(schemaSQL.length / 1024)}KB)\n`);
        
        // Connect to MySQL server (without specifying database first)
        console.log('🔌 Connecting to MySQL server...');
        console.log(`   Host: ${process.env.DB_HOST}`);
        console.log(`   Port: ${process.env.DB_PORT}`);
        console.log(`   User: ${process.env.DB_USER}`);
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true,
            timezone: 'Z'
        });
        
        console.log('✅ Connected to MySQL server\n');
        
        // Split SQL into statements (handle DELIMITER changes)
        console.log('📋 Processing SQL statements...');
        
        const statements = splitSQLStatements(schemaSQL);
        console.log(`   Found ${statements.length} statements to execute\n`);
        
        let successCount = 0;
        let skipCount = 0;
        
        // Execute statements one by one
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();
            
            if (!statement || statement.startsWith('--') || statement.toLowerCase().startsWith('delimiter')) {
                skipCount++;
                continue;
            }
            
            try {
                console.log(`⚡ [${i + 1}/${statements.length}] Executing: ${getStatementType(statement)}`);
                
                // Use query instead of execute for commands not supported in prepared statements
                let result;
                if (statement.trim().toLowerCase().startsWith('start transaction') ||
                    statement.trim().toLowerCase().startsWith('commit') ||
                    statement.trim().toLowerCase().startsWith('set ') ||
                    statement.trim().toLowerCase().startsWith('use ') ||
                    statement.trim().toLowerCase().startsWith('delimiter') ||
                    statement.trim().toLowerCase().includes('create database') ||
                    statement.trim().toLowerCase().includes('create view') ||
                    statement.trim().toLowerCase().includes('create procedure') ||
                    statement.trim().toLowerCase().includes('create trigger')) {
                    result = await connection.query(statement);
                } else {
                    result = await connection.execute(statement);
                }
                
                // Handle array result
                if (Array.isArray(result)) {
                    result = result[0];
                }
                successCount++;
                
                // Show meaningful results
                if (result && typeof result === 'object') {
                    if (result.affectedRows !== undefined) {
                        console.log(`   ✅ ${result.affectedRows} rows affected`);
                    } else if (result.length > 0) {
                        console.log(`   ✅ ${result.length} rows returned`);
                    }
                }
                
            } catch (error) {
                // Some errors are acceptable (like table already exists)
                if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
                    error.code === 'ER_DB_CREATE_EXISTS' ||
                    error.message.includes('already exists')) {
                    console.log(`   ⚠️  Already exists (skipping)`);
                    skipCount++;
                } else {
                    console.error(`   ❌ Error: ${error.message}`);
                    // Don't throw for non-critical errors
                    if (error.code !== 'ER_PARSE_ERROR') {
                        throw error;
                    }
                }
            }
        }
        
        console.log('\n🎉 Database setup completed successfully!');
        console.log(`   ✅ ${successCount} statements executed`);
        console.log(`   ⚠️  ${skipCount} statements skipped`);
        
        // Verify setup by checking tables
        console.log('\n🔍 Verifying database setup...');
        
        // Switch to the target database
        await connection.execute(`USE \`${process.env.DB_NAME}\``);
        
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`✅ Database contains ${tables.length} tables:`);
        
        tables.forEach((table, index) => {
            const tableName = Object.values(table)[0];
            console.log(`   ${index + 1}. ${tableName}`);
        });
        
        // Check views
        const [views] = await connection.execute('SHOW FULL TABLES WHERE Table_type = "VIEW"');
        if (views.length > 0) {
            console.log(`✅ Database contains ${views.length} views:`);
            views.forEach((view, index) => {
                const viewName = Object.values(view)[0];
                console.log(`   ${index + 1}. ${viewName}`);
            });
        }
        
        // Check procedures
        const [procedures] = await connection.execute('SHOW PROCEDURE STATUS WHERE Db = ?', [process.env.DB_NAME]);
        if (procedures.length > 0) {
            console.log(`✅ Database contains ${procedures.length} stored procedures:`);
            procedures.forEach((proc, index) => {
                console.log(`   ${index + 1}. ${proc.Name}`);
            });
        }
        
        console.log('\n🎊 JobScooter database is ready for production!');
        
    } catch (error) {
        console.error('\n❌ Database setup failed:');
        console.error(`   Error: ${error.message}`);
        console.error(`   Code: ${error.code || 'UNKNOWN'}`);
        
        if (error.code === 'EACCES' || error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n💡 Possible solutions:');
            console.error('   1. Check your database credentials in .env file');
            console.error('   2. Ensure the database user has sufficient privileges');
            console.error('   3. Verify the database server is running');
        }
        
        process.exit(1);
        
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

function splitSQLStatements(sql) {
    // Handle DELIMITER changes and split statements appropriately
    const statements = [];
    const lines = sql.split('\n');
    let currentStatement = '';
    let delimiter = ';';
    let inProcedure = false;
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Handle DELIMITER commands
        if (trimmedLine.startsWith('DELIMITER')) {
            delimiter = trimmedLine.split(' ')[1] || ';';
            continue;
        }
        
        // Track if we're inside a procedure/function
        if (trimmedLine.toLowerCase().includes('create procedure') || 
            trimmedLine.toLowerCase().includes('create function')) {
            inProcedure = true;
        }
        
        currentStatement += line + '\n';
        
        // Check if statement ends
        if (trimmedLine.endsWith(delimiter) && trimmedLine !== delimiter) {
            statements.push(currentStatement.slice(0, -delimiter.length - 1));
            currentStatement = '';
            if (delimiter === '$$') {
                inProcedure = false;
                delimiter = ';';
            }
        } else if (trimmedLine === delimiter && inProcedure) {
            statements.push(currentStatement.slice(0, -delimiter.length - 1));
            currentStatement = '';
            inProcedure = false;
            delimiter = ';';
        }
    }
    
    if (currentStatement.trim()) {
        statements.push(currentStatement);
    }
    
    return statements.filter(stmt => stmt.trim().length > 0);
}

function getStatementType(statement) {
    const stmt = statement.trim().toLowerCase();
    if (stmt.startsWith('create table')) return 'CREATE TABLE';
    if (stmt.startsWith('create database')) return 'CREATE DATABASE';
    if (stmt.startsWith('create view')) return 'CREATE VIEW';
    if (stmt.startsWith('create procedure')) return 'CREATE PROCEDURE';
    if (stmt.startsWith('create trigger')) return 'CREATE TRIGGER';
    if (stmt.startsWith('insert into')) return 'INSERT DATA';
    if (stmt.startsWith('create index')) return 'CREATE INDEX';
    if (stmt.startsWith('use ')) return 'USE DATABASE';
    if (stmt.startsWith('set ')) return 'SET VARIABLE';
    if (stmt.startsWith('start transaction')) return 'START TRANSACTION';
    if (stmt.startsWith('commit')) return 'COMMIT';
    if (stmt.startsWith('select ')) return 'SELECT';
    return 'SQL STATEMENT';
}

// Run the setup
if (require.main === module) {
    setupDatabase().catch(console.error);
}

module.exports = { setupDatabase };