class IpaModal {
    constructor() {
        this.modal = document.getElementById('ipaModal');
        this.closeBtn = document.querySelector('.ipa-close');
        this.termLoanIpaButton = document.getElementById('termLoanIpaButton');
        this.form = document.getElementById('ipaForm');
        this.submitBtn = this.form.querySelector('button[type="submit"]');
        this.originalButtonText = this.submitBtn ? this.submitBtn.innerHTML : 'Submit';
        this.isInIframe = window !== window.parent;
        
        this.modal.style.display = 'none';
        
        this.initializeEvents();
    }

    initializeEvents() {
        // Open modal event
        this.termLoanIpaButton.addEventListener('click', () => {
            this.openModal();
        });
        
        // Close modal events
        this.closeBtn.addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Handle mobile viewport adjustments
        if (this.isInIframe) {
            window.addEventListener('resize', () => this.handleResize());
        }
    }

    handleResize() {
        if (this.modal.style.display === 'block') {
            this.adjustModalPosition();
        }
    }

    adjustModalPosition() {
        const modalContent = this.modal.querySelector('.ipa-modal-content');
        
        if (window.innerWidth <= 768) {
            this.modal.style.top = '0';
            this.modal.style.height = '100%';
            this.modal.style.overflow = 'auto';
            
            if (modalContent) {
                modalContent.style.marginTop = '20px';
                modalContent.style.marginBottom = '20px';
                modalContent.style.maxHeight = 'none';
            }
        } else {
            this.modal.style.top = '';
            this.modal.style.height = '';
            this.modal.style.overflow = '';
            
            if (modalContent) {
                modalContent.style.marginTop = '';
                modalContent.style.marginBottom = '';
                modalContent.style.maxHeight = '';
            }
        }
    }

    openModal() {
        if (this.isInIframe) {
            window.parent.postMessage({
                type: 'showModal'
            }, '*');
            
            this.modal.style.display = 'block';
            this.adjustModalPosition();
        } else {
            this.modal.style.display = 'block';
        }
    }

    closeModal() {
        if (this.isInIframe) {
            window.parent.postMessage({
                type: 'closeModal'
            }, '*');
        }
        
        this.modal.style.display = 'none';
        const modalContent = this.modal.querySelector('.ipa-modal-content');
        if (modalContent) {
            modalContent.style.marginTop = '';
            modalContent.style.marginBottom = '';
            modalContent.style.maxHeight = '';
        }
        
        this.form.reset();
        this.clearErrors();
    }

    validateForm() {
        let isValid = true;
        const name = document.getElementById('name');
        const email = document.getElementById('emailAddress');
        const mobile = document.getElementById('mobileNumber');

        if (!name.value.trim()) {
            this.showError(name, 'nameError', 'Name is required');
            isValid = false;
        }

        if (!email.value.trim()) {
            this.showError(email, 'emailError', 'Email is required');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email.value)) {
            this.showError(email, 'emailError', 'Please enter a valid email address');
            isValid = false;
        }

        if (!mobile.value.trim()) {
            this.showError(mobile, 'mobileError', 'Mobile number is required');
            isValid = false;
        } else if (!/^[89]\d{7}$/.test(mobile.value)) {
            this.showError(mobile, 'mobileError', 'Please enter a valid Singapore mobile number');
            isValid = false;
        }

