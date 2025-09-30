const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Create connection to MariaDB (without selecting a database first)
const connection = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '', // No password for local root
    multipleStatements: true
});

async function setupLocalDatabase() {
    try {
        console.log('🔌 Connecting to MariaDB...');
        
        // Create database if it doesn't exist
        const createDbQuery = `CREATE DATABASE IF NOT EXISTS \`sedafzgt_jobscootercoz614_jobscooter\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
        
        await new Promise((resolve, reject) => {
            connection.query(createDbQuery, (err, result) => {
                if (err) {
                    console.error('❌ Error creating database:', err.message);
                    reject(err);
                } else {
                    console.log('✅ Database created or already exists');
                    resolve(result);
                }
            });
        });
        
        // Use the database
        await new Promise((resolve, reject) => {
            connection.query('USE `sedafzgt_jobscootercoz614_jobscooter`', (err, result) => {
                if (err) {
                    console.error('❌ Error selecting database:', err.message);
                    reject(err);
                } else {
                    console.log('✅ Using JobScooter database');
                    resolve(result);
                }
            });
        });
        
        // Check if tables exist
        const tablesQuery = 'SHOW TABLES';
        const tables = await new Promise((resolve, reject) => {
            connection.query(tablesQuery, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        console.log(`📊 Found ${tables.length} existing tables`);
        
        if (tables.length === 0) {
            console.log('📋 No tables found. Setting up database schema...');
            
            // Read and execute the schema file
            const schemaPath = path.join(__dirname, 'database', 'jobscooter_complete_schema.sql');
            if (fs.existsSync(schemaPath)) {
                let schema = fs.readFileSync(schemaPath, 'utf8');
                
                // Clean up the schema for MariaDB compatibility
                schema = schema.replace(/-- phpMyAdmin SQL Dump[\\s\\S]*?-- PHP Version: [\\d.]+\\n/g, '');
                schema = schema.replace(/SET SQL_MODE[\\s\\S]*?;\\n/g, '');
                schema = schema.replace(/START TRANSACTION;\\n/g, '');
                schema = schema.replace(/SET time_zone[\\s\\S]*?;\\n/g, '');
schema = schema.replace(/\/\*!\d+ [\s\S]*?\*\//g, '');
                schema = schema.replace(/COMMIT;\\n/g, '');
                
                // Remove CREATE DATABASE statements since we already created it
                schema = schema.replace(/CREATE DATABASE[\\s\\S]*?;/g, '');
                schema = schema.replace(/USE [\\s\\S]*?;/g, '');
                
                // Execute schema
                await new Promise((resolve, reject) => {
                    connection.query(schema, (err, result) => {
                        if (err) {
                            console.error('❌ Error executing schema:', err.message);
                            // Don't reject - some errors might be acceptable
                            console.log('⚠️ Continuing despite schema errors...');
                            resolve();
                        } else {
                            console.log('✅ Database schema created successfully');
                            resolve(result);
                        }
                    });
                });
            } else {
                console.log('⚠️ Schema file not found, creating basic tables...');
                
                // Create basic tables
                const basicTables = `
                    CREATE TABLE IF NOT EXISTS applicants (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(100) NOT NULL UNIQUE,
                        password_hash VARCHAR(255) NOT NULL,
                        first_name VARCHAR(100) NOT NULL,
                        surname VARCHAR(100) NOT NULL,
                        email VARCHAR(255) NOT NULL UNIQUE,
                        phone VARCHAR(20),
                        country VARCHAR(100) DEFAULT 'South Africa',
                        id_number VARCHAR(50),
                        status ENUM('pending_verification','active','suspended','deleted') DEFAULT 'pending_verification',
                        completion_percentage INT(3) DEFAULT 0,
                        traffic_light_status ENUM('red','yellow','green') DEFAULT 'red',
                        email_verification_token VARCHAR(255),
                        is_verified TINYINT(1) DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                    
                    CREATE TABLE IF NOT EXISTS application_sessions (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        session_token VARCHAR(255) NOT NULL UNIQUE,
                        step_completed INT(2) DEFAULT 0,
                        extracted_data JSON,
                        expires_at DATETIME NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                `;
                
                await new Promise((resolve, reject) => {
                    connection.query(basicTables, (err, result) => {
                        if (err) {
                            console.error('❌ Error creating basic tables:', err.message);
                            reject(err);
                        } else {
                            console.log('✅ Basic tables created successfully');
                            resolve(result);
                        }
                    });
                });
            }
        } else {
            console.log('✅ Tables already exist, skipping schema setup');
        }
        
        console.log('🎉 Database setup completed successfully!');
        console.log('📍 Database: sedafzgt_jobscootercoz614_jobscooter @ 127.0.0.1:3306');
        
    } catch (error) {
        console.error('💥 Database setup failed:', error.message);
        throw error;
    } finally {
        connection.end();
    }
}

// Run setup if called directly
if (require.main === module) {
    setupLocalDatabase()
        .then(() => {
            console.log('✅ Setup completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Setup failed:', error);
            process.exit(1);
        });
}

module.exports = setupLocalDatabase;