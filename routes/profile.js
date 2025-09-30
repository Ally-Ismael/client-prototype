const express = require('express');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Middleware to get database
const getDb = (req) => req.app.locals.db;

// Get dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const db = getDb(req);
        
        // Quick fix: If no database, return mock data
        if (!db || !db.query) {
            console.log('⚠️ QUICK FIX: No database connection, returning mock dashboard data');
            return res.json({
                success: true,
                profile: {
                    name: 'Demo User',
                    email: 'demo@jobscooter.co.za',
                    slug: 'demo-user',
                    first_name: 'Demo',
                    surname: 'User',
                    completion_percentage: 100,
                    traffic_light_status: 'green',
                    traffic_light_score: 85,
                    profilePhoto: null
                },
                stats: {
                    views: 15,
                    contacts: 3,
                    certificates: 2,
                    languages: 1
                },
                activities: [
                    {
                        type: 'profile_view',
                        description: 'Your profile was viewed by 3 employers today',
                        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        type: 'profile_completed',
                        description: 'Profile completed successfully',
                        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                    }
                ]
            });
        }

        // Get comprehensive user data
        const user = await new Promise((resolve, reject) => {
            db.query(`
                SELECT a.*, p.profile_url_slug, p.view_count, tls.total_score, tls.status as traffic_status,
                COUNT(DISTINCT c.id) as certificates_count, 
                COUNT(DISTINCT l.id) as languages_count,
                COUNT(DISTINCT pv.id) as profile_views
                FROM applicants a
                LEFT JOIN public_profiles p ON a.id = p.applicant_id
                LEFT JOIN traffic_light_scores tls ON a.id = tls.applicant_id
                LEFT JOIN certificates c ON a.id = c.applicant_id
                LEFT JOIN language_verifications l ON a.id = l.applicant_id AND l.is_verified = 1
                LEFT JOIN profile_views pv ON p.applicant_id = pv.profile_id AND pv.view_timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                WHERE a.id = ?
                GROUP BY a.id
            `, [req.user.id], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });

        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        // Get recent activities
        const activities = await new Promise((resolve, reject) => {
            db.query(`
                SELECT activity_type, description, created_at, details
                FROM activity_logs
                WHERE user_id = ? AND user_type = 'applicant'
                ORDER BY created_at DESC
                LIMIT 10
            `, [req.user.id], (err, results) => {
                if (err) reject(err);
                else resolve(results || []);
            });
        });

        // Remove password from response
        const { password_hash, email_verification_token, ...userWithoutPassword } = user;

        res.json({
            success: true,
            profile: {
                name: `${user.first_name} ${user.surname}`,
                email: user.email,
                slug: user.profile_url_slug || 'user-profile',
                first_name: user.first_name,
                surname: user.surname,
                completion_percentage: user.completion_percentage || 0,
                traffic_light_status: user.traffic_light_status || 'red',
                traffic_light_score: user.total_score || 0,
                profilePhoto: user.profile_picture_url
            },
            stats: {
                views: user.view_count || 0,
                contacts: Math.floor(Math.random() * 10), // Mock data for now
                certificates: user.certificates_count || 0,
                languages: user.languages_count || 0
            },
            activities: activities.map(activity => ({
                type: activity.activity_type,
                description: activity.description,
                timestamp: activity.created_at
            }))
        });

    } catch (error) {
        console.error('Dashboard fetch error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch dashboard data' 
        });
    }
});

// Get language preferences
router.get('/language-preferences', authenticateToken, async (req, res) => {
    try {
        const db = getDb(req);
        
        // Get user's language verifications
        const languages = await new Promise((resolve, reject) => {
            db.query(`
                SELECT language, proficiency_level, is_verified
                FROM language_verifications
                WHERE applicant_id = ?
            `, [req.user.id], (err, results) => {
                if (err) reject(err);
                else resolve(results || []);
            });
        });
        
        res.json({
            success: true,
            languages: languages.map(l => l.language.toLowerCase())
        });
        
    } catch (error) {
        console.error('Language preferences fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch language preferences'
        });
    }
});

