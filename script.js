// Format number with commas for input fields
function formatNumberWithCommas(value) {
    value = value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    let integerPart = parts[0];
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return integerPart;
}

// Parse number by removing commas
function parseNumber(value) {
    if (!value) return NaN;
    return parseFloat(value.replace(/,/g, ''));
}

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

// Add event listeners for comma formatting
[propertyValue, cpfUsed, outstandingHomeLoan, outstandingTermLoan, additionalTermLoan].forEach(input => {
    input.addEventListener('input', function(e) {
        const cursorPosition = e.target.selectionStart;
        const valueBefore = e.target.value;
        const formattedValue = formatNumberWithCommas(e.target.value);
        e.target.value = formattedValue;
        
        const commasBeforeCursor = (valueBefore.slice(0, cursorPosition).match(/,/g) || []).length;
        const newCommasBeforeCursor = (formattedValue.slice(0, cursorPosition).match(/,/g) || []).length;
        const cursorAdjustment = newCommasBeforeCursor - commasBeforeCursor;
        e.target.setSelectionRange(cursorPosition + cursorAdjustment, cursorPosition + cursorAdjustment);
        
        validateInput(e);
        if (e.target === additionalTermLoan) {
            validateAdditionalLoan();
            calculateMonthlyInstallments();
        }
        if (e.target === outstandingHomeLoan || e.target === propertyValue) {
            validateLoanAmounts();
        }
        if (e.target === outstandingTermLoan) {
            validateLoanAmounts();
        }
    });
});

// Add event listeners to input fields for validation only
const inputFields = [propertyValue, cpfUsed, averageAge, yearsSincePurchase, outstandingHomeLoan, outstandingTermLoan];
inputFields.forEach(input => {
    if (!input.classList.contains('comma-input')) {
        input.addEventListener('input', validateInput);
    }
});
// Add event listeners for combined validation
[propertyValue, outstandingHomeLoan, outstandingTermLoan].forEach(input => {
    input.addEventListener('input', function() {
        validateLoanAmounts();
    });
});
// Modified event listener for additionalTermLoan
additionalTermLoan.addEventListener('input', () => {
    validateAdditionalLoan();
    calculateMonthlyInstallments();
});

// Add event listener for interest rate
interestRate.addEventListener('input', () => {
    validateInterestRate();
    calculateMonthlyInstallments();
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
    validateAgePurchase();
    validateYearsSincePurchase();
});

outstandingHomeLoan.addEventListener('input', function() {
    validateYearsSincePurchase();
});

// Fix the validateYearsSincePurchase function to be more robust
function validateYearsSincePurchase() {
    const years = parseFloat(yearsSincePurchase.value) || 0;
    const homeLoan = parseNumber(outstandingHomeLoan.value) || 0;
    const errorElement = document.getElementById('yearsSincePurchaseError');
    
    if (years >= 30 && homeLoan > 0) {
        errorElement.textContent = 'For properties owned 30+ years, outstanding home loan must be $0.';
        errorElement.style.display = 'block';
        return false;
    } else {
        if (errorElement.textContent.includes('For properties owned 30+ years')) {
            errorElement.style.display = 'none';
        }
        return true;
    }
}

// Add real-time validation for loan amounts against property value
propertyValue.addEventListener('input', function() {
    validateLoanAmounts();
});

outstandingHomeLoan.addEventListener('input', function() {
    validateLoanAmounts();
});

outstandingTermLoan.addEventListener('input', function() {
    validateLoanAmounts();
});

function validateLoanAmounts() {
    const pv = parseNumber(propertyValue.value) || 0;
    const homeLoan = parseNumber(outstandingHomeLoan.value) || 0;
    const termLoan = parseNumber(outstandingTermLoan.value) || 0;
    const homeLoanErrorElement = document.getElementById('outstandingHomeLoanError');
    const termLoanErrorElement = document.getElementById('outstandingTermLoanError');
    let isValid = true;
    
    if (pv > 0) {
        // Individual loan validations (existing)
        if (homeLoan > pv * 0.75) {
            homeLoanErrorElement.textContent = 'Outstanding home loan cannot exceed 75% of property valuation.';
            homeLoanErrorElement.style.display = 'block';
            isValid = false;
        } else {
            if (homeLoanErrorElement.textContent.includes('75% of property valuation')) {
                homeLoanErrorElement.style.display = 'none';
            }
        }
        
        if (termLoan > pv * 0.75) {
            termLoanErrorElement.textContent = 'Outstanding equity loan cannot exceed 75% of property valuation.';
            termLoanErrorElement.style.display = 'block';
            isValid = false;
        } else {
            if (termLoanErrorElement.textContent.includes('75% of property valuation')) {
                termLoanErrorElement.style.display = 'none';
            }
        }
        
        // NEW: Combined loan validation
        if (homeLoan + termLoan > pv * 0.75) {
            const combinedErrorElement = document.getElementById('combinedLoanError') || 
                createCombinedErrorElement();
            combinedErrorElement.textContent = 'Combined home and equity loans cannot exceed 75% of property valuation.';
            combinedErrorElement.style.display = 'block';
            isValid = false;
        } else {
            const combinedErrorElement = document.getElementById('combinedLoanError');
            if (combinedErrorElement) {
                combinedErrorElement.style.display = 'none';
            }
        }
    }
    
    return isValid;
}

