// This file shows how to disable the automatic database initialization
// that's causing all the DECLARE/IF/END errors in your logs

// In your server.js, find the line that calls initDatabase() around line 196
// Replace this section:

// ORIGINAL CODE (causing errors):
// initDatabase();

// REPLACEMENT CODE (conditional initialization):
/*
// Only initialize database if explicitly requested
if (process.env.INIT_DATABASE === 'true') {
    initDatabase();
} else {
    console.log('⚠️  Database initialization skipped. Set INIT_DATABASE=true to run schema initialization.');
}
*/

// This way, the app won't try to run the problematic SQL statements on every startup
// The database initialization only runs when you explicitly set INIT_DATABASE=true

console.log('Database initialization has been disabled to prevent SQL errors.');
console.log('Run the fix-database-missing-items.sql script in phpMyAdmin instead.');