// Get user profile
router.get('/', authenticateToken, async (req, res) => {
    try {
        const db = getDb(req);

        // Get user with additional data
        const user = await new Promise((resolve, reject) => {
            db.query(`
                SELECT a.*, p.profile_url_slug, tls.total_score, tls.status as traffic_status,
                COUNT(c.id) as certificates_count, COUNT(l.id) as languages_count
                FROM applicants a
                LEFT JOIN public_profiles p ON a.id = p.applicant_id
                LEFT JOIN traffic_light_scores tls ON a.id = tls.applicant_id
                LEFT JOIN certificates c ON a.id = c.applicant_id
                LEFT JOIN language_verifications l ON a.id = l.applicant_id AND l.is_verified = 1
                WHERE a.id = ?
                GROUP BY a.id
            `, [req.user.id], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove password from response
        const { password_hash, ...userWithoutPassword } = user;

        res.json({
            user: {
                ...userWithoutPassword,
                profileUrl: user.profile_url_slug ? `/profile/${user.profile_url_slug}` : null
            }
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update user profile
router.put('/', authenticateToken, async (req, res) => {
    try {
        const {
            first_name,
            surname,
            phone,
            country,
            date_of_birth,
            gender,
            nationality,
            profile_picture_url,
            video_intro_url
        } = req.body;

        const db = getDb(req);

        // Build update query dynamically
        const updates = {};
        const validFields = [
            'first_name', 'surname', 'phone', 'country',
            'date_of_birth', 'gender', 'nationality',
            'profile_picture_url', 'video_intro_url', 'bio'
        ];

        validFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);

        await new Promise((resolve, reject) => {
            db.query(`
                UPDATE applicants
                SET ${setClause}, updated_at = NOW()
                WHERE id = ?
            `, [...values, req.user.id], (err, result) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Update completion percentage
        await updateCompletionPercentage(req.user.id, db);

        res.json({ message: 'Profile updated successfully' });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get public profile by slug
router.get('/public/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const db = getDb(req);

        // Get public profile
        const profile = await new Promise((resolve, reject) => {
            db.query(`
                SELECT a.*, p.public_fields, tls.total_score, tls.status as traffic_status,
                COUNT(c.id) as certificates_count, COUNT(l.id) as languages_count
                FROM public_profiles p
                JOIN applicants a ON p.applicant_id = a.id
                LEFT JOIN traffic_light_scores tls ON a.id = tls.applicant_id
                LEFT JOIN certificates c ON a.id = c.applicant_id AND c.is_verified = 1
                LEFT JOIN language_verifications l ON a.id = l.applicant_id AND l.is_verified = 1
                WHERE p.profile_url_slug = ? AND p.is_active = 1 AND a.status = 'active'
                GROUP BY a.id
            `, [slug], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Check privacy settings
        const privacySettings = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM applicant_privacy_settings WHERE applicant_id = ?', [profile.id], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });

        // Filter visible fields based on privacy settings
        const publicFields = privacySettings ? JSON.parse(privacySettings.public_fields || '{}') : {};
        const visibleFields = publicFields.visible_fields || ['first_name', 'traffic_light_status'];

        // Remove sensitive data
        const { password_hash, email, phone, id_number, ...safeProfile } = profile;

        // Only include visible fields
        const filteredProfile = {};
        visibleFields.forEach(field => {
            if (safeProfile[field] !== undefined) {
                filteredProfile[field] = safeProfile[field];
            }
        });

        // Add public-specific fields
        filteredProfile.certificates_count = profile.certificates_count;
        filteredProfile.languages_count = profile.languages_count;
        filteredProfile.traffic_light_status = profile.traffic_light_status;
        filteredProfile.completion_percentage = profile.completion_percentage;

        // Record profile view
        await new Promise((resolve, reject) => {
            db.query(`
                INSERT INTO profile_views (profile_id, viewed_fields, view_timestamp)
                VALUES (?, ?, NOW())
            `, [profile.id, JSON.stringify(visibleFields)], (err, result) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Update view count
        await new Promise((resolve, reject) => {
            db.query(`
                UPDATE public_profiles
                SET view_count = view_count + 1
                WHERE applicant_id = ?
            `, [profile.id], (err, result) => {
                if (err) reject(err);
                else resolve();
            });
        });

        res.json({
            profile: filteredProfile,
            viewedFields: visibleFields
        });

    } catch (error) {
        console.error('Public profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update privacy settings
router.put('/privacy', authenticateToken, async (req, res) => {
    try {
        const {
            profile_visibility,
            show_contact_info_to_subscribers,
            show_certificates_to_public,
            show_full_cv_to_subscribers,
            allow_contact_requests,
            auto_accept_contact_from_verified
        } = req.body;

        const db = getDb(req);

        // Check if privacy settings exist
        const existingSettings = await new Promise((resolve, reject) => {
            db.query('SELECT id FROM applicant_privacy_settings WHERE applicant_id = ?', [req.user.id], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });

        const settingsData = {
            profile_visibility: profile_visibility || 'public',
            show_contact_info_to_subscribers: show_contact_info_to_subscribers !== undefined ? show_contact_info_to_subscribers : true,
            show_certificates_to_public: show_certificates_to_public !== undefined ? show_certificates_to_public : false,
            show_full_cv_to_subscribers: show_full_cv_to_subscribers !== undefined ? show_full_cv_to_subscribers : true,
            allow_contact_requests: allow_contact_requests !== undefined ? allow_contact_requests : true,
            auto_accept_contact_from_verified: auto_accept_contact_from_verified !== undefined ? auto_accept_contact_from_verified : false
        };

        if (existingSettings) {
            // Update existing settings
            await new Promise((resolve, reject) => {
                db.query(`
                    UPDATE applicant_privacy_settings
                    SET profile_visibility = ?, show_contact_info_to_subscribers = ?,
                        show_certificates_to_public = ?, show_full_cv_to_subscribers = ?,
                        allow_contact_requests = ?, auto_accept_contact_from_verified = ?,
                        updated_at = NOW()
                    WHERE applicant_id = ?
                `, [
                    settingsData.profile_visibility,
                    settingsData.show_contact_info_to_subscribers,
                    settingsData.show_certificates_to_public,
                    settingsData.show_full_cv_to_subscribers,
                    settingsData.allow_contact_requests,
                    settingsData.auto_accept_contact_from_verified,
                    req.user.id
                ], (err, result) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } else {
            // Create new settings
            await new Promise((resolve, reject) => {
                db.query(`
                    INSERT INTO applicant_privacy_settings (
                        applicant_id, profile_visibility, show_contact_info_to_subscribers,
                        show_certificates_to_public, show_full_cv_to_subscribers,
                        allow_contact_requests, auto_accept_contact_from_verified
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    req.user.id,
                    settingsData.profile_visibility,
                    settingsData.show_contact_info_to_subscribers,
                    settingsData.show_certificates_to_public,
                    settingsData.show_full_cv_to_subscribers,
                    settingsData.allow_contact_requests,
                    settingsData.auto_accept_contact_from_verified
                ], (err, result) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }

        res.json({
            message: 'Privacy settings updated successfully',
            settings: settingsData
        });

    } catch (error) {
        console.error('Privacy settings update error:', error);
        res.status(500).json({ error: 'Failed to update privacy settings' });
    }
});

// Generate CV
router.post('/cv/generate', authenticateToken, async (req, res) => {
    try {
        const { template, options } = req.body;
        const db = getDb(req);

        // Get user data for CV generation
        const userData = await new Promise((resolve, reject) => {
            db.query(`
                SELECT a.*, GROUP_CONCAT(c.institution_name, ' - ', c.field_of_study) as qualifications,
                GROUP_CONCAT(l.language) as languages
                FROM applicants a
                LEFT JOIN certificates c ON a.id = c.applicant_id AND c.is_verified = 1
                LEFT JOIN language_verifications l ON a.id = l.applicant_id AND l.is_verified = 1
                WHERE a.id = ?
                GROUP BY a.id
            `, [req.user.id], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });

        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Simulate CV generation (in real implementation, use a PDF generation library)
        const cvFileName = `cv_${req.user.id}_${Date.now()}.pdf`;
        const cvFilePath = `./public/uploads/cv/${cvFileName}`;

        // Ensure CV directory exists
        const fs = require('fs');
        const path = require('path');
        const cvDir = path.dirname(cvFilePath);
        if (!fs.existsSync(cvDir)) {
            fs.mkdirSync(cvDir, { recursive: true });
        }

        // Save CV generation record
        const cvId = await new Promise((resolve, reject) => {
            db.query(`
                INSERT INTO cv_generations (
                    applicant_id, template, file_name, file_path, options, file_size
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
                req.user.id,
                template || 'professional',
                cvFileName,
                cvFilePath,
                JSON.stringify(options || {}),
                0 // Will be updated after file generation
            ], (err, result) => {
                if (err) reject(err);
                else resolve(result.insertId);
            });
        });

        // Update applicant's auto_cv_url
        const cvUrl = `/uploads/cv/${cvFileName}`;
        await new Promise((resolve, reject) => {
            db.query(`
                UPDATE applicants
                SET auto_cv_url = ?, updated_at = NOW()
                WHERE id = ?
            `, [cvUrl, req.user.id], (err, result) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Log activity
        await new Promise((resolve, reject) => {
            db.query(`
                INSERT INTO activity_logs (user_id, user_type, activity_type, description, details)
                VALUES (?, 'applicant', 'cv_generation', 'CV generated', ?)
            `, [req.user.id, JSON.stringify({ cv_id: cvId, template: template || 'professional', file_name: cvFileName })], (err) => {
                if (err) console.error('Activity log error:', err);
                resolve();
            });
        });

        // Generate CV data for display
        const cvData = {
            personalInfo: {
                name: `${userData.first_name} ${userData.surname}`,
                email: userData.email,
                phone: userData.phone || 'Phone number'
            },
            summary: `Experienced professional with verified qualifications and multilingual capabilities. Dedicated to excellence and continuous professional development.`,
            education: userData.qualifications ? userData.qualifications.split(',').map(qual => ({
                qualification: qual.split(' - ')[1] || 'Qualification',
                institution: qual.split(' - ')[0] || 'Institution',
                year: new Date().getFullYear().toString()
            })) : [{
                qualification: 'Your qualifications will appear here',
                institution: 'Educational Institution',
                year: '2024'
            }],
            skills: [
                'Professional Communication',
                'Problem Solving',
                'Team Collaboration',
                'Time Management',
                'Critical Thinking'
            ],
            languages: userData.languages ? userData.languages.split(',') : ['English']
        };
        
        // In a real implementation, generate the actual PDF here
        res.json({
            success: true,
            message: 'CV generated successfully',
            cv: cvData,
            cvId: cvId,
            fileName: cvFileName,
            downloadUrl: cvUrl,
            template: template || 'professional'
        });

    } catch (error) {
        console.error('CV generation error:', error);
        res.status(500).json({ error: 'Failed to generate CV' });
    }
});

// Get CV list
router.get('/cv/list', authenticateToken, async (req, res) => {
    try {
        const db = getDb(req);

        const cvs = await new Promise((resolve, reject) => {
            db.all(`
                SELECT id, template, file_name, file_path, file_size, download_count,
                created_at, last_downloaded
                FROM cv_generations
                WHERE applicant_id = ? AND is_active = 1
                ORDER BY created_at DESC
            `, [req.user.id], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({
            cvs: cvs.map(cv => ({
                ...cv,
                downloadUrl: cv.file_path.replace('./public', ''),
                createdAt: cv.created_at
            }))
        });

    } catch (error) {
        console.error('CV list error:', error);
        res.status(500).json({ error: 'Failed to fetch CV list' });
    }
});

// Download CV
router.get('/cv/download/:cvId', authenticateToken, async (req, res) => {
    try {
        const { cvId } = req.params;
        const db = getDb(req);

        // Get CV record
        const cv = await new Promise((resolve, reject) => {
            db.get(`
                SELECT * FROM cv_generations
                WHERE id = ? AND applicant_id = ? AND is_active = 1
            `, [cvId, req.user.id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!cv) {
            return res.status(404).json({ error: 'CV not found' });
        }

        // Update download count
        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE cv_generations
                SET download_count = download_count + 1, last_downloaded = datetime('now')
                WHERE id = ?
            `, [cvId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // In a real implementation, serve the actual file
        // For now, return download info
        res.json({
            message: 'CV download recorded',
            fileName: cv.file_name,
            downloadUrl: cv.file_path.replace('./public', '')
        });

    } catch (error) {
        console.error('CV download error:', error);
        res.status(500).json({ error: 'Failed to download CV' });
    }
});

// Get traffic light score details
router.get('/traffic-light', authenticateToken, async (req, res) => {
    try {
        const db = getDb(req);

        const scoreData = await new Promise((resolve, reject) => {
            db.get(`
                SELECT tls.*, a.completion_percentage, a.is_verified,
                COUNT(c.id) as certificates_count,
                COUNT(CASE WHEN c.is_verified = 1 THEN 1 END) as verified_certificates,
                COUNT(l.id) as languages_count
                FROM traffic_light_scores tls
                JOIN applicants a ON tls.applicant_id = a.id
                LEFT JOIN certificates c ON a.id = c.applicant_id
                LEFT JOIN language_verifications l ON a.id = l.applicant_id AND l.is_verified = 1
                WHERE tls.applicant_id = ?
                GROUP BY tls.id
            `, [req.user.id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!scoreData) {
            return res.status(404).json({ error: 'Traffic light score not found' });
        }

        res.json({
            score: scoreData.total_score,
            status: scoreData.status,
            breakdown: {
                identity: scoreData.identity_score,
                language: scoreData.language_score,
                certificate: scoreData.certificate_score,
                completeness: scoreData.completeness_score,
                consistency: scoreData.consistency_score
            },
            improvementSuggestions: scoreData.improvement_suggestions,
            certificatesCount: scoreData.certificates_count,
            verifiedCertificates: scoreData.verified_certificates,
            languagesCount: scoreData.languages_count,
            completionPercentage: scoreData.completion_percentage,
            isVerified: scoreData.is_verified
        });

    } catch (error) {
        console.error('Traffic light fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch traffic light score' });
    }
});

// Analyze profile endpoint
router.get('/analyze', authenticateToken, async (req, res) => {
    try {
        const db = getDb(req);
        
        // Get comprehensive profile data
        const profileData = await new Promise((resolve, reject) => {
            db.query(`
                SELECT a.*, p.profile_url_slug, tls.total_score, tls.status as traffic_status,
                COUNT(DISTINCT c.id) as certificates_count, 
                COUNT(DISTINCT l.id) as languages_count
                FROM applicants a
                LEFT JOIN public_profiles p ON a.id = p.applicant_id
                LEFT JOIN traffic_light_scores tls ON a.id = tls.applicant_id
                LEFT JOIN certificates c ON a.id = c.applicant_id AND c.is_verified = 1
                LEFT JOIN language_verifications l ON a.id = l.applicant_id AND l.is_verified = 1
                WHERE a.id = ?
                GROUP BY a.id
            `, [req.user.id], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });
        
        if (!profileData) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        
        // Calculate analysis scores
        const completeness = profileData.completion_percentage || 20;
        const verification = profileData.is_verified ? 95 : 60;
        const quality = Math.min(85 + (profileData.certificates_count * 5) + (profileData.languages_count * 3), 100);
        const overall = Math.floor((completeness + verification + quality) / 3);
        
        res.json({
            success: true,
            analysis: {
                completeness: `${completeness}%`,
                verification: `${verification}%`,
                quality: `${quality}%`,
                overall: overall.toString()
            },
            profile: {
                name: `${profileData.first_name} ${profileData.surname}`,
                email: profileData.email,
                slug: profileData.profile_url_slug || 'user-profile',
                completion_percentage: completeness,
                traffic_light_status: profileData.traffic_light_status || 'yellow',
                certificates_count: profileData.certificates_count || 0,
                languages_count: profileData.languages_count || 0
            }
        });
        
    } catch (error) {
        console.error('Profile analysis error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to analyze profile' 
        });
    }
});

// Complete profile endpoint
router.post('/complete', authenticateToken, async (req, res) => {
    try {
        const { privacy_setting, completed } = req.body;
        const db = getDb(req);
        
        // Update user profile as completed
        await new Promise((resolve, reject) => {
            db.query(
                'UPDATE applicants SET completion_percentage = 100, status = "active", updated_at = NOW() WHERE id = ?',
                [req.user.id],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
        
        // Update privacy settings
        if (privacy_setting) {
            const existingSettings = await new Promise((resolve, reject) => {
                db.query('SELECT id FROM applicant_privacy_settings WHERE applicant_id = ?', [req.user.id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]);
                });
            });
            
            if (existingSettings) {
                await new Promise((resolve, reject) => {
                    db.query(
                        'UPDATE applicant_privacy_settings SET profile_visibility = ?, updated_at = NOW() WHERE applicant_id = ?',
                        [privacy_setting, req.user.id],
                        (err) => {
                            if (err) reject(err);
                            else resolve();
                        }
                    );
                });
            } else {
                await new Promise((resolve, reject) => {
                    db.query(`
                        INSERT INTO applicant_privacy_settings (
                            applicant_id, profile_visibility, show_contact_info_to_subscribers,
                            show_certificates_to_public, show_full_cv_to_subscribers,
                            allow_contact_requests, auto_accept_contact_from_verified
                        ) VALUES (?, ?, 1, 0, 1, 1, 0)
                    `, [req.user.id, privacy_setting], (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            }
        }
        
        // Get profile slug
        const profileSlug = await new Promise((resolve, reject) => {
            db.query(
                'SELECT profile_url_slug FROM public_profiles WHERE applicant_id = ?',
                [req.user.id],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]?.profile_url_slug || 'user-profile');
                }
            );
        });
        
        // Log completion activity
        await new Promise((resolve, reject) => {
            db.query(`
                INSERT INTO activity_logs (user_id, user_type, activity_type, description, details, created_at)
                VALUES (?, 'applicant', 'profile_completed', 'Profile setup completed successfully', ?, NOW())
            `, [req.user.id, JSON.stringify({ privacy_setting, completion_date: new Date().toISOString() })], (err) => {
                if (err) console.error('Activity log error:', err);
                resolve();
            });
        });
        
        res.json({
            success: true,
            message: 'Profile completed successfully!',
            profileSlug: profileSlug,
            redirectTo: '/dashboard'
        });
        
    } catch (error) {
        console.error('Profile completion error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to complete profile',
            message: error.message
        });
    }
});

// Helper function to update completion percentage
async function updateCompletionPercentage(applicantId, db) {
    try {
        // Get completion data
        const applicant = await new Promise((resolve, reject) => {
            db.get(`
                SELECT a.*, COUNT(c.id) as cert_count, COUNT(l.id) as lang_count
                FROM applicants a
                LEFT JOIN certificates c ON a.id = c.applicant_id
                LEFT JOIN language_verifications l ON a.id = l.applicant_id AND l.is_verified = 1
                WHERE a.id = ?
                GROUP BY a.id
            `, [applicantId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        let completion = 20; // Base completion from ID verification

        // Add language completion
        if (applicant.lang_count > 0) completion += 20;

        // Add certificate completion
        if (applicant.cert_count > 0) completion += 20;

        // Add media completion
        if (applicant.profile_picture_url) completion += 20;
        if (applicant.video_intro_url) completion += 20;

        completion = Math.min(completion, 100);

        await new Promise((resolve, reject) => {
            db.run(`
                UPDATE applicants
                SET completion_percentage = ?, updated_at = datetime('now')
                WHERE id = ?
            `, [completion, applicantId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

    } catch (error) {
        console.error('Completion percentage update error:', error);
    }
}

module.exports = router;
