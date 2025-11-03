// Comprehensive form validation and handling
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
                field.errors.push('Please enter a valid email address');
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
            
            // Simulate form submission
            await this.simulateSubmission();
            
            this.showMessage('Thank you! Your enquiry has been submitted successfully.', 'success');
            this.form.reset();
            
            // Reset field states
            Object.keys(this.fields).forEach(fieldName => {
                this.clearFieldError(fieldName);
                this.fields[fieldName].valid = false;
            });
            
        } catch (error) {
            this.showMessage('Sorry, there was an error submitting your form. Please try again.', 'error');
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