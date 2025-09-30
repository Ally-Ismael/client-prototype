const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// Simple diagnostic endpoint that can be accessed via web browser
app.get('/diagnostic', (req, res) => {
    let output = [];
    
    const log = (message) => {
        console.log(message);
        output.push(message);
    };

    try {
        log('🔍 JobScooter cPanel/Passenger Web Diagnostic');
        log('=' .repeat(50));

        // Environment Information
        log('\n📋 ENVIRONMENT VARIABLES:');
        log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
        log(`PORT: ${process.env.PORT || 'not set'}`);
        log(`HOST: ${process.env.HOST || 'not set'}`);
        log(`HOME: ${process.env.HOME || 'not set'}`);
        log(`USER: ${process.env.USER || 'not set'}`);
        log(`PWD: ${process.env.PWD || 'not set'}`);

        // Passenger-specific environment
        log('\n🚀 PASSENGER ENVIRONMENT:');
        log(`PASSENGER_APP_ENV: ${process.env.PASSENGER_APP_ENV || 'not set'}`);
        log(`PASSENGER_LOG_LEVEL: ${process.env.PASSENGER_LOG_LEVEL || 'not set'}`);
        log(`PASSENGER_DEBUG_MODE: ${process.env.PASSENGER_DEBUG_MODE || 'not set'}`);
        log(`PASSENGER_APP_ROOT: ${process.env.PASSENGER_APP_ROOT || 'not set'}`);

        // Process information
        log('\n⚙️ PROCESS INFORMATION:');
        log(`Process ID: ${process.pid}`);
        log(`Node Version: ${process.version}`);
        log(`Platform: ${process.platform}`);
        log(`Architecture: ${process.arch}`);
        log(`Current Working Directory: ${process.cwd()}`);

        // File system checks
        log('\n📁 FILE SYSTEM CHECKS:');
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
                log(`${exists ? '✅' : '❌'} ${file} ${exists ? `(${stats.size} bytes)` : '(missing)'}`);
            } catch (error) {
                log(`❌ ${file} (error: ${error.message})`);
            }
        });

        // Directory checks
        const criticalDirs = ['public', 'routes', 'logs', 'node_modules'];
        log('\n📂 DIRECTORY CHECKS:');
        criticalDirs.forEach(dir => {
            try {
                const exists = fs.existsSync(dir);
                log(`${exists ? '✅' : '❌'} ${dir}/ ${exists ? '(exists)' : '(missing)'}`);
            } catch (error) {
                log(`❌ ${dir}/ (error: ${error.message})`);
            }
        });

        // Package.json check
        log('\n📦 PACKAGE.JSON CHECK:');
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            log(`✅ Package name: ${packageJson.name}`);
            log(`✅ Version: ${packageJson.version}`);
            log(`✅ Main script: ${packageJson.main || 'not set'}`);
            log(`✅ Start script: ${packageJson.scripts?.start || 'not set'}`);
        } catch (error) {
            log(`❌ Error reading package.json: ${error.message}`);
        }

        // .env file check
        log('\n🔧 .ENV FILE CHECK:');
        try {
            if (fs.existsSync('.env')) {
                const envContent = fs.readFileSync('.env', 'utf8');
                const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
                log(`✅ .env file exists with ${envLines.length} variables`);
            } else {
                log('❌ .env file does not exist');
            }
        } catch (error) {
            log(`❌ Error reading .env file: ${error.message}`);
        }

        log('\n' + '=' .repeat(50));
        log('✅ Web diagnostic completed');

    } catch (error) {
        log(`❌ Diagnostic error: ${error.message}`);
    }

    // Return as both HTML and plain text
    const htmlOutput = output.join('\n').replace(/\n/g, '<br>');
    const plainOutput = output.join('\n');

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>JobScooter Diagnostic Results</title>
            <style>
                body { font-family: 'Courier New', monospace; padding: 20px; background: #1a1a1a; color: #00ff00; }
                .output { white-space: pre; background: #000; padding: 20px; border-radius: 5px; overflow-x: auto; }
                .copy-btn { background: #333; color: white; padding: 10px; border: none; cursor: pointer; margin: 10px 0; }
            </style>
        </head>
        <body>
            <h1>🔍 JobScooter Diagnostic Results</h1>
            <button class="copy-btn" onclick="copyToClipboard()">📋 Copy Results</button>
            <div class="output" id="output">${htmlOutput}</div>
            
            <script>
                function copyToClipboard() {
                    const text = \`${plainOutput.replace(/`/g, '\\`')}\`;
                    navigator.clipboard.writeText(text).then(() => {
                        alert('Diagnostic results copied to clipboard!');
                    });
                }
            </script>
        </body>
        </html>
    `);
});

// Export for use
module.exports = app;

// If run directly, start server
if (require.main === module) {
    const PORT = process.env.PORT || 3002;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🔍 Diagnostic server running on port ${PORT}`);
        console.log(`Visit: http://localhost:${PORT}/diagnostic`);
    });
}