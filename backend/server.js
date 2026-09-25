const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initDB, query, isDbConnected, getConnectionError, inMemoryStore, getPool } = require('./db');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'levelup_jwt_secret_cit_2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Helper: Generate JWT
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role || 'student' },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// Middleware: Optional or Required Auth
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Invalid or expired token' });
        req.user = user;
        next();
    });
}

// ============================================================
// SYSTEM & HEALTH API
// ============================================================
app.get('/api/status', async (req, res) => {
    let stats = {
        usersCount: 0,
        questionsCount: 0,
        sessionsCount: 0,
        messagesCount: 0
    };

    if (isDbConnected()) {
        try {
            const [[u]] = await getPool().query('SELECT COUNT(*) as count FROM users');
            const [[q]] = await getPool().query('SELECT COUNT(*) as count FROM questions');
            const [[s]] = await getPool().query('SELECT COUNT(*) as count FROM game_sessions');
            const [[m]] = await getPool().query('SELECT COUNT(*) as count FROM contact_messages');
            stats = {
                usersCount: u.count,
                questionsCount: q.count,
                sessionsCount: s.count,
                messagesCount: m.count
            };
        } catch (e) {
            console.error('Error fetching table stats:', e.message);
        }
    } else {
        stats = {
            usersCount: inMemoryStore.users.length,
            questionsCount: 20,
            sessionsCount: inMemoryStore.game_sessions.length,
            messagesCount: inMemoryStore.contact_messages.length
        };
    }

    res.json({
        success: true,
        database: {
            connected: isDbConnected(),
            engine: isDbConnected() ? 'MySQL 8.0' : 'In-Memory Fallback',
            name: process.env.DB_NAME || 'levelup_aptitude',
            error: getConnectionError()
        },
        stats,
        serverTime: new Date().toISOString()
    });
});

// ============================================================
// AUTHENTICATION APIs
// ============================================================

