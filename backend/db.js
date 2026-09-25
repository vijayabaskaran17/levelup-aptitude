const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

let pool = null;
let isConnected = false;
let connectionError = null;

// Fallback in-memory store if MySQL credentials are not yet configured
const inMemoryStore = {
    users: [
        { id: 1, name: 'Aarav Sharma', email: 'aarav@cit.edu.in', password_hash: '$2a$10$9v6G4l6Uu7Qh9pB4m1bCge6sZ7pC7l0n6a4q3r1t9w8y2z0x1a', role: 'student', institution: 'Coimbatore Institute of Technology' },
        { id: 2, name: 'Priya Nair', email: 'priya@cit.edu.in', password_hash: '$2a$10$9v6G4l6Uu7Qh9pB4m1bCge6sZ7pC7l0n6a4q3r1t9w8y2z0x1a', role: 'student', institution: 'Coimbatore Institute of Technology' },
        { id: 3, name: 'Vijay Baskaran', email: 'vijaybaskaran17@gmail.com', password_hash: '$2a$10$9v6G4l6Uu7Qh9pB4m1bCge6sZ7pC7l0n6a4q3r1t9w8y2z0x1a', role: 'admin', institution: 'Coimbatore Institute of Technology' },
        { id: 4, name: 'Kavya Raman', email: 'kavya@cit.edu.in', password_hash: '$2a$10$9v6G4l6Uu7Qh9pB4m1bCge6sZ7pC7l0n6a4q3r1t9w8y2z0x1a', role: 'student', institution: 'Coimbatore Institute of Technology' },
        { id: 5, name: 'Rohan Verma', email: 'rohan@cit.edu.in', password_hash: '$2a$10$9v6G4l6Uu7Qh9pB4m1bCge6sZ7pC7l0n6a4q3r1t9w8y2z0x1a', role: 'student', institution: 'Coimbatore Institute of Technology' }
    ],
    user_stats: [
        { user_id: 1, games_played: 24, total_score: 1140, average_score: 48, best_streak: 50, math_games: 6, math_best: 50, math_avg: 48, logic_games: 6, logic_best: 50, logic_avg: 47, verbal_games: 6, verbal_best: 50, verbal_avg: 49, spatial_games: 6, spatial_best: 50, spatial_avg: 46 },
        { user_id: 2, games_played: 21, total_score: 980, average_score: 47, best_streak: 50, math_games: 5, math_best: 50, math_avg: 46, logic_games: 6, logic_best: 50, logic_avg: 48, verbal_games: 5, verbal_best: 50, verbal_avg: 47, spatial_games: 5, spatial_best: 40, spatial_avg: 45 },
        { user_id: 3, games_played: 19, total_score: 910, average_score: 48, best_streak: 50, math_games: 5, math_best: 50, math_avg: 49, logic_games: 5, logic_best: 50, logic_avg: 48, verbal_games: 5, verbal_best: 50, verbal_avg: 48, spatial_games: 4, spatial_best: 40, spatial_avg: 46 },
        { user_id: 4, games_played: 15, total_score: 680, average_score: 45, best_streak: 50, math_games: 4, math_best: 40, math_avg: 44, logic_games: 4, logic_best: 50, logic_avg: 46, verbal_games: 4, verbal_best: 40, verbal_avg: 43, spatial_games: 3, spatial_best: 40, spatial_avg: 47 },
        { user_id: 5, games_played: 12, total_score: 540, average_score: 45, best_streak: 50, math_games: 3, math_best: 50, math_avg: 45, logic_games: 3, logic_best: 40, logic_avg: 44, verbal_games: 3, verbal_best: 40, verbal_avg: 45, spatial_games: 3, spatial_best: 40, spatial_avg: 46 }
    ],
    contact_messages: [
        { id: 1, name: 'Vijay Baskaran', email: 'vijaybaskaran17@gmail.com', subject: 'CIT Aptitude Platform Launch', message: 'Welcome to Level Up Aptitude for Coimbatore Institute of Technology!', status: 'read', created_at: new Date() }
    ],
    game_sessions: []
};

async function initDB() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        connectTimeout: 3000,
        multipleStatements: true
    };

    try {
        console.log(`[MySQL] Attempting connection to ${config.host}:${config.port} as user '${config.user}'...`);
        // 1. Initial connection to create DB if needed
        const rootConnection = await mysql.createConnection(config);
        const dbName = process.env.DB_NAME || 'levelup_aptitude';
        await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        await rootConnection.end();

        // 2. Create connection pool to the target DB
        pool = mysql.createPool({
            ...config,
            database: dbName,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // 3. Test pool and run schema migration
        const testConn = await pool.getConnection();
        isConnected = true;
        connectionError = null;
        console.log(`[MySQL] Successfully connected to database '${dbName}'!`);

        // Run schema.sql to ensure all tables exist
        const schemaPath = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            await testConn.query(schemaSql);
            console.log(`[MySQL] Schema verified and up-to-date with seed data.`);
        }
        testConn.release();
    } catch (err) {
        isConnected = false;
        connectionError = err.message;
        console.warn(`\n[MySQL Notice] Could not connect to MySQL Server (${err.message}).`);
        console.warn(`[MySQL Notice] The server will run using the high-performance local data store.`);
        console.warn(`[MySQL Tip] To connect to your MySQL database:`);
        console.warn(`           1. Open 'backend/.env'`);
        console.warn(`           2. Set your DB_PASSWORD (e.g. DB_PASSWORD=your_mysql_password)`);
        console.warn(`           3. Restart the server!\n`);
    }
}

async function query(sql, params) {
    if (isConnected && pool) {
        const [results] = await pool.query(sql, params);
        return results;
    }
    return null;
}

module.exports = {
    initDB,
    query,
    getPool: () => pool,
    isDbConnected: () => isConnected,
    getConnectionError: () => connectionError,
    inMemoryStore
};
