// Test runner for main server
// This allows you to run the main server.js on a specific port for testing

const app = require('./server');

const PORT = process.env.PORT || 3003;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`🚀 Main server listening on ${HOST}:${PORT}`);
    console.log(`   Visit: http://${HOST}:${PORT}/`);
    console.log(`   Health: http://${HOST}:${PORT}/api/health`);
    console.log(`   API Info: http://${HOST}:${PORT}/api/info`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Main server shutting down...');
    process.exit(0);
});