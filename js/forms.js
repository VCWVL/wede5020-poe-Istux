// Comprehensive form validation and handling
// Local request helper to avoid dependency on global makeRequest
function safeRequest(url, method = 'GET', data = null) {
    if (typeof window !== 'undefined' && typeof window.makeRequest === 'function') {
        return window.makeRequest(url, method, data);
    }
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
        xhr.onerror = function() { reject(new Error('Network error occurred')); };
        xhr.send(data);
    });
}

class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.fields = {};
        this.isSubmitting = false;
        
        if (this.form) {
            this.init();
        }
    }
    
    init() {
        this.setupFieldValidation();
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.setupRealTimeValidation();
    }
    
    setupFieldValidation() {
        const requiredFields = this.form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            this.fields[field.name] = {
                element: field,
                valid: false,
                errors: []
            };
            
            // Add event listeners for real-time validation
            field.addEventListener('blur', () => this.validateField(field.name));
            field.addEventListener('input', () => this.clearFieldError(field.name));
        });
    }
    
    setupRealTimeValidation() {
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName].element;
            
            field.addEventListener('input', () => {
                if (field.value.trim() !== '') {
                    this.validateField(fieldName);
                }
            });
        });
    }
    
    validateField(fieldName) {
        const field = this.fields[fieldName];
        const value = field.element.value.trim();
        field.errors = [];
        
        // Required field validation
        if (field.element.hasAttribute('required') && !value) {
            field.errors.push('This field is required');
        }
        
        // Email validation
        if (field.element.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                field.errors.push('Email not valid');
            }
        }
        
        // Phone validation
        if (field.element.type === 'tel' && value) {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(value)) {
                field.errors.push('Please enter a valid 10-digit phone number');
            }
        }
        
        // Min length validation
        if (field.element.hasAttribute('minlength') && value) {
            const minLength = parseInt(field.element.getAttribute('minlength'));
            if (value.length < minLength) {
                field.errors.push(`Must be at least ${minLength} characters long`);
            }
        }
        
        // Max length validation
        if (field.element.hasAttribute('maxlength') && value) {
            const maxLength = parseInt(field.element.getAttribute('maxlength'));
            if (value.length > maxLength) {
                field.errors.push(`Must be no more than ${maxLength} characters long`);
            }
        }
        
        field.valid = field.errors.length === 0;
        this.displayFieldErrors(fieldName);
        
        return field.valid;
    }
    
    displayFieldErrors(fieldName) {
        const field = this.fields[fieldName];
        const errorElement = document.getElementById(`${fieldName}Error`);
        
        if (errorElement) {
            if (field.errors.length > 0) {
                errorElement.textContent = field.errors[0];
                errorElement.style.display = 'block';
                errorElement.style.color = '#ff6b6b';
                errorElement.style.fontSize = '0.9rem';
                errorElement.style.marginTop = '5px';
                field.element.style.borderColor = '#ff6b6b';
            } else {
                errorElement.style.display = 'none';
                field.element.style.borderColor = '#d9fdd3';
            }
        }
    }
    
    clearFieldError(fieldName) {
        const field = this.fields[fieldName];
        const errorElement = document.getElementById(`${fieldName}Error`);
        
        if (errorElement) {
            errorElement.style.display = 'none';
            field.element.style.borderColor = '#d9fdd3';
        }
    }
    
    validateAll() {
        let isValid = true;
        
        Object.keys(this.fields).forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        if (this.validateAll()) {
            this.isSubmitting = true;
            await this.submitForm();
            this.isSubmitting = false;
        } else {
            this.showMessage('Please fix the errors above', 'error');
        }
    }
    
    async submitForm() {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
            
            // AJAX submit to the form action using helper makeRequest
            const actionUrl = this.form.getAttribute('action') || '#';
            const method = (this.form.getAttribute('method') || 'post').toUpperCase();
            const data = new URLSearchParams(new FormData(this.form)).toString();
            await safeRequest(actionUrl, method, data);
            
            this.showMessage('Thank you! Your enquiry has been submitted successfully.', 'success');
            this.handlePostSubmit();
            
            // Reset field states
            Object.keys(this.fields).forEach(fieldName => {
                this.clearFieldError(fieldName);
                this.fields[fieldName].valid = false;
            });
            
        } catch (error) {
            // Fallback to email client to ensure contact always works
            this.mailtoFallback();
            this.showMessage('We opened your email app with your message prefilled. If it did not open, please email info@thegreenbasket.co.za.', 'success');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    async simulateSubmission() {
        return new Promise((resolve) => {
            setTimeout(resolve, 2000); // Simulate network delay
        });
    }
    
    showMessage(message, type) {
        const messageDiv = document.getElementById('formMessage');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `form-message ${type}`;
            messageDiv.style.display = 'block';
            messageDiv.style.padding = '10px';
            messageDiv.style.margin = '10px 0';
            messageDiv.style.borderRadius = '4px';
            messageDiv.style.textAlign = 'center';
            
            if (type === 'success') {
                messageDiv.style.background = 'rgba(46, 139, 87, 0.2)';
                messageDiv.style.color = '#d9fdd3';
                messageDiv.style.border = '1px solid #4e944f';
            } else {
                messageDiv.style.background = 'rgba(255, 107, 107, 0.2)';
                messageDiv.style.color = '#ff6b6b';
                messageDiv.style.border = '1px solid #ff6b6b';
            }
            
            // Auto-hide success messages
            if (type === 'success') {
                setTimeout(() => {
                    messageDiv.style.display = 'none';
                }, 5000);
            }
        }
    }
}

