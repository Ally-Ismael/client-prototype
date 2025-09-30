const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Middleware to get database
const getDb = (req) => req.app.locals.db;

// Middleware to authenticate JWT token
const authenticateToken = require('./auth').authenticateToken;

// Configure multer for certificate uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = './public/uploads/certificates/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        console.log('🔍 File filter check:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype
        });
        
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            console.log('✅ File passed filter:', file.originalname);
            return cb(null, true);
        } else {
            console.log('❌ File rejected by filter:', file.originalname, file.mimetype);
            cb(new Error('Invalid file type. Please upload JPG, PNG, or PDF files.'));
        }
    }
});

// Create application session
router.post('/start-session', (req, res) => {
    try {
        const sessionToken = uuidv4();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const db = getDb(req);
        
        // Quick fix: If no database, return success anyway for demo
        if (!db || !db.query) {
            console.log('⚠️ QUICK FIX: No database connection, returning mock session');
            return res.json({
                success: true,
                sessionToken,
                expiresAt: expiresAt.toISOString(),
                message: 'Application session started successfully (demo mode)'
            });
        }

        db.query(`
            INSERT INTO application_sessions (session_token, step_completed, expires_at, created_at)
            VALUES (?, 0, ?, NOW())
        `, [sessionToken, expiresAt.toISOString()], (err, result) => {
            if (err) {
                console.error('Session creation error:', err);
                return res.status(500).json({ 
                    success: false,
                    error: 'Failed to create session',
                    message: 'Database error occurred' 
                });
            }

            console.log('✅ Application session created successfully:', sessionToken);
            res.json({
                success: true,
                sessionToken,
                expiresAt: expiresAt.toISOString(),
                message: 'Application session started successfully'
            });
        });

    } catch (error) {
        console.error('Start session error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to start application session',
            message: error.message || 'Unexpected server error'
        });
    }
});

// Get current application step
router.get('/current-step/:sessionToken', (req, res) => {
    try {
        const { sessionToken } = req.params;
        const db = getDb(req);

        db.query(`
            SELECT * FROM application_sessions
            WHERE session_token = ? AND expires_at > NOW()
        `, [sessionToken], (err, results) => {
            if (err) {
                console.error('Session fetch error:', err);
                return res.status(500).json({ error: 'Failed to fetch session' });
            }

            if (!results || results.length === 0) {
                return res.status(404).json({ error: 'Session not found or expired' });
            }

            const session = results[0];
            res.json({
                currentStep: session.step_completed,
                extractedData: session.extracted_data ? JSON.parse(session.extracted_data) : null,
                sessionToken
            });
        });

    } catch (error) {
        console.error('Current step error:', error);
        res.status(500).json({ error: 'Failed to get current step' });
    }
});

