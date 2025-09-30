const mysql = require('mysql2');

// Create connection to MariaDB
const connection = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '', // No password for local root
    database: 'sedafzgt_jobscootercoz614_jobscooter'
});

async function debugVerification() {
    try {
        console.log('🔌 Connecting to database...');
        
        // Get the latest user(s) with their verification tokens
        const users = await new Promise((resolve, reject) => {
            connection.query(`
                SELECT id, first_name, surname, email, status, email_verification_token, 
                       email_verified_at, created_at, updated_at
                FROM applicants 
                ORDER BY created_at DESC 
                LIMIT 3
            `, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        console.log('👥 Latest users in database:');
        users.forEach((user, index) => {
            console.log(`\n${index + 1}. User: ${user.first_name} ${user.surname}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Status: ${user.status}`);
            console.log(`   Verification Token: ${user.email_verification_token ? 'EXISTS' : 'NULL'}`);
            console.log(`   Token Value: ${user.email_verification_token || 'N/A'}`);
            console.log(`   Email Verified: ${user.email_verified_at ? 'YES' : 'NO'}`);
            console.log(`   Created: ${user.created_at}`);
        });
        
        // Test a specific token if provided
        const testToken = process.argv[2];
        if (testToken) {
            console.log(`\n🔍 Testing token: ${testToken}`);
            
            const tokenUser = await new Promise((resolve, reject) => {
                connection.query(`
                    SELECT * FROM applicants 
                    WHERE email_verification_token = ?
                `, [testToken], (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]);
                });
            });
            
            if (tokenUser) {
                console.log('✅ Token found in database');
                console.log(`   User: ${tokenUser.first_name} ${tokenUser.surname}`);
                console.log(`   Status: ${tokenUser.status}`);
                console.log(`   Email Verified: ${tokenUser.email_verified_at ? 'YES' : 'NO'}`);
            } else {
                console.log('❌ Token not found in database');
            }
        }
        
        console.log('\n🎉 Debug completed!');
        
    } catch (error) {
        console.error('💥 Debug failed:', error.message);
    } finally {
        connection.end();
    }
}

// Run if called directly
if (require.main === module) {
    debugVerification();
}

module.exports = debugVerification;