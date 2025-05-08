// Get all input elements
const propertyValue = document.getElementById('propertyValue');
const cpfUsed = document.getElementById('cpfUsed');
const averageAge = document.getElementById('averageAge');
const yearsSincePurchase = document.getElementById('yearsSincePurchase');
const outstandingHomeLoan = document.getElementById('outstandingHomeLoan');
const outstandingTermLoan = document.getElementById('outstandingTermLoan');
const additionalTermLoan = document.getElementById('additionalTermLoan');
const homeLoanTenure = document.getElementById('homeLoanTenure');
const termLoanTenure = document.getElementById('termLoanTenure');
const interestRate = document.getElementById('interestRate');
const calculateButton = document.getElementById('calculateButton');

// Get result elements
const eligibleLoanValue = document.getElementById('eligibleLoanValue');
const eligibilityMessage = document.getElementById('eligibilityMessage');
const outstandingHomeLoanValue = document.getElementById('outstandingHomeLoanValue');
const outstandingTermLoanValue = document.getElementById('outstandingTermLoanValue');
const additionalLoanMessage = document.getElementById('additionalLoanMessage');
const homeLoanTenureDisplay = document.getElementById('homeLoanTenureDisplay');
const termLoanTenureDisplay = document.getElementById('termLoanTenureDisplay');
const maxHomeLoanTenure = document.getElementById('maxHomeLoanTenure');
const maxTermLoanTenure = document.getElementById('maxTermLoanTenure');
const homeLoanMonthlyValue = document.getElementById('homeLoanMonthlyValue');
const termLoanMonthlyValue = document.getElementById('termLoanMonthlyValue');
const loanDetails = document.getElementById('loanDetails');
const eligibleLoanResult = document.getElementById('eligibleLoanResult');
const initialMessage = document.getElementById('initialMessage');
const calculationResults = document.getElementById('calculationResults');
const errorMessage = document.getElementById('error');

// Add event listeners to input fields for validation only
const inputFields = [propertyValue, cpfUsed, averageAge, yearsSincePurchase, outstandingHomeLoan, outstandingTermLoan];
inputFields.forEach(input => {
    input.addEventListener('input', validateInput);
});

// Modified event listener for additionalTermLoan
additionalTermLoan.addEventListener('input', () => {
    validateAdditionalLoan();
    calculateMonthlyInstallments(); // Update monthly values when additional loan changes
});

// Add event listener for interest rate
interestRate.addEventListener('input', () => {
    validateInterestRate();
    calculateMonthlyInstallments(); // Update monthly values when interest rate changes
});

// Add event listener to calculate button
calculateButton.addEventListener('click', calculateAll);

// Add event listeners for years since purchase and age validation
yearsSincePurchase.addEventListener('input', validateAgePurchase);
averageAge.addEventListener('input', validateAgePurchase);

// Initialize sliders when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Hide original sliders if present
    if (homeLoanTenure) homeLoanTenure.style.display = 'none';
    if (termLoanTenure) termLoanTenure.style.display = 'none';
});

// Add real-time validation for years since purchase vs outstanding loan
yearsSincePurchase.addEventListener('input', function() {
    validateAgePurchase(); // Keep the existing validation
    validateYearsSincePurchase(); // Add the new validation
});

outstandingHomeLoan.addEventListener('input', function() {
    validateInput({ target: outstandingHomeLoan }); // Keep the existing validation
    validateYearsSincePurchase(); // Check if years constraint is violated when loan changes
});

// Fix the validateYearsSincePurchase function to be more robust
function validateYearsSincePurchase() {
    const years = parseFloat(yearsSincePurchase.value) || 0;
    const homeLoan = parseFloat(outstandingHomeLoan.value) || 0;
    const errorElement = document.getElementById('yearsSincePurchaseError');
    
    if (years >= 30 && homeLoan > 0) {
        errorElement.textContent = 'For properties owned 30+ years, outstanding home loan must be $0.';
        errorElement.style.display = 'block';
        return false;
    } else {
        // Only clear this specific error message if it exists
        // This prevents it from hiding age-purchase validation errors
        if (errorElement.textContent.includes('For properties owned 30+ years')) {
            errorElement.style.display = 'none';
        }
        return true;
    }
}

