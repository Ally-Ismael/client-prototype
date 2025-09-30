const express = require('express');
const path = require('path');

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.static('public'));

// Simple test routes
app.get('/', (req, res) => {
    res.json({
        message: 'JobScooter Test Server is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 'not set',
        host: process.env.HOST || 'not set'
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        test: true,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/info', (req, res) => {
    res.json({
        name: 'JobScooter Test Server',
        version: '1.0.0',
        passenger: true,
        environment: {
            NODE_ENV: process.env.NODE_ENV,
            PORT: process.env.PORT,
            HOST: process.env.HOST
        }
    });
});

// Diagnostic endpoint
app.get('/diagnostic', (req, res) => {
    const fs = require('fs');
    let output = [];
    
    const log = (message) => output.push(message);

    log('🔍 JobScooter Test Server Diagnostic');
    log('NODE_ENV: ' + (process.env.NODE_ENV || 'not set'));
    log('PORT: ' + (process.env.PORT || 'not set'));
    log('HOST: ' + (process.env.HOST || 'not set'));
    log('Node Version: ' + process.version);
    log('Current Directory: ' + process.cwd());
    
    // File checks
    const files = ['server.js', 'package.json', '.env', 'public/index.html'];
    files.forEach(file => {
        const exists = fs.existsSync(file);
        log(`${exists ? '✅' : '❌'} ${file}`);
    });
    
    res.json({
        diagnostic: output,
        timestamp: new Date().toISOString()
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Not found',
        path: req.originalUrl 
    });
});

// Export the app for Passenger
module.exports = app;

console.log('✅ Test server module loaded successfully');