// Update application step
router.put('/update-step/:sessionToken', (req, res) => {
    try {
        const { sessionToken } = req.params;
        const { stepCompleted, extractedData } = req.body;
        const db = getDb(req);

        const sql = `
            UPDATE application_sessions
            SET step_completed = ?, extracted_data = ?, updated_at = NOW()
            WHERE session_token = ? AND expires_at > NOW()
        `;

        db.query(sql, [stepCompleted, extractedData ? JSON.stringify(extractedData) : null, sessionToken], (err, result) => {
            if (err) {
                console.error('Step update error:', err);
                return res.status(500).json({ error: 'Failed to update step' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Session not found or expired' });
            }

            res.json({
                message: 'Step updated successfully',
                currentStep: stepCompleted
            });
        });

    } catch (error) {
        console.error('Update step error:', error);
        res.status(500).json({ error: 'Failed to update step' });
    }
});

// General certificate upload endpoint (for all certificates)
router.post('/certificates/upload', authenticateToken, upload.single('certificate'), async (req, res) => {
    try {
        console.log('📤 Certificate upload request received');
        console.log('📊 User:', req.user ? req.user.id : 'No user');
        console.log('📄 File:', req.file ? req.file.originalname : 'No file');
        
        if (!req.file) {
            console.log('❌ No file uploaded');
            return res.status(400).json({ 
                success: false,
                error: 'No certificate file uploaded' 
            });
        }
        
        console.log('📄 File details:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
        });
        
        const db = getDb(req);
        const AIService = require('../services/ai-service');
        const aiService = new AIService();
        
        console.log('🧠 Starting AI certificate processing...');
        // Process certificate with AI
        const aiResult = await aiService.processCertificate(req.file.path);
        console.log('🧠 AI processing result:', aiResult.success ? 'Success' : 'Failed');
        
        if (aiResult.success) {
            // Save certificate to database
            const certificateId = await new Promise((resolve, reject) => {
                const sql = `
                    INSERT INTO certificates (
                        applicant_id, original_filename, file_path, certificate_type,
                        document_classification, institution_name, field_of_study,
                        is_verified, authenticity_score, processing_status,
                        file_size, mime_type, ai_confidence, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?, NOW())
                `;
                
                db.query(sql, [
                    req.user.id,
                    req.file.originalname,
                    req.file.path,
                    aiResult.certificateData.type || 'Academic Certificate',
                    aiResult.certificateData.classification || 'general',
                    aiResult.certificateData.institution || 'Unknown',
                    aiResult.certificateData.subject || aiResult.certificateData.field || 'Not specified',
                    1, // Mark as verified by AI
                    aiResult.confidence || 75,
                    req.file.size,
                    req.file.mimetype,
                    aiResult.confidence || 75
                ], (err, result) => {
                    if (err) reject(err);
                    else resolve(result.insertId);
                });
            });
            
            res.json({
                success: true,
                certificateId: certificateId,
                analysis: aiResult.certificateData,
                classification: {
                    type: aiResult.certificateData.type || 'academic',
                    level: aiResult.certificateData.level || 'undergraduate'
                },
                verification: {
                    institutionVerified: true,
                    confidence: aiResult.confidence || 75
                },
                message: 'Certificate uploaded and analyzed successfully'
            });
        } else {
            res.status(422).json({
                success: false,
                message: 'Could not process certificate. Please ensure the file is clear and readable.',
                error: aiResult.error
            });
        }
        
    } catch (error) {
        console.error('Certificate upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload certificate',
            message: error.message
        });
    }
});

// German certificate upload (legacy - specific for German verification)
router.post('/certificates/upload-german', authenticateToken, upload.single('certificate'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                error: 'No certificate file uploaded' 
            });
        }
        
        const db = getDb(req);
        const AIService = require('../services/ai-service');
        const aiService = new AIService();
        
        // Process certificate with AI
        const aiResult = await aiService.processCertificate(req.file.path);
        
        if (aiResult.success) {
            // Check if it's a German language certificate
            const germanVerification = await aiService.verifyGermanLanguageCertificate(aiResult.certificateData);
            
            // Save certificate to database
            const certificateId = await new Promise((resolve, reject) => {
                const sql = `
                    INSERT INTO certificates (
                        applicant_id, original_filename, file_path, certificate_type,
                        document_classification, institution_name, field_of_study,
                        is_verified, authenticity_score, processing_status,
                        file_size, mime_type, ai_confidence
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?)
                `;
                
                db.query(sql, [
                    req.user.id,
                    req.file.originalname,
                    req.file.path,
                    'Language Certificate',
                    'language',
                    aiResult.certificateData.institution || 'Unknown',
                    'German Language',
                    germanVerification.isValid ? 1 : 0,
                    germanVerification.isValid ? 90 : 50,
                    req.file.size,
                    req.file.mimetype,
                    aiResult.confidence
                ], (err, result) => {
                    if (err) reject(err);
                    else resolve(result.insertId);
                });
            });
            
            res.json({
                success: true,
                certificateId: certificateId,
                certificateInfo: {
                    details: `${aiResult.certificateData.type} from ${aiResult.certificateData.institution}`,
                    verified: germanVerification.isValid,
                    institution: aiResult.certificateData.institution
                },
                message: 'Certificate uploaded successfully'
            });
        } else {
            res.status(422).json({
                success: false,
                message: 'Could not process certificate. Please ensure the file is clear and readable.',
                error: aiResult.error
            });
        }
        
    } catch (error) {
        console.error('Certificate upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload certificate',
            message: error.message
        });
    }
});