// Add these event listeners after your existing event listeners

// Add real-time validation for loan amounts against property value
propertyValue.addEventListener('input', function() {
    validateInput({ target: propertyValue }); // Keep the existing validation
    validateLoanAmounts(); // Check loan amounts against property value
});

outstandingHomeLoan.addEventListener('input', function() {
    validateInput({ target: outstandingHomeLoan }); // Keep the existing validation
    validateYearsSincePurchase(); // From previous fix
    validateLoanAmounts(); // Check loan amounts against property value
});

outstandingTermLoan.addEventListener('input', function() {
    validateInput({ target: outstandingTermLoan }); // Keep the existing validation
    validateLoanAmounts(); // Check loan amounts against property value
});

// The validateLoanAmounts function can remain as is, or you can enhance it:
function validateLoanAmounts() {
    const pv = parseFloat(propertyValue.value) || 0;
    const homeLoan = parseFloat(outstandingHomeLoan.value) || 0;
    const termLoan = parseFloat(outstandingTermLoan.value) || 0;
    const homeLoanErrorElement = document.getElementById('outstandingHomeLoanError');
    const termLoanErrorElement = document.getElementById('outstandingTermLoanError');
    let isValid = true;
    
    // Only validate if property value has been entered
    if (pv > 0) {
        // Rule 1: Outstanding home loan cannot be more than 75% of valuation
        if (homeLoan > pv * 0.75) {
            homeLoanErrorElement.textContent = 'Outstanding home loan cannot exceed 75% of property valuation.';
            homeLoanErrorElement.style.display = 'block';
            isValid = false;
        } else {
            // Only clear this specific error message
            if (homeLoanErrorElement.textContent.includes('75% of property valuation')) {
                homeLoanErrorElement.style.display = 'none';
            }
        }
        
        // Rule 2: Outstanding equity loan cannot be more than 75% of valuation
        if (termLoan > pv * 0.75) {
            termLoanErrorElement.textContent = 'Outstanding equity loan cannot exceed 75% of property valuation.';
            termLoanErrorElement.style.display = 'block';
            isValid = false;
        } else {
            // Only clear this specific error message
            if (termLoanErrorElement.textContent.includes('75% of property valuation')) {
                termLoanErrorElement.style.display = 'none';
            }
        }
    }
    
    return isValid;
}

// Validate average age vs years since purchase
function validateAgePurchase() {
    const age = parseFloat(averageAge.value) || 0;
    const years = parseFloat(yearsSincePurchase.value) || 0;
    const errorElement = document.getElementById('yearsSincePurchaseError');
    
    if (age - years < 21) {
        errorElement.textContent = 'Years since purchase exceeds limit. Age at purchase cannot be less than 21.';
        errorElement.style.display = 'block';
        return false;
    } else {
        errorElement.style.display = 'none';
        return true;
    }
}

// Validate input fields
function validateInput(e) {
    const input = e.target;
    const id = input.id;
    const value = parseFloat(input.value);
    const errorElement = document.getElementById(id + 'Error');
    
    if (input.value === '') {
        errorElement.style.display = 'none';
        return false;
    }
    
    // Update max age to 70 for average age
    if (id === 'averageAge') {
        input.max = 70;
    }
    
    if (isNaN(value) || value < parseFloat(input.min) || (input.max && value > parseFloat(input.max))) {
        errorElement.textContent = `Please enter a valid value between ${input.min} and ${input.max || 'any amount'}`;
        errorElement.style.display = 'block';
        return false;
    } else {
        errorElement.style.display = 'none';
        return true;
    }
}