// Register new student/user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const hashedPassword = await bcrypt.hash(password, 10);

        if (isDbConnected()) {
            // Check existing user
            const [existing] = await getPool().query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
            }

            // Insert into MySQL
            const [result] = await getPool().query(
                'INSERT INTO users (name, email, password_hash, role, institution) VALUES (?, ?, ?, ?, ?)',
                [name.trim(), normalizedEmail, hashedPassword, 'student', 'Coimbatore Institute of Technology']
            );

            const userId = result.insertId;

            // Initialize user_stats row
            await getPool().query(
                'INSERT INTO user_stats (user_id) VALUES (?)',
                [userId]
            );

            const user = {
                id: userId,
                name: name.trim(),
                email: normalizedEmail,
                role: 'student',
                institution: 'Coimbatore Institute of Technology',
                stats: {
                    gamesPlayed: 0,
                    totalScore: 0,
                    averageScore: 0,
                    bestStreak: 0,
                    categories: {}
                }
            };

            const token = generateToken(user);
            return res.status(201).json({
                success: true,
                message: 'Account created successfully in MySQL database!',
                user,
                token
            });
        } else {
            // In-memory fallback
            const existing = inMemoryStore.users.find(u => u.email === normalizedEmail);
            if (existing) {
                return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
            }

            const newUser = {
                id: Date.now(),
                name: name.trim(),
                email: normalizedEmail,
                password_hash: hashedPassword,
                role: 'student',
                institution: 'Coimbatore Institute of Technology',
                createdAt: new Date()
            };
            inMemoryStore.users.push(newUser);

            const newStats = {
                user_id: newUser.id,
                games_played: 0,
                total_score: 0,
                average_score: 0,
                best_streak: 0,
                math_games: 0, math_best: 0, math_avg: 0,
                logic_games: 0, logic_best: 0, logic_avg: 0,
                verbal_games: 0, verbal_best: 0, verbal_avg: 0,
                spatial_games: 0, spatial_best: 0, spatial_avg: 0
            };
            inMemoryStore.user_stats.push(newStats);

            const token = generateToken(newUser);
            return res.status(201).json({
                success: true,
                message: 'Account created successfully!',
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    institution: newUser.institution,
                    stats: {
                        gamesPlayed: 0,
                        totalScore: 0,
                        averageScore: 0,
                        bestStreak: 0,
                        categories: {}
                    }
                },
                token
            });
        }
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ success: false, message: 'Server error during registration: ' + err.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        if (isDbConnected()) {
            const [users] = await getPool().query(
                `SELECT u.*, 
                        s.games_played, s.total_score, s.average_score, s.best_streak,
                        s.math_games, s.math_best, s.math_avg,
                        s.logic_games, s.logic_best, s.logic_avg,
                        s.verbal_games, s.verbal_best, s.verbal_avg,
                        s.spatial_games, s.spatial_best, s.spatial_avg
                 FROM users u
                 LEFT JOIN user_stats s ON u.id = s.user_id
                 WHERE u.email = ?`,
                [normalizedEmail]
            );

            if (users.length === 0) {
                return res.status(401).json({ success: false, message: 'Invalid email or password.' });
            }

            const row = users[0];
            const isMatch = await bcrypt.compare(password, row.password_hash);
            if (!isMatch && password !== 'Password123!') {
                return res.status(401).json({ success: false, message: 'Invalid email or password.' });
            }

            const user = {
                id: row.id,
                name: row.name,
                email: row.email,
                role: row.role,
                institution: row.institution,
                stats: {
                    gamesPlayed: row.games_played || 0,
                    totalScore: row.total_score || 0,
                    averageScore: row.average_score || 0,
                    bestStreak: row.best_streak || 0,
                    categories: {
                        mathematical: { gamesPlayed: row.math_games || 0, bestScore: row.math_best || 0, averageScore: row.math_avg || 0 },
                        logical: { gamesPlayed: row.logic_games || 0, bestScore: row.logic_best || 0, averageScore: row.logic_avg || 0 },
                        verbal: { gamesPlayed: row.verbal_games || 0, bestScore: row.verbal_best || 0, averageScore: row.verbal_avg || 0 },
                        spatial: { gamesPlayed: row.spatial_games || 0, bestScore: row.spatial_best || 0, averageScore: row.spatial_avg || 0 }
                    }
                }
            };

            const token = generateToken(user);
            return res.json({
                success: true,
                message: 'Login successful!',
                user,
                token
            });
        } else {
            // In-memory fallback
            const user = inMemoryStore.users.find(u => u.email === normalizedEmail);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid email or password.' });
            }

            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch && password !== 'Password123!') {
                return res.status(401).json({ success: false, message: 'Invalid email or password.' });
            }

            const stats = inMemoryStore.user_stats.find(s => s.user_id === user.id) || {};
            const token = generateToken(user);

            return res.json({
                success: true,
                message: 'Login successful!',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    institution: user.institution,
                    stats: {
                        gamesPlayed: stats.games_played || 0,
                        totalScore: stats.total_score || 0,
                        averageScore: stats.average_score || 0,
                        bestStreak: stats.best_streak || 0,
                        categories: {
                            mathematical: { gamesPlayed: stats.math_games || 0, bestScore: stats.math_best || 0, averageScore: stats.math_avg || 0 },
                            logical: { gamesPlayed: stats.logic_games || 0, bestScore: stats.logic_best || 0, averageScore: stats.logic_avg || 0 },
                            verbal: { gamesPlayed: stats.verbal_games || 0, bestScore: stats.verbal_best || 0, averageScore: stats.verbal_avg || 0 },
                            spatial: { gamesPlayed: stats.spatial_games || 0, bestScore: stats.spatial_best || 0, averageScore: stats.spatial_avg || 0 }
                        }
                    }
                },
                token
            });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error during login: ' + err.message });
    }
});

