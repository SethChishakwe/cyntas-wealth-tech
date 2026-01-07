// static/js/script.js - Complete with Burger Menu

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initializeBurgerMenu(); // COMMENTED OUT - Burger menu is now hardcoded in HTML
    initializeSmoothScrolling();
    initializeFormValidation();
    initializeURLParameters();
    initializeScrollEffects();
    initializeAnimations();
    initializeEventListeners();
});

// ===== BURGER MENU FUNCTIONALITY =====
function initializeBurgerMenu() {
    // Create burger menu button and overlay
    const navContainer = document.querySelector('.nav-container');
    const navLinks = document.querySelector('.nav-links');
    
    if (!navContainer || !navLinks) return;
    
    // Create burger button - COMMENTED OUT (now hardcoded in HTML)
    /*
    const burgerButton = document.createElement('button');
    burgerButton.className = 'menu-toggle';
    burgerButton.setAttribute('aria-label', 'Toggle navigation menu');
    burgerButton.setAttribute('aria-expanded', 'false');
    burgerButton.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    
    // Add elements to DOM
    navContainer.appendChild(burgerButton);
    document.body.appendChild(overlay);
    */
    
    // Get existing burger button and overlay from HTML
    const burgerButton = document.querySelector('.menu-toggle');
    const overlay = document.querySelector('.menu-overlay');
    
    if (!burgerButton || !overlay) {
        console.warn('Burger menu elements not found in HTML');
        return;
    }
    
    // Toggle menu function
    burgerButton.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMobileMenu();
    });
    
    // Close menu when clicking overlay
    overlay.addEventListener('click', closeMobileMenu);
    
    // Close menu when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && navLinks.classList.contains('active')) {
            if (!navContainer.contains(e.target) && !navLinks.contains(e.target)) {
                closeMobileMenu();
            }
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
    
    // Close menu on window resize (if resizing to larger screen)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const menuToggle = document.querySelector('.menu-toggle');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    if (!navLinks || !menuToggle || !menuOverlay) return;
    
    const isActive = navLinks.classList.contains('active');
    
    if (isActive) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const menuToggle = document.querySelector('.menu-toggle');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    if (!navLinks || !menuToggle || !menuOverlay) return;
    
    navLinks.classList.add('active');
    menuToggle.classList.add('active');
    menuOverlay.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    
    // Disable body scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
}

function closeMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const menuToggle = document.querySelector('.menu-toggle');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    if (!navLinks || !menuToggle || !menuOverlay) return;
    
    navLinks.classList.remove('active');
    menuToggle.classList.remove('active');
    menuOverlay.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    
    // Re-enable body scroll
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
}

// ===== SMOOTH SCROLLING =====
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only handle internal anchor links
            if (href.startsWith('#') && href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    // Close mobile menu if open
                    closeMobileMenu();
                    
                    // Calculate offset for fixed header
                    const headerHeight = document.querySelector('nav')?.offsetHeight || 72;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = targetPosition - headerHeight;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without jumping
                    history.pushState(null, null, href);
                }
            }
        });
    });
}

// ===== FORM VALIDATION =====
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    // Clear previous error messages
    const existingErrors = form.querySelectorAll('.field-error');
    existingErrors.forEach(error => error.remove());
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        // Show general error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Please fill in all required fields marked with *.';
        errorDiv.style.marginBottom = '1.5rem';
        
        // Insert at the top of the form
        if (form.firstChild) {
            form.insertBefore(errorDiv, form.firstChild);
        } else {
            form.appendChild(errorDiv);
        }
        
        // Scroll to first error
        const firstError = form.querySelector('.field-error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    return isValid;
}

