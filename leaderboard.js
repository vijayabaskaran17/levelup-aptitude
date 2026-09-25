// Leaderboard functionality
class Leaderboard {
    constructor() {
        this.currentUser = null;
        this.allUsers = [];
        this.filteredUsers = [];
        this.currentFilter = 'overall';
        this.init();
    }

    init() {
        this.loadUsers();
        this.setupEventListeners();
        this.renderLeaderboard();
    }

    loadUsers() {
        // Load users from localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Add some demo users for better leaderboard experience
        const demoUsers = this.generateDemoUsers();
        this.allUsers = [...users, ...demoUsers];
        
        // Sort users by total score
        this.allUsers.sort((a, b) => (b.stats?.totalScore || 0) - (a.stats?.totalScore || 0));
        
        // Get current user
        const currentUserData = localStorage.getItem('currentUser');
        if (currentUserData) {
            this.currentUser = JSON.parse(currentUserData);
        }
    }

    generateDemoUsers() {
        const names = [
            'Alex Johnson', 'Sarah Chen', 'Michael Rodriguez', 'Emily Davis',
            'David Kim', 'Lisa Wang', 'James Wilson', 'Maria Garcia',
            'Robert Brown', 'Jennifer Lee', 'William Taylor', 'Amanda White',
            'Christopher Martinez', 'Jessica Anderson', 'Daniel Thomas',
            'Ashley Jackson', 'Matthew Harris', 'Stephanie Clark',
            'Andrew Lewis', 'Nicole Walker', 'Joshua Hall', 'Samantha Young',
            'Ryan Allen', 'Megan King', 'Brandon Wright', 'Rachel Scott',
            'Tyler Green', 'Lauren Adams', 'Justin Baker', 'Kayla Nelson'
        ];

        return names.map((name, index) => ({
            id: `demo-${index}`,
            name: name,
            email: `${name.toLowerCase().replace(' ', '.')}@demo.com`,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            stats: {
                gamesPlayed: Math.floor(Math.random() * 50) + 5,
                totalScore: Math.floor(Math.random() * 2000) + 100,
                averageScore: Math.floor(Math.random() * 80) + 20,
                categories: {
                    mathematical: {
                        gamesPlayed: Math.floor(Math.random() * 15) + 1,
                        totalScore: Math.floor(Math.random() * 500) + 50,
                        bestScore: Math.floor(Math.random() * 100) + 20,
                        averageScore: Math.floor(Math.random() * 80) + 20
                    },
                    logical: {
                        gamesPlayed: Math.floor(Math.random() * 12) + 1,
                        totalScore: Math.floor(Math.random() * 400) + 40,
                        bestScore: Math.floor(Math.random() * 100) + 15,
                        averageScore: Math.floor(Math.random() * 75) + 15
                    },
                    verbal: {
                        gamesPlayed: Math.floor(Math.random() * 18) + 1,
                        totalScore: Math.floor(Math.random() * 600) + 60,
                        bestScore: Math.floor(Math.random() * 100) + 25,
                        averageScore: Math.floor(Math.random() * 85) + 25
                    },
                    spatial: {
                        gamesPlayed: Math.floor(Math.random() * 10) + 1,
                        totalScore: Math.floor(Math.random() * 300) + 30,
                        bestScore: Math.floor(Math.random() * 100) + 10,
                        averageScore: Math.floor(Math.random() * 70) + 10
                    }
                }
            }
        }));
    }

