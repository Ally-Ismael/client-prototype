// Test runner for minimal server
// This allows you to run the test-server.js on a specific port for testing

const app = require('./test-server');

const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`🧪 Test server listening on ${HOST}:${PORT}`);
    console.log(`   Visit: http://${HOST}:${PORT}/`);
    console.log(`   Health: http://${HOST}:${PORT}/api/health`);
    console.log(`   Diagnostic: http://${HOST}:${PORT}/diagnostic`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Test server shutting down...');
    process.exit(0);
});