function validateField(field) {
    if (!field.hasAttribute('required')) return true;
    
    let isValid = true;
    let errorMessage = '';
    
    // Check if field is empty
    if (!field.value.trim()) {
        isValid = false;
        errorMessage = 'This field is required.';
    }
    // Email validation
    else if (field.type === 'email' && !isValidEmail(field.value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address.';
    }
    // Phone validation (basic)
    else if (field.type === 'tel' && !isValidPhone(field.value)) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number.';
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '0.8rem';
    errorDiv.style.marginTop = '0.3rem';
    errorDiv.style.fontWeight = '500';
    
    field.style.borderColor = '#dc3545';
    field.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
    
    field.style.borderColor = '';
    field.style.boxShadow = '';
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Basic phone validation - allows various formats
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// ===== URL PARAMETERS =====
function initializeURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Pre-fill investment registration
    const interest = urlParams.get('interest');
    if (interest) {
        const selectElement = document.getElementById('interest_area');
        if (selectElement) {
            const valueMap = {
                'agriculture': 'Agriculture',
                'renewable': 'Renewable Energy',
                'business': 'Small Business',
                'property': 'Property Development',
                'commercial_agriculture': 'Commercial Agriculture',
                'industrial': 'Industrial Development'
            };
            
            if (valueMap[interest]) {
                selectElement.value = valueMap[interest];
            }
        }
    }
    
    // Pre-fill workshop registration
    const workshop = urlParams.get('workshop');
    if (workshop) {
        const selectElement = document.getElementById('workshop_type');
        if (selectElement) {
            const valueMap = {
                'basic': 'Basic Financial Literacy - $15',
                'agriculture': 'Agricultural Investment Basics - $25',
                'advanced': 'Advanced Investment Strategies - $50'
            };
            
            if (valueMap[workshop]) {
                selectElement.value = valueMap[workshop];
            }
        }
    }
    
    // Pre-fill diaspora registration
    const type = urlParams.get('type');
    if (type === 'diaspora') {
        const levelSelect = document.getElementById('investment_level');
        if (levelSelect) {
            levelSelect.value = 'Diaspora ($1,000+)';
        }
    }
}

// ===== SCROLL EFFECTS =====
function initializeScrollEffects() {
    // Navbar background change on scroll
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('nav');
        if (!nav) return;
        
        if (window.scrollY > 100) {
            nav.style.background = 'rgba(0,0,0,0.95)';
            nav.style.backdropFilter = 'blur(10px)';
        } else {
            nav.style.background = '#000';
            nav.style.backdropFilter = 'none';
        }
        
        // Add shadow when scrolled
        if (window.scrollY > 10) {
            nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            nav.style.boxShadow = 'none';
        }
    });
    
    // Trigger initial check
    window.dispatchEvent(new Event('scroll'));
}

// ===== ANIMATIONS =====
function initializeAnimations() {
    // Animate numbers in stats sections
    const animateNumbers = () => {
        const statElements = document.querySelectorAll('.stat-value');
        
        statElements.forEach(stat => {
            if (isElementInViewport(stat)) {
                const finalValue = parseFloat(stat.textContent.replace(/[^0-9.]/g, ''));
                if (!stat.hasAttribute('data-animated') && !isNaN(finalValue)) {
                    animateValue(stat, 0, finalValue, 1500);
                    stat.setAttribute('data-animated', 'true');
                }
            }
        });
    };
    
    const isElementInViewport = (el) => {
        if (!el) return false;
        
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        
        return (
            rect.top <= windowHeight * 0.85 &&
            rect.bottom >= 0
        );
    };
    
    const animateValue = (element, start, end, duration) => {
        if (!element) return;
        
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const value = start + (end - start) * easeOutQuart;
            
            // Format number based on content
            if (element.textContent.includes('%')) {
                element.textContent = value.toFixed(1) + '%';
            } else {
                element.textContent = Math.floor(value).toLocaleString();
            }
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        
        window.requestAnimationFrame(step);
    };
    
    // Observe for animation triggers
    window.addEventListener('scroll', animateNumbers);
    
    // Initial check
    setTimeout(animateNumbers, 500);
    
    // Intersection Observer for more precise animations
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });
        
        // Observe cards and other elements
        document.querySelectorAll('.about-card, .service-card, .investment-card').forEach(card => {
            observer.observe(card);
        });
    }
}

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
    // Close mobile menu when clicking links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });
    
    // Handle form submission messages
    const successMessage = document.querySelector('.success-message');
    const errorMessage = document.querySelector('.error-message');
    
    if (successMessage) {
        setTimeout(() => {
            successMessage.style.opacity = '0';
            successMessage.style.transition = 'opacity 0.5s ease';
            setTimeout(() => successMessage.remove(), 500);
        }, 5000);
    }
    
    if (errorMessage) {
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            position: absolute;
            right: 10px;
            top: 10px;
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            color: inherit;
        `;
        closeBtn.addEventListener('click', () => errorMessage.remove());
        errorMessage.style.position = 'relative';
        errorMessage.appendChild(closeBtn);
    }
    
    // Add hover effects to cards
    document.querySelectorAll('.about-card, .service-card, .investment-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = this.classList.contains('service-card') 
                ? 'translateY(-8px)' 
                : 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Handle dropdown interactions
    document.querySelectorAll('select').forEach(select => {
        select.addEventListener('focus', function() {
            this.parentElement.style.zIndex = '10';
        });
        
        select.addEventListener('blur', function() {
            this.parentElement.style.zIndex = '1';
        });
    });
}

// ===== HELPER FUNCTIONS =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleMobileMenu,
        closeMobileMenu,
        validateForm,
        validateField
    };
}