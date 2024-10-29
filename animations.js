/* js/main.js */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initNavigation();
    initAnimations();
    initChatbot();
    initCounters();
    initFormValidation();
});

// Navigation functionality
function initNavigation() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const header = document.querySelector('.navbar');

    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                navLinks.classList.remove('active');
            }
        });
    });

    // Header scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > lastScroll) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        lastScroll = currentScroll;

        // Add background when scrolling
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Initialize counters with intersection observer
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    const startCounting = (counter) => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const increment = target / speed;

        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(() => startCounting(counter), 1);
        } else {
            counter.innerText = target;
        }
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounting(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

// Form validation
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            
            // Validate required fields
            form.querySelectorAll('[required]').forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    showError(field, 'This field is required');
                } else {
                    removeError(field);
                }
            });

            // Validate email fields
            form.querySelectorAll('[type="email"]').forEach(field => {
                if (field.value && !isValidEmail(field.value)) {
                    isValid = false;
                    showError(field, 'Please enter a valid email');
                }
            });

            if (isValid) {
                // Submit form
                submitForm(form);
            }
        });
    });
}

/* js/animations.js */
class NetworkAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.connections = [];
        this.mouse = { x: null, y: null, radius: 100 };
        
        this.init();
    }

    init() {
        // Set canvas size
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Create particles
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speedX: Math.random() * 2 - 1,
                speedY: Math.random() * 2 - 1
            });
        }

        // Mouse movement
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        this.animate();
    }

    resize() {
        this.canvas.width = this.canvas.parentElement.offsetWidth;
        this.canvas.height = this.canvas.parentElement.offsetHeight;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];
            
            // Update position
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Bounce off walls
            if (p.x < 0 || p.x > this.canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.speedY *= -1;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = '#6D28D9';
            this.ctx.fill();
            
            // Connect particles
            for (let j = i + 1; j < this.particles.length; j++) {
                let p2 = this.particles[j];
                let distance = Math.sqrt(
                    Math.pow(p.x - p2.x, 2) + 
                    Math.pow(p.y - p2.y, 2)
                );
                
                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(109, 40, 217, ${1 - distance / 100})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

/* js/chatbot.js */
class Chatbot {
    constructor() {
        this.container = document.querySelector('.chatbot');
        this.toggleBtn = this.container.querySelector('.chat-toggle');
        this.chatWindow = this.container.querySelector('.chat-container');
        this.messagesContainer = this.container.querySelector('.chat-messages');
        this.input = this.container.querySelector('input');
        this.sendBtn = this.container.querySelector('.send-message');
        
        this.messages = [
            { type: 'bot', text: 'Hi! How can I help you with OneMatchAI?' }
        ];
        
        this.init();
    }

    init() {
        // Toggle chat window
        this.toggleBtn.addEventListener('click', () => {
            this.chatWindow.classList.toggle('active');
            if (this.chatWindow.classList.contains('active')) {
                this.input.focus();
            }
        });

        // Send message
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Initial render
        this.renderMessages();
    }

    sendMessage() {
        const text = this.input.value.trim();
        if (!text) return;

        // Add user message
        this.addMessage('user', text);
        this.input.value = '';

        // Simulate bot response
        setTimeout(() => {
            this.addMessage('bot', this.getBotResponse(text));
        }, 1000);
    }

    addMessage(type, text) {
        this.messages.push({ type, text });
        this.renderMessages();
    }

    renderMessages() {
        this.messagesContainer.innerHTML = this.messages.map(msg => `
            <div class="message ${msg.type}">
                <div class="message-content">${msg.text}</div>
            </div>
        `).join('');
        
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    getBotResponse(text) {
        // Simple response logic - can be expanded
        if (text.toLowerCase().includes('demo')) {
            return 'I can show you a demo of our AI matching system. Would you like to see it?';
        } else if (text.toLowerCase().includes('price')) {
            return 'Our pricing plans start at $99/month. Would you like to see detailed pricing?';
        } else {
            return 'Thank you for your message. How else can I help you learn about OneMatchAI?';
        }
    }
}

/* js/utils.js */
// Utility functions
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(field, message) {
    removeError(field);
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    field.parentNode.appendChild(error);
    field.classList.add('error');
}

function removeError(field) {
    const error = field.parentNode.querySelector('.error-message');
    if (error) {
        error.remove();
        field.classList.remove('error');
    }
}

async function submitForm(form) {
    const data = new FormData(form);
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    
    try {
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        showSuccess(form, 'Thank you for your submission!');
        form.reset();
    } catch (error) {
        showError(form, 'Something went wrong. Please try again.');
    } finally {
        button.disabled = false;
    }
}

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize network animation
    const canvas = document.getElementById('networkAnimation');
    if (canvas) {
        new NetworkAnimation(canvas);
    }

    // Initialize chatbot
    new Chatbot();

    // Initialize other components
    initNavigation();
    initCounters();
    initFormValidation();
});
