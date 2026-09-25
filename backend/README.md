# Level Up Aptitude — Backend & MySQL Setup Guide

This backend powers the **Level Up Aptitude** web platform for students of **Coimbatore Institute of Technology (CIT)**. It is built with **Node.js, Express, and MySQL 8.0** with full support for user authentication, game session tracking, dashboard analytics, live leaderboards, and contact form inquiries.

---

## 🚀 Quick Start

### 1. Configure MySQL Credentials

Open [`backend/.env`](file:///c:/Users/vijay/OneDrive/Desktop/dm%20website/backend/.env):

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=levelup_aptitude
JWT_SECRET=levelup_super_secret_jwt_token_2026_coimbatore
```

### 2. Run Database Migration (Optional / Automatic)

The backend **automatically runs the schema migration on startup** when connected to MySQL. 

If you prefer to manually import the database into **MySQL Workbench** or command line:

```bash
# Using MySQL Command Line Client:
mysql -u root -p < "backend/schema.sql"
```

The database schema is located at [`backend/schema.sql`](file:///c:/Users/vijay/OneDrive/Desktop/dm%20website/backend/schema.sql).

### 3. Start the Backend Server

```bash
cd backend
npm start
```

Or run directly with auto-reloading:
```bash
npm run dev
```

The server will be available at **`http://localhost:5000`**.
When opened in your browser, it serves the entire Level Up website directly with full API support!

---

## 🗄️ MySQL Database Structure

The `levelup_aptitude` database contains the following tables and views:

| Table | Description |
|---|---|
| `users` | User accounts (name, email, bcrypt password hash, role, institution, timestamps). |
| `categories` | Aptitude categories (`mathematical`, `logical`, `verbal`, `spatial`) with icons and styles. |
| `questions` | Aptitude question bank with options in JSON, correct index, explanation, difficulty, and points. |
| `game_sessions` | Record of every quiz session played (score, max score, accuracy %, time taken, timestamp). |
| `user_stats` | Aggregate performance metrics (games played, total score, best score, per-category averages). |
| `contact_messages` | Inquiries and support messages sent via the Contact Form. |
| `v_leaderboard` | View that computes real-time ranking using `RANK() OVER (ORDER BY total_score DESC)`. |

---

## 📡 REST API Endpoints

### System & Health
- `GET /api/status` — Checks MySQL connection status, active database engine, and table counts.

### Authentication
- `POST /api/auth/register` — Registers new student, hashes password with bcrypt, and initializes stats in MySQL.
  - Body: `{ "name": "...", "email": "...", "password": "..." }`
- `POST /api/auth/login` — Verifies password, returns user object and JWT session token.
  - Body: `{ "email": "...", "password": "..." }`
- `GET /api/auth/me` — Fetches current user profile and stats from database (requires Bearer token).

### Game & Scores
- `POST /api/scores` — Records quiz completion into `game_sessions` and updates `user_stats`.
  - Body: `{ "userId": 1, "category": "mathematical", "score": 40, "totalQuestions": 5 }`
- `GET /api/leaderboard` — Returns top players ranked by total score and average accuracy.

### Contact
- `POST /api/contact` — Submits contact inquiry to `contact_messages` table.
  - Body: `{ "name": "...", "email": "...", "subject": "...", "message": "..." }`
- `GET /api/contact/messages` — Admin list of all submitted inquiries.

---

## 🌟 Key Features
- **Automatic Fallback Mode**: If MySQL credentials are not yet configured or MySQL is offline, the backend continues to serve the frontend seamlessly using a resilient local store.
- **Instant MySQL Sync**: As soon as valid `DB_PASSWORD` is saved in `.env`, the server automatically connects to MySQL, provisions `levelup_aptitude`, and executes `schema.sql`.
- **CIT Coimbatore Integration**: Preconfigured for Coimbatore Institute of Technology with official contact details (`vijaybaskaran17@gmail.com`, `+91 93639 82948`).
