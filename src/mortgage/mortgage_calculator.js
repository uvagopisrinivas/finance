// Multi-Currency Mortgage Calculator
(function(){
    
    // Global mortgage currency state
    let currentMortgageCurrency = 'USD'; // Default to USD
    
    // Currency configuration for mortgage
    const mortgageCurrencyConfig = {
        'USD': {
            symbol: '$',
            locale: 'en-US',
            name: 'US Dollar',
            defaults: {
                homePrice: '400000',
                downPayment: '80000',
                downPaymentPercent: '20',
                loanProgram: '30-year-fixed',
                interestRate: '6.5',
                propertyTax: '4800',
                propertyTaxPercent: '1.2',
                homeInsurance: '1200',
                hoaDues: '0',
                maintenance: '80',
                utilities: {
                    waterSewer: '60',
                    gas: '30',
                    internet: '50',
                    electric: '100'
                }
            }
        },
        'INR': {
            symbol: '₹',
            locale: 'en-IN',
            name: 'Indian Rupee',
            defaults: {
                loanAmount: '5000000',
                interestRate: '8.5',
                loanTerm: '20'
            }
        }
    };
    
    // Indian number to words conversion
    function numberToIndianWords(num) {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        
        function convertHundreds(n) {
            if (n === 0 || isNaN(n)) return '';
            
            let result = '';
            if (n >= 100) {
                const hundredDigit = Math.floor(n / 100);
                if (hundredDigit > 0 && hundredDigit < ones.length) {
                    result += ones[hundredDigit] + ' Hundred';
                    n %= 100;
                    if (n > 0) result += ' ';
                }
            }
            if (n >= 20) {
                const tenDigit = Math.floor(n / 10);
                if (tenDigit >= 0 && tenDigit < tens.length) {
                    result += tens[tenDigit];
                    n %= 10;
                    if (n > 0 && n < ones.length) result += ' ' + ones[n];
                }
            } else if (n >= 10) {
                const teenIndex = n - 10;
                if (teenIndex >= 0 && teenIndex < teens.length) {
                    result += teens[teenIndex];
                }
            } else if (n > 0 && n < ones.length) {
                result += ones[n];
            }
            return result;
        }
        
        if (num === 0 || isNaN(num) || num === null || num === undefined) {
            return 'Zero';
        }
        
        // Convert to integer to avoid decimal issues
        num = Math.floor(Math.abs(num));
        
        let result = '';
        
        // Handle Crore (1,00,00,000 and above)
        if (num >= 10000000) {
            const crores = Math.floor(num / 10000000);
            const croreWords = convertHundreds(crores);
            if (croreWords) {
                result += croreWords + ' Crore';
            }
            num %= 10000000;
            if (num > 0 && result) result += ' ';
        }
        
        // Handle Lac (1,00,000 and above)
        if (num >= 100000) {
            const lacs = Math.floor(num / 100000);
            const lacWords = convertHundreds(lacs);
            if (lacWords) {
                result += lacWords + ' Lac';
            }
            num %= 100000;
            if (num > 0 && result) result += ' ';
        }
        
        // Handle Thousand (1,000 and above)
        if (num >= 1000) {
            const thousands = Math.floor(num / 1000);
            const thousandWords = convertHundreds(thousands);
            if (thousandWords) {
                result += thousandWords + ' Thousand';
            }
            num %= 1000;
            if (num > 0 && result) result += ' ';
        }
        
        // Handle remaining hundreds, tens, and ones
        if (num > 0) {
            const remainingWords = convertHundreds(num);
            if (remainingWords) {
                result += remainingWords;
            }
        }
        
        return result.trim() || 'Zero';
    }
    
    // Western number to words conversion
    function numberToWesternWords(num) {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        
        function convertHundreds(n) {
            if (n === 0 || isNaN(n)) return '';
            
            let result = '';
            if (n >= 100) {
                const hundredDigit = Math.floor(n / 100);
                if (hundredDigit > 0 && hundredDigit < ones.length) {
                    result += ones[hundredDigit] + ' Hundred';
                    n %= 100;
                    if (n > 0) result += ' ';
                }
            }
            if (n >= 20) {
                const tenDigit = Math.floor(n / 10);
                if (tenDigit >= 0 && tenDigit < tens.length) {
                    result += tens[tenDigit];
                    n %= 10;
                    if (n > 0 && n < ones.length) result += ' ' + ones[n];
                }
            } else if (n >= 10) {
                const teenIndex = n - 10;
                if (teenIndex >= 0 && teenIndex < teens.length) {
                    result += teens[teenIndex];
                }
            } else if (n > 0 && n < ones.length) {
                result += ones[n];
            }
            return result;
        }
        
        if (num === 0 || isNaN(num) || num === null || num === undefined) {
            return 'Zero';
        }
        
        // Convert to integer to avoid decimal issues
        num = Math.floor(Math.abs(num));
        
        let result = '';
        
        // Handle trillions
        if (num >= 1000000000000) {
            const trillions = Math.floor(num / 1000000000000);
            const trillionWords = convertHundreds(trillions);
            if (trillionWords) {
                result += trillionWords + ' Trillion';
            }
            num %= 1000000000000;
            if (num > 0 && result) result += ' ';
        }
        
        // Handle billions
        if (num >= 1000000000) {
            const billions = Math.floor(num / 1000000000);
            const billionWords = convertHundreds(billions);
            if (billionWords) {
                result += billionWords + ' Billion';
            }
            num %= 1000000000;
            if (num > 0 && result) result += ' ';
        }
        
        // Handle millions
        if (num >= 1000000) {
            const millions = Math.floor(num / 1000000);
            const millionWords = convertHundreds(millions);
            if (millionWords) {
                result += millionWords + ' Million';
            }
            num %= 1000000;
            if (num > 0 && result) result += ' ';
        }
        
        // Handle thousands
        if (num >= 1000) {
            const thousands = Math.floor(num / 1000);
            const thousandWords = convertHundreds(thousands);
            if (thousandWords) {
                result += thousandWords + ' Thousand';
            }
            num %= 1000;
            if (num > 0 && result) result += ' ';
        }
        
        // Handle remaining hundreds, tens, and ones
        if (num > 0) {
            const remainingWords = convertHundreds(num);
            if (remainingWords) {
                result += remainingWords;
            }
        }
        
        return result.trim() || 'Zero';
    }
    
    // Get current mortgage currency configuration
    function getCurrentMortgageCurrencyConfig() {
        return mortgageCurrencyConfig[currentMortgageCurrency] || mortgageCurrencyConfig['USD'];
    }
    
    // Format number with appropriate comma system
    function formatMortgageNumber(num) {
        if (isNaN(num) || num === '' || num === '0') return num.toString();
        
        const numStr = num.toString();
        const parts = numStr.split('.');
        let integerPart = parts[0];
        const decimalPart = parts[1] ? '.' + parts[1] : '';
        
        if (currentMortgageCurrency === 'INR') {
            // Indian numbering system
            if (integerPart.length > 3) {
                const lastThree = integerPart.slice(-3);
                let remaining = integerPart.slice(0, -3);
                
                let formatted = '';
                while (remaining.length > 0) {
                    if (remaining.length > 2) {
                        const lastTwo = remaining.slice(-2);
                        formatted = ',' + lastTwo + formatted;
                        remaining = remaining.slice(0, -2);
                    } else {
                        formatted = remaining + formatted;
                        remaining = '';
                    }
                }
                integerPart = formatted + ',' + lastThree;
            }
        } else {
            // Western numbering system
            integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        
        return integerPart + decimalPart;
    }
    
    // Format currency
    function formatMortgageCurrency(num) {
        const config = getCurrentMortgageCurrencyConfig();
        
        if (isNaN(num) || num === null || num === undefined) {
            return config.symbol + '0';
        }
        
        return new Intl.NumberFormat(config.locale, {
            style: 'currency',
            currency: currentMortgageCurrency,
            maximumFractionDigits: 0
        }).format(num);
    }
    
    // Update USD helper text
    function updateUSDHelperText(inputId, amount) {
        const wordsElement = document.getElementById(inputId + 'Words');
        if (wordsElement && currentMortgageCurrency === 'USD') {
            const words = numberToWesternWords(amount);
            wordsElement.textContent = `(${words})`;
        }
    }
    
    // Update loan amount words for Indian calculator
    function updateLoanAmountWords(amount) {
        const wordsElement = document.getElementById('loanAmountWords');
        if (wordsElement && currentMortgageCurrency === 'INR') {
            const words = numberToIndianWords(amount);
            wordsElement.textContent = `(${words})`;
        }
    }
    
    // Set mortgage currency and update UI
    // Set mortgage currency and update UI - syncs with main currency selector
    window.setMortgageCurrency = function(currency) {
        try {
            Logger.debug('Setting mortgage currency to:', currency);
            
            if (mortgageCurrencyConfig[currency]) {
                currentMortgageCurrency = currency;
                
                // No need to update selector - it's handled by the main currency selector
                
                // Show/hide appropriate calculator sections
                const usSection = document.getElementById('usMortgageCalculator');
                const indianSection = document.getElementById('indianMortgageCalculator');
                
                if (currency === 'USD') {
                    if (usSection) {
                        usSection.style.display = 'block';
                        usSection.classList.add('active');
                        Logger.debug('US section activated');
                    }
                    if (indianSection) {
                        indianSection.style.display = 'none';
                        indianSection.classList.remove('active');
                    }
                } else {
                    if (usSection) {
                        usSection.style.display = 'none';
                        usSection.classList.remove('active');
                    }
                    if (indianSection) {
                        indianSection.style.display = 'block';
                        indianSection.classList.add('active');
                        Logger.debug('Indian section activated');
                    }
                }
                
                // Apply currency-specific defaults
                applyMortgageCurrencyDefaults();
                
                // Hide results when currency changes
                hideMortgageResults();
            }
        } catch (error) {
            Logger.error('Error setting mortgage currency:', error);
        }
    };
    
    // Apply currency-specific default values
    function applyMortgageCurrencyDefaults() {
        try {
            const config = getCurrentMortgageCurrencyConfig();
            const defaults = config.defaults;
            
            if (currentMortgageCurrency === 'USD') {
                // US defaults
                const inputMappings = {
                    'homePrice': defaults.homePrice,
                    'downPayment': defaults.downPayment,
                    'downPaymentPercent': defaults.downPaymentPercent,
                    'loanProgram': defaults.loanProgram,
                    'interestRate': defaults.interestRate,
                    'propertyTax': defaults.propertyTax,
                    'propertyTaxPercent': defaults.propertyTaxPercent,
                    'homeInsurance': defaults.homeInsurance,
                    'hoaDues': defaults.hoaDues,
                    'maintenance': defaults.maintenance
                };
                
                Object.entries(inputMappings).forEach(([inputId, defaultValue]) => {
                    const input = document.getElementById(inputId);
                    if (input) {
                        if (input.type === 'number' || input.tagName === 'SELECT') {
                            input.value = defaultValue;
                        } else {
                            const formatted = formatMortgageNumber(defaultValue);
                            input.value = formatted;
                        }
                    }
                });
                
                // Update helper texts
                setTimeout(() => {
                    updateUSDHelperText('homePrice', parseFloat(defaults.homePrice));
                    updateUSDHelperText('downPayment', parseFloat(defaults.downPayment));
                    updateUSDHelperText('propertyTax', parseFloat(defaults.propertyTax));
                    updateUSDHelperText('homeInsurance', parseFloat(defaults.homeInsurance));
                    updateUSDHelperText('hoaDues', parseFloat(defaults.hoaDues));
                    updateUSDHelperText('maintenance', parseFloat(defaults.maintenance));
                }, 100);
                
            } else {
                // Indian defaults
                const loanAmountSlider = document.getElementById('loanAmountSlider');
                const loanAmountInput = document.getElementById('loanAmountInput');
                const interestRateSlider = document.getElementById('interestRateSlider');
                const interestRateInput = document.getElementById('interestRateInput');
                const loanTermSlider = document.getElementById('loanTermSlider');
                const loanTermInput = document.getElementById('loanTermInput');
                
                if (loanAmountSlider && loanAmountInput) {
                    loanAmountSlider.value = defaults.loanAmount;
                    loanAmountInput.value = formatMortgageNumber(defaults.loanAmount);
                    updateLoanAmountWords(parseFloat(defaults.loanAmount));
                }
                if (interestRateSlider && interestRateInput) {
                    interestRateSlider.value = defaults.interestRate;
                    interestRateInput.value = defaults.interestRate;
                }
                if (loanTermSlider && loanTermInput) {
                    loanTermSlider.value = defaults.loanTerm;
                    loanTermInput.value = defaults.loanTerm;
                }
            }
        } catch (error) {
            console.error('Error applying mortgage currency defaults:', error);
        }
    }
    
    // Hide mortgage results when currency changes
    function hideMortgageResults() {
        const resultSection = document.getElementById('mortgageResults');
        if (resultSection) {
            resultSection.style.display = 'none';
        }
    }
    
    // Main mortgage calculation function
    window.calculateMortgage = function() {
        try {
            if (currentMortgageCurrency === 'USD') {
                calculateUSMortgage();
            } else {
                calculateIndianMortgage();
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };
    
    // Calculate US mortgage (Zillow style)
    function calculateUSMortgage() {
        // Get input values
        const homePrice = parseFloat(document.getElementById('homePrice').value.replace(/,/g, ''));
        const downPayment = parseFloat(document.getElementById('downPayment').value.replace(/,/g, ''));
        const interestRate = parseFloat(document.getElementById('interestRate').value) / 100;
        const propertyTax = parseFloat(document.getElementById('propertyTax').value.replace(/,/g, '')) || 0;
        const homeInsurance = parseFloat(document.getElementById('homeInsurance').value.replace(/,/g, '')) || 0;
        const hoaDues = parseFloat(document.getElementById('hoaDues').value.replace(/,/g, '')) || 0;
        const maintenance = parseFloat(document.getElementById('maintenance').value.replace(/,/g, '')) || 0;
        
        // Validation
        if (isNaN(homePrice) || isNaN(downPayment) || isNaN(interestRate) ||
            homePrice <= 0 || downPayment < 0 || interestRate < 0) {
            throw new Error('Please enter valid values for all required fields');
        }
        
        if (downPayment >= homePrice) {
            throw new Error('Down payment cannot be greater than or equal to home price');
        }
        
        // Calculate loan amount
        const loanAmount = homePrice - downPayment;
        const downPaymentPercent = roundCurrency((downPayment / homePrice) * 100);
        
        // Calculate Mortgage Insurance if down payment < 20%
        let monthlyMortgageInsurance = 0;
        const includeMortgageInsuranceEl = document.getElementById('includeMortgageInsurance');
        const mortgageInsuranceInput = document.getElementById('mortgageInsuranceInput');
        const includeMortgageInsurance = includeMortgageInsuranceEl ? includeMortgageInsuranceEl.checked : false;
        
        if (includeMortgageInsurance && mortgageInsuranceInput) {
            monthlyMortgageInsurance = parseFloat(mortgageInsuranceInput.value.replace(/,/g, '')) || 0;
        }
        
        // Get loan term from program
        const loanProgram = document.getElementById('loanProgram').value;
        let loanTermYears = 30;
        if (loanProgram.includes('15-year')) loanTermYears = 15;
        else if (loanProgram.includes('30-year')) loanTermYears = 30;
        
        // Calculate monthly payment (Principal & Interest)
        const monthlyRate = interestRate / 12;
        const numPayments = loanTermYears * 12;
        
        let monthlyPI = 0;
        if (monthlyRate > 0) {
            monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                       (Math.pow(1 + monthlyRate, numPayments) - 1);
        } else {
            monthlyPI = loanAmount / numPayments;
        }
        monthlyPI = roundCurrency(monthlyPI);
        
        // Get utility values
        const includeUtilities = document.getElementById('includeUtilities');
        let totalUtilities = 0;
        if (includeUtilities && includeUtilities.checked) {
            const waterSewerEl = document.getElementById('waterSewer');
            const gasEl = document.getElementById('gas');
            const internetEl = document.getElementById('internet');
            const electricEl = document.getElementById('electric');
            
            const waterSewer = waterSewerEl ? parseFloat(waterSewerEl.value.replace(/,/g, '')) || 0 : 0;
            const gas = gasEl ? parseFloat(gasEl.value.replace(/,/g, '')) || 0 : 0;
            const internet = internetEl ? parseFloat(internetEl.value.replace(/,/g, '')) || 0 : 0;
            const electric = electricEl ? parseFloat(electricEl.value.replace(/,/g, '')) || 0 : 0;
            totalUtilities = waterSewer + gas + internet + electric;
        }
        
        // Calculate taxes and insurance
        const monthlyTaxesInsurance = (propertyTax + homeInsurance) / 12;
        
        // Total housing payment (PITI + Mortgage Insurance + HOA + Utilities + Maintenance)
        const totalHousingPayment = monthlyPI + monthlyTaxesInsurance + monthlyMortgageInsurance + hoaDues + totalUtilities + maintenance;
        
        // Calculate totals
        const totalInterest = (monthlyPI * numPayments) - loanAmount;
        const totalPaid = loanAmount + totalInterest;
        
        // Update down payment percentage
        document.getElementById('downPaymentPercent').value = downPaymentPercent.toFixed(1);
        
        // Update results
        document.getElementById('resultsTitle').textContent = 'Your Monthly Payment';
        document.getElementById('resultsSubtitle').textContent = 'Here\'s your payment breakdown';
        document.getElementById('paymentLabel').textContent = 'Total Housing';
        document.getElementById('totalMonthlyPayment').textContent = formatMortgageCurrency(totalHousingPayment);
        document.getElementById('breakdownTitle').textContent = 'Monthly Breakdown';
        
        // Update summary
        const summaryItems = document.getElementById('summaryItems');
        summaryItems.innerHTML = `
            <div class="mortgage-summary-item">
                <span class="mortgage-summary-label">
                    <i class="fas fa-home"></i>
                    Home Price
                </span>
                <span class="mortgage-summary-value">${formatMortgageCurrency(homePrice)}</span>
            </div>
            <div class="mortgage-summary-item">
                <span class="mortgage-summary-label">
                    <i class="fas fa-hand-holding-usd"></i>
                    Down Payment
                </span>
                <span class="mortgage-summary-value">${formatMortgageCurrency(downPayment)} (${downPaymentPercent.toFixed(1)}%)</span>
            </div>
            <div class="mortgage-summary-item">
                <span class="mortgage-summary-label">
                    <i class="fas fa-money-bill-wave"></i>
                    Loan Amount
                </span>
                <span class="mortgage-summary-value">${formatMortgageCurrency(loanAmount)}</span>
            </div>
            <div class="mortgage-summary-item">
                <span class="mortgage-summary-label">
                    <i class="fas fa-chart-line"></i>
                    Interest Rate
                </span>
                <span class="mortgage-summary-value">${(interestRate * 100).toFixed(2)}%</span>
            </div>
            <div class="mortgage-summary-item">
                <span class="mortgage-summary-label">
                    <i class="fas fa-calendar-alt"></i>
                    Loan Term
                </span>
                <span class="mortgage-summary-value">${loanTermYears} years</span>
            </div>
            <div class="mortgage-summary-item">
                <span class="mortgage-summary-label">
                    <i class="fas fa-coins"></i>
                    Total Interest
                </span>
                <span class="mortgage-summary-highlight">${formatMortgageCurrency(totalInterest)}</span>
            </div>
        `;
        
        // Generate detailed payment breakdown
        generateUSPaymentBreakdown(monthlyPI, monthlyTaxesInsurance, monthlyMortgageInsurance, hoaDues, totalUtilities, maintenance, totalHousingPayment, includeUtilities && includeUtilities.checked);
        
        // Show results
        document.getElementById('mortgageResults').style.display = 'block';
    }
    
    // Calculate Indian mortgage (ICICI style)
    function calculateIndianMortgage() {
        // Get input values
        const loanAmount = parseFloat(document.getElementById('loanAmountInput').value.replace(/,/g, ''));
        const interestRate = parseFloat(document.getElementById('interestRateInput').value) / 100;
        const loanTermYears = parseInt(document.getElementById('loanTermInput').value);
        
        // Validation
        if (isNaN(loanAmount) || isNaN(interestRate) || isNaN(loanTermYears) ||
            loanAmount <= 0 || interestRate < 0 || loanTermYears <= 0) {
            throw new Error('Please enter valid values for all fields');
        }
        
        // Calculate EMI
        const monthlyRate = interestRate / 12;
        const numPayments = loanTermYears * 12;
        
        let emi = 0;
        if (monthlyRate > 0) {
            emi = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                  (Math.pow(1 + monthlyRate, numPayments) - 1);
        } else {
            emi = loanAmount / numPayments;
        }
        
        // Calculate totals
        const totalPayment = emi * numPayments;
        const totalInterest = totalPayment - loanAmount;
        
        // Update results
        document.getElementById('resultsTitle').textContent = 'Your EMI Details';
        document.getElementById('resultsSubtitle').textContent = 'Here\'s your EMI breakdown';
        document.getElementById('paymentLabel').textContent = 'Monthly EMI';
        document.getElementById('totalMonthlyPayment').textContent = formatMortgageCurrency(emi);
        document.getElementById('breakdownTitle').textContent = 'EMI Breakdown';
        
        // Update summary
        const summaryItems = document.getElementById('summaryItems');
        summaryItems.innerHTML = `
            <div class="mortgage-summary-item">
                <span class="mortgage-summary-label">
                    <i class="fas fa-money-bill-wave"></i>
                    Loan Amount
                </span>
                <span class="mortgage-summary-value">${formatMortgageCurrency(loanAmount)}</span>
            </div>
            <div class="mortgage-summary-item">
                <span class="mortgage-summary-label">
                    <i class="fas fa-chart-line"></i>
                    Interest Rate
                </span>
                <span class="mortgage-summary-value">${(interestRate * 100).toFixed(1)}% p.a.</span>
            </div>
            <div class="mortgage-summary-item">
                <span class="mortgage-summary-label">
                    <i class="fas fa-coins"></i>
                    Total Interest
                </span>
                <span class="mortgage-summary-highlight">${formatMortgageCurrency(totalInterest)}</span>
            </div>
        `;
        
        // Generate simple EMI breakdown
        generateIndianEMIBreakdown(loanAmount, emi, interestRate, numPayments);
        
        // Show results
        document.getElementById('mortgageResults').style.display = 'block';
    }
    
    // Generate US payment breakdown table
    function generateUSPaymentBreakdown(monthlyPI, monthlyTaxesInsurance, monthlyMortgageInsurance, hoaDues, totalUtilities, maintenance, totalHousingPayment, includeUtilities) {
        const breakdownHtml = `
            <div class="mortgage-breakdown-item">
                <span class="mortgage-breakdown-label">COMPONENT</span>
                <span class="mortgage-breakdown-value">MONTHLY AMOUNT</span>
            </div>
            <div class="mortgage-breakdown-item">
                <span class="mortgage-breakdown-label">Principal & Interest</span>
                <span class="mortgage-breakdown-value">${formatMortgageCurrency(monthlyPI)}</span>
            </div>
            <div class="mortgage-breakdown-item">
                <span class="mortgage-breakdown-label">Property Tax & Insurance</span>
                <span class="mortgage-breakdown-value">${formatMortgageCurrency(monthlyTaxesInsurance)}</span>
            </div>
            ${monthlyMortgageInsurance > 0 ? `
            <div class="mortgage-breakdown-item">
                <span class="mortgage-breakdown-label">Mortgage Insurance</span>
                <span class="mortgage-breakdown-value">${formatMortgageCurrency(monthlyMortgageInsurance)}</span>
            </div>
            ` : ''}
            <div class="mortgage-breakdown-item">
                <span class="mortgage-breakdown-label">HOA Fees</span>
                <span class="mortgage-breakdown-value">${formatMortgageCurrency(hoaDues)}</span>
            </div>
            ${includeUtilities ? `
            <div class="mortgage-breakdown-item">
                <span class="mortgage-breakdown-label">Utilities</span>
                <span class="mortgage-breakdown-value">${formatMortgageCurrency(totalUtilities)}</span>
            </div>
            ` : ''}
            <div class="mortgage-breakdown-item">
                <span class="mortgage-breakdown-label">Maintenance</span>
                <span class="mortgage-breakdown-value">${formatMortgageCurrency(maintenance)}</span>
            </div>
            <div class="mortgage-breakdown-item">
                <span class="mortgage-breakdown-label">Total Housing Payment</span>
                <span class="mortgage-breakdown-value">${formatMortgageCurrency(totalHousingPayment)}</span>
            </div>
        `;
        document.getElementById('mortgageTableContainer').innerHTML = breakdownHtml;
    }
    
    // Generate Indian EMI breakdown table
    function generateIndianEMIBreakdown(loanAmount, emi, annualRate, numPayments) {
        const totalPayment = emi * numPayments;
        const totalInterest = totalPayment - loanAmount;
        
        const breakdownHtml = `
            <div class="mortgage-breakdown-item">
                <span class="mortgage-breakdown-label">COMPONENT</span>
                <span class="mortgage-breakdown-value">AMOUNT</span>
            </div>
            <div class="mortgage-breakdown-item">
                <span class="mortgage-breakdown-label">Monthly EMI</span>
                <span class="mortgage-breakdown-value">${formatMortgageCurrency(emi)}</span>
            </div>
            <div class="mortgage-breakdown-item">
                <span class="mortgage-breakdown-label">Loan Term</span>
                <span class="mortgage-breakdown-value">${Math.ceil(numPayments / 12)} Years</span>
            </div>
            <div class="mortgage-breakdown-item">
                <span class="mortgage-breakdown-label">Total Interest</span>
                <span class="mortgage-breakdown-value">${formatMortgageCurrency(totalInterest)}</span>
            </div>
        `;
        document.getElementById('mortgageTableContainer').innerHTML = breakdownHtml;
    }
    
    // Setup input validation and formatting
    function setupMortgageInputValidation() {
        try {
            // US Currency inputs with cursor position handling
            const usCurrencyInputs = [
                { id: 'homePrice', helperId: 'homePrice' },
                { id: 'downPayment', helperId: 'downPayment' },
                { id: 'propertyTax', helperId: 'propertyTax' },
                { id: 'homeInsurance', helperId: 'homeInsurance' },
                { id: 'mortgageInsuranceInput', helperId: 'mortgageInsurance' },
                { id: 'hoaDues', helperId: 'hoaDues' },
                { id: 'maintenance', helperId: 'maintenance' }
            ];
            
            usCurrencyInputs.forEach(inputConfig => {
                const input = document.getElementById(inputConfig.id);
                if (!input) return;
                
                // Format initial value and set helper text
                if (input.value) {
                    const formatted = formatMortgageNumber(input.value);
                    input.value = formatted;
                    updateUSDHelperText(inputConfig.helperId, parseFloat(input.value.replace(/,/g, '')) || 0);
                }
                
                // Handle input events with cursor position
                input.addEventListener('input', function(e) {
                    try {
                        // Store cursor position before formatting
                        const cursorPosition = this.selectionStart;
                        const oldValue = this.value;
                        
                        let value = this.value.replace(/,/g, '');
                        value = value.replace(/[^\d]/g, '');
                        
                        if (value.length > 12) {
                            value = value.substring(0, 12);
                        }

                        if (value && value !== '0') {
                            const formatted = formatMortgageNumber(value);
                            
                            // Better cursor position calculation
                            const oldValueBeforeCursor = oldValue.substring(0, cursorPosition);
                            const digitsBeforeCursor = (oldValueBeforeCursor.match(/\d/g) || []).length;
                            
                            let newCursorPosition = 0;
                            let digitCount = 0;
                            
                            for (let i = 0; i < formatted.length; i++) {
                                if (/\d/.test(formatted[i])) {
                                    digitCount++;
                                    if (digitCount > digitsBeforeCursor) {
                                        newCursorPosition = i;
                                        break;
                                    }
                                }
                                newCursorPosition = i + 1;
                            }
                            
                            this.value = formatted;
                            this.setSelectionRange(newCursorPosition, newCursorPosition);
                            
                            // Update helper text
                            updateUSDHelperText(inputConfig.helperId, parseFloat(value));
                        } else {
                            this.value = '';
                            updateUSDHelperText(inputConfig.helperId, 0);
                        }
                    } catch (error) {
                        console.error('Error in input handler:', error);
                    }
                });

                input.addEventListener('blur', function(e) {
                    try {
                        let value = this.value.replace(/,/g, '');
                        if (value && !isNaN(value) && value !== '0') {
                            const formatted = formatMortgageNumber(value);
                            this.value = formatted;
                            updateUSDHelperText(inputConfig.helperId, parseFloat(value));
                        } else if (value === '' || value === '0') {
                            this.value = '';
                            updateUSDHelperText(inputConfig.helperId, 0);
                        }
                    } catch (error) {
                        console.error('Error in blur handler:', error);
                    }
                });
            });
            
            // Down payment synchronization for US with auto-update
            const homePrice = document.getElementById('homePrice');
            const downPayment = document.getElementById('downPayment');
            const downPaymentPercent = document.getElementById('downPaymentPercent');
            
            // Track if user has manually changed the down payment percentage
            let userModifiedDownPaymentPercent = false;
            
            if (homePrice && downPayment && downPaymentPercent) {
                // Auto-update down payment when home price changes (if user hasn't manually set percentage)
                homePrice.addEventListener('input', function() {
                    try {
                        if (!userModifiedDownPaymentPercent) {
                            const price = parseFloat(this.value.replace(/,/g, '')) || 0;
                            if (price > 0) {
                                const defaultPercent = 20; // Default 20%
                                const payment = roundCurrency((price * defaultPercent) / 100);
                                downPayment.value = formatMortgageNumber(payment.toFixed(2));
                                downPaymentPercent.value = defaultPercent.toFixed(1);
                                updateUSDHelperText('downPayment', payment);
                            }
                        }
                        // Check mortgage insurance requirement
                        updateMortgageInsuranceStatus();
                    } catch (error) {
                        console.error('Error in home price input handler:', error);
                    }
                });
                
                homePrice.addEventListener('blur', function() {
                    try {
                        if (!userModifiedDownPaymentPercent) {
                            const price = parseFloat(this.value.replace(/,/g, '')) || 0;
                            if (price > 0) {
                                const defaultPercent = 20; // Default 20%
                                const payment = roundCurrency((price * defaultPercent) / 100);
                                downPayment.value = formatMortgageNumber(payment.toFixed(2));
                                downPaymentPercent.value = defaultPercent.toFixed(1);
                                updateUSDHelperText('downPayment', payment);
                            }
                        }
                    } catch (error) {
                        console.error('Error in home price blur handler:', error);
                    }
                });
                
                // Update percentage when down payment amount changes
                downPayment.addEventListener('blur', function() {
                    try {
                        const price = parseFloat(homePrice.value.replace(/,/g, '')) || 0;
                        const payment = parseFloat(this.value.replace(/,/g, '')) || 0;
                        if (price > 0) {
                            const percent = roundCurrency((payment / price) * 100);
                            downPaymentPercent.value = percent.toFixed(1);
                            // Mark as user-modified if they changed the amount manually
                            userModifiedDownPaymentPercent = true;
                        }
                        // Check mortgage insurance requirement
                        updateMortgageInsuranceStatus();
                    } catch (error) {
                        console.error('Error in down payment blur handler:', error);
                    }
                });
                
                // Update amount when percentage changes and mark as user-modified
                downPaymentPercent.addEventListener('input', function() {
                    try {
                        const price = parseFloat(homePrice.value.replace(/,/g, '')) || 0;
                        const percent = parseFloat(this.value) || 0;
                        if (price > 0) {
                            const payment = roundCurrency((price * percent) / 100);
                            downPayment.value = formatMortgageNumber(payment.toFixed(2));
                            updateUSDHelperText('downPayment', payment);
                            // Mark as user-modified when they change percentage
                            userModifiedDownPaymentPercent = true;
                        }
                        // Check mortgage insurance requirement
                        updateMortgageInsuranceStatus();
                    } catch (error) {
                        console.error('Error in down payment percent handler:', error);
                    }
                });
                
                // Reset auto-update flag when percentage is set back to 20%
                downPaymentPercent.addEventListener('blur', function() {
                    try {
                        const percent = parseFloat(this.value) || 0;
                        if (Math.abs(percent - 20) < 0.1) { // If very close to 20%
                            userModifiedDownPaymentPercent = false;
                        }
                    } catch (error) {
                        console.error('Error in down payment percent blur handler:', error);
                    }
                });
            }
            
            // Property tax synchronization
            const propertyTax = document.getElementById('propertyTax');
            const propertyTaxPercent = document.getElementById('propertyTaxPercent');
            
            if (homePrice && propertyTax && propertyTaxPercent) {
                // Update property tax when home price changes
                homePrice.addEventListener('input', function() {
                    try {
                        const price = parseFloat(this.value.replace(/,/g, '')) || 0;
                        const percent = parseFloat(propertyTaxPercent.value) || 1.2;
                        if (price > 0) {
                            const tax = (price * percent) / 100;
                            propertyTax.value = formatMortgageNumber(tax.toString());
                            updateUSDHelperText('propertyTax', tax);
                        }
                    } catch (error) {
                        console.error('Error in property tax calculation:', error);
                    }
                });
                
                homePrice.addEventListener('blur', function() {
                    try {
                        const price = parseFloat(this.value.replace(/,/g, '')) || 0;
                        const percent = parseFloat(propertyTaxPercent.value) || 1.2;
                        if (price > 0) {
                            const tax = (price * percent) / 100;
                            propertyTax.value = formatMortgageNumber(tax.toString());
                            updateUSDHelperText('propertyTax', tax);
                        }
                    } catch (error) {
                        console.error('Error in property tax calculation:', error);
                    }
                });
                
                // Update percentage when property tax amount changes
                propertyTax.addEventListener('blur', function() {
                    try {
                        const price = parseFloat(homePrice.value.replace(/,/g, '')) || 0;
                        const tax = parseFloat(this.value.replace(/,/g, '')) || 0;
                        if (price > 0) {
                            const percent = (tax / price) * 100;
                            propertyTaxPercent.value = percent.toFixed(2);
                        }
                    } catch (error) {
                        console.error('Error in property tax percent calculation:', error);
                    }
                });
                
                // Update amount when percentage changes
                propertyTaxPercent.addEventListener('input', function() {
                    try {
                        const price = parseFloat(homePrice.value.replace(/,/g, '')) || 0;
                        const percent = parseFloat(this.value) || 0;
                        if (price > 0) {
                            const tax = (price * percent) / 100;
                            propertyTax.value = formatMortgageNumber(tax.toString());
                            updateUSDHelperText('propertyTax', tax);
                        }
                    } catch (error) {
                        console.error('Error in property tax amount calculation:', error);
                    }
                });
            }
            
            // Indian slider synchronization and input handling
            const loanAmountSlider = document.getElementById('loanAmountSlider');
            const loanAmountInput = document.getElementById('loanAmountInput');
            const interestRateSlider = document.getElementById('interestRateSlider');
            const interestRateInput = document.getElementById('interestRateInput');
            const loanTermSlider = document.getElementById('loanTermSlider');
            const loanTermInput = document.getElementById('loanTermInput');
            
            if (loanAmountSlider && loanAmountInput) {
                // Slider to input synchronization
                loanAmountSlider.addEventListener('input', function() {
                    try {
                        const formattedValue = formatMortgageNumber(this.value);
                        loanAmountInput.value = formattedValue;
                        updateLoanAmountWords(parseFloat(this.value));
                    } catch (error) {
                        console.error('Error in loan amount slider handler:', error);
                    }
                });
                
                // Input field handling with cursor position
                loanAmountInput.addEventListener('input', function(e) {
                    try {
                        // Store cursor position before formatting
                        const cursorPosition = this.selectionStart;
                        const oldValue = this.value;
                        
                        // Remove all non-digit characters
                        let value = this.value.replace(/[^\d]/g, '');
                        
                        // Limit to maximum value (5 crores = 50,000,000)
                        if (value.length > 8) {
                            value = value.substring(0, 8);
                        }
                        
                        // Minimum value check (1 lac = 100,000)
                        const numValue = parseInt(value) || 0;
                        if (numValue < 100000 && value.length >= 6) {
                            value = '100000';
                        } else if (numValue > 50000000) {
                            value = '50000000';
                        }
                        
                        if (value && value !== '0') {
                            const formatted = formatMortgageNumber(value);
                            
                            // Better cursor position calculation
                            const oldValueBeforeCursor = oldValue.substring(0, cursorPosition);
                            const digitsBeforeCursor = (oldValueBeforeCursor.match(/\d/g) || []).length;
                            
                            let newCursorPosition = 0;
                            let digitCount = 0;
                            
                            for (let i = 0; i < formatted.length; i++) {
                                if (/\d/.test(formatted[i])) {
                                    digitCount++;
                                    if (digitCount > digitsBeforeCursor) {
                                        newCursorPosition = i;
                                        break;
                                    }
                                }
                                newCursorPosition = i + 1;
                            }
                            
                            this.value = formatted;
                            this.setSelectionRange(newCursorPosition, newCursorPosition);
                            
                            // Update slider and words
                            loanAmountSlider.value = value;
                            updateLoanAmountWords(parseFloat(value));
                        } else {
                            this.value = '';
                            loanAmountSlider.value = loanAmountSlider.min;
                            updateLoanAmountWords(0);
                        }
                    } catch (error) {
                        console.error('Error in loan amount input handler:', error);
                    }
                });

                loanAmountInput.addEventListener('blur', function(e) {
                    try {
                        let value = this.value.replace(/,/g, '');
                        const numValue = parseInt(value) || 0;
                        
                        // Ensure minimum value
                        if (numValue < 100000 && numValue > 0) {
                            value = '100000';
                            this.value = formatMortgageNumber(value);
                            loanAmountSlider.value = value;
                            updateLoanAmountWords(parseFloat(value));
                        } else if (numValue === 0) {
                            // Reset to default if empty
                            const defaultValue = mortgageCurrencyConfig.INR.defaults.loanAmount;
                            this.value = formatMortgageNumber(defaultValue);
                            loanAmountSlider.value = defaultValue;
                            updateLoanAmountWords(parseFloat(defaultValue));
                        }
                    } catch (error) {
                        console.error('Error in loan amount blur handler:', error);
                    }
                });
            }
            
            if (interestRateSlider && interestRateInput) {
                interestRateSlider.addEventListener('input', function() {
                    interestRateInput.value = this.value;
                });
                
                interestRateInput.addEventListener('input', function() {
                    interestRateSlider.value = this.value;
                });
            }
            
            if (loanTermSlider && loanTermInput) {
                loanTermSlider.addEventListener('input', function() {
                    loanTermInput.value = this.value;
                });
                
                loanTermInput.addEventListener('input', function() {
                    loanTermSlider.value = this.value;
                });
            }
        } catch (error) {
            console.error('Error setting up mortgage input validation:', error);
        }
    }
    
    // Helper function to round currency values to 2 decimal places
    function roundCurrency(value) {
        return Math.round(value * 100) / 100;
    }
    
    // Format currency with exactly 2 decimal places and proper comma formatting
    function formatCurrencyInput(value) {
        const rounded = roundCurrency(parseFloat(value) || 0);
        return formatMortgageNumber(rounded.toFixed(2));
    }
    
    // Update mortgage insurance status based on down payment percentage
    function updateMortgageInsuranceStatus() {
        try {
            const homePrice = document.getElementById('homePrice');
            const downPaymentPercent = document.getElementById('downPaymentPercent');
            const includeMortgageInsuranceEl = document.getElementById('includeMortgageInsurance');
            const mortgageInsuranceInput = document.getElementById('mortgageInsuranceInput');
            
            if (homePrice && downPaymentPercent && includeMortgageInsuranceEl && mortgageInsuranceInput) {
                const price = parseFloat(homePrice.value.replace(/,/g, '')) || 0;
                const percent = parseFloat(downPaymentPercent.value) || 0;
                
                // Auto-check mortgage insurance if down payment < 20%
                if (percent < 20) {
                    includeMortgageInsuranceEl.checked = true;
                    
                    // Calculate and display mortgage insurance amount
                    if (price > 0) {
                        const loanAmount = price - (price * percent / 100);
                        const annualMortgageInsurance = loanAmount * 0.005; // 0.5% annually
                        const monthlyMortgageInsurance = roundCurrency(annualMortgageInsurance / 12);
                        
                        mortgageInsuranceInput.value = formatCurrencyInput(monthlyMortgageInsurance);
                        updateUSDHelperText('mortgageInsurance', monthlyMortgageInsurance);
                    }
                } else {
                    // Auto-uncheck if down payment >= 20%
                    includeMortgageInsuranceEl.checked = false;
                    mortgageInsuranceInput.value = '0';
                    updateUSDHelperText('mortgageInsurance', 0);
                }
            }
        } catch (error) {
            console.error('Error updating mortgage insurance status:', error);
        }
    }
    
    // Initialize mortgage calculator
    // Initialize mortgage calculator - improved with element checking
    function initializeMortgageCalculator() {
        try {
            Logger.debug('Initializing mortgage calculator...');
            
            // Sync with main currency selector
            const mainCurrencySelector = document.getElementById('currencySelector');
            const currentCurrency = mainCurrencySelector ? mainCurrencySelector.value : 'USD';
            
            setupMortgageInputValidation();
            setMortgageCurrency(currentCurrency); // Use the main currency selector value
            updateMortgageInsuranceStatus();
            hideMortgageResults();
            
            // Listen to main currency selector changes
            if (mainCurrencySelector) {
                // Add event listener to sync mortgage calculator when main currency changes
                mainCurrencySelector.addEventListener('change', function() {
                    setMortgageCurrency(this.value);
                });
                Logger.debug('Synced with main currency selector');
            }
            
            // Setup utilities checkbox functionality
            const includeUtilitiesCheckbox = document.getElementById('includeUtilities');
            const utilitiesGrid = document.getElementById('utilitiesGrid');
            const utilitiesStatus = document.querySelector('.utilities-status');
            
            if (includeUtilitiesCheckbox && utilitiesGrid && utilitiesStatus) {
                // Set initial state
                if (includeUtilitiesCheckbox.checked) {
                    utilitiesGrid.style.display = 'grid';
                    utilitiesStatus.textContent = 'Included';
                    utilitiesStatus.style.color = 'var(--color-primary)';
                } else {
                    utilitiesGrid.style.display = 'none';
                    utilitiesStatus.textContent = 'Not included';
                    utilitiesStatus.style.color = 'var(--color-text-muted)';
                }
                
                includeUtilitiesCheckbox.addEventListener('change', function() {
                    if (this.checked) {
                        utilitiesGrid.style.display = 'grid';
                        utilitiesStatus.textContent = 'Included';
                        utilitiesStatus.style.color = 'var(--color-primary)';
                        
                        // Set default utility values when checkbox is checked
                        const config = getCurrentMortgageCurrencyConfig();
                        if (config.defaults.utilities) {
                            const waterSewerInput = document.getElementById('waterSewer');
                            const gasInput = document.getElementById('gas');
                            const internetInput = document.getElementById('internet');
                            const electricInput = document.getElementById('electric');
                            
                            if (waterSewerInput && waterSewerInput.value === '0') {
                                waterSewerInput.value = config.defaults.utilities.waterSewer;
                            }
                            if (gasInput && gasInput.value === '0') {
                                gasInput.value = config.defaults.utilities.gas;
                            }
                            if (internetInput && internetInput.value === '0') {
                                internetInput.value = config.defaults.utilities.internet;
                            }
                            if (electricInput && electricInput.value === '0') {
                                electricInput.value = config.defaults.utilities.electric;
                            }
                        }
                    } else {
                        utilitiesGrid.style.display = 'none';
                        utilitiesStatus.textContent = 'Not included';
                        utilitiesStatus.style.color = 'var(--color-text-muted)';
                    }
                });
            }
            
            // Force initial helper text update
            setTimeout(() => {
                if (currentMortgageCurrency === 'USD') {
                    const usCurrencyInputs = [
                        { id: 'homePrice', helperId: 'homePrice' },
                        { id: 'downPayment', helperId: 'downPayment' },
                        { id: 'propertyTax', helperId: 'propertyTax' },
                        { id: 'homeInsurance', helperId: 'homeInsurance' },
                        { id: 'hoaDues', helperId: 'hoaDues' },
                        { id: 'maintenance', helperId: 'maintenance' }
                    ];
                    
                    usCurrencyInputs.forEach(inputConfig => {
                        const input = document.getElementById(inputConfig.id);
                        if (input && input.value) {
                            const value = parseFloat(input.value.replace(/,/g, '')) || 0;
                            updateUSDHelperText(inputConfig.helperId, value);
                        }
                    });
                }
            }, 200);
        } catch (error) {
            Logger.error('Error initializing mortgage calculator:', error);
        }
    }
    
    // Separate currency change handler for better debugging
    function handleCurrencyChange(event) {
        try {
            Logger.debug('Currency change event triggered:', event.target.value);
            setMortgageCurrency(event.target.value);
        } catch (error) {
            Logger.error('Error handling currency change:', error);
        }
    }
    
    // Initialize when DOM is ready - improved initialization
    function safeInitialize() {
        try {
            // Wait a bit for DOM to be fully ready after dynamic loading
            setTimeout(() => {
                initializeMortgageCalculator();
            }, 100);
        } catch (error) {
            Logger.error('Error during mortgage calculator initialization:', error);
            // Retry once after a longer delay
            setTimeout(() => {
                try {
                    initializeMortgageCalculator();
                } catch (retryError) {
                    Logger.error('Retry failed for mortgage calculator:', retryError);
                }
            }, 500);
        }
    }
    
    // Multiple initialization strategies to handle different loading scenarios
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', safeInitialize);
    } else if (document.readyState === 'interactive' || document.readyState === 'complete') {
        safeInitialize();
    }
    
    // Also initialize immediately if elements are already present (for dynamic loading)
    if (document.getElementById('usMortgageCalculator') || document.getElementById('indianMortgageCalculator')) {
        safeInitialize();
    }
    
    // Expose initialization function globally for manual triggering if needed
    window.initializeMortgageCalculator = initializeMortgageCalculator;

})();