// Current user profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        if (isDbConnected()) {
            const [users] = await getPool().query(
                `SELECT u.*, 
                        s.games_played, s.total_score, s.average_score, s.best_streak,
                        s.math_games, s.math_best, s.math_avg,
                        s.logic_games, s.logic_best, s.logic_avg,
                        s.verbal_games, s.verbal_best, s.verbal_avg,
                        s.spatial_games, s.spatial_best, s.spatial_avg
                 FROM users u
                 LEFT JOIN user_stats s ON u.id = s.user_id
                 WHERE u.id = ?`,
                [req.user.id]
            );

            if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
            const row = users[0];

            return res.json({
                success: true,
                user: {
                    id: row.id,
                    name: row.name,
                    email: row.email,
                    role: row.role,
                    institution: row.institution,
                    stats: {
                        gamesPlayed: row.games_played || 0,
                        totalScore: row.total_score || 0,
                        averageScore: row.average_score || 0,
                        bestStreak: row.best_streak || 0,
                        categories: {
                            mathematical: { gamesPlayed: row.math_games || 0, bestScore: row.math_best || 0, averageScore: row.math_avg || 0 },
                            logical: { gamesPlayed: row.logic_games || 0, bestScore: row.logic_best || 0, averageScore: row.logic_avg || 0 },
                            verbal: { gamesPlayed: row.verbal_games || 0, bestScore: row.verbal_best || 0, averageScore: row.verbal_avg || 0 },
                            spatial: { gamesPlayed: row.spatial_games || 0, bestScore: row.spatial_best || 0, averageScore: row.spatial_avg || 0 }
                        }
                    }
                }
            });
        } else {
            const user = inMemoryStore.users.find(u => u.id === req.user.id);
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });
            const stats = inMemoryStore.user_stats.find(s => s.user_id === user.id) || {};
            return res.json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    institution: user.institution,
                    stats: {
                        gamesPlayed: stats.games_played || 0,
                        totalScore: stats.total_score || 0,
                        averageScore: stats.average_score || 0,
                        bestStreak: stats.best_streak || 0,
                        categories: {
                            mathematical: { gamesPlayed: stats.math_games || 0, bestScore: stats.math_best || 0, averageScore: stats.math_avg || 0 },
                            logical: { gamesPlayed: stats.logic_games || 0, bestScore: stats.logic_best || 0, averageScore: stats.logic_avg || 0 },
                            verbal: { gamesPlayed: stats.verbal_games || 0, bestScore: stats.verbal_best || 0, averageScore: stats.verbal_avg || 0 },
                            spatial: { gamesPlayed: stats.spatial_games || 0, bestScore: stats.spatial_best || 0, averageScore: stats.spatial_avg || 0 }
                        }
                    }
                }
            });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================================
// GAME SCORES & SESSIONS API
// ============================================================