// Initialize forms when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize enquiry form
    if (document.getElementById('enquiryForm')) {
        new FormValidator('enquiryForm');
    }
    
    // Initialize contact form
    if (document.getElementById('contactForm')) {
        new FormValidator('contactForm');
    }
    
    // Initialize newsletter form
    if (document.getElementById('newsletterForm')) {
        new FormValidator('newsletterForm');
    }
});

// Post-submit handlers and enquiry summary rendering
FormValidator.prototype.handlePostSubmit = function() {
    if (this.form.id === 'enquiryForm') {
        const name = this.form.querySelector('#name')?.value || '';
        const email = this.form.querySelector('#email')?.value || '';
        const phone = this.form.querySelector('#phone')?.value || '';
        const enquiryType = this.form.querySelector('#enquiryType')?.value || '';
        const product = this.form.querySelector('#product')?.value || 'N/A';
        const quantity = this.form.querySelector('#quantity')?.value || 'N/A';
        const unit = this.form.querySelector('#quantityUnit')?.value || '';
        const message = this.form.querySelector('#message')?.value || '';

        // Simple response hint for cost/availability (demo logic)
        const availability = enquiryType === 'product' || enquiryType === 'wholesale' ? 'Most items in stock' : 'N/A';

        const summary = document.getElementById('enquirySummary');
        const content = document.getElementById('summaryContent');
        if (summary && content) {
            content.innerHTML = `
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Enquiry type:</strong> ${enquiryType}</p>
                <p><strong>Product:</strong> ${product}</p>
                <p><strong>Quantity:</strong> ${quantity} ${unit}</p>
                <p><strong>Your message:</strong> ${message}</p>
                <p><strong>Response:</strong> ${availability}. We’ll email you pricing/availability shortly.</p>
            `;
            summary.style.display = 'block';
            this.form.style.display = 'none';
        }

        // Try automatic email via EmailJS to store and acknowledgement to user; fallback to mailto
        const textBody = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nType: ${enquiryType}\nProduct: ${product}\nQuantity: ${quantity} ${unit}\n\nMessage:\n${message}`;
        const cfg = window.NEWSLETTER_EMAILJS || {};
        const hasRealCfg = cfg.publicKey && !cfg.publicKey.startsWith('YOUR_') && cfg.serviceId && cfg.templateId;
        const subjectStore = 'New Enquiry Received';
        const subjectUser = 'We received your enquiry';

        const sendEmail = (to, subject, body) => {
            if (window.emailjs && hasRealCfg) {
                if (!window.__emailjs_inited__) { window.emailjs.init(cfg.publicKey); window.__emailjs_inited__ = true; }
                return window.emailjs.send(cfg.serviceId, cfg.templateId, {
                    to_email: to,
                    subject: subject,
                    specials: body, // reuse template variable
                    from_name: cfg.fromName || 'The Green Basket',
                    bcc: cfg.bcc || ''
                });
            }
            return Promise.reject(new Error('EmailJS not configured'));
        };

        sendEmail('patelistiyak6@gmail.com', subjectStore, textBody)
            .then(() => email && sendEmail(email, subjectUser, 'Thanks for your enquiry. We will contact you shortly.\n\n' + textBody))
            .catch(() => {
                const subject = encodeURIComponent(`Green Basket enquiry: ${enquiryType}`);
                const body = encodeURIComponent(textBody);
                window.location.href = `mailto:patelistiyak6@gmail.com?subject=${subject}&body=${body}`;
            });
    } else if (this.form.id === 'contactForm') {
        const name = this.form.querySelector('#name')?.value || '';
        const email = this.form.querySelector('#email')?.value || '';
        const phone = this.form.querySelector('#phone')?.value || '';
        const subjectSel = this.form.querySelector('#subject')?.value || 'general';
        const message = this.form.querySelector('#message')?.value || '';

        const cfg = window.NEWSLETTER_EMAILJS || {};
        const hasRealCfg = cfg.publicKey && !cfg.publicKey.startsWith('YOUR_') && cfg.serviceId && cfg.templateId;
        const bodyText = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nSubject: ${subjectSel}\n\nMessage:\n${message}`;

        const sendEmail = (to, subject, body) => {
            if (window.emailjs && hasRealCfg) {
                if (!window.__emailjs_inited__) { window.emailjs.init(cfg.publicKey); window.__emailjs_inited__ = true; }
                return window.emailjs.send(cfg.serviceId, cfg.templateId, {
                    to_email: to,
                    subject: subject,
                    specials: body,
                    from_name: cfg.fromName || 'The Green Basket',
                    bcc: cfg.bcc || ''
                });
            }
            return Promise.reject(new Error('EmailJS not configured'));
        };

        // Send acknowledgement to user and copy to store
        sendEmail(email, 'Thanks for contacting The Green Basket', 'We received your message and will reply soon.\n\n' + bodyText)
            .then(() => sendEmail('patelistiyak6@gmail.com', `Contact: ${subjectSel}`, bodyText))
            .catch(() => {
                const subject = encodeURIComponent(`Contact: ${subjectSel}`);
                const body = encodeURIComponent(bodyText);
                window.location.href = `mailto:patelistiyak6@gmail.com?subject=${subject}&body=${body}`;
            });
        this.form.reset();
    } else {
        // Newsletter form: send weekly specials to the entered email
        if (this.form.id === 'newsletterForm') {
            const email = this.form.querySelector('#newsletter-email')?.value || '';
            const specials = [];
            const rows = document.querySelectorAll('.specials table tr');
            rows.forEach((row, idx) => {
                if (idx === 0) return; // skip header
                const cells = row.querySelectorAll('td');
                if (cells.length >= 2) {
                    specials.push(`${cells[0].textContent?.trim()} - ${cells[1].textContent?.trim()}`);
                }
            });

            const subject = encodeURIComponent('The Green Basket – Weekly Specials');
            const lines = specials.length ? specials.join('\n') : 'Fresh Broccoli – R20 per bunch\nVine Tomatoes – R15 per pack';
            const body = encodeURIComponent(`Hello,\n\nHere are this week's specials:\n\n${lines}\n\nVisit us for more: products.html`);

            // If EmailJS config is present and initialized with real values, send automatically
            const cfg = window.NEWSLETTER_EMAILJS || {};
            const hasRealCfg = cfg.publicKey && !cfg.publicKey.startsWith('YOUR_') && cfg.serviceId && cfg.templateId;
            if (window.emailjs && hasRealCfg) {
                try {
                    if (!window.__emailjs_inited__) {
                        window.emailjs.init(cfg.publicKey);
                        window.__emailjs_inited__ = true;
                    }
                    const params = {
                        to_email: email,
                        subject: 'The Green Basket – Weekly Specials',
                        specials: lines,
                        from_name: cfg.fromName || 'The Green Basket',
                        bcc: cfg.bcc || ''
                    };
                    window.emailjs.send(cfg.serviceId, cfg.templateId, params)
                        .then(() => this.showMessage('Weekly specials sent to your inbox!', 'success'))
                        .catch(() => {
                            // Fallback to mailto on failure
                            if (email) {
                                window.location.href = `mailto:${email}?subject=${subject}&body=${body}&bcc=${encodeURIComponent(cfg.bcc || '')}`;
                            }
                        });
                } catch (e) {
                    if (email) {
                        window.location.href = `mailto:${email}?subject=${subject}&body=${body}&bcc=${encodeURIComponent(cfg.bcc || '')}`;
                    }
                }
            } else if (email) {
                // If EmailJS not configured, fallback to mailto
                window.location.href = `mailto:${email}?subject=${subject}&body=${body}&bcc=${encodeURIComponent(cfg.bcc || '')}`;
            }
            this.form.reset();
        } else {
            this.form.reset();
        }
    }
};

