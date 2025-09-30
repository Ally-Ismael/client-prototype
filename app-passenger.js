// Passenger-compatible entry file for cPanel deployment
// This file imports the main server.js and exports the Express app
// Passenger will handle the port binding and server startup

const app = require('./server');

// Export the Express app for Passenger to use
module.exports = app;

console.log('✅ Passenger entry file loaded - app exported for cPanel');