// Helper function to create the combined error element if it doesn't exist
function createCombinedErrorElement() {
    const combinedErrorElement = document.createElement('div');
    combinedErrorElement.id = 'combinedLoanError';
    combinedErrorElement.className = 'error-message';
    
    // Insert after the term loan error element
    const termLoanErrorElement = document.getElementById('outstandingTermLoanError');
    if (termLoanErrorElement && termLoanErrorElement.parentNode) {
        termLoanErrorElement.parentNode.insertBefore(
            combinedErrorElement, 
            termLoanErrorElement.nextSibling
        );
    } else {
        // Fallback: append to the form
        const form = document.querySelector('form') || document.body;
        form.appendChild(combinedErrorElement);
    }
    
    return combinedErrorElement;
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
    const value = input.classList.contains('comma-input') ? parseNumber(input.value) : parseFloat(input.value);
    const errorElement = document.getElementById(id + 'Error');
    
    if (input.value === '') {
        errorElement.style.display = 'none';
        return false;
    }
    
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

function calculateEligibleLoan() {
    const pv = parseNumber(propertyValue.value) || 0;
    const cpf = parseNumber(cpfUsed.value) || 0;
    const homeLoan = parseNumber(outstandingHomeLoan.value) || 0;
    const termLoan = parseNumber(outstandingTermLoan.value) || 0;
    
    // Check if combined loans already exceed the 75% limit
    if (homeLoan + termLoan > pv * 0.75) {
        eligibleLoanValue.textContent = formatCurrency(0);
        eligibleLoanValue.className = 'result-value negative';
        eligibilityMessage.textContent = 'Combined home and equity loans already exceed 75% of property valuation.';
        eligibilityMessage.style.display = 'block';
        eligibleLoanResult.className = 'result-item negative';
        loanDetails.classList.add('hidden');
        additionalTermLoan.value = '0';
        additionalTermLoan.max = 0;
        additionalLoanMessage.textContent = '';
        additionalLoanMessage.style.display = 'none';
        return 0;
    }
    
    const eligibleAmount = (pv * 0.75) - homeLoan - termLoan - cpf;
    
    if (eligibleAmount <= 0) {
        eligibleLoanValue.textContent = formatCurrency(0);
        eligibleLoanValue.className = 'result-value negative';
        eligibilityMessage.textContent = 'Sorry, your property does not qualify for an additional Equity Loan.';
        eligibilityMessage.style.display = 'block';
        eligibleLoanResult.className = 'result-item negative';
        loanDetails.classList.add('hidden');
        additionalTermLoan.value = '0';
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
        additionalTermLoan.value = formatNumberWithCommas(eligibleAmount.toString());
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
    const additionalAmount = parseNumber(additionalTermLoan.value) || 0;
    
    if (additionalAmount > eligibleAmount) {
        additionalLoanMessage.textContent = 'Amount cannot exceed eligible amount.';
        additionalLoanMessage.style.display = 'block';
        additionalTermLoan.value = formatNumberWithCommas(eligibleAmount.toString());
    } else if (additionalAmount < 0) {
        additionalLoanMessage.textContent = 'Amount cannot be negative.';
        additionalLoanMessage.style.display = 'block';
        additionalTermLoan.value = '0';
    } else {
        additionalLoanMessage.textContent = '';
        additionalLoanMessage.style.display = 'none';
    }
}

// Calculate monthly installments
function calculateMonthlyInstallments() {
    if (calculationResults.classList.contains('hidden')) {
        return;
    }
    
    const homeLoan = parseNumber(outstandingHomeLoan.value) || 0;
    const additionalLoan = parseNumber(additionalTermLoan.value) || 0;
    const outstandingTerm = parseNumber(outstandingTermLoan.value) || 0;
    const totalTermLoan = additionalLoan + outstandingTerm;
    const homeTenureYears = parseInt(homeLoanTenure.value) || 14;
    const termTenureYears = parseInt(termLoanTenure.value) || 30;
    const rate = parseFloat(interestRate.value) / 100 || 0.025;
    
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
    
    const rateDisplay = document.querySelectorAll('.payment-method');
    rateDisplay.forEach(element => {
        element.textContent = `Payment method: ${element.textContent.includes('Cash/CPF') ? 'Cash/CPF' : 'Cash Only'} (Using ${rate * 100}% p.a interest rate)`;
    });
}

// Initialize the noUiSlider sliders with improved UI
function initializeSliders() {
    const homeLoanSlider = document.getElementById('homeLoanSlider');
    const termLoanSlider = document.getElementById('termLoanSlider');
    const homeLoanTenureDisplay = document.getElementById('homeLoanTenureDisplay');
    const termLoanTenureDisplay = document.getElementById('termLoanTenureDisplay');
    
    const homeLoanTenure = document.getElementById('homeLoanTenure');
    const termLoanTenure = document.getElementById('termLoanTenure');
    
    document.getElementById('maxHomeLoanTenure').textContent = homeLoanTenure.max + ' years';
    document.getElementById('maxTermLoanTenure').textContent = termLoanTenure.max + ' years';
    
    if (homeLoanSlider.noUiSlider) {
        homeLoanSlider.noUiSlider.destroy();
    }
    if (termLoanSlider.noUiSlider) {
        termLoanSlider.noUiSlider.destroy();
    }
    
    const homeLoanValue = parseInt(homeLoanTenure.value) || 14;
    const termLoanValue = parseInt(termLoanTenure.value) || 30;
    const maxHomeTenure = parseInt(homeLoanTenure.max) || 35;
    const maxTermTenure = parseInt(termLoanTenure.max) || 35;
    
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
        tooltips: false
    });

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
        tooltips: false
    });

    const homeLoanHandle = homeLoanSlider.querySelector('.noUi-handle');
    const termLoanHandle = termLoanSlider.querySelector('.noUi-handle');
    
    const homeLoanBubble = document.createElement('div');
    homeLoanBubble.className = 'value-bubble';
    homeLoanHandle.appendChild(homeLoanBubble);
    
    const termLoanBubble = document.createElement('div');
    termLoanBubble.className = 'value-bubble';
    termLoanHandle.appendChild(termLoanBubble);

    const homeLoanFocus = document.createElement('div');
    homeLoanFocus.className = 'handle-focus';
    homeLoanHandle.appendChild(homeLoanFocus);
    
    const termLoanFocus = document.createElement('div');
    termLoanFocus.className = 'handle-focus';
    termLoanHandle.appendChild(termLoanFocus);

    homeLoanSlider.noUiSlider.on('update', function(values, handle) {
        const value = values[handle];
        homeLoanTenureDisplay.textContent = value + ' years';
        homeLoanBubble.textContent = value + ' yrs';
        homeLoanTenure.value = value;
        homeLoanTenureDisplay.classList.add('value-updated');
        setTimeout(() => {
            homeLoanTenureDisplay.classList.remove('value-updated');
        }, 300);
        calculateMonthlyInstallments();
    });

    termLoanSlider.noUiSlider.on('update', function(values, handle) {
        const value = values[handle];
        termLoanTenureDisplay.textContent = value + ' years';
        termLoanBubble.textContent = value + ' yrs';
        termLoanTenure.value = value;
        termLoanTenureDisplay.classList.add('value-updated');
        setTimeout(() => {
            termLoanTenureDisplay.classList.remove('value-updated');
        }, 300);
        calculateMonthlyInstallments();
    });

    [homeLoanHandle, termLoanHandle].forEach(handle => {
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
    
    function checkSliderPosition(slider, handle) {
        const range = slider.noUiSlider.options.range;
        const value = slider.noUiSlider.get();
        const min = range.min;
        const max = range.max;
        
        handle.classList.remove('at-min', 'at-max', 'near-min', 'near-max');
        
        if (value <= min) handle.classList.add('at-min');
        else if (value >= max) handle.classList.add('at-max');
        else if (value <= min + (max - min) * 0.1) handle.classList.add('near-min');
        else if (value >= max - (max - min) * 0.1) handle.classList.add('near-max');
    }
    
    checkSliderPosition(homeLoanSlider, homeLoanHandle);
    checkSliderPosition(termLoanSlider, termLoanHandle);
    
    homeLoanSlider.noUiSlider.on('update', function() {
        checkSliderPosition(homeLoanSlider, homeLoanHandle);
    });
    
    termLoanSlider.noUiSlider.on('update', function() {
        checkSliderPosition(termLoanSlider, termLoanHandle);
    });
    
    setTimeout(() => {
        homeLoanSlider.classList.add('slider-initialized');
        termLoanSlider.classList.add('slider-initialized');
    }, 100);
}

// Call the initialization function when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (typeof noUiSlider !== 'undefined') {
        initializeSliders();
    } else {
        console.error('noUiSlider is not loaded. Please include the library.');
    }
});

// Calculate all values
function calculateAll() {
    let isValid = true;
    inputFields.forEach(input => {
        const valid = validateInput({ target: input });
        if (!valid) isValid = false;
    });
    
    if (!validateAgePurchase()) isValid = false;
    if (!validateYearsSincePurchase()) isValid = false;
    if (!validateLoanAmounts()) isValid = false;
    
    if (!isValid) {
        errorMessage.textContent = 'Please correct all input errors before calculating.';
        errorMessage.style.display = 'block';
        return;
    }
    
    errorMessage.style.display = 'none';
    initialMessage.classList.add('hidden');
    calculationResults.classList.remove('hidden');
    
    outstandingHomeLoanValue.textContent = formatCurrency(parseNumber(outstandingHomeLoan.value) || 0);
    outstandingTermLoanValue.textContent = formatCurrency(parseNumber(outstandingTermLoan.value) || 0);
    
    calculateEligibleLoan();
    calculateMaxTenures();
    
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