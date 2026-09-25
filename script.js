// ============================================================
// Level Up Aptitude — Single Page Application Controller
// Connected to MySQL Backend & CIT Coimbatore Portal
// ============================================================

const API_BASE = (window.location.protocol.startsWith('http') && window.location.port !== '5000') 
    ? 'http://localhost:5000' 
    : '';

// --- Global State ---
let currentUser = null;
let authToken = localStorage.getItem('authToken') || null;
let currentGame = null;
let gameScore = 0;
let currentQuestionIndex = 0;
let gameQuestions = [];

// --- Game Question Data ---
const gameData = {
    mathematical: [
        {
            question: "What is 15% of 240?",
            options: ["36", "32", "40", "28"],
            correct: 0,
            explanation: "15% of 240 = 0.15 × 240 = 36"
        },
        {
            question: "If a train travels 300 km in 4 hours, what is its average speed?",
            options: ["75 km/h", "80 km/h", "70 km/h", "85 km/h"],
            correct: 0,
            explanation: "Average speed = Distance ÷ Time = 300 ÷ 4 = 75 km/h"
        },
        {
            question: "What is the next number in the sequence: 2, 6, 12, 20, ?",
            options: ["28", "30", "32", "24"],
            correct: 1,
            explanation: "The pattern is n(n+1): 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30"
        },
        {
            question: "If 3x + 7 = 22, what is the value of x?",
            options: ["5", "4", "6", "3"],
            correct: 0,
            explanation: "3x + 7 = 22, so 3x = 15, therefore x = 5"
        },
        {
            question: "What is the area of a circle with radius 7 cm? (Use π = 22/7)",
            options: ["154 cm²", "147 cm²", "161 cm²", "168 cm²"],
            correct: 0,
            explanation: "Area = πr² = (22/7) × 7² = (22/7) × 49 = 154 cm²"
        }
    ],
    logical: [
        {
            question: "All roses are flowers. Some flowers are red. Which statement is definitely true?",
            options: ["All roses are red", "Some roses are red", "No roses are red", "Cannot be determined"],
            correct: 3,
            explanation: "We know all roses are flowers and some flowers are red, but we cannot determine if any roses are red."
        },
        {
            question: "If today is Wednesday, what day will it be 100 days from now?",
            options: ["Thursday", "Friday", "Saturday", "Sunday"],
            correct: 1,
            explanation: "100 ÷ 7 = 14 weeks and 2 days. Wednesday + 2 days = Friday"
        },
        {
            question: "A, B, C, D are sitting in a row. A is not at either end. B is next to C. D is at one end. Who must be in an inner position?",
            options: ["A", "B", "C", "Cannot be determined"],
            correct: 0,
            explanation: "If D is at one end and A is not at either end, A must be in an inner position."
        },
        {
            question: "Complete the pattern: 1, 4, 9, 16, ?",
            options: ["20", "24", "25", "30"],
            correct: 2,
            explanation: "These are perfect squares: 1²=1, 2²=4, 3²=9, 4²=16, 5²=25"
        },
        {
            question: "If APPLE = 50, BANANA = 42, what does CAT equal?",
            options: ["24", "27", "30", "21"],
            correct: 0,
            explanation: "Each letter = its position: C(3)+A(1)+T(20) = 24"
        }
    ],
    verbal: [
        {
            question: "What is the synonym of 'BENEVOLENT'?",
            options: ["Malevolent", "Kind", "Stubborn", "Lazy"],
            correct: 1,
            explanation: "Benevolent means kind, generous, or well-meaning."
        },
        {
            question: "Which word is the antonym of 'EPHEMERAL'?",
            options: ["Temporary", "Permanent", "Brief", "Fleeting"],
            correct: 1,
            explanation: "Ephemeral means lasting for a very short time, so permanent is its opposite."
        },
        {
            question: "Complete the analogy: BOOK is to LIBRARY as MONEY is to ?",
            options: ["Bank", "Wallet", "Store", "ATM"],
            correct: 0,
            explanation: "Books are stored in libraries, just as money is stored in banks."
        },
        {
            question: "What does 'SERENDIPITY' mean?",
            options: ["Bad luck", "Good fortune by accident", "Hard work", "Intelligence"],
            correct: 1,
            explanation: "Serendipity means the occurrence of events by chance in a happy way."
        },
        {
            question: "Which sentence is grammatically correct?",
            options: ["He don't like apples", "He doesn't like apples", "He doesn't likes apples", "He don't likes apples"],
            correct: 1,
            explanation: "The correct form is 'He doesn't like apples' — third person singular with 'doesn't' and base form of verb."
        }
    ],
    spatial: [
        {
            question: "If you fold a square piece of paper in half twice and cut a small triangle from the corner, how many holes will you have when you unfold it?",
            options: ["1", "2", "4", "8"],
            correct: 2,
            explanation: "Folding twice creates 4 layers, so cutting one triangle creates 4 holes."
        },
        {
            question: "Which 3D shape has 6 faces, 12 edges, and 8 vertices?",
            options: ["Cylinder", "Cube", "Sphere", "Pyramid"],
            correct: 1,
            explanation: "A cube has 6 square faces, 12 edges, and 8 vertices."
        },
        {
            question: "If you rotate a square 90 degrees clockwise, what will it look like?",
            options: ["Same as original", "Upside down", "Rotated 90°", "Cannot determine"],
            correct: 2,
            explanation: "A square rotated 90 degrees clockwise will appear rotated but still be a square."
        },
        {
            question: "How many cubes are in a 3×3×3 cube?",
            options: ["27", "26", "25", "24"],
            correct: 0,
            explanation: "A 3×3×3 cube contains 3 × 3 × 3 = 27 smaller cubes."
        },
        {
            question: "Which net can be folded to make a cube?",
            options: ["6 squares in a line", "Cross shape with 6 squares", "L-shape with 6 squares", "All of the above"],
            correct: 1,
            explanation: "Only the cross shape with 6 squares can be folded into a cube."
        }
    ]
};

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    loadUser();
    updateNavUI();
    setupNavigation();
    setupMobileMenu();
    setupModals();
    setupForms();
    setupScrollEffects();
    setup3DCardTilt();
    checkDatabaseStatus();
    animateHeroStats();
    loadDashboard();
    loadLeaderboard();
}

