// 401k Projection Calculator - Enhanced Version with Salary-Based Calculations
(function(){
    
    function formatCurrency(num) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 2
        }).format(num);
    }

    function formatPercent(num) {
        return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num / 100);
    }

    // Enhanced USD formatting with readable suffixes
    function formatUSDReadable(num) {
        if (isNaN(num) || num === null || num === undefined) {
            return '$0';
        }
        
        const basicFormat = formatCurrency(num);
        let suffix = '';
        
        if (num >= 1000000000) { // 1 Billion or more
            const billions = num / 1000000000;
            suffix = ` (${billions.toFixed(2)} B)`;
        } else if (num >= 1000000) { // 1 Million or more
            const millions = num / 1000000;
            suffix = ` (${millions.toFixed(2)} M)`;
        } else if (num >= 1000) { // 1 Thousand or more
            const thousands = num / 1000;
            suffix = ` (${thousands.toFixed(2)} K)`;
        }
        
        return basicFormat + suffix;
    }

    // Number to words conversion for USD (handles up to trillions)
    function numberToUSWords(num) {
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
        
        // Handle trillions
        if (num >= 1000000000000) {
            const trillions = Math.floor(num / 1000000000000);
            result += convertHundreds(trillions) + ' Trillion';
            num %= 1000000000000;
            if (num > 0) result += ' ';
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

    // Format number with US comma system (standard thousands separator)
    function formatUSNumber(num) {
        if (isNaN(num) || num === '' || num === '0') return num.toString();
        
        const numStr = num.toString();
        const parts = numStr.split('.');
        let integerPart = parts[0];
        const decimalPart = parts[1] ? '.' + parts[1] : '';
        
        // US numbering system: comma every 3 digits from right
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        return integerPart + decimalPart;
    }

    // Create or update helper text element for USD
    function updateUSDHelperText(input, value) {
        const cleanValue = value.replace(/,/g, '');
        const numValue = parseFloat(cleanValue);
        
        if (isNaN(numValue) || numValue === 0) {
            removeUSDHelperText(input);
            return;
        }
        
        let helperId = input.id + 'Helper';
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
            
            const formGroup = input.closest('.form-group');
            if (formGroup) {
                formGroup.appendChild(helper);
            } else {
                input.parentNode.insertBefore(helper, input.nextSibling);
            }
        }
        
        try {
            const words = numberToUSWords(Math.floor(numValue));
            
            if (words && words !== 'undefined' && words.trim() !== '' && !words.includes('undefined')) {
                helper.textContent = `(${words})`;
            } else {
                helper.textContent = `(${formatUSNumber(numValue)})`;
            }
        } catch (error) {
            console.error('Error converting number to words:', error);
            helper.textContent = `(${formatUSNumber(numValue)})`;
        }
    }

    // Remove helper text
    function removeUSDHelperText(input) {
        if (!input.id) return;
        
        const helperId = input.id + 'Helper';
        const helper = document.getElementById(helperId);
        if (helper) {
            helper.remove();
        }
    }

    // Input validation for 401k calculator
    function setup401kInputValidation() {
        const currencyInputs = document.querySelectorAll('#baseSalary, #current401kBalance, #current401kContributed, #current401aBalance');
        const numberInputs = document.querySelectorAll('#salaryIncrease, #projectionYears, #annualReturn, #bonusPercent, #bonusContribPercent, #employerMatchPercent, #contrib401aPercent');
        
        // Setup currency inputs with comma formatting and helper text
        currencyInputs.forEach(input => {
            if (!input) return;
            
            // Format initial value
            if (input.value) {
                const formatted = formatUSNumber(input.value);
                input.value = formatted;
                updateUSDHelperText(input, formatted);
            }
            
            // Handle input events
            input.addEventListener('input', function(e) {
                // Store cursor position before formatting
                const cursorPosition = this.selectionStart;
                const oldValue = this.value;
                
                let value = this.value.replace(/,/g, ''); // Remove existing commas
                
                // Only allow numbers
                value = value.replace(/[^\d]/g, '');
                
                // Allow large numbers (up to 12 digits for millions/billions)
                if (value.length > 12) {
                    value = value.substring(0, 12);
                }
                
                if (value && value !== '0') {
                    const formatted = formatUSNumber(value);
                    
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
                    this.setSelectionRange(newCursorPosition, newCursorPosition);
                    
                    updateUSDHelperText(this, formatted);
                } else {
                    this.value = '';
                    removeUSDHelperText(this);
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
                    const formatted = formatUSNumber(value);
                    this.value = formatted;
                    updateUSDHelperText(this, formatted);
                } else if (value === '' || value === '0') {
                    this.value = '';
                    removeUSDHelperText(this);
                }
            });

            // Handle paste events for large numbers
            input.addEventListener('paste', function(e) {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text');
                const cleanPaste = paste.replace(/[^\d]/g, '');
                if (cleanPaste && cleanPaste.length <= 12) {
                    const formatted = formatUSNumber(cleanPaste);
                    this.value = formatted;
                    updateUSDHelperText(this, formatted);
                }
            });
        });
        
        // Setup other number inputs (no comma formatting)
        numberInputs.forEach(input => {
            if (!input) return;
            
            // Prevent non-numeric characters
            input.addEventListener('keypress', function(e) {
                if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
                    (e.keyCode === 65 && e.ctrlKey === true) ||
                    (e.keyCode === 67 && e.ctrlKey === true) ||
                    (e.keyCode === 86 && e.ctrlKey === true) ||
                    (e.keyCode === 88 && e.ctrlKey === true) ||
                    (e.keyCode >= 35 && e.keyCode <= 39)) {
                    return;
                }
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            });

            // Prevent pasting non-numeric content
            input.addEventListener('paste', function(e) {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text');
                if (/^\d*\.?\d*$/.test(paste)) {
                    this.value = paste;
                }
            });

            // Clean up invalid values
            input.addEventListener('blur', function(e) {
                const value = parseFloat(this.value);
                if (isNaN(value) || value < 0) {
                    this.value = this.getAttribute('value') || '0';
                }
            });
        });
    }

    // Setup validation when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup401kInputValidation);
    } else {
        setTimeout(setup401kInputValidation, 100);
    }
    
    // Also call setup when the function is defined (immediate execution)
    setTimeout(setup401kInputValidation, 50);
    
    // Expose setup function globally for HTML script access
    window.setup401kInputValidation = setup401kInputValidation;

    // Expose calculate401k globally
    window.calculate401k = function() {
        try {
            // Get input values
            const baseSalary = parseFloat(document.getElementById('baseSalary').value.replace(/,/g, ''));
            const salaryIncrease = parseFloat(document.getElementById('salaryIncrease').value) / 100;
            const projectionYears = parseInt(document.getElementById('projectionYears').value);
            const annualReturn = parseFloat(document.getElementById('annualReturn').value) / 100;
            const current401kBalance = parseFloat(document.getElementById('current401kBalance').value.replace(/,/g, ''));
            const current401kContributed = parseFloat(document.getElementById('current401kContributed').value.replace(/,/g, '')) || 0;
            
            // Get company benefit configuration
            const hasBonus = document.getElementById('hasBonus').checked;
            const bonusPercentage = hasBonus ? parseFloat(document.getElementById('bonusPercent').value) / 100 : 0;
            const bonusContributionPercent = hasBonus ? parseFloat(document.getElementById('bonusContribPercent').value) / 100 : 0;
            
            const hasEmployerMatch = document.getElementById('hasEmployerMatch').checked;
            const employerMatchPercent = hasEmployerMatch ? parseFloat(document.getElementById('employerMatchPercent').value) / 100 : 0;
            
            const has401a = document.getElementById('has401a').checked;
            const employee401aPercent = has401a ? parseFloat(document.getElementById('contrib401aPercent').value) / 100 : 0;
            const current401aBalance = has401a ? parseFloat(document.getElementById('current401aBalance').value.replace(/,/g, '')) : 0;

            // Fixed parameters
            const annual401kLimit = 23500; // 2025 limit (employee + bonus contributions only)
            const startYear = new Date().getFullYear();

            // Create table structure - dynamic columns based on enabled features
            let tableHeaders = `
                                <th class="table__year-col">Year</th>
                                <th class="table__salary-col">Base Salary</th>`;
            
            if (hasBonus) {
                tableHeaders += `
                                <th class="table__bonus-col">Bonus (${(bonusPercentage * 100).toFixed(1)}%)</th>`;
            }
            
            tableHeaders += `
                                <th class="table__percent-col">401k %</th>
                                <th class="table__contrib-col">Employee 401k</th>`;
            
            if (hasBonus) {
                tableHeaders += `
                                <th class="table__contrib-col">Bonus Contrib (${(bonusContributionPercent * 100).toFixed(0)}%)</th>`;
            }
            
            if (hasEmployerMatch) {
                tableHeaders += `
                                <th class="table__contrib-col">Employer Match</th>`;
            }
            
            if (has401a) {
                tableHeaders += `
                                <th class="table__contrib-col">401a (${(employee401aPercent * 100).toFixed(1)}%)</th>`;
            }
            
            tableHeaders += `
                                <th class="table__total-col">Total Contrib</th>
                                <th class="table__balance-col">401k Start</th>`;
            
            if (has401a) {
                tableHeaders += `
                                <th class="table__balance-col">401a Start</th>`;
            }
            
            tableHeaders += `
                                <th class="table__return-col">401k Returns</th>`;
            
            if (has401a) {
                tableHeaders += `
                                <th class="table__return-col">401a Returns</th>`;
            }
            
            tableHeaders += `
                                <th class="table__balance-col">401k End</th>`;
            
            if (has401a) {
                tableHeaders += `
                                <th class="table__balance-col">401a End</th>`;
            }
            
            tableHeaders += `
                                <th class="table__grand-total-col">Grand Total</th>`;

            const tableHtml = `
                <div class="table-container">
                    <table class="table table--401k">
                        <thead class="table__header">
                            <tr>
                                ${tableHeaders}
                            </tr>
                        </thead>
                        <tbody class="table__body">
            `;

            let tableBody = '';
            let current401k = current401kBalance;
            let current401a = current401aBalance;
            let totalContributions = 0;
            let totalReturns = 0;

            for (let i = 0; i < projectionYears; i++) {
                const year = startYear + i;
                const isCurrentYear = (year === startYear); // 2025 is the current year
                
                // Calculate salary for this year with annual increases
                const currentSalary = baseSalary * Math.pow(1 + salaryIncrease, i);
                
                // Calculate bonus (configurable percentage of salary)
                const bonus = currentSalary * bonusPercentage;
                
                // Calculate bonus contribution (configurable percentage of bonus)
                const bonusContrib = bonus * bonusContributionPercent;
                
                let contributionPercentThisYear;
                let employee401kContrib;
                let finalEmployee401k;
                let finalBonusContrib;
                
                if (isCurrentYear) {
                    // Special case for current year (2025)
                    // current401kContributed represents regular employee contributions only (not bonus)
                    const totalContributedSoFar = current401kContributed; // Regular contributions only
                    const remainingLimit = annual401kLimit - totalContributedSoFar;
                    
                    // Calculate days remaining in the year for prorated contributions
                    const currentDate = new Date();
                    const endOfYear = new Date(currentDate.getFullYear(), 11, 31);
                    const daysRemaining = Math.ceil((endOfYear - currentDate) / (1000 * 60 * 60 * 24));
                    const daysInYear = 365;
                    const remainingYearFraction = daysRemaining / daysInYear;
                    
                    // Check if we're past bonus season (March)
                    const currentMonth = currentDate.getMonth(); // 0-based, so March = 2
                    const bonusAlreadyPaid = currentMonth >= 2; // March or later
                    
                    if (remainingLimit <= 0) {
                        // Already maxed out for the year with regular contributions
                        contributionPercentThisYear = 0;
                        employee401kContrib = 0; // No additional contributions
                        finalEmployee401k = current401kContributed;
                        finalBonusContrib = 0; // No bonus contribution (already accounted for or maxed out)
                    } else {
                        // Calculate prorated contributions for remaining days
                        // Prorate the salary for remaining days
                        const proratedSalary = currentSalary * remainingYearFraction;
                        
                        // For bonus: if already past March, bonus was already paid and contributed
                        // It should be included in the "current401kContributed" field by the user
                        let proratedBonusContrib = 0;
                        if (!bonusAlreadyPaid) {
                            // Only calculate bonus contribution if we haven't reached bonus season yet
                            const proratedBonus = bonus * remainingYearFraction;
                            proratedBonusContrib = proratedBonus * bonusContributionPercent;
                        }
                        
                        const maxBonusContrib = Math.min(proratedBonusContrib, remainingLimit);
                        const remainingAfterBonus = remainingLimit - maxBonusContrib;
                        
                        // Calculate additional regular contribution for remaining days
                        const maxAdditionalRegular = Math.min(remainingAfterBonus, proratedSalary * 0.50);
                        contributionPercentThisYear = proratedSalary > 0 ? maxAdditionalRegular / proratedSalary : 0;
                        
                        employee401kContrib = maxAdditionalRegular;
                        finalEmployee401k = current401kContributed + employee401kContrib; // Total regular for the year
                        finalBonusContrib = maxBonusContrib;
                    }
                } else {
                    // Regular calculation for future years
                    const remainingLimitThisYear = annual401kLimit - bonusContrib;
                    contributionPercentThisYear = Math.min(remainingLimitThisYear / currentSalary, 0.50); // Cap at 50%
                    
                    // Calculate employee 401k contribution (based on dynamic percentage)
                    employee401kContrib = currentSalary * contributionPercentThisYear;
                    
                    // Since we calculated dynamically, these should already be within limits
                    finalEmployee401k = employee401kContrib;
                    finalBonusContrib = bonusContrib;
                }
                
                // Calculate employer match (configurable percentage of salary, only on regular contributions)
                let maxEmployerMatch, employerMatch;
                if (isCurrentYear) {
                    // For current year, prorate employer match based on remaining days
                    const currentDate = new Date();
                    const endOfYear = new Date(currentDate.getFullYear(), 11, 31);
                    const daysRemaining = Math.ceil((endOfYear - currentDate) / (1000 * 60 * 60 * 24));
                    const remainingYearFraction = daysRemaining / 365;
                    
                    maxEmployerMatch = hasEmployerMatch ? currentSalary * employerMatchPercent * remainingYearFraction : 0;
                    employerMatch = hasEmployerMatch ? Math.min(employee401kContrib, maxEmployerMatch) : 0;
                } else {
                    maxEmployerMatch = hasEmployerMatch ? currentSalary * employerMatchPercent : 0;
                    employerMatch = hasEmployerMatch ? Math.min(finalEmployee401k, maxEmployerMatch) : 0;
                }
                
                // Calculate 401a contribution (configurable percentage of salary)
                let employee401aContrib;
                if (isCurrentYear) {
                    // For current year, prorate 401a contribution
                    const currentDate = new Date();
                    const endOfYear = new Date(currentDate.getFullYear(), 11, 31);
                    const daysRemaining = Math.ceil((endOfYear - currentDate) / (1000 * 60 * 60 * 24));
                    const remainingYearFraction = daysRemaining / 365;
                    
                    employee401aContrib = has401a ? currentSalary * employee401aPercent * remainingYearFraction : 0;
                } else {
                    employee401aContrib = has401a ? currentSalary * employee401aPercent : 0;
                }
                
                // Total contributions for the year
                let total401kContrib, totalYearContrib;
                if (isCurrentYear) {
                    // For current year, only count additional contributions for remaining days
                    total401kContrib = employee401kContrib + finalBonusContrib + employerMatch;
                    totalYearContrib = total401kContrib + employee401aContrib;
                } else {
                    // For future years, use full year amounts
                    total401kContrib = finalEmployee401k + finalBonusContrib + employerMatch;
                    totalYearContrib = total401kContrib + employee401aContrib;
                }
                
                // Starting balances for this year
                const start401k = current401k;
                const start401a = current401a;
                
                // Calculate returns: different logic for current year vs future years
                let returns401k, returns401a;
                
                if (isCurrentYear) {
                    // For current year (2025), calculate returns based on days remaining
                    const currentDate = new Date();
                    const endOfYear = new Date(currentDate.getFullYear(), 11, 31); // Dec 31
                    const daysRemaining = Math.ceil((endOfYear - currentDate) / (1000 * 60 * 60 * 24));
                    const dailyReturn = Math.pow(1 + annualReturn, 1/365) - 1; // Daily compound rate
                    const remainingYearReturn = Math.pow(1 + dailyReturn, daysRemaining) - 1;
                    
                    // For current year, assume contributions are made at the beginning of remaining period
                    const midPeriodBalance401k = start401k + (total401kContrib / 2);
                    const midPeriodBalance401a = start401a + (employee401aContrib / 2);
                    
                    returns401k = midPeriodBalance401k * remainingYearReturn;
                    returns401a = midPeriodBalance401a * remainingYearReturn;
                } else {
                    // For future years, use full annual return
                    // This assumes contributions are made throughout the year
                    const midYearBalance401k = start401k + (total401kContrib / 2);
                    const midYearBalance401a = start401a + (employee401aContrib / 2);
                    
                    returns401k = midYearBalance401k * annualReturn;
                    returns401a = midYearBalance401a * annualReturn;
                }
                
                // End balances
                let end401k, end401a;
                if (isCurrentYear) {
                    // For current year, only add the additional contributions for remaining days
                    // Don't double-count the already contributed amount
                    end401k = start401k + employee401kContrib + finalBonusContrib + employerMatch + returns401k;
                    end401a = start401a + employee401aContrib + returns401a;
                } else {
                    // For future years, use the standard calculation
                    end401k = start401k + total401kContrib + returns401k;
                    end401a = start401a + employee401aContrib + returns401a;
                }
                
                // Grand total
                const grandTotal = end401k + end401a;
                
                // Track totals
                if (isCurrentYear) {
                    // For current year, only track the additional contributions made during remaining days
                    totalContributions += employee401kContrib + finalBonusContrib + employerMatch + employee401aContrib;
                } else {
                    // For future years, track full year contributions
                    totalContributions += totalYearContrib;
                }
                totalReturns += returns401k + returns401a;
                
                // Update for next iteration
                current401k = end401k;
                current401a = end401a;
                
                // Build table row with dynamic columns
                let tableRow = `
                    <tr class="table__data-row">
                        <td class="table__year-cell"><strong>${year}${isCurrentYear ? ' (Current)' : ''}</strong></td>`;
                
                // For current year, show prorated salary, for future years show full salary
                if (isCurrentYear) {
                    const currentDate = new Date();
                    const endOfYear = new Date(currentDate.getFullYear(), 11, 31);
                    const daysRemaining = Math.ceil((endOfYear - currentDate) / (1000 * 60 * 60 * 24));
                    const remainingYearFraction = daysRemaining / 365;
                    const proratedSalary = currentSalary * remainingYearFraction;
                    
                    tableRow += `<td class="table__salary-cell">${formatCurrency(proratedSalary)} (${daysRemaining} days)</td>`;
                } else {
                    tableRow += `<td class="table__salary-cell">${formatCurrency(currentSalary)}</td>`;
                }
                
                if (hasBonus) {
                    const currentMonth = new Date().getMonth(); // 0-based
                    const bonusAlreadyPaid = currentMonth >= 2; // March or later
                    
                    let displayBonus, bonusLabel;
                    if (isCurrentYear) {
                        if (bonusAlreadyPaid) {
                            displayBonus = 0; // Show $0 since bonus was already paid and should be in "contributed so far"
                            bonusLabel = ' (already paid)';
                        } else {
                            displayBonus = bonus * (Math.ceil((new Date(new Date().getFullYear(), 11, 31) - new Date()) / (1000 * 60 * 60 * 24)) / 365);
                            bonusLabel = ' (prorated)';
                        }
                    } else {
                        displayBonus = bonus;
                        bonusLabel = '';
                    }
                    
                    tableRow += `
                        <td class="table__bonus-cell">${formatCurrency(displayBonus)}${bonusLabel}</td>`;
                }
                
                tableRow += `
                        <td class="table__percent-cell"><strong>${formatPercent(contributionPercentThisYear * 100)}</strong></td>`;
                
                // For current year, show the breakdown more clearly
                if (isCurrentYear) {
                    // Show only additional contribution for remaining days
                    tableRow += `<td class="table__contrib-cell">${formatCurrency(employee401kContrib)} (additional)</td>`;
                } else {
                    tableRow += `<td class="table__contrib-cell">${formatCurrency(finalEmployee401k)}</td>`;
                }
                
                if (hasBonus) {
                    tableRow += `
                        <td class="table__contrib-cell">${formatCurrency(finalBonusContrib)}</td>`;
                }
                
                if (hasEmployerMatch) {
                    tableRow += `
                        <td class="table__contrib-cell">${formatCurrency(employerMatch)}</td>`;
                }
                
                if (has401a) {
                    tableRow += `
                        <td class="table__contrib-cell">${formatCurrency(employee401aContrib)}</td>`;
                }
                
                tableRow += `
                        <td class="table__total-cell"><strong>${formatCurrency(isCurrentYear ? (employee401kContrib + finalBonusContrib + employerMatch + employee401aContrib) : totalYearContrib)}</strong></td>
                        <td class="table__balance-cell">${formatCurrency(start401k)}</td>`;
                
                if (has401a) {
                    tableRow += `
                        <td class="table__balance-cell">${formatCurrency(start401a)}</td>`;
                }
                
                tableRow += `
                        <td class="table__return-cell">${formatCurrency(returns401k)}</td>`;
                
                if (has401a) {
                    tableRow += `
                        <td class="table__return-cell">${formatCurrency(returns401a)}</td>`;
                }
                
                tableRow += `
                        <td class="table__balance-cell"><strong>${formatCurrency(end401k)}</strong></td>`;
                
                if (has401a) {
                    tableRow += `
                        <td class="table__balance-cell"><strong>${formatCurrency(end401a)}</strong></td>`;
                }
                
                tableRow += `
                        <td class="table__grand-total-cell"><strong>${formatCurrency(grandTotal)}</strong></td>
                    </tr>
                `;
                
                tableBody += tableRow;
            }

            const fullTableHtml = tableHtml + tableBody + `
                        </tbody>
                    </table>
                </div>
            `;

            // Enhanced summary with key metrics
            const initialTotal = current401kBalance + current401aBalance;
            const finalTotal = current401k + current401a;
            const totalGrowth = finalTotal - initialTotal;
            const finalSalary = baseSalary * Math.pow(1 + salaryIncrease, projectionYears - 1);

            // Calculate effective contribution rate (average across all years)
            const avgSalary = baseSalary * (Math.pow(1 + salaryIncrease, projectionYears) - 1) / (projectionYears * salaryIncrease || 1);
            const avgTotalContrib = totalContributions / projectionYears;
            const effectiveContribRate = avgTotalContrib / avgSalary;
            
            // Calculate average 401k contribution percentage across all years
            let totalContribPercent = 0;
            for (let i = 0; i < projectionYears; i++) {
                const currentSalary = baseSalary * Math.pow(1 + salaryIncrease, i);
                const bonus = currentSalary * bonusPercentage;
                const bonusContrib = bonus * bonusContributionPercent;
                const remainingLimitThisYear = annual401kLimit - bonusContrib;
                const contributionPercentThisYear = Math.min(remainingLimitThisYear / currentSalary, 0.50);
                totalContribPercent += contributionPercentThisYear;
            }
            const avgContribPercent = totalContribPercent / projectionYears;

            // Build dynamic summary sections
            let finalBalancesSection = `
                            <div class="summary-item">
                                <label class="summary-label">💼 401k Balance</label>
                                <div class="summary-value summary-value--primary">${formatCurrency(current401k)}</div>
                            </div>`;
            
            if (has401a) {
                finalBalancesSection += `
                            <div class="summary-item">
                                <label class="summary-label">🏦 401a Balance</label>
                                <div class="summary-value summary-value--primary">${formatCurrency(current401a)}</div>
                            </div>`;
            }
            
            finalBalancesSection += `
                            <div class="summary-item summary-item--highlight">
                                <label class="summary-label">🎯 Total Portfolio</label>
                                <div class="summary-value summary-value--success">${formatCurrency(finalTotal)}</div>
                            </div>`;

            // Build contribution details section
            let contributionDetailsSection = `
                            <div class="summary-item">
                                <label class="summary-label">💰 Starting Salary</label>
                                <div class="summary-value summary-value--info">${formatCurrency(baseSalary)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">📊 Final Salary</label>
                                <div class="summary-value summary-value--info">${formatCurrency(finalSalary)}</div>
                            </div>`;
            
            // Add current year contribution status
            const currentYearRemaining = annual401kLimit - current401kContributed;
            if (current401kContributed > 0 || projectionYears > 0) {
                // Calculate days remaining in current year for display
                const currentDate = new Date();
                const endOfYear = new Date(currentDate.getFullYear(), 11, 31);
                const daysRemaining = Math.ceil((endOfYear - currentDate) / (1000 * 60 * 60 * 24));
                const daysInYear = 365;
                const remainingYearFraction = daysRemaining / daysInYear;
                const dailyReturn = Math.pow(1 + annualReturn, 1/365) - 1;
                const remainingYearReturn = Math.pow(1 + dailyReturn, daysRemaining) - 1;
                const proratedSalary = baseSalary * remainingYearFraction;
                
                contributionDetailsSection += `
                            <div class="summary-item">
                                <label class="summary-label">📅 Days Remaining in 2025</label>
                                <div class="summary-value summary-value--info">${daysRemaining} days (${(remainingYearFraction * 100).toFixed(1)}%)</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">💰 2025 Prorated Salary</label>
                                <div class="summary-value summary-value--info">${formatCurrency(proratedSalary)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">� 2025 RRemaining Return Rate</label>
                                <div class="summary-value summary-value--info">${formatPercent(remainingYearReturn * 100)}</div>
                            </div>`;
                
                if (current401kContributed > 0) {
                    contributionDetailsSection += `
                            <div class="summary-item">
                                <label class="summary-label">💰 2025 Total Contributions So Far</label>
                                <div class="summary-value summary-value--warning">${formatCurrency(current401kContributed)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">🎯 2025 Remaining Limit</label>
                                <div class="summary-value summary-value--${currentYearRemaining > 0 ? 'success' : 'danger'}">${formatCurrency(Math.max(0, currentYearRemaining))}</div>
                            </div>`;
                }
            }
            
            contributionDetailsSection += `
                            <div class="summary-item">
                                <label class="summary-label">🎯 Avg 401k Contribution Rate</label>
                                <div class="summary-value summary-value--warning">${formatPercent(avgContribPercent * 100)}</div>
                            </div>`;
            
            if (hasBonus) {
                contributionDetailsSection += `
                            <div class="summary-item">
                                <label class="summary-label">🎁 Annual Bonus Rate</label>
                                <div class="summary-value summary-value--info">${formatPercent(bonusPercentage * 100)}</div>
                            </div>`;
            }
            
            if (hasEmployerMatch) {
                contributionDetailsSection += `
                            <div class="summary-item">
                                <label class="summary-label">🤝 Employer Match Rate</label>
                                <div class="summary-value summary-value--info">${formatPercent(employerMatchPercent * 100)}</div>
                            </div>`;
            }
            
            contributionDetailsSection += `
                            <div class="summary-item">
                                <label class="summary-label">⚡ Effective Total Rate</label>
                                <div class="summary-value summary-value--warning">${formatPercent(effectiveContribRate * 100)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">🔥 Growth Multiple</label>
                                <div class="summary-value summary-value--success">${(finalTotal / initialTotal).toFixed(2)}x</div>
                            </div>`;

            // Enhanced summary with better layout
            const summaryHtml = `
                <div class="card mt-xl card--elevated">
                    <div class="card__header">
                        <h3 class="card__title">📊 Projection Summary (${projectionYears} Years)</h3>
                        <p class="card__subtitle">Retirement savings with ${formatPercent(annualReturn * 100)} annual return and ${formatPercent(salaryIncrease * 100)} salary growth</p>
                    </div>
                    <div class="summary-grid">
                        <div class="summary-section">
                            <h4 class="summary-section__title">Final Balances</h4>
                            ${finalBalancesSection}
                        </div>
                        
                        <div class="summary-section">
                            <h4 class="summary-section__title">Growth Analysis</h4>
                            <div class="summary-item">
                                <label class="summary-label">📈 Total Growth</label>
                                <div class="summary-value summary-value--success">${formatCurrency(totalGrowth)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">💵 Total Contributions</label>
                                <div class="summary-value summary-value--warning">${formatCurrency(totalContributions)}</div>
                            </div>
                            <div class="summary-item">
                                <label class="summary-label">🚀 Investment Returns</label>
                                <div class="summary-value summary-value--success">${formatCurrency(totalReturns)}</div>
                            </div>
                        </div>
                        
                        <div class="summary-section">
                            <h4 class="summary-section__title">Contribution Details</h4>
                            ${contributionDetailsSection}
                        </div>
                    </div>
                </div>
            `;

            const resultsEl = document.getElementById('results401kArea');
            if (resultsEl) {
                resultsEl.innerHTML = summaryHtml + fullTableHtml;
            } else {
                Logger.error('Results container not found');
            }
            
        } catch (error) {
            Logger.error('Error in 401k calculation:', error);
            const resultsEl = document.getElementById('results401kArea');
            if (resultsEl) {
                resultsEl.innerHTML = `
                    <div class="card">
                        <div class="card__header">
                            <h3 class="card__title">Error</h3>
                        </div>
                        <p>There was an error calculating the 401k projection. Please check your inputs and try again.</p>
                        <p><small>Error: ${error.message}</small></p>
                    </div>
                `;
            }
        }
    };

    // Removed automatic calculation - user must click Generate button to see results

    // 401k Info Modal Functions - Use unique function name to avoid conflicts
    function show401kInfoModal(id) {
        Logger.debug('show401kInfoModal called with id:', id); // Debug log
        const modal = document.getElementById('info401kModal');
        const titleEl = document.getElementById('info401kTitle');
        const contentEl = document.getElementById('info401kContent');
        
        if (!modal || !titleEl || !contentEl) {
            Logger.error('Modal elements not found:', {modal, titleEl, contentEl});
            return;
        }
        
        const data = {
            '401k-overview': {
                title: '401k Projection Calculator Overview',
                content: `
                    <div class="info-content">
                        <h4>🎯 What is 401k Projection?</h4>
                        <p>This calculator helps you plan your retirement savings by projecting the growth of your 401k and 401a accounts over time. It uses your current salary, expected salary increases, and contribution strategies to show how your retirement savings will grow.</p>
                        
                        <h4>📊 Key Features</h4>
                        
                        <div class="method-section">
                            <h5>� Cyurrent Year (2025) Special Handling</h5>
                            <p><strong>How it works:</strong></p>
                            <ul>
                                <li>Enter regular employee 401k contributions made in 2025 (including any bonus contributions already made)</li>
                                <li>Calculator determines remaining contribution limit ($23,500 - total contributions so far)</li>
                                <li>Salary is prorated based on days remaining in 2025</li>
                                <li>Bonus contributions: If past March, bonus was already paid and should be included in "contributed so far"</li>
                                <li>If before March, bonus is prorated for remaining time until bonus payment</li>
                                <li>Contribution calculations use prorated amounts to respect remaining time in year</li>
                                <li>Returns calculated based on actual days remaining in 2025 (not full year)</li>
                                <li>Daily return rate of 0.0305% compounded for remaining days only</li>
                            </ul>
                            <p><strong>Why This Matters:</strong> Separates regular and bonus contributions for accurate 2025 projections.</p>
                        </div>
                        
                        <div class="method-section">
                            <h5>💰 Dynamic Contribution Optimization</h5>
                            <p><strong>Formula:</strong> Contribution % = (Annual Limit - Bonus Contribution) ÷ Current Salary</p>
                            <p><strong>How it works:</strong></p>
                            <ul>
                                <li>Automatically calculates optimal contribution percentage each year</li>
                                <li>Maximizes the $23,500 annual 401k limit (2025)</li>
                                <li>Adjusts for salary increases and bonus contributions</li>
                                <li>Ensures you never exceed IRS contribution limits</li>
                            </ul>
                        </div>
                        
                        <div class="method-section">
                            <h5>🏢 Flexible Employer Benefits</h5>
                            <p><strong>Configurable Options:</strong></p>
                            <ul>
                                <li><strong>Annual Bonus:</strong> Optional - set your company's bonus percentage (0-50%)</li>
                                <li><strong>Bonus to 401k:</strong> Optional - choose what percentage of bonus goes to 401k (0-100%)</li>
                                <li><strong>Employer Match:</strong> Optional - configure your company's matching policy (0-15%)</li>
                                <li><strong>401a Contribution:</strong> Optional - only for companies that offer 401a plans (0-10%)</li>
                            </ul>
                            <p><strong>Why This Matters:</strong> Not all companies offer the same benefits. This calculator adapts to your specific employer's benefit structure for accurate projections.</p>
                        </div>
                        
                        <div class="method-section">
                            <h5>📈 Multi-Year Projections</h5>
                            <p><strong>Growth Modeling:</strong></p>
                            <ul>
                                <li>Salary increases compound annually</li>
                                <li>Investment returns calculated on mid-year balance</li>
                                <li>Separate tracking for 401k and 401a accounts</li>
                                <li>Real-time recalculation of contribution percentages</li>
                            </ul>
                        </div>
                        
                        <h4>🧮 Calculation Methodology</h4>
                        
                        <div class="method-section">
                            <h5>📋 Annual Calculation Steps</h5>
                            <ol>
                                <li><strong>Salary Growth:</strong> Current Salary × (1 + Annual Increase)^Year</li>
                                <li><strong>Bonus Calculation:</strong> Salary × 10%</li>
                                <li><strong>Bonus Contribution:</strong> Bonus × 50%</li>
                                <li><strong>Dynamic 401k %:</strong> (23,500 - Bonus Contribution) ÷ Salary</li>
                                <li><strong>Employee 401k:</strong> Salary × Dynamic %</li>
                                <li><strong>Employer Match:</strong> min(Employee 401k, Salary × 6%)</li>
                                <li><strong>401a Contribution:</strong> Salary × 4%</li>
                                <li><strong>Investment Returns:</strong> (Starting Balance + Contributions/2) × Return Rate</li>
                            </ol>
                        </div>
                        
                        <h4>💡 Key Benefits</h4>
                        <ul>
                            <li><strong>Automatic Optimization:</strong> Maximizes contributions without manual calculation</li>
                            <li><strong>Compliance:</strong> Never exceeds IRS contribution limits</li>
                            <li><strong>Comprehensive:</strong> Includes all employer benefits and matching</li>
                            <li><strong>Flexible:</strong> Adjusts to salary changes and career progression</li>
                            <li><strong>Visual Analytics:</strong> Colorful summary panels with key insights</li>
                        </ul>
                        
                        <h4>📊 Understanding the Results</h4>
                        
                        <div class="method-section">
                            <h5>🎨 Color-Coded Table</h5>
                            <ul>
                                <li><strong style="color: #3498db;">Blue:</strong> Account balances and totals</li>
                                <li><strong style="color: #e74c3c;">Red:</strong> Contributions (money going out)</li>
                                <li><strong style="color: #27ae60;">Green:</strong> Investment returns (growth)</li>
                                <li><strong style="color: #f39c12;">Orange:</strong> Contribution percentages</li>
                            </ul>
                        </div>
                        
                        <div class="method-section">
                            <h5>📈 Summary Analytics</h5>
                            <ul>
                                <li><strong>Final Balances:</strong> Your projected account values</li>
                                <li><strong>Total Growth:</strong> How much your money grew</li>
                                <li><strong>Total Contributions:</strong> How much you and your employer contributed</li>
                                <li><strong>Investment Returns:</strong> Earnings from market growth</li>
                                <li><strong>Growth Multiple:</strong> How many times your money multiplied</li>
                            </ul>
                        </div>
                        
                        <h4>⚙️ Input Parameters</h4>
                        <ul>
                            <li><strong>Current Base Salary:</strong> Your current annual salary before bonuses</li>
                            <li><strong>Salary Increase %:</strong> Expected annual salary growth rate</li>
                            <li><strong>Projection Years:</strong> How many years to project (1-30)</li>
                            <li><strong>Rate of Return:</strong> Expected annual investment return</li>
                            <li><strong>Current Balances:</strong> Starting amounts in your 401k and 401a accounts</li>
                        </ul>
                        
                        <h4>🏢 Company Benefits Configuration</h4>
                        <ul>
                            <li><strong>Annual Bonus:</strong> Check if your company offers bonuses, set percentage (0-50%)</li>
                            <li><strong>Bonus to 401k:</strong> What percentage of your bonus you want to contribute (0-100%)</li>
                            <li><strong>Employer Match:</strong> Check if your company matches 401k contributions, set match percentage (0-15%)</li>
                            <li><strong>401a Plan:</strong> Check if your company offers 401a, set contribution percentage (0-10%)</li>
                        </ul>
                        
                        <p class="text-info"><strong>💡 Pro Tip:</strong> Uncheck benefits your company doesn't offer to get accurate projections specific to your situation.</p>
                        
                        <h4>⚠️ Important Notes</h4>
                        <ul>
                            <li><strong>Company-Specific:</strong> Configure benefits to match your specific employer's offerings</li>
                            <li><strong>Projections:</strong> Based on assumptions and may not reflect actual results</li>
                            <li><strong>Market Risk:</strong> Investment returns can vary significantly</li>
                            <li><strong>Contribution Limits:</strong> IRS limits may change annually</li>
                            <li><strong>Tax Implications:</strong> Consult a tax professional for tax planning</li>
                            <li><strong>Benefit Verification:</strong> Verify your specific employer's benefit structure with HR</li>
                        </ul>
                        
                        <p class="disclaimer"><strong>Disclaimer:</strong> This calculator is for educational and planning purposes only. Consult with qualified financial advisors for personalized retirement planning advice.</p>
                    </div>
                `
            }
        };
        
        const info = data[id];
        if (!info) {
            Logger.error('No data found for id:', id, 'Available keys:', Object.keys(data));
            titleEl.innerText = 'Info';
            contentEl.innerHTML = '<p>No information available for this section.</p>';
        } else {
            titleEl.innerText = info.title; 
            contentEl.innerHTML = info.content;
        }
        
        modal.classList.remove('modal--hidden'); 
        modal.setAttribute('aria-hidden','false');
        const close = document.getElementById('info401kClose'); 
        if(close) close.focus();
    }
    
    // Ensure global access - use unique function name
    window.show401kInfoModal = show401kInfoModal;
    
    function close401kInfo() { 
        const modal = document.getElementById('info401kModal'); 
        if(!modal) return; 
        modal.classList.add('modal--hidden'); 
        modal.setAttribute('aria-hidden','true'); 
    }
    
    // Ensure global access
    window.close401kInfo = close401kInfo;
    
    // Event listeners for 401k modal
    document.addEventListener('click', function(e) { 
        if(e.target && e.target.id==='info401kClose') close401kInfo(); 
        const modal = document.getElementById('info401kModal'); 
        if(modal && e.target===modal) close401kInfo(); 
    });
    
    document.addEventListener('keydown', function(e) { 
        if(e.key==='Escape') {
            close401kInfo();
        }
    });

})();