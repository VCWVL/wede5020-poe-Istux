// Enhanced enquiry form functionality
document.addEventListener('DOMContentLoaded', function() {
    const enquiryType = document.getElementById('enquiryType');
    const productSelection = document.getElementById('productSelection');
    const quantityGroup = document.getElementById('quantityGroup');
    const newEnquiryBtn = document.getElementById('newEnquiry');
    const form = document.getElementById('enquiryForm');
    const summary = document.getElementById('enquirySummary');
    
    if (enquiryType) {
        enquiryType.addEventListener('change', function() {
            const selectedValue = this.value;
            
            // Show/hide product selection based on enquiry type
            if (selectedValue === 'product' || selectedValue === 'wholesale') {
                productSelection.style.display = 'block';
                quantityGroup.style.display = 'block';
            } else {
                productSelection.style.display = 'none';
                quantityGroup.style.display = 'none';
            }
            
            // Update form labels and placeholders based on enquiry type
            updateFormForEnquiryType(selectedValue);
        });
    }
    
    // Dynamic form updates based on enquiry type
    function updateFormForEnquiryType(type) {
        const messageTextarea = document.getElementById('message');
        const submitBtn = document.getElementById('submitBtn');
        
        if (!messageTextarea) return;
        
        const placeholders = {
            product: 'Please specify which products you\'re interested in, quantities needed, and any specific requirements...',
            volunteer: 'Please tell us about your background, availability, and why you\'d like to volunteer with us...',
            sponsorship: 'Please describe your organization, proposed partnership, and how we can work together...',
            wholesale: 'Please provide details about your business, required quantities, and delivery preferences...',
            other: 'Please provide details about your enquiry...'
        };
        
        const buttonTexts = {
            product: 'Get Product Information',
            volunteer: 'Apply to Volunteer',
            sponsorship: 'Submit Partnership Request',
            wholesale: 'Request Wholesale Quote',
            other: 'Submit Enquiry'
        };
        
        messageTextarea.placeholder = placeholders[type] || placeholders.other;
        
        if (submitBtn) {
            submitBtn.textContent = buttonTexts[type] || buttonTexts.other;
        }
    }
    
    // Initialize form based on current selection
    if (enquiryType && enquiryType.value) {
        updateFormForEnquiryType(enquiryType.value);
    }

    // Reset to new enquiry after summary
    if (newEnquiryBtn && form && summary) {
        newEnquiryBtn.addEventListener('click', function() {
            form.reset();
            summary.style.display = 'none';
            form.style.display = 'block';
            if (enquiryType) updateFormForEnquiryType(enquiryType.value || 'other');
        });
    }
});