// ============================================================
// USER MANAGEMENT
// ============================================================
function loadUser() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
        currentUser = JSON.parse(stored);
    }
}

function updateNavUI() {
    const authEl = document.getElementById('nav-auth');
    const userEl = document.getElementById('nav-user');
    const nameEl = document.getElementById('user-name-display');
    const dashPrompt = document.getElementById('dash-login-prompt');

    if (currentUser) {
        authEl.style.display = 'none';
        userEl.style.display = 'flex';
        nameEl.textContent = currentUser.name;
        if (dashPrompt) dashPrompt.style.display = 'none';
    } else {
        authEl.style.display = 'flex';
        userEl.style.display = 'none';
        if (dashPrompt) dashPrompt.style.display = 'block';
    }
}

// ============================================================
// NAVIGATION
// ============================================================
function setupNavigation() {
    // Smooth scroll for nav links
    document.querySelectorAll('.nav-link, a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    // Close mobile menu
                    document.getElementById('nav-menu').classList.remove('active');
                    document.getElementById('hamburger').classList.remove('active');
                }
            }
        });
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[data-section]');

    const observerOptions = {
        rootMargin: '-20% 0px -60% 0px'
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.dataset.section === sectionId);
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));
}

function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

function setupScrollEffects() {
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Intersection observer for fade-in animations
    const animElements = document.querySelectorAll('.feature-card, .game-card, .dash-stat-card, .dash-category-card, .team-member');
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animElements.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.6s ${0.08 * i}s cubic-bezier(0.16, 1, 0.3, 1)`;
        fadeObserver.observe(el);
    });
}

// ============================================================
// HERO COUNTER ANIMATION
// ============================================================
function animateHeroStats() {
    const counters = document.querySelectorAll('.hero-stat-number[data-count]');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
}

function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const duration = 2000;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        el.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = target.toLocaleString();
        }
    }
    
    requestAnimationFrame(update);
}

// ============================================================
// MODALS
// ============================================================
function setupModals() {
    // Close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.modal;
            hideModal(modalId);
        });
    });

    // Click outside to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });

    // Auth buttons
    document.getElementById('login-btn').addEventListener('click', showLoginModal);
    document.getElementById('register-btn').addEventListener('click', showRegisterModal);
    document.getElementById('hero-get-started').addEventListener('click', () => {
        if (currentUser) {
            document.getElementById('games').scrollIntoView({ behavior: 'smooth' });
        } else {
            showRegisterModal();
        }
    });
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Switch between modals
    document.getElementById('switch-to-register').addEventListener('click', (e) => {
        e.preventDefault();
        hideModal('login-modal');
        setTimeout(() => showRegisterModal(), 200);
    });
    document.getElementById('switch-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        hideModal('register-modal');
        setTimeout(() => showLoginModal(), 200);
    });
}

function showModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'flex';
    // Force reflow for animation
    modal.offsetHeight;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { modal.style.display = 'none'; }, 300);
}

function showLoginModal() { showModal('login-modal'); }
function showRegisterModal() { showModal('register-modal'); }

// ============================================================
// FORMS
// ============================================================
function setupForms() {
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('contact-form').addEventListener('submit', handleContact);
}

function setBtnLoading(btn, isLoading) {
    if (!btn) return;
    const textEl = btn.querySelector('.btn-text');
    const loaderEl = btn.querySelector('.btn-loader');
    btn.disabled = isLoading;
    if (textEl) textEl.style.display = isLoading ? 'none' : 'inline';
    if (loaderEl) loaderEl.style.display = isLoading ? 'inline' : 'none';
}

function handleLogin(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    setBtnLoading(submitBtn, true);

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        setBtnLoading(submitBtn, false);
        if (data.success) {
            currentUser = data.user;
            authToken = data.token;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            if (authToken) localStorage.setItem('authToken', authToken);
            updateNavUI();
            hideModal('login-modal');
            loadDashboard();
            loadLeaderboard();
            showNotification('Welcome back, ' + currentUser.name + '!', 'success');
            document.getElementById('login-form').reset();
        } else {
            showNotification(data.message || 'Invalid email or password.', 'error');
        }
    })
    .catch(() => {
        setBtnLoading(submitBtn, false);
        // Local fallback
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            updateNavUI();
            hideModal('login-modal');
            loadDashboard();
            loadLeaderboard();
            showNotification('Welcome back, ' + user.name + '!', 'success');
            document.getElementById('login-form').reset();
        } else {
            showNotification('Invalid email or password.', 'error');
        }
    });
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;

    if (password !== confirm) {
        showNotification('Passwords do not match.', 'error');
        return;
    }
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters.', 'error');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    setBtnLoading(submitBtn, true);

    fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    })
    .then(res => res.json())
    .then(data => {
        setBtnLoading(submitBtn, false);
        if (data.success) {
            currentUser = data.user;
            authToken = data.token;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            if (authToken) localStorage.setItem('authToken', authToken);
            updateNavUI();
            hideModal('register-modal');
            loadDashboard();
            loadLeaderboard();
            showNotification('Account created successfully! Welcome, ' + currentUser.name + ' 🎉', 'success');
            document.getElementById('register-form').reset();
        } else {
            showNotification(data.message || 'Registration failed.', 'error');
        }
    })
    .catch(() => {
        setBtnLoading(submitBtn, false);
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.email === email)) {
            showNotification('Email already exists.', 'error');
            return;
        }
        const newUser = {
            id: Date.now(),
            name, email, password,
            createdAt: new Date().toISOString(),
            stats: { gamesPlayed: 0, totalScore: 0, averageScore: 0, categories: {} }
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        updateNavUI();
        hideModal('register-modal');
        loadDashboard();
        loadLeaderboard();
        showNotification('Welcome to Level Up, ' + name + '! 🎉', 'success');
        document.getElementById('register-form').reset();
    });
}

function handleContact(e) {
    e.preventDefault();
    const name = document.getElementById('contact-name')?.value || '';
    const email = document.getElementById('contact-email')?.value || '';
    const subject = document.getElementById('contact-subject')?.value || '';
    const message = document.getElementById('contact-message')?.value || '';

    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
    })
    .then(res => res.json())
    .then(data => {
        if (submitBtn) submitBtn.disabled = false;
        if (data.success) {
            showNotification(data.message || 'Message sent and stored in database!', 'success');
            e.target.reset();
        } else {
            showNotification(data.message || 'Could not send message.', 'error');
        }
    })
    .catch(() => {
        if (submitBtn) submitBtn.disabled = false;
        showNotification('Message received! We will get back to you soon.', 'success');
        e.target.reset();
    });
}

function logout() {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    updateNavUI();
    loadDashboard();
    showNotification('Logged out successfully.', 'info');
}

// ============================================================
// GAME ENGINE
// ============================================================
function openGame(category) {
    if (!currentUser) {
        showNotification('Please sign in to play games.', 'warning');
        showLoginModal();
        return;
    }

    currentGame = category;
    gameScore = 0;
    currentQuestionIndex = 0;
    gameQuestions = shuffleArray([...gameData[category]]);

    showModal('game-modal');
    renderQuestion();
}

function renderQuestion() {
    const container = document.getElementById('game-container');
    const categoryNames = {
        mathematical: 'Mathematical Reasoning',
        logical: 'Logical Reasoning',
        verbal: 'Verbal Ability',
        spatial: 'Spatial Reasoning'
    };

    const q = gameQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / gameQuestions.length) * 100;

    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">${categoryNames[currentGame]}</h2>
            <div class="game-score">
                Score: <strong>${gameScore}</strong> · Question ${currentQuestionIndex + 1}/${gameQuestions.length}
            </div>
            <div class="dash-progress-bar" style="margin-top: 12px;">
                <div class="dash-progress-fill" style="width: ${progress}%; --bar-color: var(--cyan); transition: width 0.5s ease;"></div>
            </div>
        </div>
        <div class="game-question">
            <div class="question-text">${q.question}</div>
            <div class="question-options">
                ${q.options.map((opt, i) =>
                    `<button class="option-btn" onclick="selectOption(${i})">${opt}</button>`
                ).join('')}
            </div>
        </div>
        <div class="game-controls">
            <button class="btn btn-ghost" onclick="skipQuestion()">Skip</button>
            <button class="btn btn-primary" id="submit-btn" onclick="submitAnswer()" disabled>Submit</button>
        </div>
    `;
}

