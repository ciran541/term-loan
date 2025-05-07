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

// Add event listeners to sliders
homeLoanTenure.addEventListener('input', () => {
    updateHomeLoanTenure(homeLoanTenure.value);
    calculateMonthlyInstallments(); // Update monthly values when slider changes
});

termLoanTenure.addEventListener('input', () => {
    updateTermLoanTenure(termLoanTenure.value);
    calculateMonthlyInstallments(); // Update monthly values when slider changes
});

// Modified event listener for additionalTermLoan
additionalTermLoan.addEventListener('input', () => {
    validateAdditionalLoan();
    calculateMonthlyInstallments(); // Update monthly values when additional loan changes
});

// Add event listener to calculate button
calculateButton.addEventListener('click', calculateAll);

// Add event listeners for years since purchase and age validation
yearsSincePurchase.addEventListener('input', validateAgePurchase);
averageAge.addEventListener('input', validateAgePurchase);

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

// Validate years since purchase against outstanding loan
function validateYearsSincePurchase() {
    const years = parseFloat(yearsSincePurchase.value) || 0;
    const homeLoan = parseFloat(outstandingHomeLoan.value) || 0;
    const errorElement = document.getElementById('yearsSincePurchaseError');
    
    if (years >= 30 && homeLoan > 0) {
        errorElement.textContent = 'For properties owned 30+ years, outstanding home loan must be $0.';
        errorElement.style.display = 'block';
        return false;
    } else {
        // Only clear if there's no age-purchase validation error
        if (validateAgePurchase()) {
            errorElement.style.display = 'none';
        }
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
        eligibilityMessage.textContent = 'Sorry, your property does not qualify for an additional term loan.';
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
    
    const homeRate = 0.025; // 2.5% p.a
    const termRate = 0.025; // 2.5% p.a
    
    if (homeLoan > 0) {
        const homeMonthly = calculatePMT(homeRate, homeTenureYears * 12, homeLoan);
        homeLoanMonthlyValue.textContent = formatCurrency(homeMonthly);
    } else {
        homeLoanMonthlyValue.textContent = formatCurrency(0);
    }
    
    if (totalTermLoan > 0) {
        const termMonthly = calculatePMT(termRate, termTenureYears * 12, totalTermLoan);
        termLoanMonthlyValue.textContent = formatCurrency(termMonthly);
    } else {
        termLoanMonthlyValue.textContent = formatCurrency(0);
    }
}

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
    calculateMonthlyInstallments();
}