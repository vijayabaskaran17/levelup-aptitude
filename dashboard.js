// Dashboard functionality
class Dashboard {
    constructor() {
        this.currentUser = null;
        this.charts = {};
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.loadDashboardData();
    }

    checkAuthentication() {
        const user = localStorage.getItem('currentUser');
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        this.currentUser = JSON.parse(user);
        this.updateUserInfo();
    }

    updateUserInfo() {
        document.getElementById('dashboard-user-name').textContent = this.currentUser.name;
        document.getElementById('user-name').textContent = this.currentUser.name;
    }

    setupEventListeners() {
        // Settings modal
        document.getElementById('settings-modal').addEventListener('click', (e) => {
            if (e.target.id === 'settings-modal') {
                this.hideSettings();
            }
        });

        // Close settings modal
        document.querySelector('#settings-modal .close').addEventListener('click', () => {
            this.hideSettings();
        });

        // Settings checkboxes
        document.getElementById('sound-enabled').addEventListener('change', (e) => {
            this.updateSetting('soundEnabled', e.target.checked);
        });

        document.getElementById('animations-enabled').addEventListener('change', (e) => {
            this.updateSetting('animationsEnabled', e.target.checked);
        });

        document.getElementById('notifications-enabled').addEventListener('change', (e) => {
            this.updateSetting('notificationsEnabled', e.target.checked);
        });
    }

    loadDashboardData() {
        this.loadStats();
        this.loadCategoryPerformance();
        this.loadCharts();
        this.loadRecentActivity();
        this.loadSettings();
    }

    loadStats() {
        const stats = this.currentUser.stats || {};
        
        document.getElementById('total-games').textContent = stats.gamesPlayed || 0;
        document.getElementById('total-score').textContent = stats.totalScore || 0;
        document.getElementById('average-score').textContent = stats.averageScore || 0;
        
        // Calculate best streak from category stats
        let bestStreak = 0;
        if (stats.categories) {
            Object.values(stats.categories).forEach(category => {
                bestStreak = Math.max(bestStreak, category.bestScore || 0);
            });
        }
        document.getElementById('best-streak').textContent = bestStreak;
    }

    loadCategoryPerformance() {
        const categories = ['mathematical', 'logical', 'verbal', 'spatial'];
        const categoryNames = {
            mathematical: 'math',
            logical: 'logic',
            verbal: 'verbal',
            spatial: 'spatial'
        };

        categories.forEach(category => {
            const categoryStats = this.currentUser.stats?.categories?.[category] || {};
            const prefix = categoryNames[category];
            
            document.getElementById(`${prefix}-games`).textContent = categoryStats.gamesPlayed || 0;
            document.getElementById(`${prefix}-best`).textContent = categoryStats.bestScore || 0;
            document.getElementById(`${prefix}-avg`).textContent = categoryStats.averageScore || 0;
            
            // Calculate progress and level
            const progress = this.calculateProgress(categoryStats.averageScore || 0);
            const level = this.getLevel(progress);
            
            document.getElementById(`${prefix}-progress`).style.width = `${progress}%`;
            document.getElementById(`${prefix}-level`).textContent = level;
        });
    }

    calculateProgress(averageScore) {
        // Convert average score to percentage (assuming max score per game is 100)
        return Math.min((averageScore / 100) * 100, 100);
    }

    getLevel(progress) {
        if (progress >= 90) return 'Master';
        if (progress >= 80) return 'Expert';
        if (progress >= 70) return 'Advanced';
        if (progress >= 60) return 'Intermediate';
        if (progress >= 40) return 'Beginner+';
        return 'Beginner';
    }

    loadCharts() {
        this.createScoreChart();
        this.createCategoryChart();
    }

