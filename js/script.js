// Main JavaScript functionality for The Green Basket
document.addEventListener('DOMContentLoaded', function() {
    console.log('The Green Basket - Initializing enhanced functionality');
    initAllFeatures();
});

function initAllFeatures() {
    initMobileNavigation();
    initSmoothAnimations();
    initBackToTop();
    initDynamicContent();
    initLazyLoading();
    initAccordion();
}

// Mobile Navigation
function initMobileNavigation() {
    const nav = document.querySelector('nav');
    if (window.innerWidth <= 768 && nav) {
        const menuToggle = document.createElement('button');
        menuToggle.className = 'menu-toggle';
        menuToggle.innerHTML = '☰ Menu';
        menuToggle.style.cssText = `
            background: #2d572c;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
            margin: 10px 0;
            width: 100%;
        `;
        
        nav.parentNode.insertBefore(menuToggle, nav);
        nav.style.display = 'none';
        
        menuToggle.addEventListener('click', function() {
            const isVisible = nav.style.display === 'flex';
            nav.style.display = isVisible ? 'none' : 'flex';
            menuToggle.innerHTML = isVisible ? '☰ Menu' : '✕ Close';
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
                nav.style.display = 'none';
                menuToggle.innerHTML = '☰ Menu';
            }
        });
    }
}

// Smooth Animations
function initSmoothAnimations() {
    // Add fade-in class to sections for animation
    const sections = document.querySelectorAll('main section');
    sections.forEach((section, index) => {
        section.classList.add('fade-in');
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    // Animate on scroll
    const animateOnScroll = function() {
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (sectionTop < windowHeight - 100) {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Initial check
}

// Back to Top Button
function initBackToTop() {
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '↑';
    backToTop.className = 'back-to-top';
    backToTop.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #2d572c;
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 1.5rem;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;

    document.body.appendChild(backToTop);

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.style.opacity = '1';
        } else {
            backToTop.style.opacity = '0';
        }
    });

    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Dynamic Content Loading
function initDynamicContent() {
    // Load featured products on homepage
    if (document.querySelector('.featured-products')) {
        loadFeaturedProducts();
    }
}

function loadFeaturedProducts() {
    const featuredSection = document.querySelector('.featured-products');
    const list = document.querySelector('.featured-products .featured-list');
    if (!featuredSection || !list) return;

    list.setAttribute('aria-live', 'polite');
    list.classList.add('loading');
    list.innerHTML = '<p>Loading featured items…</p>';

    // Fetch featured items from local JSON
    makeRequest('data/featured.json', 'GET')
        .then((response) => {
            const items = JSON.parse(response);
            if (!Array.isArray(items)) throw new Error('Invalid data');

            list.classList.remove('loading');
            list.innerHTML = items.map(item => `
                <div class="featured-item fade-in product-card" role="article">
                    <h4>${item.title}</h4>
                    ${item.image ? `<img src="${item.image}" alt="${item.title}" loading="lazy">` : ''}
                    <p>${item.description}</p>
                    ${item.price ? `<p><strong>${item.price}</strong></p>` : ''}
                </div>
            `).join('');
        })
        .catch(() => {
            list.classList.remove('loading');
            list.innerHTML = `
                <div class="featured-item">
                    <p>We couldn't load featured items right now. Please try again later.</p>
                </div>`;
        });
}

// Lazy-load images that are not marked as eager
function initLazyLoading() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
    });
}

// Simple accordion logic for .accordion sections
function initAccordion() {
    const questions = document.querySelectorAll('.accordion .question');
    questions.forEach(btn => {
        btn.addEventListener('click', () => {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!expanded));
            const answer = btn.nextElementSibling;
            if (answer) {
                if (answer.hasAttribute('hidden')) {
                    answer.removeAttribute('hidden');
                } else {
                    answer.setAttribute('hidden', '');
                }
            }
        });
    });
}

// Utility function for AJAX requests
function makeRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.responseText);
            } else {
                reject(new Error(`Request failed with status ${xhr.status}`));
            }
        };
        
        xhr.onerror = function() {
            reject(new Error('Network error occurred'));
        };
        
        xhr.send(data);
    });
}