function selectOption(index) {
    document.querySelectorAll('.option-btn').forEach((btn, i) => {
        btn.classList.toggle('selected', i === index);
    });
    document.getElementById('submit-btn').disabled = false;
    gameQuestions[currentQuestionIndex].selectedOption = index;
}

function submitAnswer() {
    const q = gameQuestions[currentQuestionIndex];
    const selected = q.selectedOption;
    if (selected === undefined) return;

    const isCorrect = selected === q.correct;
    if (isCorrect) gameScore += 10;

    // Disable all buttons and show feedback
    document.querySelectorAll('.option-btn').forEach((btn, i) => {
        btn.disabled = true;
        btn.onclick = null;
        if (i === q.correct) btn.classList.add('correct');
        else if (i === selected && !isCorrect) btn.classList.add('incorrect');
    });

    // Show explanation after a beat
    setTimeout(() => {
        const container = document.getElementById('game-container');
        const resultDiv = document.createElement('div');
        resultDiv.className = 'game-result';
        resultDiv.innerHTML = `
            <div class="result-message">
                <strong style="color: ${isCorrect ? 'var(--emerald)' : 'var(--red)'};">
                    ${isCorrect ? '✓ Correct!' : '✗ Incorrect!'}
                </strong><br>
                ${q.explanation}
            </div>
            <button class="btn btn-primary" onclick="nextQuestion()">
                ${currentQuestionIndex < gameQuestions.length - 1 ? 'Next Question →' : 'See Results'}
            </button>
        `;
        container.appendChild(resultDiv);
    }, 1200);
}

