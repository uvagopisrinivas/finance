// Multi-Currency Investment Calculators - Main File with Shared Utilities
(function(){
    
    // Global currency state
    let currentCurrency = 'INR'; // Default to INR
    
    // Make currentCurrency globally accessible
    window.currentCurrency = currentCurrency;
    
    // Currency configuration
    const currencyConfig = {
        'INR': {
            symbol: '₹',
            locale: 'en-IN',
            name: 'Indian Rupee',
            largeUnits: [
                { value: 10000000, name: 'Cr', fullName: 'Crore' },
                { value: 100000, name: 'Lacs', fullName: 'Lac' },
                { value: 1000, name: 'K', fullName: 'Thousand' }
            ],
            numberSystem: 'indian', // Uses Indian comma system (x,xx,xxx)
            defaults: {
                sipAmount: '25000',
                swpTotalInvestment: '500000',
                swpWithdrawal: '10000',
                swpTaxRate: '10',
                lumpsumAmount: '25000',
                lumpsumTimePeriod: '10',
                retirementMonthlySavings: '270000',
                retirementMonthlyExpenses: '160000',
                retirementCurrentCorpus: '40000000',
                goalAmount: '500000'
            },
            taxHints: {
                swpTaxRate: 'LTCG: 10%, STCG: 15-30%'
            }
        },
        'USD': {
            symbol: '$',
            locale: 'en-US',
            name: 'US Dollar',
            largeUnits: [
                { value: 1000000000000, name: 'T', fullName: 'Trillion' },
                { value: 1000000000, name: 'B', fullName: 'Billion' },
                { value: 1000000, name: 'M', fullName: 'Million' },
                { value: 1000, name: 'K', fullName: 'Thousand' }
            ],
            numberSystem: 'western', // Uses Western comma system (xxx,xxx)
            defaults: {
                sipAmount: '3000',
                swpTotalInvestment: '1000000',
                swpWithdrawal: '3000',
                swpTaxRate: '30',
                lumpsumAmount: '500000',
                lumpsumTimePeriod: '30',
                retirementMonthlySavings: '3000',
                retirementMonthlyExpenses: '3000',
                retirementCurrentCorpus: '500000',
                goalAmount: '20000'
            },
            taxHints: {
                swpTaxRate: 'LTCG: 15-20%, STCG: 22-37%'
            }
        }
    };
    
    // Get current currency configuration
    function getCurrentCurrencyConfig() {
        return currencyConfig[currentCurrency] || currencyConfig['INR'];
    }
    
    // Set currency and update UI
    window.setCurrency = function(currency) {
        if (currencyConfig[currency]) {
            currentCurrency = currency;
            window.currentCurrency = currency; // Update global reference
            
            // Update currency selector if it exists
            const selector = document.getElementById('currencySelector');
            if (selector) {
                selector.value = currency;
            }
            
            // Apply currency-specific defaults
            applyCurrencyDefaults();
            
            // Update all currency labels in the UI
            updateCurrencyLabels();
            
            // Update tax hints
            updateTaxHints();
            
            // Reformat all existing input values
            reformatAllInputs();
            
            // Update any existing results
            updateExistingResults();
            
            // Update goals section if in retirement calculator
            updateGoalsSection();
            
            // Update expenses calculator if available
            if (window.updateExpensesCurrency) {
                window.updateExpensesCurrency();
            }
            
            Logger.debug('Currency changed to:', currency);
        }
    };
    
    // Apply currency-specific default values
    function applyCurrencyDefaults() {
        const config = getCurrentCurrencyConfig();
        const defaults = config.defaults;
        
        // Update input values with currency-specific defaults
        const inputMappings = {
            'sipAmount': defaults.sipAmount,
            'swpTotalInvestment': defaults.swpTotalInvestment,
            'swpWithdrawal': defaults.swpWithdrawal,
            'swpTaxRate': defaults.swpTaxRate,
            'lumpsumAmount': defaults.lumpsumAmount,
            'lumpsumTimePeriod': defaults.lumpsumTimePeriod,
            'retirementMonthlySavings': defaults.retirementMonthlySavings,
            'retirementMonthlyExpenses': defaults.retirementMonthlyExpenses,
            'retirementCurrentCorpus': defaults.retirementCurrentCorpus
        };
        
        Object.entries(inputMappings).forEach(([inputId, defaultValue]) => {
            const input = document.getElementById(inputId);
            if (input) {
                // For currency inputs, format the number
                if (inputId.includes('Amount') || inputId.includes('Investment') || inputId.includes('Withdrawal') || inputId.includes('Savings') || inputId.includes('Expenses') || inputId.includes('Corpus')) {
                    const formatted = formatNumber(defaultValue);
                    input.value = formatted;
                    updateHelperText(input, formatted);
                } else {
                    input.value = defaultValue;
                }
            }
        });
    }
    
    // Update tax hints based on currency
    function updateTaxHints() {
        const config = getCurrentCurrencyConfig();
        const taxHints = config.taxHints;
        
        // Update SWP tax rate hint
        const swpTaxHint = document.querySelector('#swpTaxRate + .form-hint');
        if (swpTaxHint && taxHints.swpTaxRate) {
            swpTaxHint.textContent = taxHints.swpTaxRate;
        }
    }
    
    // Update goals section with currency-specific defaults
    function updateGoalsSection() {
        const config = getCurrentCurrencyConfig();
        
        // Check if we're in the retirement calculator
        const retirementSection = document.getElementById('retirementCalculator');
        if (retirementSection && retirementSection.classList.contains('active')) {
            // Reinitialize goals with currency-appropriate defaults
            if (window.reinitializeGoals) {
                window.reinitializeGoals();
            }
        }
        
        // Update existing goal amount inputs
        const goalAmountInputs = document.querySelectorAll('.goal-amount-input');
        goalAmountInputs.forEach(input => {
            if (input.value) {
                // Extract numeric value and reformat
                const numericValue = input.value.replace(/[^\d]/g, '');
                if (numericValue) {
                    const formatted = formatNumber(numericValue);
                    input.value = formatted;
                    updateHelperText(input, formatted);
                }
            }
        });
        
        // Update goal amount labels
        document.querySelectorAll('label').forEach(label => {
            if (label.textContent.includes('Amount (') && (label.textContent.includes('₹') || label.textContent.includes('$'))) {
                label.textContent = `Amount (${config.symbol})`;
            }
        });
    }
    
    // Update currency labels throughout the UI
    function updateCurrencyLabels() {
        const config = getCurrentCurrencyConfig();
        const symbol = config.symbol;
        
        // Update all labels that contain currency symbols
        document.querySelectorAll('label, .form-hint, .summary-label, th').forEach(element => {
            let text = element.textContent;
            // Replace ₹ with current symbol
            if (text.includes('₹')) {
                element.textContent = text.replace(/₹/g, symbol);
            }
            // Replace $ with current symbol  
            if (text.includes('$')) {
                element.textContent = text.replace(/\$/g, symbol);
            }
        });
        
        // Update placeholder text
        document.querySelectorAll('input[placeholder]').forEach(input => {
            let placeholder = input.placeholder;
            if (placeholder.includes('₹')) {
                input.placeholder = placeholder.replace(/₹/g, symbol);
            }
            if (placeholder.includes('$')) {
                input.placeholder = placeholder.replace(/\$/g, symbol);
            }
        });
    }
    
    // Reformat all input values when currency changes
    function reformatAllInputs() {
        const currencyInputs = document.querySelectorAll('#sipAmount, #swpTotalInvestment, #swpWithdrawal, #lumpsumAmount, #retirementMonthlySavings, #retirementCurrentCorpus, #retirementMonthlyExpenses, .goal-amount-input');
        
        currencyInputs.forEach(input => {
            if (input.value && input.value.trim() !== '') {
                // Extract numeric value
                const numericValue = input.value.replace(/[^\d]/g, '');
                if (numericValue) {
                    const formatted = formatNumber(numericValue);
                    input.value = formatted;
                    updateHelperText(input, formatted);
                }
            }
        });
    }
    
    // Update existing calculation results when currency changes
    function updateExistingResults() {
        // Hide all result sections when currency changes
        // User must recalculate to see results in the new currency
        const resultSections = [
            'sipResults',
            'swpResults', 
            'lumpsumResults',
            'retirementResults',
            'expensesResults'
        ];
        
        resultSections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'none';
            }
        });
        
        Logger.debug('Currency changed - results hidden. Please recalculate to see results in new currency.');
    }
    
    // Generic currency formatting function
    function formatCurrency(num) {
        const config = getCurrentCurrencyConfig();
        
        // Handle NaN, null, undefined values
        if (isNaN(num) || num === null || num === undefined) {
            return config.symbol + '0';
        }
        
        return new Intl.NumberFormat(config.locale, {
            style: 'currency',
            currency: currentCurrency,
            maximumFractionDigits: 0
        }).format(num);
    }

    function formatCurrencyDetailed(num) {
        const config = getCurrentCurrencyConfig();
        
        // Handle NaN, null, undefined values
        if (isNaN(num) || num === null || num === undefined) {
            return config.symbol + '0.00';
        }
        
        return new Intl.NumberFormat(config.locale, {
            style: 'currency',
            currency: currentCurrency,
            maximumFractionDigits: 2
        }).format(num);
    }

    // Enhanced currency formatting with readable suffixes
    function formatCurrencyReadable(num) {
        const config = getCurrentCurrencyConfig();
        
        // Handle NaN, null, undefined values
        if (isNaN(num) || num === null || num === undefined) {
            return config.symbol + '0';
        }
        
        const basicFormat = formatCurrency(num);
        let suffix = '';
        
        // Find appropriate unit
        for (const unit of config.largeUnits) {
            if (num >= unit.value) {
                const unitValue = num / unit.value;
                suffix = ` (${unitValue.toFixed(2)} ${unit.name})`;
                break;
            }
        }
        
        return basicFormat + suffix;
    }

    // Legacy function names for backward compatibility
    window.formatINR = formatCurrency;
    window.formatINRDetailed = formatCurrencyDetailed;
    window.formatINRReadable = formatCurrencyReadable;

    function formatPercent(num) {
        return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num / 100);
    }

    // Calculator switching functionality
    window.switchCalculator = function(calculatorType) {
        Logger.debug('Switching to calculator:', calculatorType);
        
        // Handle mortgage calculator loading
        if (calculatorType === 'mortgage') {
            const mortgageSection = document.getElementById('mortgageCalculator');
            if (mortgageSection && !mortgageSection.dataset.loaded) {
                Logger.debug('Loading mortgage calculator HTML...');
                fetch('src/mortgage/mortgage_widget.html')
                    .then(r => r.text())
                    .then(html => {
                        mortgageSection.innerHTML = html;
                        mortgageSection.dataset.loaded = 'true';
                        Logger.debug('Mortgage calculator HTML loaded');
                        
                        // Initialize mortgage calculator if function exists
                        if (window.initializeMortgageCalculator) {
                            setTimeout(() => {
                                window.initializeMortgageCalculator();
                                
                                // Ensure correct currency is set after initialization
                                const mainCurrencySelector = document.getElementById('currencySelector');
                                if (mainCurrencySelector && window.setMortgageCurrency) {
                                    window.setMortgageCurrency(mainCurrencySelector.value);
                                    Logger.debug('Mortgage currency synced to:', mainCurrencySelector.value);
                                }
                                
                                Logger.debug('Mortgage calculator initialized');
                            }, 100);
                        }
                    })
                    .catch(err => {
                        Logger.error('Failed to load mortgage calculator:', err);
                    });
            } else if (mortgageSection && mortgageSection.dataset.loaded) {
                // Already loaded, just sync currency
                const mainCurrencySelector = document.getElementById('currencySelector');
                if (mainCurrencySelector && window.setMortgageCurrency) {
                    window.setMortgageCurrency(mainCurrencySelector.value);
                    Logger.debug('Mortgage currency re-synced to:', mainCurrencySelector.value);
                }
            }
        }
        
        // Update tab states
        document.querySelectorAll('.calculator-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-calculator="${calculatorType}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            Logger.debug('Active tab set for:', calculatorType);
        } else {
            Logger.error('Tab not found for:', calculatorType);
        }

        // Update calculator sections
        document.querySelectorAll('.calculator-section').forEach(section => {
            section.classList.remove('active');
        });
        const activeSection = document.getElementById(`${calculatorType}Calculator`);
        if (activeSection) {
            activeSection.classList.add('active');
            Logger.debug('Active section set for:', calculatorType);
        } else {
            Logger.error('Section not found for:', calculatorType + 'Calculator');
        }
    };

    // Legacy function name for backward compatibility
    window.switchIndianCalculator = window.switchCalculator;
    // Number to words conversion for multiple numbering systems
    function numberToWords(num) {
        const config = getCurrentCurrencyConfig();
        
        if (num === 0 || isNaN(num) || num === null || num === undefined) {
            return 'Zero';
        }
        
        // Convert to integer to avoid decimal issues
        num = Math.floor(Math.abs(num));
        
        if (config.numberSystem === 'indian') {
            return numberToIndianWords(num);
        } else {
            return numberToWesternWords(num);
        }
    }

    // Indian numbering system (Crore, Lac, Thousand)
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
        
        let result = '';
        
        // Handle very large numbers (Lakh Crore and above)
        if (num >= 1000000000000) {
            const lakhCrores = Math.floor(num / 1000000000000);
            result += convertHundreds(lakhCrores) + ' Lakh Crore';
            num %= 1000000000000;
            if (num > 0) result += ' ';
        }
        
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

    // Western numbering system (Trillion, Billion, Million, Thousand)
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

    // Format number with appropriate comma system
    function formatNumber(num) {
        const config = getCurrentCurrencyConfig();
        
        if (isNaN(num) || num === '' || num === '0') return num.toString();
        
        if (config.numberSystem === 'indian') {
            return formatIndianNumber(num);
        } else {
            return formatWesternNumber(num);
        }
    }

    // Format number with Indian comma system (handles up to 15 digits)
    function formatIndianNumber(num) {
        if (isNaN(num) || num === '' || num === '0') return num.toString();
        
        const numStr = num.toString();
        const parts = numStr.split('.');
        let integerPart = parts[0];
        const decimalPart = parts[1] ? '.' + parts[1] : '';
        
        // Indian numbering system: first comma after 3 digits from right, then every 2 digits
        if (integerPart.length > 3) {
            // Start from the right
            const lastThree = integerPart.slice(-3);
            let remaining = integerPart.slice(0, -3);
            
            // Add commas every 2 digits for the remaining part
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
        
        return integerPart + decimalPart;
    }

    // Format number with Western comma system (every 3 digits)
    function formatWesternNumber(num) {
        if (isNaN(num) || num === '' || num === '0') return num.toString();
        
        const numStr = num.toString();
        const parts = numStr.split('.');
        let integerPart = parts[0];
        const decimalPart = parts[1] ? '.' + parts[1] : '';
        
        // Western numbering system: comma every 3 digits from right
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        return integerPart + decimalPart;
    }

    // Legacy function names for backward compatibility
    window.formatIndianNumber = formatNumber;
    window.numberToIndianWords = numberToWords;

    // Create or update helper text element
    function updateHelperText(input, value) {
        const cleanValue = value.replace(/,/g, '');
        const numValue = parseFloat(cleanValue);
        
        if (isNaN(numValue) || numValue === 0) {
            removeHelperText(input);
            return;
        }
        
        let helperId = input.id + 'Helper';
        // If input doesn't have an ID, create one based on its position
        if (!input.id) {
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000);
            input.id = `input_${timestamp}_${random}`;
            helperId = input.id + 'Helper';
        }
        
        let helper = document.getElementById(helperId);
        
        if (!helper) {
            helper = document.createElement('div');
            helper.id = helperId;
            helper.className = 'number-helper-text';
            helper.style.cssText = `
                font-size: 0.75rem;
                color: #6b7280;
                margin-top: 0.25rem;
                font-style: italic;
                line-height: 1.2;
                word-wrap: break-word;
            `;
            
            // Insert after the input's parent form-group or directly after input
            const formGroup = input.closest('.form-group');
            if (formGroup) {
                formGroup.appendChild(helper);
            } else {
                input.parentNode.insertBefore(helper, input.nextSibling);
            }
        }
        
        try {
            const words = numberToWords(Math.floor(numValue));
            
            if (words && words !== 'undefined' && words.trim() !== '' && !words.includes('undefined')) {
                helper.textContent = `(${words})`;
            } else {
                // Fallback to just showing the formatted number
                helper.textContent = `(${formatNumber(numValue)})`;
            }
        } catch (error) {
            Logger.error('Error converting number to words:', error);
            helper.textContent = `(${formatNumber(numValue)})`;
        }
    }

    // Remove helper text
    function removeHelperText(input) {
        if (!input.id) return; // Can't remove if no ID
        
        const helperId = input.id + 'Helper';
        const helper = document.getElementById(helperId);
        if (helper) {
            helper.remove();
        }
    }
    // Frequency handling functions
    function updateFrequencyLabels() {
        const config = getCurrentCurrencyConfig();
        const symbol = config.symbol;
        
        // Update SIP labels
        const sipFrequency = document.getElementById('sipFrequency');
        const sipAmountLabel = document.getElementById('sipAmountLabel');
        
        if (sipFrequency && sipAmountLabel) {
            const frequency = sipFrequency.value;
            const frequencyLabels = {
                'monthly': `Monthly Investment (${symbol})`,
                'quarterly': `Quarterly Investment (${symbol})`,
                'halfyearly': `Half-yearly Investment (${symbol})`,
                'yearly': `Yearly Investment (${symbol})`
            };
            sipAmountLabel.textContent = frequencyLabels[frequency];
        }
        
        // Update SWP labels
        const swpFrequency = document.getElementById('swpFrequency');
        const swpWithdrawalLabel = document.getElementById('swpWithdrawalLabel');
        
        if (swpFrequency && swpWithdrawalLabel) {
            const frequency = swpFrequency.value;
            const frequencyLabels = {
                'monthly': `Monthly Withdrawal (${symbol})`,
                'quarterly': `Quarterly Withdrawal (${symbol})`,
                'halfyearly': `Half-yearly Withdrawal (${symbol})`,
                'yearly': `Yearly Withdrawal (${symbol})`
            };
            swpWithdrawalLabel.textContent = frequencyLabels[frequency];
        }
    }

    function getFrequencyMultiplier(frequency) {
        const multipliers = {
            'monthly': 12,
            'quarterly': 4,
            'halfyearly': 2,
            'yearly': 1
        };
        return multipliers[frequency] || 12;
    }

    // Copy to clipboard functionality
    function copyToClipboard(text, element) {
        // Extract only the number part, remove currency symbol, commas, and everything in parentheses
        let cleanText = text.replace(/[₹$]/g, '').trim(); // Remove currency symbols
        
        // If there are parentheses, take only the part before them
        if (cleanText.includes('(')) {
            cleanText = cleanText.split('(')[0].trim();
        }
        
        // Remove all commas to get plain number
        cleanText = cleanText.replace(/,/g, '');
        
        if (navigator.clipboard && window.isSecureContext) {
            // Modern clipboard API
            navigator.clipboard.writeText(cleanText).then(() => {
                showCopyFeedback(element, 'Copied!');
            }).catch(() => {
                fallbackCopyToClipboard(cleanText, element);
            });
        } else {
            // Fallback for older browsers
            fallbackCopyToClipboard(cleanText, element);
        }
    }

    function fallbackCopyToClipboard(text, element) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            showCopyFeedback(element, 'Copied!');
        } catch (err) {
            showCopyFeedback(element, 'Copy failed');
        }
        
        document.body.removeChild(textArea);
    }

    function showCopyFeedback(element, message) {
        const originalTitle = element.title;
        const originalIcon = element.innerHTML;
        
        element.innerHTML = '<i class="fas fa-check"></i>';
        element.title = message;
        element.style.color = '#27ae60';
        
        setTimeout(() => {
            element.innerHTML = originalIcon;
            element.title = originalTitle;
            element.style.color = '';
        }, 1500);
    }

    // Add copy buttons to result values
    function addCopyButtons() {
        const resultElements = document.querySelectorAll('.summary-value');
        
        resultElements.forEach(element => {
            // Skip if copy button already exists
            if (element.parentElement.querySelector('.copy-btn')) return;
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.title = 'Copy to clipboard';
            copyBtn.setAttribute('aria-label', 'Copy value to clipboard');
            
            copyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Check if element has raw value in data attribute
                const rawValue = element.getAttribute('data-raw-value');
                if (rawValue) {
                    // Use raw value directly
                    if (navigator.clipboard && window.isSecureContext) {
                        navigator.clipboard.writeText(rawValue).then(() => {
                            showCopyFeedback(copyBtn, 'Copied!');
                        }).catch(() => {
                            fallbackCopyToClipboard(rawValue, copyBtn);
                        });
                    } else {
                        fallbackCopyToClipboard(rawValue, copyBtn);
                    }
                } else {
                    // Fallback to text content cleaning
                    copyToClipboard(element.textContent, copyBtn);
                }
            });
            
            // Insert the copy button after the summary value
            element.parentElement.style.position = 'relative';
            element.parentElement.appendChild(copyBtn);
        });
    }

    // Input validation and formatting
    function setupInputValidation() {
        // Get currency inputs (now text inputs with inputmode="numeric")
        const currencyInputs = document.querySelectorAll('#sipAmount, #swpTotalInvestment, #swpWithdrawal, #lumpsumAmount, #retirementMonthlySavings, #retirementCurrentCorpus, #retirementMonthlyExpenses, #expensesIncomeAmount');
        const percentageInputs = document.querySelectorAll('#sipReturnRate, #sipStepUp, #swpReturnRate, #swpTaxRate');
        const yearInputs = document.querySelectorAll('#sipTimePeriod, #swpTimePeriod, #lumpsumTimePeriod');
        
        // Setup frequency change listeners
        const sipFrequency = document.getElementById('sipFrequency');
        const swpFrequency = document.getElementById('swpFrequency');
        
        if (sipFrequency) {
            sipFrequency.addEventListener('change', updateFrequencyLabels);
        }
        
        if (swpFrequency) {
            swpFrequency.addEventListener('change', updateFrequencyLabels);
        }
        
        // Initialize labels
        updateFrequencyLabels();
        
        // Setup currency inputs with comma formatting and helper text
        currencyInputs.forEach(input => {
            // Remove any max length restrictions
            input.removeAttribute('maxlength');
            
            // Format initial value
            if (input.value) {
                const formatted = formatNumber(input.value);
                input.value = formatted;
                updateHelperText(input, formatted);
            }
            
            // Handle input events - more permissive for large numbers
            input.addEventListener('input', function(e) {
                // Store cursor position before formatting
                const cursorPosition = this.selectionStart;
                const oldValue = this.value;
                
                let value = this.value.replace(/,/g, ''); // Remove existing commas
                
                // Only allow numbers (no length restriction)
                value = value.replace(/[^\d]/g, '');
                
                // Allow very large numbers (up to 15 digits for thousands of crores)
                if (value.length > 15) {
                    value = value.substring(0, 15);
                }

                if (value && value !== '0') {
                    const formatted = formatNumber(value);
                    
                    // Better cursor position calculation
                    // Count digits before cursor in old value
                    const oldValueBeforeCursor = oldValue.substring(0, cursorPosition);
                    const digitsBeforeCursor = (oldValueBeforeCursor.match(/\d/g) || []).length;
                    
                    // Find position in new formatted value that has same number of digits before it
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
                    
                    // Restore cursor position
                    this.setSelectionRange(newCursorPosition, newCursorPosition);
                    
                    updateHelperText(this, formatted);
                } else {
                    this.value = '';
                    removeHelperText(this);
                }
            });

            // Handle focus events
            input.addEventListener('focus', function(e) {
                // Keep helper text visible, just remove commas for easier editing
                this.value = this.value.replace(/,/g, '');
            });

            // Handle blur events
            input.addEventListener('blur', function(e) {
                let value = this.value.replace(/,/g, '');
                
                if (value && !isNaN(value) && value !== '0') {
                    const formatted = formatNumber(value);
                    this.value = formatted;
                    updateHelperText(this, formatted);
                } else if (value === '' || value === '0') {
                    // Allow empty or zero values
                    this.value = '';
                    removeHelperText(this);
                }
            });

            // More permissive keypress handling
            input.addEventListener('keypress', function(e) {
                // Allow: backspace, delete, tab, escape, enter
                if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
                    (e.ctrlKey && [65, 67, 86, 88, 90].indexOf(e.keyCode) !== -1) ||
                    // Allow: home, end, left, right, up, down
                    (e.keyCode >= 35 && e.keyCode <= 40)) {
                    return;
                }
                // Only prevent if it's definitely not a number
                if (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            });

            // Handle paste events for large numbers
            input.addEventListener('paste', function(e) {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text');
                const cleanPaste = paste.replace(/[^\d]/g, '');
                if (cleanPaste && cleanPaste.length <= 15) {
                    const formatted = formatNumber(cleanPaste);
                    this.value = formatted;
                    updateHelperText(this, formatted);
                }
            });
        });

        // Setup percentage and year inputs (no comma formatting)
        [...percentageInputs, ...yearInputs].forEach(input => {
            input.addEventListener('keypress', function(e) {
                // Allow: backspace, delete, tab, escape, enter, decimal point
                if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
                    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                    (e.keyCode === 65 && e.ctrlKey === true) ||
                    (e.keyCode === 67 && e.ctrlKey === true) ||
                    (e.keyCode === 86 && e.ctrlKey === true) ||
                    (e.keyCode === 88 && e.ctrlKey === true) ||
                    // Allow: home, end, left, right
                    (e.keyCode >= 35 && e.keyCode <= 39)) {
                    return;
                }
                // Ensure that it is a number and stop the keypress
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            });

            input.addEventListener('input', function(e) {
                if (this.value < 0) {
                    this.value = 0;
                }
                
                // Enforce return rate ranges (10-15%)
                if (this.id.includes('ReturnRate')) {
                    if (this.value > 15) {
                        this.value = 15;
                    } else if (this.value < 10 && this.value !== '') {
                        this.value = 10;
                    }
                }
                
                // Tax rate validation (max 50%)
                if (this.id === 'swpTaxRate' && this.value > 50) {
                    this.value = 50;
                }
            });

            input.addEventListener('blur', function(e) {
                const value = parseFloat(this.value);
                if (isNaN(value) || value < 0) {
                    // Set default values based on input type
                    if (this.id.includes('ReturnRate')) {
                        this.value = '12';
                    } else {
                        this.value = this.getAttribute('value') || '0';
                    }
                }
                
                // Enforce return rate ranges on blur
                if (this.id.includes('ReturnRate')) {
                    if (value > 15) {
                        this.value = '15';
                    } else if (value < 10) {
                        this.value = '10';
                    }
                }
                
                if (this.id === 'swpTaxRate' && value > 50) {
                    this.value = '50';
                }
            });
        });

        // Auto-recalculate when active trading checkbox changes
        const activeTrading = document.getElementById('swpActiveTrading');
        if (activeTrading) {
            activeTrading.addEventListener('change', function() {
                setTimeout(() => {
                    if (typeof window.calculateSWP === 'function') {
                        window.calculateSWP();
                    }
                }, 100);
            });
        }
    }

    // Make utility functions globally available
    window.formatCurrency = formatCurrency;
    window.formatCurrencyDetailed = formatCurrencyDetailed;
    window.formatCurrencyReadable = formatCurrencyReadable;
    window.formatPercent = formatPercent;
    window.numberToWords = numberToWords;
    window.formatNumber = formatNumber;
    window.updateHelperText = updateHelperText;
    window.removeHelperText = removeHelperText;
    window.updateFrequencyLabels = updateFrequencyLabels;
    window.getFrequencyMultiplier = getFrequencyMultiplier;
    window.copyToClipboard = copyToClipboard;
    window.addCopyButtons = addCopyButtons;
    window.setupInputValidation = setupInputValidation;

    // Setup input validation when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setupInputValidation();
            // Initialize with default currency
            setCurrency('INR');
        });
    } else {
        setupInputValidation();
        // Initialize with default currency
        setCurrency('INR');
    }

})();