    setupEventListeners() {
        // Filter tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveTab(e.target);
                this.currentFilter = e.target.dataset.filter;
                this.filterUsers();
                this.renderLeaderboard();
            });
        });

        // Search functionality
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filterUsers();
            this.renderLeaderboard();
        });

        // Sort functionality
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.sortUsers(e.target.value);
            this.renderLeaderboard();
        });
    }

    setActiveTab(activeBtn) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    filterUsers() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        
        this.filteredUsers = this.allUsers.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm);
            const hasStats = user.stats && user.stats.gamesPlayed > 0;
            return matchesSearch && hasStats;
        });

        // Sort by current filter
        this.sortUsers(document.getElementById('sort-select').value);
    }

    sortUsers(sortBy) {
        this.filteredUsers.sort((a, b) => {
            switch (sortBy) {
                case 'totalScore':
                    return (b.stats?.totalScore || 0) - (a.stats?.totalScore || 0);
                case 'averageScore':
                    return (b.stats?.averageScore || 0) - (a.stats?.averageScore || 0);
                case 'gamesPlayed':
                    return (b.stats?.gamesPlayed || 0) - (a.stats?.gamesPlayed || 0);
                default:
                    return 0;
            }
        });
    }

    renderLeaderboard() {
        this.renderPodium();
        this.renderTable();
        this.renderYourRanking();
        this.renderAchievements();
    }

    renderPodium() {
        const podium = document.getElementById('podium');
        const top3 = this.filteredUsers.slice(0, 3);
        
        if (top3.length === 0) {
            podium.innerHTML = '<p style="text-align: center; color: #64748b;">No players found</p>';
            return;
        }

        podium.innerHTML = top3.map((user, index) => {
            const places = ['first', 'second', 'third'];
            const place = places[index];
            const score = this.getUserScore(user);
            
            return `
                <div class="podium-place ${place}">
                    <div class="podium-player">
                        <div class="player-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="player-name">${user.name}</div>
                        <div class="player-score">${score}</div>
                    </div>
                    <div class="podium-stand ${place}">
                        <div class="rank-badge">${index + 1}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderTable() {
        const tbody = document.getElementById('leaderboard-body');
        
        if (this.filteredUsers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #64748b; padding: 40px;">
                        No players found matching your criteria
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredUsers.map((user, index) => {
            const rank = index + 1;
            const score = this.getUserScore(user);
            const averageScore = user.stats?.averageScore || 0;
            const gamesPlayed = user.stats?.gamesPlayed || 0;
            const bestCategory = this.getBestCategory(user);
            
            return `
                <tr ${user.id === this.currentUser?.id ? 'style="background: #f0f9ff;"' : ''}>
                    <td class="rank-cell">${rank}</td>
                    <td class="player-cell">
                        <div class="player-avatar-small">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="player-details">
                            <h4>${user.name} ${user.id === this.currentUser?.id ? '(You)' : ''}</h4>
                            <p>Joined ${this.formatDate(user.createdAt)}</p>
                        </div>
                    </td>
                    <td class="score-cell">${score}</td>
                    <td class="score-cell">${averageScore}</td>
                    <td class="score-cell">${gamesPlayed}</td>
                    <td>
                        <span class="best-category">${bestCategory}</span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderYourRanking() {
        const yourRanking = document.getElementById('your-ranking');
        
        if (!this.currentUser) {
            yourRanking.style.display = 'none';
            return;
        }

        const userIndex = this.filteredUsers.findIndex(user => user.id === this.currentUser.id);
        
        if (userIndex === -1) {
            yourRanking.style.display = 'none';
            return;
        }

        const rank = userIndex + 1;
        const score = this.getUserScore(this.currentUser);
        const averageScore = this.currentUser.stats?.averageScore || 0;
        const gamesPlayed = this.currentUser.stats?.gamesPlayed || 0;

        document.getElementById('your-rank').textContent = rank;
        document.getElementById('your-name').textContent = this.currentUser.name;
        document.getElementById('your-stats').textContent = 
            `Total Score: ${score} | Average: ${averageScore} | Games: ${gamesPlayed}`;

        yourRanking.style.display = 'block';
    }

    renderAchievements() {
        const achievementsGrid = document.getElementById('achievements-grid');
        const achievements = this.getRecentAchievements();
        
        achievementsGrid.innerHTML = achievements.map(achievement => `
            <div class="achievement-card">
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
            </div>
        `).join('');
    }

    getRecentAchievements() {
        const achievements = [
            {
                icon: 'fas fa-trophy',
                title: 'First Victory',
                description: 'Congratulations to our newest players who completed their first game!'
            },
            {
                icon: 'fas fa-fire',
                title: 'Streak Master',
                description: 'Players who achieved a 5+ game winning streak this week.'
            },
            {
                icon: 'fas fa-brain',
                title: 'Logic Master',
                description: 'Top performers in Logical Reasoning category this month.'
            },
            {
                icon: 'fas fa-calculator',
                title: 'Math Wizard',
                description: 'Mathematical Reasoning champions of the week.'
            },
            {
                icon: 'fas fa-star',
                title: 'Perfect Score',
                description: 'Players who achieved 100% accuracy in any category.'
            },
            {
                icon: 'fas fa-medal',
                title: 'Consistent Player',
                description: 'Players who completed 10+ games this month.'
            }
        ];

        return achievements;
    }

    getUserScore(user) {
        switch (this.currentFilter) {
            case 'mathematical':
                return user.stats?.categories?.mathematical?.totalScore || 0;
            case 'logical':
                return user.stats?.categories?.logical?.totalScore || 0;
            case 'verbal':
                return user.stats?.categories?.verbal?.totalScore || 0;
            case 'spatial':
                return user.stats?.categories?.spatial?.totalScore || 0;
            default:
                return user.stats?.totalScore || 0;
        }
    }

    getBestCategory(user) {
        if (!user.stats?.categories) return 'N/A';
        
        const categories = user.stats.categories;
        let bestCategory = '';
        let bestScore = 0;
        
        Object.entries(categories).forEach(([category, stats]) => {
            if (stats.averageScore > bestScore) {
                bestScore = stats.averageScore;
                bestCategory = category;
            }
        });
        
        const categoryNames = {
            mathematical: 'Math',
            logical: 'Logic',
            verbal: 'Verbal',
            spatial: 'Spatial'
        };
        
        return categoryNames[bestCategory] || 'N/A';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
        return `${Math.ceil(diffDays / 365)} years ago`;
    }
}

// Initialize leaderboard when page loads
let leaderboard;
document.addEventListener('DOMContentLoaded', function() {
    leaderboard = new Leaderboard();
});
