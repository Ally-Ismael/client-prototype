const express = require('express');
const router = express.Router();

// Middleware to get database
const getDb = (req) => req.app.locals.db;

// Debug route to check database contents (only in development)
router.get('/database-status', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Debug routes not available in production' });
    }

    try {
        const db = getDb(req);
        
        // Check all main tables
        const queries = [
            'SELECT COUNT(*) as count FROM applicants',
            'SELECT email, first_name, surname, created_at FROM applicants ORDER BY created_at DESC LIMIT 5',
            'SELECT COUNT(*) as count FROM public_profiles',
            'SELECT COUNT(*) as count FROM certificates',
            'SELECT COUNT(*) as count FROM application_sessions',
        ];

        const results = await Promise.all(
            queries.map(query => new Promise((resolve, reject) => {
                db.query(query, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            }))
        );

        res.json({
            success: true,
            database_status: {
                applicants_count: results[0][0].count,
                recent_applicants: results[1],
                public_profiles_count: results[2][0].count,
                certificates_count: results[3][0].count,
                application_sessions_count: results[4][0].count,
            },
            message: 'Database status retrieved successfully'
        });

    } catch (error) {
        console.error('Database status check error:', error);
        res.status(500).json({ 
            error: 'Failed to check database status',
            details: error.message,
            database_connected: !!getDb(req)
        });
    }
});

// Debug route to check specific email
router.get('/check-email/:email', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Debug routes not available in production' });
    }

    try {
        const { email } = req.params;
        const db = getDb(req);
        
        const result = await new Promise((resolve, reject) => {
            db.query('SELECT id, email, first_name, surname, status, created_at FROM applicants WHERE email = ?', [email], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        res.json({
            success: true,
            email: email,
            exists: result.length > 0,
            user_data: result.length > 0 ? result[0] : null,
            message: result.length > 0 ? 'Email found in database' : 'Email not found in database'
        });

    } catch (error) {
        console.error('Email check error:', error);
        res.status(500).json({ 
            error: 'Failed to check email',
            details: error.message 
        });
    }
});

// Debug route to clear test data (only in development)
router.delete('/clear-test-data', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Clear data not available in production' });
    }

    try {
        const db = getDb(req);
        
        // Clear tables in correct order to avoid foreign key issues
        const clearQueries = [
            'DELETE FROM activity_logs WHERE user_type = "applicant"',
            'DELETE FROM traffic_light_scores',
            'DELETE FROM public_profiles', 
            'DELETE FROM certificates',
            'DELETE FROM languages',
            'DELETE FROM media_files',
            'DELETE FROM application_sessions',
            'DELETE FROM applicants'
        ];

        for (const query of clearQueries) {
            await new Promise((resolve, reject) => {
                db.query(query, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
        }

        res.json({
            success: true,
            message: 'Test data cleared successfully'
        });

    } catch (error) {
        console.error('Clear test data error:', error);
        res.status(500).json({ 
            error: 'Failed to clear test data',
            details: error.message 
        });
    }
});

module.exports = router;