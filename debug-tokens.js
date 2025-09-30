#!/usr/bin/env node

// Debug script to check verification tokens in memory

console.log('🔍 Checking current verification tokens...\n');

// Mock verification tokens (stored during development)
if (global.mockVerificationTokens) {
    console.log('📋 Mock Verification Tokens:');
    console.log('Count:', Object.keys(global.mockVerificationTokens).length);
    
    for (const [token, userData] of Object.entries(global.mockVerificationTokens)) {
        console.log(`\n🔑 Token: ${token}`);
        console.log(`   👤 User: ${userData.first_name} ${userData.surname}`);
        console.log(`   📧 Email: ${userData.email}`);
        console.log(`   🏷  Username: ${userData.username}`);
        console.log(`   📊 Status: ${userData.status}`);
        console.log(`   📅 Created: ${userData.created_at}`);
    }
} else {
    console.log('❌ No mock verification tokens found');
}

// Active users (after verification)
if (global.mockActiveUsers) {
    console.log('\n👥 Mock Active Users:');
    console.log('Count:', Object.keys(global.mockActiveUsers).length);
    
    for (const [email, userData] of Object.entries(global.mockActiveUsers)) {
        console.log(`\n📧 Email: ${email}`);
        console.log(`   👤 User: ${userData.first_name} ${userData.surname}`);
        console.log(`   🏷  Username: ${userData.username}`);
        console.log(`   ✅ Verified: ${userData.is_verified ? 'Yes' : 'No'}`);
        console.log(`   📅 Verified at: ${userData.email_verified_at || 'Not verified'}`);
    }
} else {
    console.log('\n❌ No mock active users found');
}

console.log('\n🏁 Debug completed.');