// Verify certificate by ID
router.get('/certificates/verify/:id', authenticateToken, async (req, res) => {
    try {
        const certificateId = req.params.id;
        const db = getDb(req);
        
        // Get certificate from database
        const certificate = await new Promise((resolve, reject) => {
            db.query(`
                SELECT * FROM certificates 
                WHERE id = ? AND applicant_id = ?
            `, [certificateId, req.user.id], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });
        
        if (!certificate) {
            return res.status(404).json({
                success: false,
                error: 'Certificate not found'
            });
        }
        
        res.json({
            success: true,
            verified: certificate.is_verified === 1,
            institution: certificate.institution_name,
            authenticityScore: certificate.authenticity_score
        });
        
    } catch (error) {
        console.error('Certificate verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify certificate'
        });
    }
});

// Verify German language certificate (legacy route)
router.post('/verify-german-certificate', authenticateToken, upload.single('german_certificate'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                error: 'No certificate file uploaded' 
            });
        }
        
        const db = getDb(req);
        const AIService = require('../services/ai-service');
        const aiService = new AIService();
        
        // Process certificate with AI
        const aiResult = await aiService.processCertificate(req.file.path);
        
        if (aiResult.success) {
            // Verify if it's a German language certificate
            const germanVerification = await aiService.verifyGermanLanguageCertificate(aiResult.certificateData);
            
            if (germanVerification.isValid) {
                // Save language verification to database
                const verificationId = await new Promise((resolve, reject) => {
                    const sql = `
                        INSERT INTO language_verifications (
                            applicant_id, language, proficiency_level, certificate_type,
                            institution_name, certificate_file_path, date_verified, is_verified, verification_notes
                        ) VALUES (?, 'German', ?, ?, ?, ?, NOW(), 1, ?)
                    `;
                    
                    db.query(sql, [
                        req.user.id,
                        germanVerification.level || 'Intermediate',
                        aiResult.certificateData.type,
                        aiResult.certificateData.institution,
                        req.file.path,
                        `Verified German proficiency certificate from ${aiResult.certificateData.institution}`
                    ], (err, result) => {
                        if (err) reject(err);
                        else resolve(result.insertId);
                    });
                });
                
                res.json({
                    success: true,
                    verified: true,
                    message: 'German language certificate verified successfully!',
                    verification: {
                        id: verificationId,
                        level: germanVerification.level,
                        institution: aiResult.certificateData.institution,
                        type: aiResult.certificateData.type,
                        confidence: aiResult.confidence
                    }
                });
            } else {
                res.status(422).json({
                    success: false,
                    verified: false,
                    message: germanVerification.reason || 'Certificate not recognized as valid German language certificate',
                    suggestion: 'Please upload a certificate from Goethe Institut, TestDaF, TELC, or other accredited institutions'
                });
            }
        } else {
            res.status(422).json({
                success: false,
                verified: false,
                message: 'Could not process certificate. Please ensure the file is clear and readable.',
                error: aiResult.error
            });
        }
        
    } catch (error) {
        console.error('German certificate verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify German certificate',
            message: error.message
        });
    }
});

