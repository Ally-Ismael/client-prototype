#!/usr/bin/env node

console.log('🔍 JobScooter cPanel/Passenger Diagnostic Script');
console.log('=' .repeat(50));

// Environment Information
console.log('\n📋 ENVIRONMENT VARIABLES:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`PORT: ${process.env.PORT || 'not set'}`);
console.log(`HOST: ${process.env.HOST || 'not set'}`);
console.log(`HOME: ${process.env.HOME || 'not set'}`);
console.log(`USER: ${process.env.USER || 'not set'}`);
console.log(`PWD: ${process.env.PWD || 'not set'}`);

// Passenger-specific environment
console.log('\n🚀 PASSENGER ENVIRONMENT:');
console.log(`PASSENGER_APP_ENV: ${process.env.PASSENGER_APP_ENV || 'not set'}`);
console.log(`PASSENGER_LOG_LEVEL: ${process.env.PASSENGER_LOG_LEVEL || 'not set'}`);
console.log(`PASSENGER_DEBUG_MODE: ${process.env.PASSENGER_DEBUG_MODE || 'not set'}`);
console.log(`PASSENGER_APP_ROOT: ${process.env.PASSENGER_APP_ROOT || 'not set'}`);

// Process information
console.log('\n⚙️ PROCESS INFORMATION:');
console.log(`Process ID: ${process.pid}`);
console.log(`Node Version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Architecture: ${process.arch}`);
console.log(`Current Working Directory: ${process.cwd()}`);

// File system checks
const fs = require('fs');
const path = require('path');

console.log('\n📁 FILE SYSTEM CHECKS:');

const criticalFiles = [
    'server.js',
    'test-server.js',
    'package.json',
    '.env',
    'public/index.html'
];

criticalFiles.forEach(file => {
    try {
        const exists = fs.existsSync(file);
        const stats = exists ? fs.statSync(file) : null;
        console.log(`${exists ? '✅' : '❌'} ${file} ${exists ? `(${stats.size} bytes)` : '(missing)'}`);
        
        if (exists && stats) {
            console.log(`   Modified: ${stats.mtime.toISOString()}`);
            console.log(`   Permissions: ${(stats.mode & parseInt('777', 8)).toString(8)}`);
        }
    } catch (error) {
        console.log(`❌ ${file} (error: ${error.message})`);
    }
});

// Directory checks
const criticalDirs = [
    'public',
    'routes',
    'logs',
    'node_modules'
];

console.log('\n📂 DIRECTORY CHECKS:');
criticalDirs.forEach(dir => {
    try {
        const exists = fs.existsSync(dir);
        const stats = exists ? fs.statSync(dir) : null;
        console.log(`${exists ? '✅' : '❌'} ${dir}/ ${exists ? '(exists)' : '(missing)'}`);
        
        if (exists && stats) {
            console.log(`   Permissions: ${(stats.mode & parseInt('777', 8)).toString(8)}`);
        }
    } catch (error) {
        console.log(`❌ ${dir}/ (error: ${error.message})`);
    }
});

// Package.json check
console.log('\n📦 PACKAGE.JSON CHECK:');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`✅ Package name: ${packageJson.name}`);
    console.log(`✅ Version: ${packageJson.version}`);
    console.log(`✅ Main script: ${packageJson.main || 'not set'}`);
    console.log(`✅ Start script: ${packageJson.scripts?.start || 'not set'}`);
    
    // Check critical dependencies
    const criticalDeps = ['express', 'mysql2', 'cors', 'dotenv'];
    console.log('\n📚 CRITICAL DEPENDENCIES:');
    criticalDeps.forEach(dep => {
        const version = packageJson.dependencies?.[dep];
        console.log(`${version ? '✅' : '❌'} ${dep}: ${version || 'missing'}`);
    });
} catch (error) {
    console.log(`❌ Error reading package.json: ${error.message}`);
}

// .env file check
console.log('\n🔧 .ENV FILE CHECK:');
try {
    if (fs.existsSync('.env')) {
        const envContent = fs.readFileSync('.env', 'utf8');
        const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        console.log(`✅ .env file exists with ${envLines.length} variables`);
        
        const criticalEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
        criticalEnvVars.forEach(varName => {
            const hasVar = envLines.some(line => line.startsWith(`${varName}=`));
            console.log(`${hasVar ? '✅' : '❌'} ${varName}: ${hasVar ? 'set' : 'missing'}`);
        });
    } else {
        console.log('❌ .env file does not exist');
    }
} catch (error) {
    console.log(`❌ Error reading .env file: ${error.message}`);
}

// Test Express app loading
console.log('\n🧪 EXPRESS APP LOADING TEST:');
try {
    const express = require('express');
    console.log('✅ Express module loads successfully');
    
    // Try to load the test server
    try {
        require('./test-server');
        console.log('✅ test-server.js loads successfully');
    } catch (error) {
        console.log(`❌ test-server.js failed to load: ${error.message}`);
    }
    
} catch (error) {
    console.log(`❌ Express module failed to load: ${error.message}`);
}

console.log('\n' + '=' .repeat(50));
console.log('🎯 NEXT STEPS:');
console.log('1. Upload this diagnostic script to your server');
console.log('2. Run: node diagnose.js');
console.log('3. Check for any ❌ errors in the output');
console.log('4. Upload test-server.js and set it as startup file in cPanel');
console.log('5. Test with the minimal server first');
console.log('=' .repeat(50));

module.exports = {
    runDiagnostics: () => {
        console.log('Diagnostic script completed');
    }
};