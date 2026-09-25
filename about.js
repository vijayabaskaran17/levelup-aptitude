// About page functionality
class AboutPage {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.animateStats();
        this.setupContactForm();
    }

    setupEventListeners() {
        // Contact form submission
        document.getElementById('contact-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleContactForm(e);
        });
    }

    animateStats() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateNumber(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        document.querySelectorAll('.stat-number').forEach(stat => {
            observer.observe(stat);
        });
    }

    animateNumber(element) {
        const target = parseInt(element.dataset.target);
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Format number with commas
            element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    }

    setupContactForm() {
        const form = document.getElementById('contact-form');
        const inputs = form.querySelectorAll('input, select, textarea');
        
        // Add focus/blur effects
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement.classList.remove('focused');
                }
            });
        });
    }

    handleContactForm(e) {
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        this.showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
        e.target.reset();
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

// Initialize about page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new AboutPage();
});