// Build and trigger mailto as a universal fallback
FormValidator.prototype.mailtoFallback = function() {
    if (this.form.id === 'enquiryForm') {
        const name = this.form.querySelector('#name')?.value || '';
        const email = this.form.querySelector('#email')?.value || '';
        const phone = this.form.querySelector('#phone')?.value || '';
        const enquiryType = this.form.querySelector('#enquiryType')?.value || '';
        const product = this.form.querySelector('#product')?.value || 'N/A';
        const quantity = this.form.querySelector('#quantity')?.value || 'N/A';
        const unit = this.form.querySelector('#quantityUnit')?.value || '';
        const message = this.form.querySelector('#message')?.value || '';
        const subject = encodeURIComponent(`Green Basket enquiry (fallback): ${enquiryType}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nType: ${enquiryType}\nProduct: ${product}\nQuantity: ${quantity} ${unit}\n\nMessage:\n${message}`);
        window.location.href = `mailto:patelistiyak6@gmail.com?subject=${subject}&body=${body}`;
    } else if (this.form.id === 'contactForm') {
        const name = this.form.querySelector('#name')?.value || '';
        const email = this.form.querySelector('#email')?.value || '';
        const phone = this.form.querySelector('#phone')?.value || '';
        const subjectSel = this.form.querySelector('#subject')?.value || 'general';
        const message = this.form.querySelector('#message')?.value || '';
        const subject = encodeURIComponent(`Contact (fallback): ${subjectSel}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nSubject: ${subjectSel}\n\nMessage:\n${message}`);
        window.location.href = `mailto:patelistiyak6@gmail.com?subject=${subject}&body=${body}`;
    }
};