        return isValid;
    }

    showError(input, errorId, message) {
        const errorElement = document.getElementById(errorId);
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    clearErrors() {
        document.querySelectorAll('.ipa-error').forEach(error => {
            error.style.display = 'none';
        });
        document.querySelectorAll('.ipa-input-group input').forEach(input => {
            input.classList.remove('error');
        });
    }

    getLoanDetails() {
        return {
            averageAge: document.getElementById('averageAge').value,
            propertyValue: document.getElementById('propertyValue').value,
            cpfUsed: document.getElementById('cpfUsed').value,
            yearsSincePurchase: document.getElementById('yearsSincePurchase').value,
            outstandingHomeLoan: document.getElementById('outstandingHomeLoan').value,
            outstandingTermLoan: document.getElementById('outstandingTermLoan').value,
            additionalTermLoan: document.getElementById('additionalTermLoan').value,
            homeLoanTenure: document.getElementById('homeLoanTenure').value,
            termLoanTenure: document.getElementById('termLoanTenure').value,
            interestRate: document.getElementById('interestRate').value,
            eligibleLoanAmount: document.getElementById('eligibleLoanValue').textContent,
            homeLoanMonthlyInstalment: document.getElementById('homeLoanMonthlyValue').textContent,
            termLoanMonthlyInstalment: document.getElementById('termLoanMonthlyValue').textContent
        };
    }

    showNotification(type = 'success', title = 'Success!', message = 'Thank you! Your report is being processed and will arrive in your email shortly.') {
        if (this.isInIframe) {
            window.parent.postMessage({
                type: 'showNotification',
                notification: {
                    type: type,
                    title: title,
                    message: message,
                    icon: type === 'success' ? 
                        `<svg viewBox="0 0 24 24" width="24" height="24">
                            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/>
                        </svg>` :
                        `<svg viewBox="0 0 24 24" width="24" height="24">
                            <path fill="#EF4444" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>`
                }
            }, '*');
        }
    }

    showLoading() {
        if (this.submitBtn) {
            this.submitBtn.disabled = true;
            this.submitBtn.innerHTML = 'Almost there! Preparing your report...';
        }
    }

    hideLoading() {
        if (this.submitBtn) {
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = this.originalButtonText;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        if (this.validateForm()) {
            this.showLoading();

            try {
                const formData = new FormData(this.form);
                const loanDetails = this.getLoanDetails();
                const userName = formData.get('name');
                const userEmail = formData.get('emailAddress');
                
                // Create temporary container
                const captureContainer = document.createElement('div');
                captureContainer.className = 'pdf-capture-container';
                
                captureContainer.innerHTML = `
                    <div class="pdf-header">
                        <div class="company-info">
                            <h1>The Loan Connection</h1>
                            <h2>Getting The Right Mortgage</h2>
                        </div>
                        <div class="user-info">
                            <p><strong>Prepared for:</strong> ${userName || 'Valued Customer'}</p>
                            <p><strong>Email:</strong> ${userEmail || 'N/A'}</p>
                            <p><strong>Generated on:</strong> ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        </div>
                    </div>
                `;
                
                // Clone results section
                const resultsSection = document.querySelector('.results-section');
                const resultsClone = resultsSection.cloneNode(true);

                // Remove hidden elements but keep sliders
                resultsClone.querySelectorAll('.hidden').forEach(el => {
                    if (!el.classList.contains('slider')) {
                        el.remove();
                    }
                });

                // Make all elements visible
                resultsClone.querySelectorAll('*').forEach(el => {
                    if (window.getComputedStyle(el).display === 'none' && !el.classList.contains('slider')) {
                        el.style.display = 'block';
                    }
                });

                // Update additional term loan value in the clone
                const additionalTermLoanClone = resultsClone.querySelector('#additionalTermLoan');
                const originalAdditionalTermLoan = document.getElementById('additionalTermLoan');
                if (additionalTermLoanClone && originalAdditionalTermLoan) {
                    // Get the formatted value from the original input
                    const formattedValue = originalAdditionalTermLoan.value;
                    // Set both value and placeholder to ensure visibility
                    additionalTermLoanClone.value = formattedValue;
                    additionalTermLoanClone.placeholder = formattedValue;
                    // Force the input to display the value
                    additionalTermLoanClone.style.display = 'block';
                    additionalTermLoanClone.style.visibility = 'visible';
                    additionalTermLoanClone.style.opacity = '1';
                }
                
                captureContainer.appendChild(resultsClone);
                
                captureContainer.innerHTML += `
                    <div class="pdf-footer">
                        <hr>
                        <p>This report was generated on ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        <p>For any questions, please contact our mortgage specialists at <a href="mailto:hello@theloanconnection.com.sg">hello@theloanconnection.com.sg</a></p>
                    </div>
                `;
                
                // Add to document for capture
                document.body.appendChild(captureContainer);
                
                // Use original dimensions
                const width = Math.max(resultsClone.scrollWidth, 800);
                const height = Math.max(resultsClone.scrollHeight + 200, 1800);
                
                captureContainer.style.width = `${width}px`;
                
                // Capture content
                const canvas = await html2canvas(captureContainer, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    width: width,
                    height: height,
                    windowWidth: width,
                    windowHeight: height
                });
                
                // Remove temporary container
                document.body.removeChild(captureContainer);
                
                // Create PDF
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: width > height ? 'landscape' : 'portrait',
                    unit: 'px',
                    format: [width, height]
                });
                
                // Add captured content to PDF
                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                pdf.addImage(imgData, 'JPEG', 0, 0, width, height, '', 'FAST');
                
                // Get base64 for submission
                const pdfBase64 = pdf.output('datauristring').split(',')[1];
                
                // Prepare submission data
                const submissionData = {
                    timestamp: new Date().toISOString(),
                    name: formData.get('name'),
                    email: formData.get('emailAddress'),
                    mobile: formData.get('mobileNumber'),
                    pdfData: pdfBase64,
                    ...loanDetails
                };

                // Submit to Google Apps Script
                const scriptURL = 'https://script.google.com/macros/s/AKfycbz406ljW85NuJHps0EjGEz0xuvz3BLJVV1XNh40S5fAJeLfWaEFkFLj4MFuFn6iVi-Idg/exec';
                const form = new FormData();
                
                Object.keys(submissionData).forEach(key => {
                    form.append(key, submissionData[key]);
                });

                const response = await fetch(scriptURL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: form
                });

                this.hideLoading();
                this.closeModal();
                
                this.showNotification(
                    'success', 
                    'Success!', 
                    'Thank you! Your report is being processed and will arrive in your email shortly.'
                );
                
            } catch (error) {
                console.error('Error submitting form:', error);
                this.hideLoading();
                
                this.showNotification(
                    'error',
                    'Error',
                    'Sorry, there was an error submitting your form. Please try again.'
                );
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new IpaModal();
});