// Validate interest rate
function validateInterestRate() {
    const rate = parseFloat(interestRate.value) || 0;
    const errorElement = document.getElementById('interestRateError');
    
    if (isNaN(rate) || rate < 0 || rate > 10) {
        errorElement.textContent = 'Please enter a valid interest rate between 0% and 10%';
        errorElement.style.display = 'block';
        interestRate.value = 2.5;
        return false;
    } else {
        errorElement.style.display = 'none';
        return true;
    }
}

// Validate years since purchase against outstanding loan
// function validateYearsSincePurchase() {
//     const years = parseFloat(yearsSincePurchase.value) || 0;
//     const homeLoan = parseFloat(outstandingHomeLoan.value) || 0;
//     const errorElement = document.getElementById('yearsSincePurchaseError');
    
//     if (years >= 30 && homeLoan > 0) {
//         errorElement.textContent = 'For properties owned 30+ years, outstanding home loan must be $0.';
//         errorElement.style.display = 'block';
//         return false;
//     } else {
//         // Only clear if there's no age-purchase validation error
//         if (validateAgePurchase()) {
//             errorElement.style.display = 'none';
//         }
//         return true;
//     }
// }

// Validate loan amounts against property value (Rule 1 & 2)
// function validateLoanAmounts() {
//     const pv = parseFloat(propertyValue.value) || 0;
//     const homeLoan = parseFloat(outstandingHomeLoan.value) || 0;
//     const termLoan = parseFloat(outstandingTermLoan.value) || 0;
//     const homeLoanErrorElement = document.getElementById('outstandingHomeLoanError');
//     const termLoanErrorElement = document.getElementById('outstandingTermLoanError');
//     let isValid = true;
    
//     // Rule 1: Outstanding home loan cannot be more than 75% of valuation
//     if (homeLoan > pv * 0.75) {
//         homeLoanErrorElement.textContent = 'Outstanding home loan cannot exceed 75% of property valuation.';
//         homeLoanErrorElement.style.display = 'block';
//         isValid = false;
//     } else {
//         homeLoanErrorElement.style.display = 'none';
//     }
    
//     // Rule 2: Outstanding equity loan cannot be more than 75% of valuation
//     if (termLoan > pv * 0.75) {
//         termLoanErrorElement.textContent = 'Outstanding equity loan cannot exceed 75% of property valuation.';
//         termLoanErrorElement.style.display = 'block';
//         isValid = false;
//     } else {
//         termLoanErrorElement.style.display = 'none';
//     }
    
//     return isValid;
// }

// Format currency
function formatCurrency(amount) {
    return 'SGD ' + Math.round(amount).toLocaleString('en-SG');
}

// Calculate PMT (monthly installment)
function calculatePMT(rate, nper, pv) {
    const monthlyRate = rate / 12;
    if (monthlyRate === 0) return pv / nper;
    return pv * monthlyRate * Math.pow(1 + monthlyRate, nper) / (Math.pow(1 + monthlyRate, nper) - 1);
}

// Calculate eligible additional term loan
function calculateEligibleLoan() {
    const pv = parseFloat(propertyValue.value) || 0;
    const cpf = parseFloat(cpfUsed.value) || 0;
    const homeLoan = parseFloat(outstandingHomeLoan.value) || 0;
    const termLoan = parseFloat(outstandingTermLoan.value) || 0;
    
    const eligibleAmount = (pv * 0.75) - homeLoan - termLoan - cpf;
    
    if (eligibleAmount <= 0) {
        eligibleLoanValue.textContent = formatCurrency(0);
        eligibleLoanValue.className = 'result-value negative';
        eligibilityMessage.textContent = 'Sorry, your property does not qualify for an additional Equity Loan.';
        eligibilityMessage.style.display = 'block';
        eligibleLoanResult.className = 'result-item negative';
        loanDetails.classList.add('hidden');
        additionalTermLoan.value = 0;
        additionalTermLoan.max = 0;
        additionalLoanMessage.textContent = '';
        additionalLoanMessage.style.display = 'none';
        return 0;
    } else {
        eligibleLoanValue.textContent = formatCurrency(eligibleAmount);
        eligibleLoanValue.className = 'result-value positive';
        eligibilityMessage.textContent = '';
        eligibilityMessage.style.display = 'none';
        eligibleLoanResult.className = 'result-item positive';
        loanDetails.classList.remove('hidden');
        
        additionalTermLoan.max = eligibleAmount;
        additionalTermLoan.value = eligibleAmount;
        additionalLoanMessage.textContent = '';
        additionalLoanMessage.style.display = 'none';
        
        return eligibleAmount;
    }
}

