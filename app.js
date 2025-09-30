#!/usr/bin/env node

/**
 * JobScooter Production App Entry Point for Passenger
 * This file is required for LiteSpeed/Passenger to serve the Node.js application
 */

const app = require('./server');

// Export the app for Passenger
module.exports = app;

// For standalone running (if needed)
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 JobScooter running on port ${PORT}`);
    });
}