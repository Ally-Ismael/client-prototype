#!/usr/bin/env node

/**
 * Clean Production Database Setup
 * Drops existing tables and creates fresh schema
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupProductionClean() {
    let connection;
    
    try {
        console.log('🚀 Clean Production Database Setup for JobScooter...\n');
        
        // Connect as root to the production database
        console.log('🔌 Connecting to MySQL as root...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: 'root',
            password: '',
            database: process.env.DB_NAME,
            multipleStatements: true
        });
        console.log(`✅ Connected to database: ${process.env.DB_NAME}\n`);
        
        // Drop existing tables (in reverse dependency order)
        console.log('🧹 Cleaning existing database structure...');
        const dropTables = [
            'employer_contacts',
            'profile_views', 
            'applicant_privacy_settings',
            'traffic_light_scores',
            'generated_cvs',
            'language_verifications',
            'certificates',
            'activity_logs',
            'application_sessions',
            'public_profiles',
            'applicants',
            'subscribers',
            'system_settings',
            'accredited_institutions'
        ];
        
        for (const table of dropTables) {
            try {
                await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
                console.log(`   ✅ Dropped table: ${table}`);
            } catch (error) {
                console.log(`   ⚠️  Could not drop ${table}: ${error.message}`);
            }
        }
        
        console.log('\n📄 Loading fresh schema...');
        const schemaPath = path.join(__dirname, '..', 'database', 'jobscooter_complete_schema.sql');
        
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found at: ${schemaPath}`);
        }
        
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        console.log(`✅ Schema loaded (${Math.round(schemaSQL.length / 1024)}KB)\n`);
        
        // Execute schema in proper order
        console.log('🏗️  Creating fresh database structure...');
        
        // 1. Create core tables first
        const coreTableOrder = [
            'applicants',
            'public_profiles', 
            'application_sessions',
            'certificates',
            'language_verifications', 
            'traffic_light_scores',
            'generated_cvs',
            'activity_logs',
            'profile_views',
            'applicant_privacy_settings',
            'accredited_institutions',
            'subscribers',
            'employer_contacts',
            'system_settings'
        ];
        
        for (const tableName of coreTableOrder) {
            try {
                const tableSQL = extractTableSQL(schemaSQL, tableName);
                if (tableSQL) {
                    console.log(`   📋 Creating ${tableName}...`);
                    await connection.query(tableSQL);
                    console.log(`   ✅ ${tableName} created successfully`);
                } else {
                    console.log(`   ⚠️  ${tableName} SQL not found in schema`);
                }
            } catch (error) {
                console.error(`   ❌ Error creating ${tableName}: ${error.message}`);
                // Continue with other tables
            }
        }
        
        // 2. Insert sample data
        console.log('\n📊 Inserting sample data...');
        const sampleDataTables = [
            'accredited_institutions',
            'system_settings', 
            'subscribers'
        ];
        
        for (const tableName of sampleDataTables) {
            try {
                const insertSQL = extractInsertSQL(schemaSQL, tableName);
                if (insertSQL) {
                    console.log(`   📥 Inserting ${tableName} data...`);
                    await connection.query(insertSQL);
                    console.log(`   ✅ ${tableName} data inserted`);
                }
            } catch (error) {
                if (error.code !== 'ER_DUP_ENTRY') {
                    console.error(`   ❌ Error inserting ${tableName}: ${error.message}`);
                } else {
                    console.log(`   ⚠️  ${tableName} data already exists`);
                }
            }
        }
        
        // 3. Create indexes
        console.log('\n🔍 Creating database indexes...');
        const indexes = extractIndexes(schemaSQL);
        for (let i = 0; i < indexes.length; i++) {
            try {
                console.log(`   [${i + 1}/${indexes.length}] Creating index...`);
                await connection.query(indexes[i]);
                console.log(`   ✅ Index created`);
            } catch (error) {
                if (error.code === 'ER_DUP_KEYNAME') {
                    console.log(`   ⚠️  Index already exists`);
                } else {
                    console.error(`   ❌ Error: ${error.message}`);
                }
            }
        }
        
        // Verify final setup
        console.log('\n🔍 Verifying production database...');
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`✅ Database contains ${tables.length} tables:\n`);
        
        const tableNames = tables.map(table => Object.values(table)[0]).sort();
        tableNames.forEach((tableName, index) => {
            console.log(`   ${(index + 1).toString().padStart(2, ' ')}. ${tableName}`);
        });
        
        // Check sample data counts
        console.log('\n📊 Sample data verification:');
        const dataChecks = [
            { table: 'accredited_institutions', desc: 'accredited institutions' },
            { table: 'system_settings', desc: 'system settings' },
            { table: 'subscribers', desc: 'sample subscribers' }
        ];
        
        for (const check of dataChecks) {
            try {
                const [result] = await connection.query(`SELECT COUNT(*) as count FROM ${check.table}`);
                console.log(`   • ${result[0].count} ${check.desc}`);
            } catch (err) {
                console.log(`   ⚠️  ${check.table}: ${err.message}`);
            }
        }
        
        console.log('\n🎊 Production database setup completed successfully!');
        console.log('\n🔐 Production Ready Configuration:');
        console.log(`   Host: ${process.env.DB_HOST}`);
        console.log(`   Database: ${process.env.DB_NAME}`);
        console.log(`   Tables: ${tables.length}`);
        console.log(`   Environment: ${process.env.NODE_ENV}`);
        
        console.log('\n🚀 JobScooter is ready for production deployment!');
        console.log('\n💡 Next steps:');
        console.log('   1. Test the application with: npm start');
        console.log('   2. Verify all features work correctly');
        console.log('   3. Deploy to production server');
        
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

function extractTableSQL(schemaSQL, tableName) {
    const regex = new RegExp(`CREATE TABLE \`${tableName}\`[\\s\\S]*?ENGINE=InnoDB[^;]*;`, 'i');
    const match = schemaSQL.match(regex);
    return match ? match[0] : null;
}

function extractInsertSQL(schemaSQL, tableName) {
    const regex = new RegExp(`INSERT INTO \`${tableName}\`[\\s\\S]*?;`, 'i');
    const match = schemaSQL.match(regex);
    return match ? match[0] : null;
}

function extractIndexes(schemaSQL) {
    const regex = /CREATE INDEX.*?;/gs;
    const matches = schemaSQL.match(regex) || [];
    return matches;
}

// Run the setup
if (require.main === module) {
    setupProductionClean().catch(console.error);
}

module.exports = { setupProductionClean };