// Calculate max tenures
function calculateMaxTenures() {
    const age = parseFloat(averageAge.value) || 0;
    const years = parseFloat(yearsSincePurchase.value) || 0;
    
    const ageBased = 75 - age;
    const yearsBased = 35 - years - 1;
    let maxHomeTenure = Math.min(ageBased, yearsBased);
    let maxTermTenure = 75 - age;
    
    maxHomeTenure = Math.min(Math.max(Math.round(maxHomeTenure), 5), 35);
    maxTermTenure = Math.min(Math.max(Math.round(maxTermTenure), 5), 35);
    
    homeLoanTenure.max = maxHomeTenure;
    termLoanTenure.max = maxTermTenure;
    
    maxHomeLoanTenure.textContent = maxHomeTenure + ' years';
    maxTermLoanTenure.textContent = maxTermTenure + ' years';
    
    // Update slider ranges if they exist
    const homeLoanSlider = document.getElementById('homeLoanSlider');
    const termLoanSlider = document.getElementById('termLoanSlider');
    
    if (homeLoanSlider && homeLoanSlider.noUiSlider) {
        homeLoanSlider.noUiSlider.updateOptions({
            range: {
                'min': 5,
                'max': maxHomeTenure
            }
        }, true);
    }
    
    if (termLoanSlider && termLoanSlider.noUiSlider) {
        termLoanSlider.noUiSlider.updateOptions({
            range: {
                'min': 5,
                'max': maxTermTenure
            }
        }, true);
    }
    
    // Set default tenures
    updateHomeLoanTenure(maxHomeTenure);
    updateTermLoanTenure(maxTermTenure);
    
    return { homeTenure: maxHomeTenure, termTenure: maxTermTenure };
}

// Update home loan tenure
function updateHomeLoanTenure(value) {
    let tenure = parseInt(value);
    const maxTenure = parseInt(homeLoanTenure.max);
    const minTenure = parseInt(homeLoanTenure.min);
    
    if (isNaN(tenure) || tenure < minTenure) {
        tenure = minTenure;
    } else if (tenure > maxTenure) {
        tenure = maxTenure;
    }
    
    homeLoanTenure.value = tenure;
    homeLoanTenureDisplay.textContent = tenure + ' years';
    
    // Update slider if it exists
    const homeLoanSlider = document.getElementById('homeLoanSlider');
    if (homeLoanSlider && homeLoanSlider.noUiSlider) {
        homeLoanSlider.noUiSlider.set(tenure);
    }
}

// Update term loan tenure
function updateTermLoanTenure(value) {
    let tenure = parseInt(value);
    const maxTenure = parseInt(termLoanTenure.max);
    const minTenure = parseInt(termLoanTenure.min);
    
    if (isNaN(tenure) || tenure < minTenure) {
        tenure = minTenure;
    } else if (tenure > maxTenure) {
        tenure = maxTenure;
    }
    
    termLoanTenure.value = tenure;
    termLoanTenureDisplay.textContent = tenure + ' years';
    
    // Update slider if it exists
    const termLoanSlider = document.getElementById('termLoanSlider');
    if (termLoanSlider && termLoanSlider.noUiSlider) {
        termLoanSlider.noUiSlider.set(tenure);
    }
}

