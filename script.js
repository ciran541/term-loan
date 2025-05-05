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
const homeLoanTenureInput = document.getElementById('homeLoanTenureInput');
const termLoanTenureInput = document.getElementById('termLoanTenureInput');

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

// Add event listeners to input fields
const inputFields = [propertyValue, cpfUsed, averageAge, yearsSincePurchase, outstandingHomeLoan, outstandingTermLoan];
inputFields.forEach(input => {
    input.addEventListener('input', function(e) {
        validateInput(e);
        calculateAll();
    });
});

// Add event listeners to sliders and inputs
homeLoanTenure.addEventListener('input', () => updateHomeLoanTenure(homeLoanTenure.value, true));
termLoanTenure.addEventListener('input', () => updateTermLoanTenure(termLoanTenure.value, true));
homeLoanTenureInput.addEventListener('input', () => updateHomeLoanTenure(homeLoanTenureInput.value, false));
termLoanTenureInput.addEventListener('input', () => updateTermLoanTenure(termLoanTenureInput.value, false));
additionalTermLoan.addEventListener('input', validateAdditionalLoan);

// Validate input fields
function validateInput(e) {
    const input = e.target;
    const id = input.id;
    const value = parseFloat(input.value);
    const errorElement = document.getElementById(id + 'Error');
    
    if (input.value === '') {
        errorElement.style.display = 'none';
        return;
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
    homeLoanTenureInput.max = maxHomeTenure;
    termLoanTenureInput.max = maxTermTenure;
    
    maxHomeLoanTenure.textContent = maxHomeTenure + ' years';
    maxTermLoanTenure.textContent = maxTermTenure + ' years';
    
    // Set default tenures
    updateHomeLoanTenure(maxHomeTenure, true);
    updateTermLoanTenure(maxTermTenure, true);
    
    return { homeTenure: maxHomeTenure, termTenure: maxTermTenure };
}

// Update home loan tenure
function updateHomeLoanTenure(value, fromSlider = true) {
    let tenure = parseInt(value);
    const maxTenure = parseInt(homeLoanTenure.max);
    const minTenure = parseInt(homeLoanTenure.min);
    
    if (isNaN(tenure) || tenure < minTenure) {
        tenure = minTenure;
    } else if (tenure > maxTenure) {
        tenure = maxTenure;
    }
    
    homeLoanTenure.value = tenure;
    homeLoanTenureInput.value = tenure;
    homeLoanTenureDisplay.textContent = tenure + ' years';
    
    calculateMonthlyInstallments();
}

// Update term loan tenure
function updateTermLoanTenure(value, fromSlider = true) {
    let tenure = parseInt(value);
    const maxTenure = parseInt(termLoanTenure.max);
    const minTenure = parseInt(termLoanTenure.min);
    
    if (isNaN(tenure) || tenure < minTenure) {
        tenure = minTenure;
    } else if (tenure > maxTenure) {
        tenure = maxTermTenure;
    }
    
    termLoanTenure.value = tenure;
    termLoanTenureInput.value = tenure;
    termLoanTenureDisplay.textContent = tenure + ' years';
    
    calculateMonthlyInstallments();
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
    
    calculateMonthlyInstallments();
}

// Calculate monthly installments
function calculateMonthlyInstallments() {
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
    initialMessage.classList.add('hidden');
    calculationResults.classList.remove('hidden');
    
    outstandingHomeLoanValue.textContent = formatCurrency(parseFloat(outstandingHomeLoan.value) || 0);
    outstandingTermLoanValue.textContent = formatCurrency(parseFloat(outstandingTermLoan.value) || 0);
    
    calculateEligibleLoan();
    calculateMaxTenures();
    calculateMonthlyInstallments();
}

// Set initial values for demonstration
propertyValue.value = "3000000";
cpfUsed.value = "300000";
averageAge.value = "45";
yearsSincePurchase.value = "20";
outstandingHomeLoan.value = "1500000";
outstandingTermLoan.value = "100000";

// Initialize calculations
calculateAll();