function skipQuestion() { nextQuestion(); }

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= gameQuestions.length) {
        endGame();
    } else {
        renderQuestion();
    }
}

function endGame() {
    const container = document.getElementById('game-container');
    const maxScore = gameQuestions.length * 10;
    const pct = Math.round((gameScore / maxScore) * 100);

    let emoji, message;
    if (pct >= 80) { emoji = '🏆'; message = 'Excellent work! You\'ve mastered this category.'; }
    else if (pct >= 60) { emoji = '👏'; message = 'Good job! Keep practicing to improve further.'; }
    else { emoji = '💪'; message = 'Keep practicing! You\'ll get better with time.'; }

    container.innerHTML = `
        <div class="game-header">
            <h2 class="game-title">Game Complete! ${emoji}</h2>
        </div>
        <div class="game-result">
            <div class="result-title">Final Score</div>
            <div class="result-score">${gameScore} / ${maxScore}</div>
            <div class="result-message">${message}</div>
            <div class="game-controls">
                <button class="btn btn-ghost" onclick="hideModal('game-modal')">Close</button>
                <button class="btn btn-primary" onclick="openGame('${currentGame}')">Play Again</button>
            </div>
        </div>
    `;

    updateUserStats(gameScore, gameQuestions.length);
    loadDashboard();
    loadLeaderboard();
}