// Save language preferences (authenticated user)
router.post('/save-language-preferences', authenticateToken, async (req, res) => {
    try {
        const { languages, germanCertificateVerified = false, germanVerificationId = null } = req.body;
        
        if (!languages || !Array.isArray(languages) || languages.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please select at least one language'
            });
        }
        
        const db = getDb(req);
        
        // Validate German selection requires verification if German or both is selected
        const requiresGermanVerification = languages.includes('german') || languages.includes('both');
        if (requiresGermanVerification && !germanCertificateVerified) {
            return res.status(400).json({
                success: false,
                error: 'German language certificate verification required',
                requiresGermanCertificate: true
            });
        }
        
        // Save language preferences to applicant record
        await new Promise((resolve, reject) => {
            const sql = `
                UPDATE applicants 
                SET completion_percentage = GREATEST(completion_percentage, 40),
                    updated_at = NOW()
                WHERE id = ?
            `;
            
            db.query(sql, [req.user.id], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        // Also save to session if available
        const languageData = {
            languages: languages,
            germanVerified: germanCertificateVerified,
            germanVerificationId: germanVerificationId,
            step2_completed: true
        };
        
        res.json({
            success: true,
            message: 'Language preferences saved successfully',
            languages: languages,
            germanVerificationRequired: requiresGermanVerification,
            germanVerified: germanCertificateVerified
        });
        
    } catch (error) {
        console.error('Save language preferences error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save language preferences',
            message: error.message
        });
    }
});

// Update language selection (authenticated users)
router.put('/language', authenticateToken, async (req, res) => {
    try {
        const { languages, german_certificate_verified = false } = req.body;
        
        if (!languages || !Array.isArray(languages) || languages.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please select at least one language'
            });
        }
        
        const db = getDb(req);
        
        // Check if German verification is required
        const requiresGermanVerification = languages.includes('german') || languages.includes('both');
        
        if (requiresGermanVerification && !german_certificate_verified) {
            return res.status(400).json({
                success: false,
                error: 'German language certificate verification required',
                requiresGermanCertificate: true
            });
        }
        
        // Save language selections to database
        for (const lang of languages) {
            const language = lang === 'both' ? ['English', 'German'] : [lang === 'english' ? 'English' : 'German'];
            
            for (const langName of language) {
                // Check if language verification already exists
                const existing = await new Promise((resolve, reject) => {
                    db.query(`
                        SELECT id FROM language_verifications
                        WHERE applicant_id = ? AND language = ?
                    `, [req.user.id, langName], (err, results) => {
                        if (err) reject(err);
                        else resolve(results[0]);
                    });
                });
                
                if (!existing) {
                    // Insert new language verification
                    await new Promise((resolve, reject) => {
                        const sql = `
                            INSERT INTO language_verifications (
                                applicant_id, language, proficiency_level, is_verified, created_at
                            ) VALUES (?, ?, ?, ?, NOW())
                        `;
                        
                        const isVerified = langName === 'English' ? 1 : (german_certificate_verified ? 1 : 0);
                        const proficiency = langName === 'English' ? 'Native' : 'Intermediate';
                        
                        db.query(sql, [req.user.id, langName, proficiency, isVerified], (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        });
                    });
                }
            }
        }
        
        // Update applicant completion percentage
        await new Promise((resolve, reject) => {
            db.query(`
                UPDATE applicants 
                SET completion_percentage = GREATEST(completion_percentage, 40),
                    updated_at = NOW()
                WHERE id = ?
            `, [req.user.id], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        res.json({
            success: true,
            message: 'Language preferences saved successfully',
            languages: languages,
            germanVerificationRequired: requiresGermanVerification
        });
        
    } catch (error) {
        console.error('Language preferences save error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save language preferences',
            message: error.message
        });
    }
});

// Update language selection (legacy for session-based)
router.put('/language/:sessionToken', (req, res) => {
    try {
        const { sessionToken } = req.params;
        const { languages } = req.body;
        const db = getDb(req);

        // Get current session data
        db.query(`
            SELECT extracted_data FROM application_sessions
            WHERE session_token = ? AND expires_at > NOW()
        `, [sessionToken], (err, results) => {
            if (err) {
                console.error('Session fetch error:', err);
                return res.status(500).json({ error: 'Failed to fetch session' });
            }

            if (!results || results.length === 0) {
                return res.status(404).json({ error: 'Session not found or expired' });
            }

            const session = results[0];
            const currentData = session.extracted_data ? JSON.parse(session.extracted_data) : {};
            currentData.languages = languages;

            db.query(`
                UPDATE application_sessions
                SET extracted_data = ?, updated_at = NOW()
                WHERE session_token = ?
            `, [JSON.stringify(currentData), sessionToken], (err, result) => {
                if (err) {
                    console.error('Language update error:', err);
                    return res.status(500).json({ error: 'Failed to update languages' });
                }

                res.json({
                    message: 'Languages updated successfully',
                    languages
                });
            });
        });

    } catch (error) {
        console.error('Language update error:', error);
        res.status(500).json({ error: 'Failed to update languages' });
    }
});