// Validate additional term loan amount
function validateAdditionalLoan() {
    const eligibleAmount = parseFloat(additionalTermLoan.max) || 0;
    const additionalAmount = parseFloat(additionalTermLoan.value) || 0;
    
    if (additionalAmount > eligibleAmount) {
        additionalLoanMessage.textContent = 'Amount cannot exceed eligible amount.';
        additionalLoanMessage.style.display = 'block';
        additionalTermLoan.value = eligibleAmount;
    } else if (additionalAmount < 0) {
        additionalLoanMessage.textContent = 'Amount cannot be negative.';
        additionalLoanMessage.style.display = 'block';
        additionalTermLoan.value = 0;
    } else {
        additionalLoanMessage.textContent = '';
        additionalLoanMessage.style.display = 'none';
    }
}

// Calculate monthly installments
function calculateMonthlyInstallments() {
    // Only calculate if results are visible
    if (calculationResults.classList.contains('hidden')) {
        return;
    }
    
    const homeLoan = parseFloat(outstandingHomeLoan.value) || 0;
    const additionalLoan = parseFloat(additionalTermLoan.value) || 0;
    const outstandingTerm = parseFloat(outstandingTermLoan.value) || 0;
    const totalTermLoan = additionalLoan + outstandingTerm;
    const homeTenureYears = parseInt(homeLoanTenure.value) || 14;
    const termTenureYears = parseInt(termLoanTenure.value) || 30;
    
    // Use the interest rate from the field instead of a fixed value
    const rate = parseFloat(interestRate.value) / 100 || 0.025; // default to 2.5% if invalid
    
    if (homeLoan > 0) {
        const homeMonthly = calculatePMT(rate, homeTenureYears * 12, homeLoan);
        homeLoanMonthlyValue.textContent = formatCurrency(homeMonthly);
    } else {
        homeLoanMonthlyValue.textContent = formatCurrency(0);
    }
    
    if (totalTermLoan > 0) {
        const termMonthly = calculatePMT(rate, termTenureYears * 12, totalTermLoan);
        termLoanMonthlyValue.textContent = formatCurrency(termMonthly);
    } else {
        termLoanMonthlyValue.textContent = formatCurrency(0);
    }
    
    // Update the payment method display to show current interest rate
    const rateDisplay = document.querySelectorAll('.rate-display');
    rateDisplay.forEach(element => {
        element.textContent = `(Using ${rate * 100}% p.a interest rate)`;
    });
}