    createScoreChart() {
        const ctx = document.getElementById('scoreChart').getContext('2d');
        
        // Generate sample data for demonstration
        const labels = [];
        const scores = [];
        const gamesPlayed = this.currentUser.stats?.gamesPlayed || 0;
        
        for (let i = 0; i < Math.min(gamesPlayed, 10); i++) {
            labels.push(`Game ${i + 1}`);
            scores.push(Math.floor(Math.random() * 100) + 20); // Random scores for demo
        }
        
        this.charts.scoreChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Score',
                    data: scores,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4f46e5',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: '#f1f5f9'
                        },
                        ticks: {
                            color: '#64748b'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#64748b'
                        }
                    }
                }
            }
        });
    }

    createCategoryChart() {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        const categories = ['Mathematical', 'Logical', 'Verbal', 'Spatial'];
        const scores = [];
        
        categories.forEach(category => {
            const categoryKey = category.toLowerCase().replace(' ', '');
            const categoryStats = this.currentUser.stats?.categories?.[categoryKey] || {};
            scores.push(categoryStats.averageScore || 0);
        });
        
        this.charts.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: scores,
                    backgroundColor: [
                        '#4f46e5',
                        '#7c3aed',
                        '#10b981',
                        '#f59e0b'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            color: '#64748b'
                        }
                    }
                }
            }
        });
    }

    loadRecentActivity() {
        const activityList = document.getElementById('activity-list');
        const activities = this.generateRecentActivity();
        
        if (activities.length === 0) {
            activityList.innerHTML = `
                <div class="no-activity">
                    <i class="fas fa-gamepad"></i>
                    <p>No recent activity. Start playing games to see your progress here!</p>
                </div>
            `;
            return;
        }
        
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                </div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `).join('');
    }

    generateRecentActivity() {
        const activities = [];
        const gamesPlayed = this.currentUser.stats?.gamesPlayed || 0;
        
        if (gamesPlayed > 0) {
            activities.push({
                icon: 'fas fa-trophy',
                title: 'Game Completed',
                description: `Scored ${this.currentUser.stats.totalScore || 0} points in your latest game`,
                time: 'Just now'
            });
        }
        
        if (gamesPlayed > 1) {
            activities.push({
                icon: 'fas fa-chart-line',
                title: 'Progress Update',
                description: 'Your average score has improved!',
                time: '1 hour ago'
            });
        }
        
        if (this.currentUser.stats?.categories) {
            Object.entries(this.currentUser.stats.categories).forEach(([category, stats]) => {
                if (stats.gamesPlayed > 0) {
                    activities.push({
                        icon: this.getCategoryIcon(category),
                        title: `${this.getCategoryName(category)} Mastery`,
                        description: `Best score: ${stats.bestScore || 0}`,
                        time: '2 hours ago'
                    });
                }
            });
        }
        
        return activities.slice(0, 5); // Show only last 5 activities
    }

    getCategoryIcon(category) {
        const icons = {
            mathematical: 'fas fa-calculator',
            logical: 'fas fa-puzzle-piece',
            verbal: 'fas fa-comments',
            spatial: 'fas fa-cube'
        };
        return icons[category] || 'fas fa-gamepad';
    }

    getCategoryName(category) {
        const names = {
            mathematical: 'Mathematical Reasoning',
            logical: 'Logical Reasoning',
            verbal: 'Verbal Ability',
            spatial: 'Spatial Reasoning'
        };
        return names[category] || category;
    }

    loadSettings() {
        const settings = this.currentUser.settings || {
            soundEnabled: true,
            animationsEnabled: true,
            notificationsEnabled: true
        };
        
        document.getElementById('sound-enabled').checked = settings.soundEnabled;
        document.getElementById('animations-enabled').checked = settings.animationsEnabled;
        document.getElementById('notifications-enabled').checked = settings.notificationsEnabled;
    }

    updateSetting(key, value) {
        if (!this.currentUser.settings) {
            this.currentUser.settings = {};
        }
        
        this.currentUser.settings[key] = value;
        
        // Update in localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = this.currentUser;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
    }

    showSettings() {
        document.getElementById('settings-modal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    hideSettings() {
        document.getElementById('settings-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    exportData() {
        const data = {
            user: this.currentUser,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `level-up-aptitude-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully!', 'success');
    }

    clearData() {
        if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
            // Reset user stats
            this.currentUser.stats = {
                gamesPlayed: 0,
                totalScore: 0,
                averageScore: 0,
                categories: {}
            };
            
            // Update in localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex !== -1) {
                users[userIndex] = this.currentUser;
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            }
            
            // Reload dashboard
            this.loadDashboardData();
            this.showNotification('All data cleared successfully!', 'success');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 3000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
            warning: '#f59e0b'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Global functions
function showSettings() {
    dashboard.showSettings();
}

function exportData() {
    dashboard.exportData();
}

function clearData() {
    dashboard.clearData();
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', function() {
    dashboard = new Dashboard();
});