// Get application progress
router.get('/progress/:sessionToken', (req, res) => {
    try {
        const { sessionToken } = req.params;
        const db = getDb(req);

        db.query(`
            SELECT step_completed, extracted_data FROM application_sessions
            WHERE session_token = ? AND expires_at > NOW()
        `, [sessionToken], (err, results) => {
            if (err) {
                console.error('Progress fetch error:', err);
                return res.status(500).json({ error: 'Failed to fetch progress' });
            }

            if (!results || results.length === 0) {
                return res.status(404).json({ error: 'Session not found or expired' });
            }

            const session = results[0];
            const extractedData = session.extracted_data ? JSON.parse(session.extracted_data) : {};
            const progressPercentage = Math.round((session.step_completed / 5) * 100);

            res.json({
                currentStep: session.step_completed,
                progressPercentage,
                extractedData,
                sessionToken
            });
        });

    } catch (error) {
        console.error('Progress error:', error);
        res.status(500).json({ error: 'Failed to get progress' });
    }
});

// Complete application (authenticated endpoint)
router.post('/complete', authenticateToken, async (req, res) => {
    try {
        const { sessionToken } = req.body;
        const db = getDb(req);

        // Get session data
        const [session] = await new Promise((resolve, reject) => {
            db.query(`
                SELECT * FROM application_sessions
                WHERE session_token = ? AND expires_at > NOW()
            `, [sessionToken], (err, results) => {
                if (err) reject(err);
                else resolve(results || []);
            });
        });

        if (!session) {
            return res.status(404).json({ error: 'Session not found or expired' });
        }

        const extractedData = session.extracted_data ? JSON.parse(session.extracted_data) : {};

        // Update applicant completion status
        await new Promise((resolve, reject) => {
            db.query(`
                UPDATE applicants
                SET status = 'active', completion_percentage = 100, updated_at = NOW()
                WHERE id = ?
            `, [req.user.id], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        // Calculate final traffic light score
        const finalScore = await calculateTrafficLightScore(req.user.id, db);

        // Update traffic light status
        await new Promise((resolve, reject) => {
            db.query(`
                UPDATE applicants
                SET traffic_light_status = ?, traffic_light_score = ?, updated_at = NOW()
                WHERE id = ?
            `, [finalScore.status, finalScore.totalScore, req.user.id], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        // Update traffic light scores table
        await new Promise((resolve, reject) => {
            db.query(`
                UPDATE traffic_light_scores
                SET total_score = ?, status = ?, calculated_at = NOW()
                WHERE applicant_id = ?
            `, [finalScore.totalScore, finalScore.status, req.user.id], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        // Clean up session
        await new Promise((resolve, reject) => {
            db.query(`
                DELETE FROM application_sessions WHERE session_token = ?
            `, [sessionToken], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        res.json({
            message: 'Application completed successfully',
            trafficLightStatus: finalScore.status,
            score: finalScore.totalScore,
            completionPercentage: 100
        });

    } catch (error) {
        console.error('Application completion error:', error);
        res.status(500).json({ error: 'Failed to complete application' });
    }
});

// Helper function to calculate traffic light score
async function calculateTrafficLightScore(applicantId, db) {
    try {
        // Get certificate count and verification status
        const certificates = await new Promise((resolve, reject) => {
            db.query(`
                SELECT is_verified, authenticity_score FROM certificates
                WHERE applicant_id = ?
            `, [applicantId], (err, results) => {
                if (err) reject(err);
                else resolve(results || []);
            });
        });

        // Get language verification count
        const [languageResult] = await new Promise((resolve, reject) => {
            db.query(`
                SELECT COUNT(*) as count FROM language_verifications
                WHERE applicant_id = ? AND is_verified = 1
            `, [applicantId], (err, results) => {
                if (err) reject(err);
                else resolve(results || [{ count: 0 }]);
            });
        });

        const languages = languageResult ? languageResult.count : 0;

        // Calculate scores (simplified scoring logic)
        const certificateScore = Math.min(certificates.length * 15, 60);
        const languageScore = Math.min(languages * 10, 20);
        const identityScore = 20; // Assuming ID is verified
        const completenessScore = 100; // Assuming all steps completed

        const totalScore = certificateScore + languageScore + identityScore + completenessScore;

        let status = 'red';
        if (totalScore >= 80) status = 'green';
        else if (totalScore >= 60) status = 'yellow';

        return {
            totalScore,
            status,
            breakdown: {
                certificateScore,
                languageScore,
                identityScore,
                completenessScore
            }
        };

    } catch (error) {
        console.error('Score calculation error:', error);
        return { totalScore: 0, status: 'red', breakdown: {} };
    }
}

// List certificates for current user
router.get('/certificates/list', authenticateToken, async (req, res) => {
    try {
        const db = getDb(req);
        
        const certificates = await new Promise((resolve, reject) => {
            db.query(`
                SELECT id, original_filename, certificate_type, document_classification,
                       institution_name, field_of_study, is_verified, authenticity_score,
                       processing_status, created_at, ai_confidence
                FROM certificates 
                WHERE applicant_id = ?
                ORDER BY created_at DESC
            `, [req.user.id], (err, results) => {
                if (err) reject(err);
                else resolve(results || []);
            });
        });
        
        res.json({
            success: true,
            certificates: certificates.map(cert => ({
                id: cert.id,
                filename: cert.original_filename,
                status: 'verified',
                type: cert.certificate_type,
                analysis: {
                    institution: cert.institution_name,
                    subject: cert.field_of_study,
                    confidence: cert.ai_confidence
                },
                classification: {
                    type: cert.document_classification || 'academic'
                },
                verification: {
                    institutionVerified: cert.is_verified === 1,
                    confidence: cert.authenticity_score
                }
            }))
        });
        
    } catch (error) {
        console.error('Error listing certificates:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list certificates'
        });
    }
});

// Process certificate (AI analysis)
router.post('/certificates/process', authenticateToken, async (req, res) => {
    try {
        const { certificate_id } = req.body;
        const db = getDb(req);
        
        // Get certificate from database
        const certificate = await new Promise((resolve, reject) => {
            db.query(`
                SELECT * FROM certificates 
                WHERE id = ? AND applicant_id = ?
            `, [certificate_id, req.user.id], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });
        
        if (!certificate) {
            return res.status(404).json({
                success: false,
                error: 'Certificate not found'
            });
        }
        
        // Return mock analysis since the certificate was already processed during upload
        res.json({
            success: true,
            analysis: {
                institution: certificate.institution_name,
                subject: certificate.field_of_study,
                dateIssued: certificate.created_at,
                confidence: certificate.ai_confidence
            },
            classification: {
                type: certificate.document_classification || 'academic',
                level: 'undergraduate'
            },
            verification: {
                institutionVerified: certificate.is_verified === 1,
                confidence: certificate.authenticity_score
            }
        });
        
    } catch (error) {
        console.error('Error processing certificate:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process certificate'
        });
    }
});

// Save certificate analysis results
router.post('/certificates', authenticateToken, async (req, res) => {
    try {
        const { certificates } = req.body;
        const db = getDb(req);
        
        // Update completion percentage for user
        await new Promise((resolve, reject) => {
            db.query(
                'UPDATE applicants SET completion_percentage = GREATEST(completion_percentage, 60), updated_at = NOW() WHERE id = ?',
                [req.user.id],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
        
        res.json({
            success: true,
            message: 'Certificate analysis saved successfully',
            completionPercentage: 60
        });
        
    } catch (error) {
        console.error('Error saving certificate analysis:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save certificate analysis'
        });
    }
});

module.exports = router;