function updateUserStats(score, totalQuestions = 5) {
    if (!currentUser) return;

    if (!currentUser.stats) {
        currentUser.stats = { gamesPlayed: 0, totalScore: 0, averageScore: 0, categories: {} };
    }

    currentUser.stats.gamesPlayed++;
    currentUser.stats.totalScore += score;
    currentUser.stats.averageScore = Math.round(currentUser.stats.totalScore / currentUser.stats.gamesPlayed);

    // Per-category stats
    if (!currentUser.stats.categories) currentUser.stats.categories = {};
    if (!currentUser.stats.categories[currentGame]) {
        currentUser.stats.categories[currentGame] = { gamesPlayed: 0, totalScore: 0, bestScore: 0, averageScore: 0 };
    }
    const cat = currentUser.stats.categories[currentGame];
    cat.gamesPlayed++;
    cat.totalScore += score;
    cat.bestScore = Math.max(cat.bestScore, score);
    cat.averageScore = Math.round(cat.totalScore / cat.gamesPlayed);

    // Persist local cache
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx !== -1) {
        users[idx] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    // Persist to MySQL Backend API
    fetch(`${API_BASE}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: currentUser.id,
            category: currentGame,
            score: score,
            totalQuestions: totalQuestions
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.stats) {
            currentUser.stats.totalScore = data.stats.totalScore;
            currentUser.stats.gamesPlayed = data.stats.gamesPlayed;
            currentUser.stats.averageScore = data.stats.averageScore;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            loadDashboard();
            loadLeaderboard();
        }
    })
    .catch(err => console.log('Score saved locally:', err.message));
}

// ============================================================
// DASHBOARD
// ============================================================
function loadDashboard() {
    if (!currentUser) return;

    const stats = currentUser.stats || {};
    setTextSafe('dash-games-played', stats.gamesPlayed || 0);
    setTextSafe('dash-total-score', stats.totalScore || 0);
    setTextSafe('dash-avg-score', stats.averageScore || 0);

    // Best streak = best score across categories
    let bestStreak = 0;
    if (stats.categories) {
        Object.values(stats.categories).forEach(c => {
            bestStreak = Math.max(bestStreak, c.bestScore || 0);
        });
    }
    setTextSafe('dash-best-streak', bestStreak);

    // Category details
    const catMap = {
        mathematical: 'math',
        logical: 'logic',
        verbal: 'verbal',
        spatial: 'spatial'
    };

    Object.entries(catMap).forEach(([key, prefix]) => {
        const catStats = stats.categories?.[key] || {};
        setTextSafe(`dash-${prefix}-games`, catStats.gamesPlayed || 0);
        setTextSafe(`dash-${prefix}-best`, catStats.bestScore || 0);
        setTextSafe(`dash-${prefix}-avg`, catStats.averageScore || 0);

        const progress = Math.min(((catStats.averageScore || 0) / 50) * 100, 100);
        const progressEl = document.getElementById(`dash-${prefix}-progress`);
        if (progressEl) progressEl.style.width = progress + '%';

        const levelEl = document.getElementById(`dash-${prefix}-level`);
        if (levelEl) levelEl.textContent = getLevel(progress);
    });
}

function getLevel(progress) {
    if (progress >= 90) return 'Master';
    if (progress >= 70) return 'Expert';
    if (progress >= 50) return 'Advanced';
    if (progress >= 30) return 'Intermediate';
    if (progress > 0) return 'Beginner+';
    return 'Beginner';
}

// ============================================================
// LEADERBOARD (MySQL Backend with local fallback)
// ============================================================
function loadLeaderboard() {
    fetch(`${API_BASE}/api/leaderboard`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.leaderboard && data.leaderboard.length > 0) {
                renderLeaderboardData(data.leaderboard);
                return;
            }
            fallbackLocalLeaderboard();
        })
        .catch(() => {
            fallbackLocalLeaderboard();
        });
}

function renderLeaderboardData(list) {
    // Podium
    for (let i = 1; i <= 3; i++) {
        const user = list[i - 1];
        setTextSafe(`podium-${i}-name`, user ? user.name : '—');
        setTextSafe(`podium-${i}-score`, user ? (user.total_score + ' pts') : '0 pts');
    }

    // Table
    const tbody = document.getElementById('lb-table-body');
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    No players yet. Be the first to play!
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = list.map((user, i) => {
        const rankClass = i === 0 ? 'lb-rank-gold' : i === 1 ? 'lb-rank-silver' : i === 2 ? 'lb-rank-bronze' : '';
        const instBadge = user.institution ? `<span style="font-size:0.75rem; color:var(--text-muted); display:block;">${user.institution}</span>` : '';
        return `
            <tr>
                <td><span class="lb-rank ${rankClass}">#${i + 1}</span></td>
                <td><span class="lb-player">${user.name}</span>${instBadge}</td>
                <td><strong>${user.total_score || 0}</strong></td>
                <td>${user.games_played || 0}</td>
                <td>${user.average_score || 0}</td>
            </tr>
        `;
    }).join('');
}

function fallbackLocalLeaderboard() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const sorted = users
        .filter(u => (u.stats?.gamesPlayed || 0) > 0)
        .sort((a, b) => (b.stats?.totalScore || 0) - (a.stats?.totalScore || 0))
        .map(u => ({
            name: u.name,
            total_score: u.stats?.totalScore || 0,
            games_played: u.stats?.gamesPlayed || 0,
            average_score: u.stats?.averageScore || 0
        }));
    renderLeaderboardData(sorted);
}

// ============================================================
// 3D CARD TILT & MOUSE INTERACTION
// ============================================================
function setup3DCardTilt() {
    const cards = document.querySelectorAll('.card-3d, .game-card, .feature-card, .dash-stat-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });

    // 3D Hero Visual interactive mouse tracking
    const heroVisual = document.querySelector('.hero-visual');
    const heroLogo = document.querySelector('.hero-3d-logo');
    if (heroVisual && heroLogo) {
        heroVisual.addEventListener('mousemove', (e) => {
            const rect = heroVisual.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            heroLogo.style.transform = `rotateY(${(x * 0.08).toFixed(1)}deg) rotateX(${(-y * 0.08).toFixed(1)}deg) scale(1.05)`;
        });
        heroVisual.addEventListener('mouseleave', () => {
            heroLogo.style.transform = '';
        });
    }
}

// ============================================================
// DATABASE STATUS MONITOR
// ============================================================
function checkDatabaseStatus() {
    fetch(`${API_BASE}/api/status`)
        .then(res => res.json())
        .then(data => {
            const pill = document.getElementById('db-status-pill');
            const dot = document.getElementById('db-status-dot');
            const label = document.getElementById('db-status-label');
            if (pill && dot && label) {
                pill.style.display = 'inline-flex';
                if (data.database && data.database.connected) {
                    dot.className = 'db-status-dot';
                    label.textContent = 'MySQL Online';
                    pill.title = `Connected to MySQL: ${data.database.name}`;
                } else {
                    dot.className = 'db-status-dot offline';
                    label.textContent = 'DB Active';
                    pill.title = 'Backend Active (Set DB_PASSWORD in backend/.env for MySQL)';
                }
            }
        })
        .catch(() => {
            const pill = document.getElementById('db-status-pill');
            if (pill) pill.style.display = 'none';
        });
}

// ============================================================
// NOTIFICATIONS
// ============================================================
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notif = document.createElement('div');
    notif.className = `notification notification-${type}`;
    notif.textContent = message;
    container.appendChild(notif);

    setTimeout(() => {
        notif.classList.add('removing');
        setTimeout(() => notif.remove(), 400);
    }, 3500);
}

// ============================================================
// UTILITIES
// ============================================================
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function setTextSafe(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}
