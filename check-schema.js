const mysql = require('mysql2');

// Create connection to MariaDB
const connection = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '', // No password for local root
    database: 'sedafzgt_jobscootercoz614_jobscooter'
});

async function checkSchema() {
    try {
        console.log('🔌 Connecting to database...');
        
        // Check if applicants table exists and its structure
        const tableExists = await new Promise((resolve, reject) => {
            connection.query('SHOW TABLES LIKE "applicants"', (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0);
            });
        });
        
        if (!tableExists) {
            console.log('❌ Applicants table does not exist!');
            return;
        }
        
        console.log('✅ Applicants table exists');
        
        // Get table structure
        const columns = await new Promise((resolve, reject) => {
            connection.query('DESCRIBE applicants', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        console.log('📋 Applicants table columns:');
        columns.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(required)'}`);
        });
        
        // Check if the specific columns we need exist
        const requiredColumns = ['date_of_birth', 'gender', 'preferred_name'];
        const existingColumns = columns.map(col => col.Field);
        
        console.log('\n🔍 Checking required columns:');
        requiredColumns.forEach(col => {
            if (existingColumns.includes(col)) {
                console.log(`  ✅ ${col} - EXISTS`);
            } else {
                console.log(`  ❌ ${col} - MISSING`);
            }
        });
        
        // If columns are missing, create them
        const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
        
        if (missingColumns.length > 0) {
            console.log('\n🔧 Adding missing columns...');
            
            for (const col of missingColumns) {
                let alterSQL = '';
                
                switch (col) {
                    case 'date_of_birth':
                        alterSQL = 'ALTER TABLE applicants ADD COLUMN date_of_birth DATE NULL';
                        break;
                    case 'gender':
                        alterSQL = "ALTER TABLE applicants ADD COLUMN gender ENUM('Male','Female','Other','Prefer not to say') NULL";
                        break;
                    case 'preferred_name':
                        alterSQL = 'ALTER TABLE applicants ADD COLUMN preferred_name VARCHAR(100) NULL';
                        break;
                }
                
                if (alterSQL) {
                    try {
                        await new Promise((resolve, reject) => {
                            connection.query(alterSQL, (err, result) => {
                                if (err) reject(err);
                                else resolve(result);
                            });
                        });
                        console.log(`  ✅ Added column: ${col}`);
                    } catch (error) {
                        console.log(`  ❌ Failed to add column ${col}:`, error.message);
                    }
                }
            }
        }
        
        console.log('\n🎉 Schema check completed!');
        
    } catch (error) {
        console.error('💥 Schema check failed:', error.message);
    } finally {
        connection.end();
    }
}

// Run if called directly
if (require.main === module) {
    checkSchema();
}

module.exports = checkSchema;