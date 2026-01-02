// Indian Investment Calculators - SIP, SWP, Lumpsum
(function(){
    
    // Utility functions for Indian Rupee formatting
    function formatINR(num) {
        // Handle NaN, null, undefined values
        if (isNaN(num) || num === null || num === undefined) {
            return '₹0';
        }
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(num);
    }

    function formatINRDetailed(num) {
        // Handle NaN, null, undefined values
        if (isNaN(num) || num === null || num === undefined) {
            return '₹0.00';
        }
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(num);
    }

    // Enhanced INR formatting with readable suffixes
    function formatINRReadable(num) {
        // Handle NaN, null, undefined values
        if (isNaN(num) || num === null || num === undefined) {
            return '₹0';
        }
        
        const basicFormat = formatINR(num);
        let suffix = '';
        
        if (num >= 10000000) { // 1 Crore or more
            const crores = num / 10000000;
            suffix = ` (${crores.toFixed(2)} Cr)`;
        } else if (num >= 100000) { // 1 Lac or more
            const lacs = num / 100000;
            suffix = ` (${lacs.toFixed(2)} Lacs)`;
        } else if (num >= 1000) { // 1 Thousand or more
            const thousands = num / 1000;
            suffix = ` (${thousands.toFixed(2)} K)`;
        }
        
        return basicFormat + suffix;
    }

    function formatPercent(num) {
        return new Intl.NumberFormat('en-IN', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num / 100);
    }

    // Calculator switching functionality
    window.switchIndianCalculator = function(calculatorType) {
        console.log('Switching to calculator:', calculatorType);
        
        // Update tab states
        document.querySelectorAll('.calculator-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-calculator="${calculatorType}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            console.log('Active tab set for:', calculatorType);
        } else {
            console.error('Tab not found for:', calculatorType);
        }

        // Update calculator sections
        document.querySelectorAll('.calculator-section').forEach(section => {
            section.classList.remove('active');
        });
        const activeSection = document.getElementById(`${calculatorType}Calculator`);
        if (activeSection) {
            activeSection.classList.add('active');
            console.log('Active section set for:', calculatorType);
        } else {
            console.error('Section not found for:', calculatorType + 'Calculator');
        }
    };

    // Number to words conversion for Indian numbering system (handles up to thousands of crores)
    function numberToIndianWords(num) {
        if (num === 0 || isNaN(num) || num === null || num === undefined) {
            return 'Zero';
        }
        
        // Convert to integer to avoid decimal issues
        num = Math.floor(Math.abs(num));
        
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
            const words = numberToIndianWords(Math.floor(numValue));
            
            if (words && words !== 'undefined' && words.trim() !== '' && !words.includes('undefined')) {
                helper.textContent = `(${words})`;
            } else {
                // Fallback to just showing the formatted number
                helper.textContent = `(${formatIndianNumber(numValue)})`;
            }
        } catch (error) {
            console.error('Error converting number to words:', error);
            helper.textContent = `(${formatIndianNumber(numValue)})`;
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
        // Update SIP labels
        const sipFrequency = document.getElementById('sipFrequency');
        const sipAmountLabel = document.getElementById('sipAmountLabel');
        
        if (sipFrequency && sipAmountLabel) {
            const frequency = sipFrequency.value;
            const frequencyLabels = {
                'monthly': 'Monthly Investment (₹)',
                'quarterly': 'Quarterly Investment (₹)',
                'halfyearly': 'Half-yearly Investment (₹)',
                'yearly': 'Yearly Investment (₹)'
            };
            sipAmountLabel.textContent = frequencyLabels[frequency];
        }
        
        // Update SWP labels
        const swpFrequency = document.getElementById('swpFrequency');
        const swpWithdrawalLabel = document.getElementById('swpWithdrawalLabel');
        
        if (swpFrequency && swpWithdrawalLabel) {
            const frequency = swpFrequency.value;
            const frequencyLabels = {
                'monthly': 'Monthly Withdrawal (₹)',
                'quarterly': 'Quarterly Withdrawal (₹)',
                'halfyearly': 'Half-yearly Withdrawal (₹)',
                'yearly': 'Yearly Withdrawal (₹)'
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

    // Input validation and formatting
    function setupInputValidation() {
        // Get currency inputs (now text inputs with inputmode="numeric")
        const currencyInputs = document.querySelectorAll('#sipAmount, #swpTotalInvestment, #swpWithdrawal, #lumpsumAmount');
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
                const formatted = formatIndianNumber(input.value);
                input.value = formatted;
                updateHelperText(input, formatted);
            }
            
            // Handle input events - more permissive for large numbers
            input.addEventListener('input', function(e) {
                let value = this.value.replace(/,/g, ''); // Remove existing commas
                
                // Only allow numbers (no length restriction)
                value = value.replace(/[^\d]/g, '');
                
                // Allow very large numbers (up to 15 digits for thousands of crores)
                if (value.length > 15) {
                    value = value.substring(0, 15);
                }
                
                if (value && value !== '0') {
                    const formatted = formatIndianNumber(value);
                    this.value = formatted;
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
                    const formatted = formatIndianNumber(value);
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
                    const formatted = formatIndianNumber(cleanPaste);
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

    // SIP Calculator
    window.calculateSIP = function() {
        try {
            const investmentAmount = parseFloat(document.getElementById('sipAmount').value.replace(/,/g, ''));
            const frequency = document.getElementById('sipFrequency').value;
            const annualRate = parseFloat(document.getElementById('sipReturnRate').value) / 100;
            const years = parseInt(document.getElementById('sipTimePeriod').value);
            const stepUpRate = parseFloat(document.getElementById('sipStepUp').value) / 100;

            if (isNaN(investmentAmount) || isNaN(annualRate) || isNaN(years) || investmentAmount <= 0 || annualRate < 0 || years <= 0) {
                throw new Error('Please enter valid positive values');
            }

            const frequencyMultiplier = getFrequencyMultiplier(frequency);
            const periodicRate = annualRate / frequencyMultiplier;
            const totalPeriods = years * frequencyMultiplier;
            
            let totalInvestment = 0;
            let currentAmount = investmentAmount;
            let futureValue = 0;

            // Calculate year-wise data for table
            const yearlyData = [];
            let runningInvestment = 0;
            let runningValue = 0;

            for (let year = 1; year <= years; year++) {
                let yearInvestment = 0;
                let yearEndValue = runningValue;

                for (let period = 1; period <= frequencyMultiplier; period++) {
                    // Apply step-up annually (only at the beginning of each year)
                    if (period === 1 && year > 1) {
                        currentAmount = currentAmount * (1 + stepUpRate);
                    }

                    yearInvestment += currentAmount;
                    runningInvestment += currentAmount;

                    // Calculate future value with compound interest
                    yearEndValue = (yearEndValue + currentAmount) * (1 + periodicRate);
                }

                runningValue = yearEndValue;
                
                yearlyData.push({
                    year: year,
                    yearlyInvestment: yearInvestment,
                    cumulativeInvestment: runningInvestment,
                    yearEndValue: yearEndValue,
                    yearlyReturns: yearEndValue - runningInvestment
                });
            }

            totalInvestment = runningInvestment;
            futureValue = runningValue;
            const totalReturns = futureValue - totalInvestment;

            // Update summary
            document.getElementById('sipTotalInvestment').textContent = formatINRReadable(totalInvestment);
            document.getElementById('sipExpectedReturns').textContent = formatINRReadable(totalReturns);
            document.getElementById('sipTotalValue').textContent = formatINRReadable(futureValue);

            // Generate table
            generateSIPTable(yearlyData);

            // Show results
            document.getElementById('sipResults').style.display = 'block';

            // Add copy buttons to the results
            setTimeout(() => {
                addCopyButtons();
            }, 100);

        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    function generateSIPTable(data) {
        const tableHtml = `
            <div class="table-container ${data.length > 6 ? 'has-scroll' : ''}">
                <table class="table table--indian">
                    <thead class="table__header">
                        <tr>
                            <th><i class="fas fa-calendar-alt"></i> Year</th>
                            <th><i class="fas fa-money-bill-wave"></i> Yearly Investment</th>
                            <th><i class="fas fa-piggy-bank"></i> Cumulative Investment</th>
                            <th><i class="fas fa-chart-line"></i> Year End Value</th>
                            <th><i class="fas fa-trophy"></i> Total Returns</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>
                                <td class="table__year">${row.year}</td>
                                <td class="table__investment">${formatINR(row.yearlyInvestment)}</td>
                                <td class="table__investment">${formatINR(row.cumulativeInvestment)}</td>
                                <td class="table__balance">${formatINR(row.yearEndValue)}</td>
                                <td class="table__returns">${formatINR(row.yearlyReturns)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('sipTableContainer').innerHTML = tableHtml;
    }

    // SWP Calculator
    window.calculateSWP = function() {
        try {
            const totalInvestment = parseFloat(document.getElementById('swpTotalInvestment').value.replace(/,/g, ''));
            const withdrawalAmount = parseFloat(document.getElementById('swpWithdrawal').value.replace(/,/g, ''));
            const frequency = document.getElementById('swpFrequency').value;
            const annualRate = parseFloat(document.getElementById('swpReturnRate').value) / 100;
            const taxRate = parseFloat(document.getElementById('swpTaxRate').value) / 100;
            const years = parseInt(document.getElementById('swpTimePeriod').value);
            const isActiveTrading = document.getElementById('swpActiveTrading').checked;

            if (isNaN(totalInvestment) || isNaN(withdrawalAmount) || isNaN(annualRate) || isNaN(taxRate) || isNaN(years) || 
                totalInvestment <= 0 || withdrawalAmount <= 0 || annualRate < 0 || taxRate < 0 || years <= 0) {
                throw new Error('Please enter valid positive values');
            }

            const frequencyMultiplier = getFrequencyMultiplier(frequency);
            const periodicRate = annualRate / frequencyMultiplier;
            let remainingBalance = totalInvestment;
            let totalWithdrawn = 0;
            let totalTaxPaid = 0;
            let totalNetReceived = 0;

            // Calculate year-wise data
            const yearlyData = [];

            for (let year = 1; year <= years; year++) {
                let yearStartBalance = remainingBalance;
                let yearWithdrawal = 0;
                let yearTaxPaid = 0;
                let yearNetReceived = 0;
                let yearGains = 0;

                if (isActiveTrading) {
                    // Active Trading: Tax on all capital gains for the year
                    const annualGains = yearStartBalance * annualRate;
                    yearGains = annualGains;
                    
                    // Tax on all gains
                    const annualTax = annualGains * taxRate;
                    yearTaxPaid = annualTax;
                    
                    // Net gains after tax
                    const netGains = annualGains - annualTax;
                    
                    // Update balance with net gains
                    remainingBalance = yearStartBalance + netGains;
                    
                    // Now handle withdrawals (no additional tax since already paid)
                    const annualWithdrawal = Math.min(withdrawalAmount * frequencyMultiplier, remainingBalance);
                    yearWithdrawal = annualWithdrawal;
                    yearNetReceived = annualWithdrawal; // No additional tax on withdrawal
                    
                    remainingBalance -= annualWithdrawal;
                    
                } else {
                    // Regular SWP: Tax on withdrawal amount at specified rate
                    for (let period = 1; period <= frequencyMultiplier; period++) {
                        if (remainingBalance <= 0) break;

                        // Apply periodic return
                        const periodicReturn = remainingBalance * periodicRate;
                        remainingBalance += periodicReturn;
                        yearGains += periodicReturn;
                        
                        // Withdraw amount (but not more than remaining balance)
                        const grossWithdrawal = Math.min(withdrawalAmount, remainingBalance);
                        
                        // Tax calculation: Apply tax rate to the entire withdrawal amount
                        const periodicTax = grossWithdrawal * taxRate;
                        const netWithdrawal = grossWithdrawal - periodicTax;
                        
                        remainingBalance -= grossWithdrawal;
                        yearWithdrawal += grossWithdrawal;
                        yearTaxPaid += periodicTax;
                        yearNetReceived += netWithdrawal;
                    }
                }

                totalWithdrawn += yearWithdrawal;
                totalTaxPaid += yearTaxPaid;
                totalNetReceived += yearNetReceived;

                yearlyData.push({
                    year: year,
                    startBalance: yearStartBalance,
                    yearlyWithdrawal: yearWithdrawal,
                    yearlyTax: yearTaxPaid,
                    yearlyNetReceived: yearNetReceived,
                    endBalance: remainingBalance,
                    cumulativeWithdrawal: totalWithdrawn,
                    cumulativeTax: totalTaxPaid,
                    cumulativeNetReceived: totalNetReceived,
                    isActiveTrading: isActiveTrading
                });

                if (remainingBalance <= 0) break;
            }

            // Update summary
            document.getElementById('swpInitialInvestment').textContent = formatINRReadable(totalInvestment);
            document.getElementById('swpTotalWithdrawal').textContent = formatINRReadable(totalWithdrawn);
            document.getElementById('swpTotalTax').textContent = formatINRReadable(totalTaxPaid);
            document.getElementById('swpNetReceived').textContent = formatINRReadable(totalNetReceived);
            document.getElementById('swpFinalValue').textContent = formatINRReadable(remainingBalance);

            // Generate table
            generateSWPTable(yearlyData);

            // Show results
            document.getElementById('swpResults').style.display = 'block';

            // Add copy buttons to the results
            setTimeout(() => {
                addCopyButtons();
            }, 100);

        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    function generateSWPTable(data) {
        const tableHtml = `
            <div class="table-container ${data.length > 6 ? 'has-scroll' : ''}">
                <table class="table table--indian">
                    <thead class="table__header">
                        <tr>
                            <th><i class="fas fa-calendar-alt"></i> Year</th>
                            <th><i class="fas fa-wallet"></i> Start Balance</th>
                            <th><i class="fas fa-hand-holding-usd"></i> Gross Withdrawal</th>
                            <th><i class="fas fa-receipt"></i> Tax Paid</th>
                            <th><i class="fas fa-hand-holding-heart"></i> Net Received</th>
                            <th><i class="fas fa-calendar-check"></i> Monthly Net</th>
                            <th><i class="fas fa-piggy-bank"></i> End Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => {
                            const monthlyNet = row.yearlyNetReceived / 12;
                            return `
                            <tr>
                                <td class="table__year">${row.year}</td>
                                <td class="table__balance">${formatINR(row.startBalance)}</td>
                                <td class="table__withdrawal">${formatINR(row.yearlyWithdrawal)}</td>
                                <td class="table__tax">${formatINR(row.yearlyTax)}</td>
                                <td class="table__net">${formatINR(row.yearlyNetReceived)}</td>
                                <td class="table__monthly-net">${formatINR(monthlyNet)}</td>
                                <td class="table__balance">${formatINR(row.endBalance)}</td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('swpTableContainer').innerHTML = tableHtml;
    }

    // Lumpsum Calculator
    window.calculateLumpsum = function() {
        try {
            const principal = parseFloat(document.getElementById('lumpsumAmount').value.replace(/,/g, ''));
            const annualRate = parseFloat(document.getElementById('lumpsumReturnRate').value) / 100;
            const years = parseInt(document.getElementById('lumpsumTimePeriod').value);
            // Use annual compounding since lumpsum is calculated annually
            const compoundingFreq = 1;

            if (isNaN(principal) || isNaN(annualRate) || isNaN(years) || 
                principal <= 0 || annualRate < 0 || years <= 0) {
                throw new Error('Please enter valid positive values');
            }

            // Calculate year-wise compound growth
            const yearlyData = [];
            
            for (let year = 1; year <= years; year++) {
                const amount = principal * Math.pow((1 + annualRate / compoundingFreq), compoundingFreq * year);
                const returns = amount - principal;
                
                yearlyData.push({
                    year: year,
                    principal: principal,
                    amount: amount,
                    returns: returns,
                    returnPercent: (returns / principal) * 100
                });
            }

            const finalAmount = yearlyData[yearlyData.length - 1].amount;
            const totalReturns = finalAmount - principal;

            // Update summary
            document.getElementById('lumpsumInvestedAmount').textContent = formatINRReadable(principal);
            document.getElementById('lumpsumExpectedReturns').textContent = formatINRReadable(totalReturns);
            document.getElementById('lumpsumTotalValue').textContent = formatINRReadable(finalAmount);

            // Generate table
            generateLumpsumTable(yearlyData);

            // Show results
            document.getElementById('lumpsumResults').style.display = 'block';

            // Add copy buttons to the results
            setTimeout(() => {
                addCopyButtons();
            }, 100);

        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    function generateLumpsumTable(data) {
        const tableHtml = `
            <div class="table-container ${data.length > 6 ? 'has-scroll' : ''}">
                <table class="table table--indian">
                    <thead class="table__header">
                        <tr>
                            <th><i class="fas fa-calendar-alt"></i> Year</th>
                            <th><i class="fas fa-money-bill"></i> Principal</th>
                            <th><i class="fas fa-chart-line"></i> Amount</th>
                            <th><i class="fas fa-trophy"></i> Returns</th>
                            <th><i class="fas fa-percentage"></i> Return %</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>
                                <td class="table__year">${row.year}</td>
                                <td class="table__investment">${formatINR(row.principal)}</td>
                                <td class="table__balance">${formatINR(row.amount)}</td>
                                <td class="table__returns">${formatINR(row.returns)}</td>
                                <td class="table__percent">${formatPercent(row.returnPercent)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('lumpsumTableContainer').innerHTML = tableHtml;
    }

    // Copy to clipboard functionality
    function copyToClipboard(text, element) {
        // Extract only the number part, remove currency symbol, commas, and everything in parentheses
        let cleanText = text.replace(/₹/g, '').trim(); // Remove currency symbol
        
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
                copyToClipboard(element.textContent, copyBtn);
            });
            
            // Insert the copy button after the summary value
            element.parentElement.style.position = 'relative';
            element.parentElement.appendChild(copyBtn);
        });
    }

    // Setup input validation when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupInputValidation);
    } else {
        setupInputValidation();
    }

    // Retirement Planning Calculator
    let goalCounter = 0;
    const defaultGoals = [
        { type: 'marriage', name: "Daughter's Marriage", amount: 20000000, years: 25 },
        { type: 'education', name: "Son's Education", amount: 4000000, years: 20 },
        { type: 'house', name: "Dream House", amount: 20000000, years: 10 },
        { type: 'emergency', name: "Emergency Fund", amount: 2500000, years: 6 }
    ];

    // Initialize default goals
    function initializeDefaultGoals() {
        const container = document.getElementById('goalsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        goalCounter = 0;
        
        defaultGoals.forEach(goal => {
            addGoalItem(goal.type, goal.name, goal.amount, goal.years);
        });
        
        // Initialize helper text for all goal amount inputs after a short delay
        setTimeout(() => {
            const goalAmountInputs = document.querySelectorAll('.goal-amount-input');
            goalAmountInputs.forEach(input => {
                if (input.value) {
                    updateHelperText(input, input.value);
                }
            });
        }, 100);
    }

    // Add new goal functionality
    window.addNewGoal = function() {
        addGoalItem('other', '', 500000, 10);
    };

    function addGoalItem(type = 'other', name = '', amount = 500000, years = 10) {
        goalCounter++;
        const container = document.getElementById('goalsContainer');
        
        const goalHtml = `
            <div class="goal-item" data-goal-type="${type}" id="goal-${goalCounter}">
                <button type="button" class="goal-remove-btn" onclick="removeGoal(${goalCounter})" title="Remove Goal">
                    <i class="fas fa-trash"></i>
                </button>
                <div class="form-group">
                    <label class="form-label">Goal Type</label>
                    <select class="form-input goal-type-select" onchange="updateGoalType(${goalCounter}, this.value)">
                        <option value="marriage" ${type === 'marriage' ? 'selected' : ''}>Marriage</option>
                        <option value="education" ${type === 'education' ? 'selected' : ''}>Education</option>
                        <option value="house" ${type === 'house' ? 'selected' : ''}>House Purchase</option>
                        <option value="vehicle" ${type === 'vehicle' ? 'selected' : ''}>Vehicle</option>
                        <option value="vacation" ${type === 'vacation' ? 'selected' : ''}>Vacation/Travel</option>
                        <option value="business" ${type === 'business' ? 'selected' : ''}>Business Investment</option>
                        <option value="emergency" ${type === 'emergency' ? 'selected' : ''}>Emergency Fund</option>
                        <option value="other" ${type === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Goal Name</label>
                    <input type="text" class="form-input goal-name-input" value="${name}" placeholder="Enter goal name">
                </div>
                <div class="form-group">
                    <label class="form-label">Amount (₹)</label>
                    <input type="text" class="form-input goal-amount-input" value="${formatIndianNumber(amount)}" placeholder="Target amount" inputmode="numeric">
                </div>
                <div class="form-group">
                    <label class="form-label">Years from now</label>
                    <input type="number" class="form-input goal-years-input" value="${years}" min="1" max="50" placeholder="Years">
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', goalHtml);
        
        // Setup input validation for the new goal
        const goalElement = document.getElementById(`goal-${goalCounter}`);
        const amountInput = goalElement.querySelector('.goal-amount-input');
        
        // Setup the input validation first
        setupGoalAmountInput(amountInput);
        
        // Force initialize helper text multiple times to ensure it works
        const initializeHelper = () => {
            if (amountInput.value && amountInput.value.trim() !== '') {
                console.log(`Setting up helper text for goal ${goalCounter}:`, amountInput.value);
                updateHelperText(amountInput, amountInput.value);
            }
        };
        
        // Try multiple times with different delays
        setTimeout(initializeHelper, 10);
        setTimeout(initializeHelper, 50);
        setTimeout(initializeHelper, 100);
    }

    window.updateGoalType = function(goalId, type) {
        const goalElement = document.getElementById(`goal-${goalId}`);
        goalElement.setAttribute('data-goal-type', type);
    };

    window.removeGoal = function(goalId) {
        const goalElement = document.getElementById(`goal-${goalId}`);
        if (goalElement) {
            goalElement.remove();
        }
    };

    function setupGoalAmountInput(input) {
        // Format initial value and show helper text
        if (input.value) {
            const formatted = formatIndianNumber(input.value.replace(/,/g, ''));
            input.value = formatted;
            updateHelperText(input, formatted);
        }
        
        // Handle input events
        input.addEventListener('input', function(e) {
            let value = this.value.replace(/,/g, '');
            value = value.replace(/[^\d]/g, '');
            
            if (value.length > 15) {
                value = value.substring(0, 15);
            }
            
            if (value && value !== '0') {
                const formatted = formatIndianNumber(value);
                this.value = formatted;
                updateHelperText(this, formatted);
            } else {
                this.value = '';
                removeHelperText(this);
            }
        });

        input.addEventListener('focus', function(e) {
            // Keep helper text visible, just remove commas for easier editing
            this.value = this.value.replace(/,/g, '');
        });

        input.addEventListener('blur', function(e) {
            let value = this.value.replace(/,/g, '');
            if (value && !isNaN(value) && value !== '0') {
                const formatted = formatIndianNumber(value);
                this.value = formatted;
                updateHelperText(this, formatted);
            } else if (value === '' || value === '0') {
                this.value = '';
                removeHelperText(this);
            }
        });
    }

    // Retirement Calculator
    window.calculateRetirement = function() {
        try {
            // Get basic inputs with better validation
            const currentAge = parseInt(document.getElementById('retirementCurrentAge').value);
            const monthlySavingsInput = document.getElementById('retirementMonthlySavings').value.replace(/,/g, '');
            const monthlySavings = parseFloat(monthlySavingsInput);
            const currentCorpusInput = document.getElementById('retirementCurrentCorpus').value.replace(/,/g, '');
            const currentCorpus = parseFloat(currentCorpusInput) || 0;
            const returnRate = parseFloat(document.getElementById('retirementReturnRate').value) / 100;
            const inflationRate = parseFloat(document.getElementById('retirementInflationRate').value) / 100;
            const monthlyExpensesInput = document.getElementById('retirementMonthlyExpenses').value.replace(/,/g, '');
            const monthlyExpenses = parseFloat(monthlyExpensesInput);
            const lifeExpectancy = parseInt(document.getElementById('retirementLifeExpectancy').value);
            const taxRate = parseFloat(document.getElementById('retirementTaxRate').value) / 100;

            // Enhanced validation
            if (isNaN(currentAge) || currentAge < 18 || currentAge > 65) {
                throw new Error('Please enter a valid current age between 18 and 65');
            }
            if (isNaN(monthlySavings) || monthlySavings <= 0) {
                throw new Error('Please enter a valid monthly savings amount');
            }
            if (isNaN(monthlyExpenses) || monthlyExpenses <= 0) {
                throw new Error('Please enter a valid monthly expenses amount');
            }
            if (isNaN(returnRate) || returnRate <= 0) {
                throw new Error('Please enter a valid return rate');
            }
            if (isNaN(inflationRate) || inflationRate < 0) {
                throw new Error('Please enter a valid inflation rate');
            }
            if (isNaN(lifeExpectancy) || lifeExpectancy <= currentAge) {
                throw new Error('Please enter a valid life expectancy greater than current age');
            }
            if (isNaN(taxRate) || taxRate < 0 || taxRate > 0.5) {
                throw new Error('Please enter a valid tax rate between 0% and 50%');
            }

            // Collect goals
            const goals = [];
            const goalElements = document.querySelectorAll('.goal-item');
            
            goalElements.forEach(goalElement => {
                const type = goalElement.querySelector('.goal-type-select').value;
                const name = goalElement.querySelector('.goal-name-input').value;
                const amount = parseFloat(goalElement.querySelector('.goal-amount-input').value.replace(/,/g, ''));
                const years = parseInt(goalElement.querySelector('.goal-years-input').value);
                
                if (name && amount > 0 && years > 0) {
                    // Adjust for inflation
                    const futureValue = amount * Math.pow(1 + inflationRate, years);
                    goals.push({
                        type,
                        name,
                        currentAmount: amount,
                        futureAmount: futureValue,
                        years
                    });
                }
            });

            // Calculate goals corpus (we only need corpus for the actual goal amounts)
            const totalGoalsCurrentValue = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
            const totalGoalsFutureValue = goals.reduce((sum, goal) => sum + goal.futureAmount, 0);
            
            // We only need corpus for the actual goal amounts, not the tax
            const totalGoalsFutureValueWithTax = totalGoalsFutureValue;

            // Calculate retirement age by finding when we can accumulate enough corpus
            let retirementAge = currentAge + 5; // Start checking from 5 years from now
            let canRetire = false;
            let calculationResults = null;

            // Try different retirement ages until we find one that works
            for (let testAge = currentAge + 5; testAge <= Math.min(lifeExpectancy - 5, 75); testAge++) {
                const yearsToRetirement = testAge - currentAge;
                const yearsInRetirement = lifeExpectancy - testAge;
                
                if (yearsInRetirement < 5) continue; // Need at least 5 years of retirement
                
                // Calculate retirement corpus needed for this age
                const futureMonthlyExpenses = monthlyExpenses * Math.pow(1 + inflationRate, yearsToRetirement);
                const annualExpensesInRetirement = futureMonthlyExpenses * 12;
                
                // We only need corpus for the actual expenses, not the tax
                // (Tax is paid from other sources or is a separate consideration)
                
                // Using sustainable withdrawal method with net expenses only
                const postRetirementReturn = 0.08;
                const retirementCorpus = (annualExpensesInRetirement * yearsInRetirement) / 
                                       (1 - Math.pow(1 + postRetirementReturn, -yearsInRetirement)) * 
                                       (1 + postRetirementReturn);

                // Total corpus needed (goals + retirement) - both adjusted for tax
                const totalCorpusNeeded = totalGoalsFutureValueWithTax + retirementCorpus;

                // Calculate what we can accumulate with current corpus + monthly savings
                const monthlyReturn = returnRate / 12;
                const totalMonths = yearsToRetirement * 12;
                
                // Future value of current corpus
                const futureValueOfCurrentCorpus = currentCorpus * Math.pow(1 + returnRate, yearsToRetirement);
                
                // Future value of monthly savings (SIP)
                const futureValueOfSavings = monthlySavings * 
                    ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);
                
                // Total accumulated corpus
                const totalAccumulatedCorpus = futureValueOfCurrentCorpus + futureValueOfSavings;

                // Check if this is feasible (we can accumulate enough)
                if (totalAccumulatedCorpus >= totalCorpusNeeded) {
                    retirementAge = testAge;
                    canRetire = true;
                    calculationResults = {
                        yearsToRetirement,
                        yearsInRetirement,
                        totalCorpusNeeded,
                        totalAccumulatedCorpus,
                        futureMonthlyExpenses,
                        retirementCorpus,
                        futureValueOfCurrentCorpus,
                        futureValueOfSavings,
                        surplus: totalAccumulatedCorpus - totalCorpusNeeded
                    };
                    break;
                }
            }

            if (!canRetire) {
                throw new Error('Based on your current savings capacity, you may need to increase monthly savings or reduce goals to retire within a reasonable timeframe.');
            }

            // Update results
            document.getElementById('retirementTotalGoals').textContent = goals.length;
            document.getElementById('retirementGoalsCorpus').textContent = formatINRReadable(totalGoalsCurrentValue);
            document.getElementById('retirementGoalsCorpusFuture').textContent = formatINRReadable(totalGoalsFutureValue);
            document.getElementById('retirementCalculatedAge').textContent = retirementAge + ' years';
            document.getElementById('retirementYearsLeft').textContent = calculationResults.yearsToRetirement;
            document.getElementById('retirementCorpusNeeded').textContent = formatINRReadable(calculationResults.retirementCorpus);
            document.getElementById('retirementTotalCorpus').textContent = formatINRReadable(calculationResults.totalCorpusNeeded);
            document.getElementById('retirementMonthlySIP').textContent = formatINRReadable(monthlySavings);
            document.getElementById('retirementIncomeAllocation').textContent = formatINRReadable(calculationResults.surplus);

            // Generate detailed table
            generateRetirementTable(goals, {
                currentAge,
                retirementAge,
                monthlySavings,
                currentCorpus,
                returnRate,
                inflationRate,
                monthlyExpenses,
                lifeExpectancy,
                taxRate,
                ...calculationResults
            });

            // Show results
            document.getElementById('retirementResults').style.display = 'block';

            // Add copy buttons
            setTimeout(() => {
                addCopyButtons();
            }, 100);

        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    function generateRetirementTable(goals, params) {
        // Debug logging
        console.log('generateRetirementTable params:', params);
        
        // Validate parameters to prevent NaN values
        const monthlySavings = parseFloat(params.monthlySavings) || 0;
        const currentCorpus = parseFloat(params.currentCorpus) || 0;
        const returnRate = parseFloat(params.returnRate) || 0.12;
        const currentAge = parseInt(params.currentAge) || 30;
        const totalCorpusNeeded = parseFloat(params.totalCorpusNeeded) || 0;
        
        console.log('Parsed values:', {
            monthlySavings,
            currentCorpus,
            returnRate,
            currentAge,
            totalCorpusNeeded,
            monthlyExpenses: params.monthlyExpenses,
            retirementAge: params.retirementAge,
            lifeExpectancy: params.lifeExpectancy,
            inflationRate: params.inflationRate
        });
        
        // Create goals breakdown table
        const goalsTableHtml = `
            <div class="table-container">
                <h4 style="margin: var(--space-lg) 0 var(--space-md) 0; color: var(--color-text-primary);">
                    <i class="fas fa-bullseye"></i> Goals Breakdown
                </h4>
                <table class="table table--indian">
                    <thead class="table__header">
                        <tr>
                            <th><i class="fas fa-tag"></i> Goal</th>
                            <th><i class="fas fa-calendar-alt"></i> Years</th>
                            <th><i class="fas fa-rupee-sign"></i> Current Value</th>
                            <th><i class="fas fa-chart-line"></i> Future Value</th>
                            <th><i class="fas fa-percentage"></i> Inflation Impact</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${goals.map(goal => {
                            const inflationImpact = ((goal.futureAmount - goal.currentAmount) / goal.currentAmount) * 100;
                            return `
                            <tr>
                                <td class="table__year">${goal.name}</td>
                                <td class="table__year">${goal.years}</td>
                                <td class="table__investment">${formatINR(goal.currentAmount)}</td>
                                <td class="table__balance">${formatINR(goal.futureAmount)}</td>
                                <td class="table__percent">${inflationImpact.toFixed(1)}%</td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Create year-wise investment projection
        const yearlyData = [];
        let cumulativeInvestment = 0;
        let portfolioValue = currentCorpus; // Start with current corpus
        
        // Calculate retirement parameters
        const yearsToRetirement = params.retirementAge - params.currentAge;
        const yearsInRetirement = params.lifeExpectancy - params.retirementAge;
        const totalYears = yearsToRetirement + yearsInRetirement;
        
        console.log('Retirement calculation:', {
            yearsToRetirement,
            yearsInRetirement,
            totalYears,
            retirementAge: params.retirementAge,
            lifeExpectancy: params.lifeExpectancy,
            currentAge: params.currentAge
        });
        
        // Calculate future monthly expenses at retirement (adjusted for inflation until retirement)
        const futureMonthlyExpensesAtRetirement = params.monthlyExpenses * Math.pow(1 + params.inflationRate, yearsToRetirement);
        
        console.log('Monthly expenses calculation:', {
            currentMonthlyExpenses: params.monthlyExpenses,
            inflationRate: params.inflationRate,
            yearsToRetirement,
            futureMonthlyExpensesAtRetirement
        });
        
        for (let year = 1; year <= totalYears; year++) {
            const currentAgeInYear = params.currentAge + year;
            const isRetired = currentAgeInYear >= params.retirementAge;
            const yearsIntoRetirement = Math.max(0, currentAgeInYear - params.retirementAge);
            
            // Check if any goals are due this year
            const goalsThisYear = goals.filter(goal => goal.years === year);
            const totalGoalExpenses = goalsThisYear.reduce((sum, goal) => sum + goal.futureAmount, 0);
            
            if (!isRetired) {
                // Accumulation phase - still working and investing
                const yearlyInvestment = params.monthlySavings * 12;
                cumulativeInvestment += yearlyInvestment;
                
                // Apply returns to existing portfolio + add new investment
                portfolioValue = (portfolioValue * (1 + params.returnRate)) + yearlyInvestment;
                
                // Deduct goal expenses if any goals are due this year
                // We only withdraw the actual goal amount, tax is separate for display
                portfolioValue -= totalGoalExpenses;
                
                // Tax is calculated for display purposes only
                const taxOnGoals = totalGoalExpenses * params.taxRate;
                
                const shortfallOrSurplus = params.totalCorpusNeeded - portfolioValue;
                
                yearlyData.push({
                    year: year,
                    age: currentAgeInYear,
                    yearlyInvestment: yearlyInvestment,
                    cumulativeInvestment: cumulativeInvestment,
                    portfolioValue: portfolioValue,
                    monthlyExpenses: 0, // No monthly expenses during accumulation
                    goalExpenses: totalGoalExpenses, // Net goal expenses (what you actually need)
                    grossGoalWithdrawal: totalGoalExpenses, // Same as net since we only withdraw what we need
                    taxOnGoals: taxOnGoals, // Tax paid on goals (for display only)
                    goalsThisYear: goalsThisYear, // Track which goals
                    shortfallOrSurplus: shortfallOrSurplus,
                    isShortfall: shortfallOrSurplus > 0,
                    phase: 'accumulation'
                });
            } else {
                // Retirement phase - withdrawing for expenses
                const yearlyInvestment = 0; // No more investments
                
                // Calculate monthly expenses for this retirement year (with inflation from retirement start)
                const netMonthlyExpensesThisYear = futureMonthlyExpensesAtRetirement * Math.pow(1 + params.inflationRate, yearsIntoRetirement);
                const netAnnualExpensesThisYear = netMonthlyExpensesThisYear * 12;
                
                // Tax is only on the withdrawal amount (the expenses we actually withdraw)
                const taxOnExpenses = netAnnualExpensesThisYear * params.taxRate;
                const monthlyTaxOnExpenses = netMonthlyExpensesThisYear * params.taxRate;
                const taxOnGoals = totalGoalExpenses * params.taxRate;
                
                // We only withdraw the actual expenses (net amounts), tax is separate calculation for display
                const totalWithdrawal = netAnnualExpensesThisYear + totalGoalExpenses;
                
                // Apply returns and subtract only the actual withdrawals (expenses)
                portfolioValue = (portfolioValue * (1 + params.returnRate)) - totalWithdrawal;
                
                // During retirement, surplus is remaining portfolio value, deficit is negative portfolio
                const remainingAfterExpenses = portfolioValue;
                const shortfallOrSurplus = remainingAfterExpenses < 0 ? Math.abs(remainingAfterExpenses) : remainingAfterExpenses;
                const isShortfall = remainingAfterExpenses < 0;
                
                yearlyData.push({
                    year: year,
                    age: currentAgeInYear,
                    yearlyInvestment: yearlyInvestment,
                    cumulativeInvestment: cumulativeInvestment,
                    portfolioValue: Math.max(0, portfolioValue), // Don't show negative portfolio
                    monthlyExpenses: netMonthlyExpensesThisYear, // Net monthly expenses (what you actually need)
                    grossMonthlyWithdrawal: netMonthlyExpensesThisYear, // Same as net since we only withdraw what we need
                    taxOnExpenses: taxOnExpenses, // Annual tax paid on monthly expenses (for display only)
                    monthlyTaxOnExpenses: monthlyTaxOnExpenses, // Monthly tax amount
                    goalExpenses: totalGoalExpenses, // Net goal expenses (what you actually need)
                    grossGoalWithdrawal: totalGoalExpenses, // Same as net since we only withdraw what we need
                    taxOnGoals: taxOnGoals, // Tax paid on goals (for display only)
                    goalsThisYear: goalsThisYear, // Track which goals
                    shortfallOrSurplus: shortfallOrSurplus,
                    isShortfall: isShortfall,
                    phase: 'retirement'
                });
            }
        }

        // Calculate legacy amount and money depletion info
        const legacyAmount = yearlyData.length > 0 ? yearlyData[yearlyData.length - 1].portfolioValue : 0;
        
        // Find when money runs out (if it does)
        let moneyRunsOutAge = null;
        let moneyRunsOutYear = null;
        for (let i = 0; i < yearlyData.length; i++) {
            if (yearlyData[i].portfolioValue <= 0) {
                moneyRunsOutAge = yearlyData[i].age;
                moneyRunsOutYear = yearlyData[i].year;
                break;
            }
        }
        
        // Add legacy amount and depletion info to the retirement details section
        setTimeout(() => {
            const retirementDetails = document.querySelector('.retirement-details');
            if (retirementDetails) {
                // Remove existing legacy elements
                const existingLegacy = document.querySelectorAll('.legacy-info');
                existingLegacy.forEach(el => el.remove());
                
                if (moneyRunsOutAge) {
                    // Money runs out - show warning
                    const depletionDiv = document.createElement('div');
                    depletionDiv.className = 'retirement-detail-item legacy-info depletion-warning';
                    depletionDiv.innerHTML = `
                        <span class="detail-label">⚠️ Money Runs Out At Age</span>
                        <span class="detail-value">${moneyRunsOutAge} years</span>
                    `;
                    retirementDetails.appendChild(depletionDiv);
                } else {
                    // Money lasts - show legacy amount
                    const legacyDiv = document.createElement('div');
                    legacyDiv.className = 'retirement-detail-item legacy-info legacy-success';
                    legacyDiv.innerHTML = `
                        <span class="detail-label">💰 Legacy Amount (At Age ${params.lifeExpectancy})</span>
                        <span class="detail-value">${formatINRReadable(legacyAmount)}</span>
                    `;
                    retirementDetails.appendChild(legacyDiv);
                }
            }
        }, 100);

        const projectionTableHtml = `
            <div class="table-container ${yearlyData.length > 6 ? 'has-scroll' : ''}">
                <h4 style="margin: var(--space-xl) 0 var(--space-md) 0; color: var(--color-text-primary);">
                    <i class="fas fa-chart-area"></i> Year-wise Cash Flow Analysis
                </h4>
                <table class="table table--indian table--cashflow">
                    <thead class="table__header">
                        <tr>
                            <th>AGE</th>
                            <th>PORTFOLIO START</th>
                            <th>WITHDRAWALS</th>
                            <th>TAX ON WITHDRAWALS</th>
                            <th>PORTFOLIO END</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${yearlyData.map((row, index) => {
                            // Step-by-step calculation for clarity
                            let portfolioStart, totalWithdrawals, totalTax, portfolioAfterWithdrawals, investmentGains, portfolioEnd;
                            
                            if (index === 0) {
                                portfolioStart = params.currentCorpus;
                            } else {
                                portfolioStart = yearlyData[index - 1].portfolioValue;
                            }
                            
                            // Calculate withdrawals and tax
                            const livingExpenses = row.monthlyExpenses * 12;
                            const goalExpenses = row.goalExpenses || 0;
                            totalWithdrawals = livingExpenses + goalExpenses;
                            totalTax = totalWithdrawals * params.taxRate;
                            
                            // Step 1: Start with portfolio
                            // Step 2: Add annual investment (if accumulation phase)
                            let portfolioAfterInvestment = portfolioStart;
                            if (row.phase === 'accumulation') {
                                portfolioAfterInvestment += row.yearlyInvestment;
                            }
                            
                            // Step 3: Apply investment returns
                            const portfolioAfterReturns = portfolioAfterInvestment * (1 + params.returnRate);
                            
                            // Step 4: Subtract withdrawals and tax
                            portfolioEnd = portfolioAfterReturns - totalWithdrawals - totalTax;
                            
                            // Format withdrawals display with monthly breakdown
                            let withdrawalsDisplay = '-';
                            if (livingExpenses > 0 && goalExpenses > 0) {
                                const monthlyLiving = livingExpenses / 12;
                                withdrawalsDisplay = `${formatINR(livingExpenses)} living (${formatINR(monthlyLiving)}/mo) + ${formatINR(goalExpenses)} goals`;
                            } else if (livingExpenses > 0) {
                                const monthlyLiving = livingExpenses / 12;
                                withdrawalsDisplay = `${formatINR(livingExpenses)} living<br><small style="color: var(--color-text-secondary);">(${formatINR(monthlyLiving)}/month)</small>`;
                            } else if (goalExpenses > 0) {
                                const goalNames = row.goalsThisYear.map(goal => goal.name.split(' ')[0]).join(', ');
                                withdrawalsDisplay = `${formatINR(goalExpenses)} (${goalNames})`;
                            }
                            
                            return `
                            <tr class="${row.phase === 'retirement' ? 'retirement-phase' : 'accumulation-phase'} ${row.goalExpenses > 0 ? 'goal-expense-year' : ''}">
                                <td class="table__age">${row.age}</td>
                                <td class="table__balance">${formatINR(portfolioStart)}</td>
                                <td class="table__withdrawals">${withdrawalsDisplay}</td>
                                <td class="table__tax">${formatINR(totalTax)}</td>
                                <td class="table__balance">${formatINR(Math.max(0, portfolioEnd))}</td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
                
                <div class="cashflow-explanation">
                    <h5>Step-by-step cash flow process:</h5>
                    <ol>
                        <li><strong>Portfolio Start:</strong> Your corpus at beginning of year</li>
                        <li><strong>Add Investment Returns:</strong> Portfolio grows by ${(params.returnRate * 100).toFixed(1)}%</li>
                        <li><strong>Subtract Withdrawals:</strong> Take out money for expenses and goals</li>
                        <li><strong>Pay Tax:</strong> ${(params.taxRate * 100).toFixed(1)}% tax on withdrawn amount</li>
                        <li><strong>Portfolio End:</strong> What remains for next year</li>
                    </ol>
                    <p><em>Formula: Portfolio End = (Portfolio Start × ${(1 + params.returnRate).toFixed(2)}) - Withdrawals - Tax</em></p>
                </div>
            </div>
        `;

        document.getElementById('retirementTableContainer').innerHTML = goalsTableHtml + projectionTableHtml;
    }

    // Manual function to refresh all helper texts
    window.refreshGoalHelperTexts = function() {
        const allGoalInputs = document.querySelectorAll('.goal-amount-input');
        console.log(`Found ${allGoalInputs.length} goal inputs to refresh`);
        
        allGoalInputs.forEach((input, index) => {
            if (input.value && input.value.trim() !== '') {
                console.log(`Refreshing helper text for input ${index + 1}:`, input.value);
                updateHelperText(input, input.value);
            }
        });
        
        // Also refresh main currency inputs
        const mainInputs = document.querySelectorAll('#retirementCurrentIncome, #retirementMonthlyExpenses');
        mainInputs.forEach((input, index) => {
            if (input.value && input.value.trim() !== '') {
                console.log(`Refreshing main input ${index + 1}:`, input.value);
                updateHelperText(input, input.value);
            }
        });
    };

    // Initialize retirement calculator when switching to it
    const originalSwitchFunction = window.switchIndianCalculator;
    window.switchIndianCalculator = function(calculatorType) {
        originalSwitchFunction(calculatorType);
        
        if (calculatorType === 'retirement') {
            setTimeout(() => {
                initializeDefaultGoals();
                setupRetirementInputValidation();
                
                // Force update helper text for all goal inputs after initialization
                setTimeout(() => {
                    const allGoalInputs = document.querySelectorAll('.goal-amount-input');
                    allGoalInputs.forEach((input, index) => {
                        if (input.value && input.value.trim() !== '') {
                            console.log(`Initializing helper text for goal ${index + 1}:`, input.value);
                            updateHelperText(input, input.value);
                        }
                    });
                }, 200);
            }, 100);
        }
    };

    function setupRetirementInputValidation() {
        // Setup validation for retirement-specific inputs
        const currencyInputs = document.querySelectorAll('#retirementMonthlySavings, #retirementCurrentCorpus, #retirementMonthlyExpenses');
        
        currencyInputs.forEach(input => {
            input.removeAttribute('maxlength');
            
            if (input.value) {
                const formatted = formatIndianNumber(input.value);
                input.value = formatted;
                updateHelperText(input, formatted);
            }
            
            input.addEventListener('input', function(e) {
                let value = this.value.replace(/,/g, '');
                value = value.replace(/[^\d]/g, '');
                
                if (value.length > 15) {
                    value = value.substring(0, 15);
                }
                
                if (value && value !== '0') {
                    const formatted = formatIndianNumber(value);
                    this.value = formatted;
                    updateHelperText(this, formatted);
                } else {
                    this.value = '';
                    removeHelperText(this);
                }
            });

            input.addEventListener('focus', function(e) {
                // Keep helper text visible, just remove commas for easier editing
                this.value = this.value.replace(/,/g, '');
            });

            input.addEventListener('blur', function(e) {
                let value = this.value.replace(/,/g, '');
                
                if (value && !isNaN(value) && value !== '0') {
                    const formatted = formatIndianNumber(value);
                    this.value = formatted;
                    updateHelperText(this, formatted);
                } else if (value === '' || value === '0') {
                    this.value = '';
                    removeHelperText(this);
                }
            });
        });
    }

})();