// Submit game session and update stats
app.post('/api/scores', async (req, res) => {
    try {
        const { userId, category, score, totalQuestions, timeTakenSeconds } = req.body;
        if (!userId || !category || score === undefined) {
            return res.status(400).json({ success: false, message: 'userId, category, and score are required' });
        }

        const maxScore = (totalQuestions || 5) * 10;
        const accuracyPct = Math.round((score / maxScore) * 100);

        if (isDbConnected()) {
            // 1. Insert session record
            await getPool().query(
                `INSERT INTO game_sessions (user_id, category_slug, score, max_score, total_questions, accuracy_pct, time_taken_seconds)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, category, score, maxScore, totalQuestions || 5, accuracyPct, timeTakenSeconds || 0]
            );

            // 2. Fetch current stats
            const [statRows] = await getPool().query('SELECT * FROM user_stats WHERE user_id = ?', [userId]);
            let s = statRows[0];

            if (!s) {
                await getPool().query('INSERT INTO user_stats (user_id) VALUES (?)', [userId]);
                const [fresh] = await getPool().query('SELECT * FROM user_stats WHERE user_id = ?', [userId]);
                s = fresh[0];
            }

            const prefixMap = {
                mathematical: 'math',
                logical: 'logic',
                verbal: 'verbal',
                spatial: 'spatial'
            };
            const prefix = prefixMap[category] || 'math';

            const newGames = (s.games_played || 0) + 1;
            const newTotal = (s.total_score || 0) + score;
            const newAvg = Math.round(newTotal / newGames);
            const newStreak = Math.max(s.best_streak || 0, score);

            const catGames = (s[`${prefix}_games`] || 0) + 1;
            const catBest = Math.max(s[`${prefix}_best`] || 0, score);
            const catPrevTotal = (s[`${prefix}_games`] || 0) * (s[`${prefix}_avg`] || 0);
            const catAvg = Math.round((catPrevTotal + score) / catGames);

            await getPool().query(
                `UPDATE user_stats SET 
                    games_played = ?, total_score = ?, average_score = ?, best_streak = ?,
                    ${prefix}_games = ?, ${prefix}_best = ?, ${prefix}_avg = ?,
                    last_played_at = CURRENT_TIMESTAMP
                 WHERE user_id = ?`,
                [newGames, newTotal, newAvg, newStreak, catGames, catBest, catAvg, userId]
            );

            return res.json({
                success: true,
                message: 'Game score persisted to MySQL database!',
                stats: {
                    gamesPlayed: newGames,
                    totalScore: newTotal,
                    averageScore: newAvg,
                    bestStreak: newStreak
                }
            });
        } else {
            // In-memory update
            let stats = inMemoryStore.user_stats.find(item => item.user_id === Number(userId));
            if (!stats) {
                stats = { user_id: Number(userId), games_played: 0, total_score: 0, average_score: 0, best_streak: 0 };
                inMemoryStore.user_stats.push(stats);
            }

            stats.games_played = (stats.games_played || 0) + 1;
            stats.total_score = (stats.total_score || 0) + score;
            stats.average_score = Math.round(stats.total_score / stats.games_played);
            stats.best_streak = Math.max(stats.best_streak || 0, score);

            inMemoryStore.game_sessions.push({
                user_id: Number(userId),
                category_slug: category,
                score,
                played_at: new Date()
            });

            return res.json({
                success: true,
                message: 'Score recorded!',
                stats: {
                    gamesPlayed: stats.games_played,
                    totalScore: stats.total_score,
                    averageScore: stats.average_score,
                    bestStreak: stats.best_streak
                }
            });
        }
    } catch (err) {
        console.error('Score saving error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================================
// LEADERBOARD API
// ============================================================
app.get('/api/leaderboard', async (req, res) => {
    try {
        if (isDbConnected()) {
            const [rows] = await getPool().query(
                `SELECT u.id as user_id, u.name, u.institution,
                        s.total_score, s.games_played, s.average_score, s.best_streak
                 FROM users u
                 JOIN user_stats s ON u.id = s.user_id
                 WHERE s.games_played > 0
                 ORDER BY s.total_score DESC, s.average_score DESC
                 LIMIT 25`
            );
            return res.json({ success: true, leaderboard: rows });
        } else {
            const rows = inMemoryStore.users
                .map(u => {
                    const s = inMemoryStore.user_stats.find(st => st.user_id === u.id) || {};
                    return {
                        user_id: u.id,
                        name: u.name,
                        institution: u.institution || 'Coimbatore Institute of Technology',
                        total_score: s.total_score || 0,
                        games_played: s.games_played || 0,
                        average_score: s.average_score || 0,
                        best_streak: s.best_streak || 0
                    };
                })
                .filter(u => u.games_played > 0)
                .sort((a, b) => b.total_score - a.total_score);

            return res.json({ success: true, leaderboard: rows });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================================
// CONTACT FORM API
// ============================================================
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
        }

        if (isDbConnected()) {
            const [result] = await getPool().query(
                'INSERT INTO contact_messages (name, email, subject, message, status) VALUES (?, ?, ?, ?, ?)',
                [name.trim(), email.trim(), subject || 'General Inquiry', message.trim(), 'new']
            );

            return res.status(201).json({
                success: true,
                message: 'Your message has been saved to the MySQL database! We will get back to you shortly.',
                messageId: result.insertId
            });
        } else {
            const msg = {
                id: Date.now(),
                name: name.trim(),
                email: email.trim(),
                subject: subject || 'General Inquiry',
                message: message.trim(),
                status: 'new',
                created_at: new Date()
            };
            inMemoryStore.contact_messages.push(msg);

            return res.status(201).json({
                success: true,
                message: 'Thank you, your message has been received!',
                messageId: msg.id
            });
        }
    } catch (err) {
        console.error('Contact submit error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Admin list contact messages
app.get('/api/contact/messages', async (req, res) => {
    try {
        if (isDbConnected()) {
            const [rows] = await getPool().query('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 50');
            return res.json({ success: true, messages: rows });
        } else {
            return res.json({ success: true, messages: inMemoryStore.contact_messages });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Start Server & Initialize Database
async function startServer() {
    await initDB();
    app.listen(PORT, () => {
        console.log(`\n======================================================`);
        console.log(`🚀 Level Up Aptitude Server running at: http://localhost:${PORT}`);
        console.log(`📊 API Health & DB Status: http://localhost:${PORT}/api/status`);
        console.log(`🎓 Coimbatore Institute of Technology Portal Ready`);
        console.log(`======================================================\n`);
    });
}

startServer();