// Initialize the noUiSlider sliders with improved UI
function initializeSliders() {
    // Get slider elements
    const homeLoanSlider = document.getElementById('homeLoanSlider');
    const termLoanSlider = document.getElementById('termLoanSlider');
    const homeLoanTenureDisplay = document.getElementById('homeLoanTenureDisplay');
    const termLoanTenureDisplay = document.getElementById('termLoanTenureDisplay');
    
    // Get hidden range inputs
    const homeLoanTenure = document.getElementById('homeLoanTenure');
    const termLoanTenure = document.getElementById('termLoanTenure');
    
    // Update max labels with correct values
    document.getElementById('maxHomeLoanTenure').textContent = homeLoanTenure.max + ' years';
    document.getElementById('maxTermLoanTenure').textContent = termLoanTenure.max + ' years';
    
    // Remove old sliders if they exist
    if (homeLoanSlider.noUiSlider) {
        homeLoanSlider.noUiSlider.destroy();
    }
    if (termLoanSlider.noUiSlider) {
        termLoanSlider.noUiSlider.destroy();
    }
    
    // Get initial values and ranges
    const homeLoanValue = parseInt(homeLoanTenure.value) || 14;
    const termLoanValue = parseInt(termLoanTenure.value) || 30;
    const maxHomeTenure = parseInt(homeLoanTenure.max) || 35;
    const maxTermTenure = parseInt(termLoanTenure.max) || 35;
    
    // Initialize Home Loan Slider with improved settings
    noUiSlider.create(homeLoanSlider, {
        start: homeLoanValue,
        connect: [true, false],
        step: 1,
        range: {
            'min': 5,
            'max': maxHomeTenure
        },
        format: {
            to: function (value) {
                return parseInt(value);
            },
            from: function (value) {
                return parseInt(value);
            }
        },
        tooltips: false // We'll use our custom bubble instead
    });

    // Initialize Term Loan Slider with improved settings
    noUiSlider.create(termLoanSlider, {
        start: termLoanValue,
        connect: [true, false],
        step: 1,
        range: {
            'min': 5,
            'max': maxTermTenure
        },
        format: {
            to: function (value) {
                return parseInt(value);
            },
            from: function (value) {
                return parseInt(value);
            }
        },
        tooltips: false // We'll use our custom bubble instead
    });

    // Create bubbles for handles
    const homeLoanHandle = homeLoanSlider.querySelector('.noUi-handle');
    const termLoanHandle = termLoanSlider.querySelector('.noUi-handle');
    
    const homeLoanBubble = document.createElement('div');
    homeLoanBubble.className = 'value-bubble';
    homeLoanHandle.appendChild(homeLoanBubble);
    
    const termLoanBubble = document.createElement('div');
    termLoanBubble.className = 'value-bubble';
    termLoanHandle.appendChild(termLoanBubble);

    // Add focus elements to make it clear where the slider is positioned
    const homeLoanFocus = document.createElement('div');
    homeLoanFocus.className = 'handle-focus';
    homeLoanHandle.appendChild(homeLoanFocus);
    
    const termLoanFocus = document.createElement('div');
    termLoanFocus.className = 'handle-focus';
    termLoanHandle.appendChild(termLoanFocus);

    // Update display values and bubbles
    homeLoanSlider.noUiSlider.on('update', function(values, handle) {
        const value = values[handle];
        homeLoanTenureDisplay.textContent = value + ' years';
        homeLoanBubble.textContent = value + ' yrs';
        
        // Update the original range input for compatibility
        homeLoanTenure.value = value;
        
        // Animate the display text on change
        homeLoanTenureDisplay.classList.add('value-updated');
        setTimeout(() => {
            homeLoanTenureDisplay.classList.remove('value-updated');
        }, 300);
        
        // Trigger calculation
        if (typeof calculateMonthlyInstallments === 'function') {
            calculateMonthlyInstallments();
        }
    });

    termLoanSlider.noUiSlider.on('update', function(values, handle) {
        const value = values[handle];
        termLoanTenureDisplay.textContent = value + ' years';
        termLoanBubble.textContent = value + ' yrs';
        
        // Update the original range input for compatibility
        termLoanTenure.value = value;
        
        // Animate the display text on change
        termLoanTenureDisplay.classList.add('value-updated');
        setTimeout(() => {
            termLoanTenureDisplay.classList.remove('value-updated');
        }, 300);
        
        // Trigger calculation
        if (typeof calculateMonthlyInstallments === 'function') {
            calculateMonthlyInstallments();
        }
    });

    // Enhanced interaction effects
    [homeLoanHandle, termLoanHandle].forEach(handle => {
        // Show bubble on active state
        handle.addEventListener('mousedown', function() {
            this.classList.add('noUi-active');
            const bubble = this.querySelector('.value-bubble');
            if (bubble) bubble.classList.add('bubble-active');
        });
        
        handle.addEventListener('touchstart', function() {
            this.classList.add('noUi-active');
            const bubble = this.querySelector('.value-bubble');
            if (bubble) bubble.classList.add('bubble-active');
        });
        
        // Hide bubble when mouse up anywhere on document
        document.addEventListener('mouseup', function() {
            handle.classList.remove('noUi-active');
            const bubble = handle.querySelector('.value-bubble');
            if (bubble) bubble.classList.remove('bubble-active');
        });
        
        document.addEventListener('touchend', function() {
            handle.classList.remove('noUi-active');
            const bubble = handle.querySelector('.value-bubble');
            if (bubble) bubble.classList.remove('bubble-active');
        });
        
        // Show bubble on hover
        handle.addEventListener('mouseover', function() {
            const bubble = this.querySelector('.value-bubble');
            if (bubble) bubble.classList.add('bubble-hover');
        });
        
        handle.addEventListener('mouseout', function() {
            const bubble = this.querySelector('.value-bubble');
            if (bubble && !this.classList.contains('noUi-active')) {
                bubble.classList.remove('bubble-hover');
            }
        });
    });
    
    // Add visual indication when slider is near the edge
    function checkSliderPosition(slider, handle) {
        const range = slider.noUiSlider.options.range;
        const value = slider.noUiSlider.get();
        const min = range.min;
        const max = range.max;
        
        // Remove all position classes
        handle.classList.remove('at-min', 'at-max', 'near-min', 'near-max');
        
        // Add appropriate classes based on position
        if (value <= min) handle.classList.add('at-min');
        else if (value >= max) handle.classList.add('at-max');
        else if (value <= min + (max - min) * 0.1) handle.classList.add('near-min');
        else if (value >= max - (max - min) * 0.1) handle.classList.add('near-max');
    }
    
    // Check initial positions
    checkSliderPosition(homeLoanSlider, homeLoanHandle);
    checkSliderPosition(termLoanSlider, termLoanHandle);
    
    // Update positions on slider change
    homeLoanSlider.noUiSlider.on('update', function() {
        checkSliderPosition(homeLoanSlider, homeLoanHandle);
    });
    
    termLoanSlider.noUiSlider.on('update', function() {
        checkSliderPosition(termLoanSlider, termLoanHandle);
    });
    
    // Make sure sliders are fully initialized and visible
    setTimeout(() => {
        homeLoanSlider.classList.add('slider-initialized');
        termLoanSlider.classList.add('slider-initialized');
    }, 100);
}

// Call the initialization function when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if noUiSlider is loaded
    if (typeof noUiSlider !== 'undefined') {
        initializeSliders();
    } else {
        console.error('noUiSlider is not loaded. Please include the library.');
    }
});

// Calculate all values
function calculateAll() {
    // Validate all inputs before calculating
    let isValid = true;
    inputFields.forEach(input => {
        const valid = validateInput({ target: input });
        if (!valid) isValid = false;
    });
    
    // Additional validations
    if (!validateAgePurchase()) isValid = false;
    if (!validateYearsSincePurchase()) isValid = false;
    if (!validateLoanAmounts()) isValid = false; // Added the new validation function
    
    if (!isValid) {
        errorMessage.textContent = 'Please correct all input errors before calculating.';
        errorMessage.style.display = 'block';
        return;
    }
    
    errorMessage.style.display = 'none';
    initialMessage.classList.add('hidden');
    calculationResults.classList.remove('hidden');
    
    outstandingHomeLoanValue.textContent = formatCurrency(parseFloat(outstandingHomeLoan.value) || 0);
    outstandingTermLoanValue.textContent = formatCurrency(parseFloat(outstandingTermLoan.value) || 0);
    
    calculateEligibleLoan();
    calculateMaxTenures();
    
    // Initialize sliders after calculating max tenures
    initializeSliders();
    
    calculateMonthlyInstallments();
}

// Iframe resizer for Term Loan Calculator
document.addEventListener('DOMContentLoaded', function() {
    // Function to send height to parent window with extra padding
    function sendHeight() {
        // Get the document height and add some extra padding (20px)
        const height = document.body.scrollHeight + 20;
        window.parent.postMessage({ type: 'setHeight', height: height }, '*');
    }

    // Send height on important events
    const events = ['load', 'resize', 'input', 'change'];
    events.forEach(event => {
        window.addEventListener(event, sendHeight);
    });

    // Watch for DOM changes
    const observer = new MutationObserver(function() {
        // Small delay to ensure all DOM changes are completed
        setTimeout(sendHeight, 50);
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
    });

    // Handle height requests from parent window
    window.addEventListener('message', function(event) {
        if (event.data.type === 'requestHeight') {
            sendHeight();
        }
    });

    // Initial height send with slight delay to ensure full rendering
    setTimeout(sendHeight, 300);

    // Also send after all images and assets are loaded
    window.addEventListener('load', function() {
        setTimeout(sendHeight, 500);
    });
});